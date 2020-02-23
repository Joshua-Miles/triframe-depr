import { each, map, Pipe } from "../core"
import { List } from "./List"
import { Resource } from "./Resource"
import { stageNewPatches, createBatch, commitBatch, mergePatches } from "./core"


const primativeTypes = ['String', 'Boolean', 'Number', 'Date', 'Function']

export const createUnserializer = io => {

    const cache = createCache({ socket: io })

    const classes = { Resource, List }

    const unserialize = (schema) => {
        if (typeof schema !== 'object') throw Error('schema must be a plain JavaScript Object')
        return unserializeObject(classes, schema)
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
                    target[key] = unserializeObject({}, schema)
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
        return new Function(`return ${schema.value}`)()
    }

    const unserializeRemoteFunction = (schema) => {
        const { name } = schema

        const remoteProcess = function (emit, args) {
            const { uid } = this;
            const patches = this.getNewPatches ? this.getNewPatches() : []
            const emitUnserialized = value => {
                if(value && value.error) emit.throw(new Error(value.message))
                let document = unserializeDocument(value, () => emit(document))
                emit(document)
            }
            io.emit(name, { uid, patches, args }, ({ value, hook }) => {
                emitUnserialized(value)
                if(hook !== undefined){
                    io.on(hook, ({ value }) => emitUnserialized(value))
                    io.on('reconnect', () => {
                        io.emit(name, { uid, patches, args }, ({ value, hook }) => {
                            emitUnserialized(value)
                            if(hook !== undefined) io.on(hook, ({ value }) => emitUnserialized(value))
                        })
                    })
                }
            })
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
        if(_class_) return classes[__class__]
        if(_proto_) return cache.register(new classes[_proto_](map(attributes, ( key, value ) => next(value))), callback)
        return map(attributes, ( key, value ) => next(value))
    }

    return unserialize
}


const createCache = ({ socket }) => {

    function register(resource, callback){

        let timer;

        resource.on('Δ.change', () => {
            if(timer) clearTimeout(timer)
            timer = setTimeout(() => {
                resource.emit('Δ.sync')
            }, resource['[[syncRate]]'])
        })

        resource.on('Δ.sync', () => {
            let patches = stageNewPatches(resource)
            let batchId = createBatch(resource)
            socket.emit(`${resource.uid}.sync`, { patches, batchId })
            callback()
        })

        socket.on(`${resource.uid}.commitBatch`, (batchId) => {
            commitBatch(resource, batchId)
        })
        socket.on(`${resource.uid}.mergePatches`, (patches) => {
            mergePatches(resource, patches)
            callback()
        })
        return resource
    }

    return { register }
}