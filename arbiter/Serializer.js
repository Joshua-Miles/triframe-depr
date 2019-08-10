import { jsonpatch } from './jsonpatch'
import { Collection } from '../librarian';
import { EventEmitter } from '../herald';
import { map, filter } from '../mason';
import { markersFor } from './Markers'
import { SessionRequest } from './SessionRequest';
const skippedPrototypes = [ Object.prototype, Function.prototype, EventEmitter.prototype ]
const skippedProperties = [ 'prototype', 'constructor' ]
const primativeTypes = [ 'String', 'Boolean', 'Number', 'Date', 'Function' ]

export class Serializer {
    
    agent = new EventEmitter
    dependencies = new Array

    constructor(types){
        this.interface = { 
            types: map({ ...types, Collection }, (name, Type) => this.serializeType(Type, this.agent.of(name))), 
            dependencies: this.dependencies
        }
    }

    createSocketServer(io){
        io.on('connection', socket => {
            socket.emit('interface', this.interface)
            socket.on('message', ( { action, payload, id }) => this.agent.emit(action, { ...payload, socket, respond: (result) => {
                socket.emit(id, result)
            }}))
        })
    }

    serializeType(Type, agent){
        this.CurrentType = Type
        const instance = new Type
        const name = Type.name
        this.currentPlacement = 'class'
        const classProperties = this.serializeObject(`${name}.`, Type, agent.of('class'))
        this.currentPlacement = 'instance'
        const instanceProperties = this.serializeObject(`${name}#`, instance, agent.of('instance'))
        return  {
            name,
            classProperties,
            instanceProperties
        }
    }
    
    serializeObject(name, original, agent){
        let props = {}, target = original
        do {
            if(!skippedPrototypes.includes(target)){
                props = {
                    ...props,
                    ...filter(map(
                        filter( Object.getOwnPropertyDescriptors(target), key => !skippedProperties.includes(key) ),
                        (key, descriptor) => this.serializeProperty(`${name}${key}`, descriptor, agent.of(key))
                    ))
                }
            }
        } while (target = Object.getPrototypeOf(target));
        
        return props
    }
    
    serializeProperty(name, descriptor, agent){
        let { markers, booleanMarkers } = this.markersFor(name)

        if(markers.hidden) return

        if(typeof descriptor.value == 'function'){
            return {
                name,
                type: 'method',
                value: this.serializeFunction(descriptor.value, markers, agent),
                markers: booleanMarkers
            }
        }
        
        else if(typeof descriptor.get == 'function' || typeof descriptor.set == 'function'){
            return {
                name,
                type: 'property',
                value: {
                    get: descriptor.get && this.serializeFunction(descriptor.get, markers, agent),
                    set: descriptor.set && this.serializeFunction(descriptor.set, markers, agent)
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
    
    serializeFunction( func, markers, agent ){
        const callCache = {}
        let { pure, cache, session, authorize } = markers;
        if(session && cache) throw Error('A function cannot be cached and access the session')
        if(session && pure) throw Error('A function cannot be pure and access the session')
        if(authorize && pure) throw Error('A function cannot be pure and authorized the session')
        const usesSession = session;
        if(pure){
            let dependencies = pure
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
            agent.on('call', async ({ socket, args, id, patches, includes, attributes, session, respond, emit }) => {
                //await sleep(3000)
                let hash;
                if(authorize){
                    let authorizer, message;
                    if(typeof authorize === 'function') authorizer = authorize, message = 'You are not authorized for the requested action'
                    else authorizer = authorize.unless, message = authorize.message
                    if(!authorizer(session)) return respond({ error: true, message })
                }
                if(cache) { 
                    hash = JSON.stringify({ args, id })
                    if(callCache[hash]){
                        let { pipe, serialized } = callCache[hash]
                        respond(serialized)
                        if(pipe.observe) pipe.observe( newDocument => {
                            let newSerialized = this.serializeDocument(newDocument)
                            let patch = jsonpatch.compare(serialized, newSerialized)
                            serialized = newSerialized
                            if(path.length) emit(patch)
                        })
                        return
                    }
                }
                let target = currentPlacement == 'class' ? Type :  ( Number.isInteger(id) ? await Type.find(id, { includes }) : Type.new() )
                try{
                    jsonpatch.applyPatch(target, patches)
                } catch(err){}
                
                if(attributes) Object.assign(target, attributes)
                let pipe = func.apply(target, args)
                if(!pipe || !pipe.then){
                    respond(this.serializeDocument(pipe))
                } else { 
                    pipe.catch( err => {
                        if(err instanceof SessionRequest){
                            err.callback(session)
                        }
                    })
                    pipe.then( document => {
                        if(cache) callCache[hash] = { 
                            get serialized(){
                                return serialized
                            },
                            get pipe(){
                                return pipe
                            },
                        }

                        let serialized = this.serializeDocument(document)
                        respond(serialized)
                        if(pipe.observe) pipe.observe( newDocument => {
                            let newSerialized = this.serializeDocument(newDocument)
                            let patch = jsonpatch.compare(serialized, newSerialized)
                            serialized = newSerialized
                            emit(patch)
                        })
                    })

                    socket.on('disconnect', () => {
                        if(pipe.destroy){
                            pipe.destroy()
                        }
                    })
                }
            })
        }
    }

    serializeDocument(document, propertyName = false){
        if(!document) return document
        if(typeof document === 'function') return {
            __type__: document.name
        }
        if(propertyName && markersFor(propertyName).hidden) return undefined;
        if(primativeTypes.includes(document.constructor.name)) return document            
        return {
            __class__: document.constructor.name,
            ...map(document, (propertyName, object) => this.serializeDocument(object, `${document.constructor.name}#${propertyName}`))
        }
    }

    storeDependency(data){
        let index = this.dependencies.findIndex( dependency => dependency == data )
        if(index == -1) index= this.dependencies.push(data) - 1
        return index
    }

    markersFor(name){
        let markers = markersFor(name)
        let booleanMarkers = map(markers, ( key, value ) => !!value )
        return { markers, booleanMarkers }
    }

}