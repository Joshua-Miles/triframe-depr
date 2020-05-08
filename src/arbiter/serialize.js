import { each, map, mapAsync, filter, EventEmitter, getMetadata } from 'triframe/core'
import { Resource } from './Resource'
import { createCache, mergeBatch, mergePatches, stageNewPatches, createBatch, archivePatchesFor, updateResource } from './core'


const primativeTypes = ['String', 'Boolean', 'Number', 'Date', 'Function']
const skippedPrototypes = [Object.prototype, Function.prototype, Resource.prototype, Resource, EventEmitter.prototype, undefined, null]
const skippedProperties = target => (
    typeof target === 'function'
        ? ['length', 'name', 'prototype']
        : ['constructor', '[[attributes]]', '[[patches]]', '[[base]]', '[[batch]]', '[[validation]]']
)

export const serialize = function ($interface, config= {}) {

    const io = new EventEmitter

    const main = () => {
        if (!isObject($interface)) throw Error('$interface must be a plain JavaScript Object')
        let schema = serializeObject('global', $interface)
        Object.defineProperty(schema, 'emit', {
            enumerable: false,
            value: (...args) => io.emit(...args)
        })
        return schema
    }

    const serializeObject = function (name, object) {
        let descriptors = {}
        let $interface = {}
        for (let target = object; !skippedPrototypes.includes(target); target = target.__proto__) {
            each(Object.getOwnPropertyDescriptors(target), (key, descriptor) => {
                if (!skippedProperties(target).includes(key)) {
                    $interface[key] = object[key]
                    descriptors[key] = descriptor
                }
            })
        }
        return {
            type: 'object',
            attributes: map($interface, (key, value) => {
                const descriptor = descriptors[key]
                const metadata = getMetadata(object, key)
                if (isClass(value, descriptor)) return serializeClass(`${name}/${key}`, value, descriptor, metadata, object, key)
                if (isObject(value, descriptor)) return serializeObject(`${name}/${key}`, value, descriptor, metadata, object, key)
                if (isFunction(value, descriptor)) return serializeFunction(`${name}/${key}`, value, descriptor, metadata, object, key)
                if (isProperty(value, descriptor)) return serializeProperty(`${name}/${key}`, value, descriptor, metadata, object, key)
                if (isAttribute(value, descriptor)) return serializeAttribute(`${name}/${key}`, value, descriptor, metadata, object, key)
            }),
        }
    }

    const serializeClass = function (name, Class) {
        const instance = new Class
        return {
            name,
            type: 'class',
            className: Class.name,
            classMethods: serializeMethods(name, Class),
            instanceMethods: serializeMethods(`${name}/#`, instance)
        }
    }


    const serializeMethods = function (name, object) {
        let descriptors = {}
        for (let target = object; !skippedPrototypes.includes(target); target = target.__proto__) {
            each(Object.getOwnPropertyDescriptors(target), (key, descriptor) => {
                if (!skippedProperties(target).includes(key)) {
                    descriptors[key] = descriptor
                }
            })
        }
        return map(descriptors, (key, descriptor) => {
            const metadata = getMetadata(object, key)
            if (isObject(descriptor.value, descriptor)) return serializeObject(`${name}/${key}`, descriptor.value, descriptor, metadata, object, key)
            if (isFunction(descriptor.value, descriptor)) return serializeFunction(`${name}/${key}`, descriptor.value, descriptor, metadata, object, key)
            if (isProperty(descriptor.value, descriptor)) return serializeProperty(`${name}/${key}`, descriptor.value, descriptor, metadata, object, key)
            if (isAttribute(descriptor.value, descriptor)) return serializeAttribute(`${name}/${key}`, descriptor.value, descriptor, metadata, object, key)
        })
    }


    const serializeFunction = function (name, value, descriptor, metadata, parent) {
        const { isShared, readAccessTest, usesSession, isStream, original } = metadata;
        if (isShared) {
            return {
                isStream,
                name,
                type: 'shared-function',
                value: isStream ? original.toString() : value.toString()
            }
        } else {
            io.on(name, async ({ args, uid, attributes, patches, socket, send, onClose }) => {
                
                socket.cache = socket.cache || createCache(socket)

                const { session } = socket
                const resource = typeof parent === 'function' ? parent : new parent.constructor(attributes)

                let { updateSuccessful, invalidPatches } = await updateResource(resource, patches, session)

                if(!updateSuccessful){
                    return send({ error: true, invalidPatches, message: 'You are not authorized to update the resource as requested' })
                }

                if ( readAccessTest !== undefined &&  !await readAccessTest.call(resource, { session, resource })) {
                    return send({ error: true, message: 'You are not authorized to call this method' })
                }
                
                let result, methodSession, accessSession = socket.session.createSlice();

                const sendSerialized = async (value, keepOpen) => {
                    // if (usesSession) methodSession.save()
                    const cache = socket.cache
                    const session = accessSession
                    const callback = () => sendSerialized(value, keepOpen)
                    let serialized = await serializeDocument(value, { cache, session, callback })
                    send(serialized, keepOpen)
                }

                if (usesSession) {
                    methodSession = socket.session.createSlice()
                    args.unshift(methodSession)
                    methodSession.onChange(() => run())
                }

                let run = () => {
                    if(result && result.destroy) result.destroy()
                    try {
                        result = value.apply(resource, args)
                    } catch (err) {
                        send({ error: true, message: err.message, callstack: Error.captureStackTrace(err) })
                    }
                    if (result && result.catch) result.catch(err => {
                        // Error.captureStackTrace(err)
                        send({ error: true, message: err.message, callstack: err.stack })
                    })
                    if (isPipe(result)) {
                        result.observe(value => sendSerialized(value, true))
                        // onClose(() => {
                        //     result.destroy()
                        //     if(methodSession) methodSession.removeListeners()
                        //     if(accessSession) accessSession.removeListeners()
                        // })
                    } else if (isPromise(result)) {
                        result.then(value => sendSerialized(value))
                    } else {
                        sendSerialized(result)
                    }
                }
                run()
            })

            return {
                name,
                type: 'remote-function'
            }
        }
    }

    const serializeProperty = function (name, value, descriptor, metadata, object, key) {
        const { validators } = metadata
        return {
            name,
            key: key,
            type: 'property',
            enumerable: descriptor.enumerable,
            get: serializeFunction(`${name}.get`, descriptor.get || (() => null), descriptor, metadata, object),
            set: serializeFunction(`${name}.set`, descriptor.set || (() => null), descriptor, metadata, object),
            validators: validators && validators.map(validator => validator.toString())

        }
    }

    const serializeAttribute = function (name, value, descriptor, metadata, object, key) {
        const { validators } = metadata
        return {
            name,
            key: key,
            type: 'attribute',
            value: descriptor.value,
            validators: validators && validators.map(validator => validator.toString())
        }
    }

    return main()
}

const isPrimative = value => primativeTypes.includes(value.constructor.name)
const isClass = (value) => typeof value === 'function' && value.prototype instanceof Resource
const isDocument = value => value instanceof Resource
const isArray = value => Array.isArray(value)
const isObject = (value) => value && value.__proto__ === Object.prototype
const isFunction = (value) => typeof value === 'function' && !isClass(value)
const isProperty = (value, descriptor) => typeof descriptor.get === 'function' || typeof descriptor.set === 'function'
const isAttribute = (value, descriptor) => [isClass, isObject, isFunction, isProperty].every(isType => !isType(value, descriptor))
const isPipe = value => value && typeof value.observe == 'function'
const isPromise = value => value && typeof value.then == 'function' && !isPipe(value)

const serializeDocument = async function (document, { cache, session, callback }) {
    const next = document => serializeDocument(document, { cache, session, callback })
    if (!document) return document
    if (isClass(document)) return { _class_: document.name }
    if (isPrimative(document)) return document
    if (isArray(document)) return await Promise.all(document.map((element, index) => next(element)))
    if (isObject(document)) return await mapAsync(document, (propertyName, object) => next(object))
    cache.cache(document) 
    if (isDocument(document)) return {
        ... await mapAsync(document['[[attributes]]'], async (propertyName, propertyValue) => {
            const metadata = getMetadata(document, propertyName)
            const { readAccessTest, namespace } = metadata;
            if(readAccessTest === undefined){
                return await next(propertyValue)
            } else {
                session.onChange( callback )
                const resource = document
                const result = readAccessTest.call(resource, { session, resource })
                if(result instanceof Promise && config.audit) console.warn(`Running Asynchronous Authentication Checks for ${namespace} during serailization`)
                if(!await result) return null
                else return await next(propertyValue)
            } 
        }),
        _proto_: document.constructor.name
    }

}