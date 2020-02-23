import { each, map, filter, EventEmitter, getMetadata } from '../core'
import { Resource } from './Resource'
import { List } from './List'
import { appendPatches, commitBatch, mergePatches, stageNewPatches, createBatch } from './core'

const primativeTypes = ['String', 'Boolean', 'Number', 'Date', 'Function']
const skippedPrototypes = [Object.prototype, Function.prototype, Resource.prototype, Resource, EventEmitter.prototype, undefined, null]
const skippedProperties = target => (
    typeof target === 'function'
        ? ['length', 'name', 'prototype']
        : ['constructor', '[[attributes]]', '[[patches]]', '[[base]]', '[[batch]]', '[[validation]]']
)

export const createSerializer = io => {

    const serialize = function ($interface) {
        if (!isObject($interface)) throw Error('$interface must be a plain JavaScript Object')
        return serializeObject('global', $interface)
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
        return map($interface, (key, value) => {
            const descriptor = descriptors[key]
            const metadata = getMetadata(object, key)
            const { accessLevel } = metadata;
            if (accessLevel === 'private') return null
            if (isClass(value, descriptor)) return serializeClass(`${name}/${key}`, value, descriptor, metadata, object, key)
            if (isObject(value, descriptor)) return serializeObject(`${name}/${key}`, value, descriptor, metadata, object, key)
            if (isFunction(value, descriptor)) return serializeFunction(`${name}/${key}`, value, descriptor, metadata, object, key)
            if (isProperty(value, descriptor)) return serializeProperty(`${name}/${key}`, value, descriptor, metadata, object, key)
            if (isAttribute(value, descriptor)) return serializeAttribute(`${name}/${key}`, value, descriptor, metadata, object, key)
        })
    }

    const serializeClass = function (name, Class) {
        const instance = new Class
        return {
            name,
            type: 'class',
            className: Class.name,
            classMethods: serializeMethods(name, Class),
            instanceMethods: {
                ...serializeMethods(`${name}/#`, instance), sync: serializeFunction(
                    `${name}/#/sync`, instance.sync, {}, {}, instance
                )
            }

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
        const { isShared, accessLevel, authCheck, usesSession } = metadata;
        if (isShared) {
            return {
                name,
                type: 'shared-function',
                value: value.toString()
            }
        } else {
            io.on(name, async ({ args, uid, patches, connection, send, onClose }) => {
                connection.cache = connection.cache || createCache(connection)
                const sendSerialized = (value, keepOpen) => {
                    if (usesSession) connection.session.save()
                    send(serializeDocument(value, connection), keepOpen)
                }

                const target = (
                    uid
                        ? connection.cache.getCached(uid)
                        : typeof parent === 'function' ? parent : new parent.constructor
                )

                if (patches) appendPatches(target, patches)

                if (accessLevel === 'private' || (accessLevel === 'protected' && ! await authCheck(connection.session, target))) {
                    return send({ error: true, message: 'You are not authorized to call this method' })
                }

                if (usesSession) args.unshift(connection.session)
                let result;
                try {
                    result = value.apply(target, args)
                } catch (err) {
                    send({ error: true, message: err.message })
                }
                if (result && result.catch) result.catch(err => send({ error: true, message: err.message }))
                if (isPipe(result)) {
                    result.observe(value => sendSerialized(value, true))
                    onClose(() => result.destroy())
                } else if (isPromise(result)) {
                    result.then(value => sendSerialized(value))
                } else {
                    sendSerialized(result)
                }
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

    return serialize
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

const global = {}

// const clone = 

const createCache = ({ socket }) => {

    const bin = {}

    function cache(resource) {
        if (!bin[resource.uid]) {
            bin[resource.uid] = resource
            global[resource.uid] = global[resource.uid] || { base: clone(resource), branches: [] }
            resource = clone(global[resource.uid].base)
            global[resource.uid].branches.push({ socket, resource })

            socket.on(`${resource.uid}.sync`, ({ batchId, patches }) => {
                appendPatches(resource, patches)
                sync(batchId)
                // TODO: DONT RECONCILE CHANGES UNTIL ALL PENDING UPDATES HAVE BEEN CONFIRMED (?)
                socket.emit(`${resource.uid}.commitBatch`, batchId)
            })

            resource.on('Δ.sync', () => {
                stageNewPatches(resource)
                const batchId = createBatch(resource)
                sync(batchId, { includeSelf: true })
            })
        }


        const sync = (batchId, { includeSelf = false } = {}) => {
            const patches = commitBatch(resource, batchId)
            mergePatches(global[resource.uid].base, patches)
            global[resource.uid].branches.forEach(({ socket: otherSocket, resource }) => {
                if (socket != otherSocket || includeSelf) {
                    mergePatches(resource, patches)
                    otherSocket.emit(`${resource.uid}.mergePatches`, patches)
                }
            })
        }

        return global[resource.uid].base
    }

    function getCached(uid) {
        return bin[uid]
    }

    return { cache, getCached }
}


const serializeDocument = function (document, connection) {
    const next = document => serializeDocument(document, connection)
    if (!document) return document
    if (isClass(document)) return { _class_: document.name }
    if (isPrimative(document)) return document
    if (isArray(document)) return document.map((element, index) => next(element))
    if (isObject(document)) return map(document, (propertyName, object) => next(object))

    document = connection.cache.cache(document)

    if (isDocument(document)) return {
        ...map(document['[[attributes]]'], (propertyName, object) => {
            const metadata = getMetadata(document, propertyName)
            const { accessLevel, authCheck } = metadata;
            if (accessLevel == 'private') return null
            if (accessLevel == 'protected' && !authCheck(connection.session)) return null
            return next(object)
        }),
        _proto_: document.constructor.name
    }

}

const clone = (resource) => {
    const classes = {}

    const serializeDocument = function (document) {
        const next = document => serializeDocument(document)
        if (!document) return document
        if (isClass(document)) return { _class_: document.name }
        if (isPrimative(document)) return document
        if (isArray(document)) return document.map((element, index) => next(element))
        if (isObject(document)) return map(document, (propertyName, object) => next(object))

        if (isDocument(document)) {
            classes[document.constructor.name] = document.constructor
            return {
                ...map(document['[[attributes]]'], (propertyName, object) => {
                    const metadata = getMetadata(document, propertyName)
                    const { accessLevel, authCheck } = metadata;
                    return next(object)
                }),
                _proto_: document.constructor.name
            }
        }

    }

    const unserializeDocument = (document) => {
        const next = document => unserializeDocument(document)
        if (!document) return document
        if (primativeTypes.includes(document.constructor.name)) return document
        if (Array.isArray(document)) return new List(...document.map(document => next(document)))
        const { _class_, _proto_, ...attributes } = document;
        if (_class_) return classes[__class__]
        if (_proto_) return new classes[_proto_](map(attributes, (key, value) => next(value)))
        return map(attributes, (key, value) => next(value))
    }


    return unserializeDocument(serializeDocument(resource))
}