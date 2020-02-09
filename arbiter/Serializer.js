import { jsonpatch, JSONPatchOT } from './jsonpatch'
import { EventEmitter } from '../herald';
import { map, filter } from '../mason';
import { markersFor } from './Markers'
import { SessionRequest } from './SessionRequest';
import { List } from '../librarian';
const skippedPrototypes = [Object.prototype, Function.prototype, EventEmitter.prototype]
const skippedProperties = ['prototype', 'constructor']
const primativeTypes = ['String', 'Boolean', 'Number', 'Date', 'Function']

export class Serializer {

    agent = new EventEmitter
    dependencies = new Array
    patches = new Object

    constructor(types) {
        this.interface = {
            types: map(types, (name, Type) => this.serializeType(Type, this.agent.of(name))),
            dependencies: this.dependencies
        }
    }

    serializeType(Type, agent) {
        this.CurrentType = Type
        const instance = new Type
        const name = Type.name
        this.currentPlacement = 'class'
        const classProperties = this.serializeObject(`${name}.`, Type, agent.of('class'))
        this.currentPlacement = 'instance'
        const instanceProperties = this.serializeObject(`${name}#`, instance, agent.of('instance'))
        return {
            name,
            classProperties,
            instanceProperties
        }
    }

    serializeObject(name, original, agent) {
        let props = {}, target = original
        do {
            if (!skippedPrototypes.includes(target)) {
                props = {
                    ...props,
                    ...filter(map(
                        filter(Object.getOwnPropertyDescriptors(target), key => !skippedProperties.includes(key)),
                        (key, descriptor) => this.serializeProperty(`${name}${key}`, descriptor, agent.of(key))
                    ))
                }
            }
        } while (target = Object.getPrototypeOf(target));

        return props
    }

    serializeProperty(name, descriptor, agent) {
        let { markers, booleanMarkers } = this.markersFor(name)
        if (!markers.authorize && !markers.publish && !markers.shared) {
            return undefined
        }

        if (typeof descriptor.value == 'function') {
            return {
                name,
                type: 'method',
                value: this.serializeFunction(name, descriptor.value, markers, agent),
                markers: booleanMarkers
            }
        }

        else if (typeof descriptor.get == 'function' || typeof descriptor.set == 'function') {
            return {
                name,
                type: 'property',
                value: {
                    get: descriptor.get && this.serializeFunction(name, descriptor.get, markers, agent),
                    set: descriptor.set && this.serializeFunction(name, descriptor.set, markers, agent)
                },
                markers: booleanMarkers
            }
        }

        else {
            return {
                name,
                type: 'attribute',
                value: descriptor.value,
                markers: booleanMarkers
            }
        }
    }

    serializeFunction(name, func, markers, agent) {
        const callCache = {}
        let { shared, session, authorize, publish, stream } = markers;
        
        if (session && shared) throw Error('A function cannot be shared and access the session')
        if (authorize && shared) throw Error('A function cannot be shared and require authorization')
        if (authorize && publish) throw Error('A function cannot be publish and require authorization')
        const cache = (!session && stream);

        if (shared) {
            let dependencies = shared
            let dependencyNames = Object.keys(dependencies)
            let dependencyValues = Object.values(map(dependencies, (key, value) => this.storeDependency(value)))
            return {
                dependencyNames: dependencyNames,
                dependencyValues: dependencyValues,
                code: func.toString()
            }
        } else {
            const Type = this.CurrentType;
            const currentPlacement = this.currentPlacement;
            agent.on('call', async ({ socket, requestId, instanceId, args, id, patches, includes, timestamp, attributes, session, emit }) => {
                // Create a unique identifier for this method call
                let hash = JSON.stringify({ args, id })

                // Create the object of the request
                let createTarget = async() => {
                    let namespace = `${Type.name}.${id}`
                    let target
                    if(currentPlacement == 'class') target = Type 
                    else if(Number.isInteger(id)) target = this.instanceCache[instanceId] || await Type.find(id, includes) 
                    else target = new Type
                    try { 
                        if(this.patches[namespace]){
                            // let otherPatches = this.patches[namespace].reduce( (patches, request) => {
                            //     if(request.timestamp > timestamp && request.socketId != socket.id){
                            //         patches.push(...request.patches)
                            //     }
                            //     return patches
                            // }, [])
                            // patches = JSONPatchOT.transform(patches, otherPatches);
                        }
                        patches.forEach( op => {
                            op.sender = socket.id
                            try{
                                jsonpatch.applyOperation(target, op) 
                            } catch(err){
                                console.log(err)
                            }
                        })
                        if(id) {
                            this.patches[namespace] = this.patches[namespace] || []
                            this.patches[namespace].push({ patches, timestamp, socketId: socket.id })
                        }
                    } catch (err) { console.log('ERROR:', err) }
                    if (attributes) Object.assign(target, attributes)
                    target.patches = patches
                    return target
                }

                // Process a document and opened pipe for response
                let sendResponse = ({document, pipe}) => {

                    // Cache result if it has not been cached yet
                    if(cache && !callCache[hash]) callCache[hash] = {
                        get document() {
                            return document
                        },
                        get pipe() {
                            return pipe
                        }
                    }
                 

                    let serialized = this.serializeDocument(document, session, `${socket.id}.${requestId}`)
                    emit({ body: serialized, timestamp: (new Date).getTime() })
                    
                    // Emit updates to the requestor
                    if (pipe && pipe.observe) {
                        let emitUpdate = newDocument => {
                            if(newDocument && newDocument.$patch){
                                jsonpatch.applyPatch(serialized, newDocument.$patch)
                                return emit({ body: newDocument.$patch.filter(op => op.sender !== socket.id)})
                            }
                            if(name == 'Document.content') console.log("AND HERE----")
                            document = newDocument
                            let newSerialized = this.serializeDocument(newDocument, session, `${socket.id}.${requestId}`)
                            if(newSerialized && serialized){
                                let patch = jsonpatch.compare(serialized, newSerialized)
                                emit({ body: patch, timestamp: (new Date).getTime() })
                            } else {
                                emit({ body: newSerialized, timestamp: (new Date).getTime()})
                            }
                            serialized = newSerialized
                        }
                        pipe.observe(emitUpdate)

                        // Unobserve the pipe.
                        // Destroy the pipe if it is ambandoned
                        socket.on('disconnect', () => {
                            pipe.unobserve(emitUpdate)
                            if (pipe.observers.length == 0) {
                                delete callCache[hash]
                                pipe.destroy()
                            }
                        })
                    }
                }

                // Check method authorization
                if (authorize) {
                    let authorizer, message;
                    if (typeof authorize === 'function') authorizer = authorize, message = 'You are not authorized for the requested action'
                    else authorizer = authorize.unless, message = authorize.message
                    if (!authorizer(session)) return emit({ error: true, message })
                }

                // Check for a cached result
                if (cache && callCache[hash]) return sendResponse(callCache[hash])

                // Call the method
                let pipe = func.apply(await createTarget(), args)
                
                // Send any non-pipe/promise response immediately
                if (!pipe || !pipe.then) return sendResponse({ document: pipe, pipe: null })
                    
                // Catch any requests for the session. 
                // This will always be reached for methods that can access the session
                // as they cannot be cached
                pipe.catch(err => {
                    if (err instanceof SessionRequest) {
                        err.callback(session)
                    } else {
                        emit({ error: true, message: err.message })
                    }
                })

                pipe.then(document => sendResponse({ document, pipe }))
                
            })
        }
    }

    instanceCache = {}

    serializeDocument(document, session, instanceId, propertyName = false) {
        if (propertyName && session) {
            let { authorize, publish } = markersFor(propertyName)
            if (authorize && publish) throw Error('A field cannot be publish and require authorization')
            if (authorize) {
                let authorizer, message;
                if (typeof authorize === 'function') authorizer = authorize, message = 'You are not authorized for the requested action'
                else authorizer = authorize.unless, message = authorize.message
                if (!authorizer(session)) return undefined
            }
            if (!authorize && !publish && !propertyName.startsWith('Collection') && !propertyName.startsWith('List') && !propertyName.includes('_') && !propertyName.startsWith('Object') && !propertyName.startsWith('Array')) {
                //console.log('blocked', propertyName)
                return undefined
            } else {
                //console.log(propertyName)
            }
            // if(propertyName.startsWith('Collection')) console.log(propertyName, document)
        }
        if (typeof document === 'function') return {
            __type__: document.name
        }
        if (!document) return document
        this.cacheInstance(document, `${instanceId}/${propertyName}`)
        if (primativeTypes.includes(document.constructor.name)) return document
        if(Array.isArray(document)) return document.map( (element, index) => this.serializeDocument(element, session, instanceId, `${document.constructor.name}#${index}`))
        return {
            ...map(document, (propertyName, object) => this.serializeDocument(object, session, instanceId, `${document.constructor.name}#${propertyName}`)),
            __class__: document.constructor.name,
            __index__: document.__index__,
            __IID__: `${instanceId}/${propertyName}`
        }
    }

    cacheInstance(instance, socketId){
        this.instanceCache[socketId] = instance
    }

    storeDependency(data) {
        let index = this.dependencies.findIndex(dependency => dependency == data)
        if (index == -1) index = this.dependencies.push(data) - 1
        return index
    }

    markersFor(name) {
        let markers = markersFor(name)
        let booleanMarkers = map(markers, (key, value) => !!value)
        return { markers, booleanMarkers }
    }

}