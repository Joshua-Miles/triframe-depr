import { each } from '../mason'
const { Pipe } = require ('./Pipe')

const bin = Symbol()
const nodes = Symbol()
const submodules = Symbol()

let id = 0
export class EventEmitter {

    constructor(){
       this.id = id++
        Object.defineProperty(this, nodes, {
            value: {},
            enumerable: false,
            writable: true
        })

        Object.defineProperty(this, submodules, {
            value: {},
            enumerable: false,
            writable: true
        })
       
        Object.defineProperty(this, bin, {
            value: [],
            enumerable: false,
            writable: true
        })
       
    }


    get bin(){
        return this[bin]
    }


    _nowAndOn = (emit, node) => {
        node.callback = emit
        emit()
        node.calls.forEach( (args) => emit(...args))
    }

    nowAndOn(events, callback){
        let node = { events, calls: [], callback: (...args) => node.calls.push(args)}
        let stream1 = this.on(events) 
        stream1.observe( (...args) => {
            node.callback(...args)
        })
        let stream = new Pipe( this._nowAndOn, node )
        stream.onCancel( () => stream1.destroy() )
        if(callback) stream.observe(callback)
        return stream
    }

    _onArray = (emit, events) => each(events, (index, event) => this.on(event, emit))

    on(events, callback){
        let stream
        if(Array.isArray(events)) stream = new Pipe( this._onArray, events)
        else stream = this.provision(events)
        if(callback) stream.observe(callback)
        return stream;
    }

    emit(event, payload, metadata={}){
        return Promise.all(this[bin].map( (node) => {
            if(this.matches( node.predicate, event)){ 
                return new Promise( resolve => {
                    let promise = node.callback(payload, event, metadata)
                    if(promise && promise.then) promise.then(resolve)
                    else resolve()
                })
            }
        }))
    }

    _provision = (emit, node, calls) => {
        node.callback = emit;
        calls.forEach( async ([args, resolve]) => { await emit(...args); resolve() }) 
    }

    provision(event){
        let calls = new Array
        let node = {
            predicate: event,
            callback: function(...args){
                return new Promise( resolve => {
                    calls.push([args,  resolve])
                })
            }
        }
        this[bin].push(node)
        let stream = new Pipe( this._provision, node, calls )
        stream.onCancel( () => {
            this[bin] = this[bin].filter( x => x !== node)
        })
        return stream
    }

    of(namespace){
        if(this[submodules][namespace]) return this[submodules][namespace]
        let newEmitter = this[submodules][namespace] = new EventEmitter 
        const proxyMarker = Symbol()
        this.on(`${namespace}.*`, (payload, event, metadata) => {
            if(metadata[proxyMarker]) return 
            let newEvent = event.replace(`${namespace}.`, '')
            newEmitter.emit(newEvent, payload)
        })
        newEmitter.on('*', (payload, event) => {
            this.emit(`${namespace}.${event}`, payload, { [proxyMarker]: true })
        })
        return newEmitter
    }

    matches(predicate, event){
        if(event === predicate) return true
        if(event.endsWith('*') && (predicate.startsWith(event.substr(0, event.length -1)) || predicate.startsWith('*'))) return true
        if(event.startsWith('*') && (predicate.endsWith(event.substr(1)) || predicate.endsWith('*'))) return true
        if(predicate.endsWith('*') && event.startsWith(predicate.substr(0, predicate.length -1))) return true
        if(predicate.startsWith('*') && event.endsWith(predicate.substr(1)) ) return true
        return false
    }


}

if(typeof window != 'undefined') window.EventEmitter = EventEmitter