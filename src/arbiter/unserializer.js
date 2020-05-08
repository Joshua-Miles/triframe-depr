import { each, map, Pipe } from "triframe/core"
import { List } from "./List"
import { Resource } from "./Resource"
import { stageNewPatches, createBatch, mergeBatch, mergePatches, rollbackPatches, upstreamMerge } from "./core"


const primativeTypes = ['String', 'Boolean', 'Number', 'Date', 'Function']

export const createUnserializer = io => {

    const cache = createCache({ socket: io })

    const classes = { Resource, List }

    const unserialize = (schema) => {
        if (typeof schema !== 'object') throw Error('schema must be a plain JavaScript Object')
        return unserializeObject(classes, schema.attributes)
    }

    const unserializeClass = (schema) => {
        const Class = class extends Resource { }
        Object.defineProperty(Class, 'name', { value: schema.className })
        unserializeObject(Class, schema.classMethods)
        unserializeObject(Class.prototype, schema.instanceMethods)
        return Class;
    }


    const unserializeObject = (target, schema) => {
        each(schema, (key, schema) => {
            switch (schema.type) {
                case 'class':
                    target[key] = unserializeClass(schema)
                break;
                case 'object':
                    target[key] = unserializeObject({}, schema.attributes)
                break;
                case 'shared-function':
                    target[key] = unserializeSharedFunction(schema)
                break;
                case 'remote-function':
                    target[key] = unserializeRemoteFunction(schema)
                break;
                case 'property':
                    unserializeProperty(target, key, schema)
                break;
                case 'attribute':
                    target[key] = unserializeAttribute(schema, target)
                break;
            }
        })
        return target
    }

    const unserializeFunction = (schema) => {
        switch (schema.type) {
            case 'shared-function':
                return unserializeSharedFunction(schema)
                break;
            case 'remote-function':
                return unserializeRemoteFunction(schema)
                break;
        }
    }

    const unserializeSharedFunction = (schema) => {
        const { isStream, prependEmit, value } = schema
        const func = new Function(`return ${value}`)()
        return !isStream
            ? func
            : createStream(func, prependEmit)
    }

    function createStream(method){
        const process = function(emit, ...args){
            return method.call(this, ...args, emit)
        }
        return function(...args){
            return new Pipe([this, process], ...args)
        }
    }

    const unserializeRemoteFunction = (schema) => {
        const { name } = schema

        const remoteProcess = function (emit, args) {
            const { uid } = this;
            const attributes = this['[[attributes]]']
            const patches = stageNewPatches(this)
            let document;
            let emitDocument = () => emit(document)

            const emitUnserialized = (value) => {
                if(value && value.error){      
                    // TO DO: Remove invalid patches from the resources patches
                    value.invalidPatches
                    let error = new Error(value.message)
                    error.stack = value.callstack
                    emit.throw(error)
                }
                document = unserializeDocument(value, emitDocument)
                emit(document)
            }

            const sendRequest = () => {
                io.emit(name, { uid, patches, args, attributes }, emitUnserialized)
            }

            const createSubscription = (hook) => {
                io.on(hook, emitUnserialized)

                // If the server or connection fuck up, 
                //  1. stop listening for the old event, and
                //  2. re-send the request to re-establish connection
                // TODO: Worry about a server re-start causing a ton of requests, crashing
                //  browsers and/or the server
                // const reconnectHandler = () => {
                //     console.log(name)
                //     io.removeEventListener('reconnect', reconnectHandler)
                //     io.removeEventListener(hook, emitUnserialized)
                //     sendRequest()
                // }

                // io.on('reconnect', reconnectHandler)

                // If this pipe is destroyed (user goes to another page, etc.), 
                // tell the server to cancel the subscription and stop listening for it
                emit.pipe.onCancel( () => {
                    io.removeEventListener(hook, emitUnserialized)
                    io.emit(`${hook}.destroy`)
                })
            }
            
            sendRequest()
        }

        return function (...args) {
            return new Pipe([this, remoteProcess], args)
        }
    }

    const unserializeProperty = (target, key, schema) => {
        const { validation } = target
        if(validation && schema.validators){
            schema.validators.forEach( validator => {
                validation.addHandler(schema.key, unserializeSharedFunction({ value: validator }) )
            })
        }
        Object.defineProperty(target, key, {
            enumerable: schema.enumerable,
            get: unserializeFunction(schema.get),
            set: unserializeFunction(schema.set)
        })
    }

    const unserializeAttribute = (schema, target) => {
        const { validation } = target
        if(validation && schema.validators){
            schema.validators.forEach( validator => {
                validation.addHandler(schema.key, unserializeSharedFunction({ value: validator }) )
            })
        }
        return schema.value
    }

    const unserializeDocument = (document, callback) => {
        const next = document => unserializeDocument(document, callback)
        if(!document) return document
        if(primativeTypes.includes(document.constructor.name)) return document
        if(Array.isArray(document)) return new List(...document.map( document => next(document)))
        const { _class_, _proto_, ...attributes } = document;
        if(_class_) return classes[_class_]
        if(_proto_) return cache.register(new classes[_proto_](map(attributes, ( key, value ) => next(value))), callback)
        return map(attributes, ( key, value ) => next(value))
    }

    return unserialize
}


const createCache = ({ socket }) => {

    let bin = {}
    window.bin = bin

    function register(resource = {}, callback){
        if(!bin[resource.uid]){

            function emit(){
                bin[resource.uid].callbacks.forEach( callback => callback())
            }

            resource.on('Δ.change', () => emit())
    
            resource.on('Δ.sync', ({ patches }) => {
                let batchId = createBatch(resource)
                socket.emit(`${resource.uid}.sync`, { patches, batchId }, ({updateSuccessful, invalidPatches }) => {
                    if(!updateSuccessful){
                        rollbackPatches(resource, invalidPatches)
                        emit()
                    }
                })
                // emit()
            })
    
            socket.on(`${resource.uid}.mergeBatch`, (batchId) => {
                mergeBatch(resource, batchId)
            })

            socket.on(`${resource.uid}.mergePatches`, (patches) => {
                mergePatches(resource, patches)
                emit()
            })

            bin[resource.uid] = { resource, callbacks: [ callback ] }
        } else {
            if(!bin[resource.uid].callbacks.includes(callback)) bin[resource.uid].callbacks.push(callback);
            upstreamMerge(bin[resource.uid].resource, resource);

            resource = bin[resource.uid].resource
        }

        return resource
    }

    return { register }
}