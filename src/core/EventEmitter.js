const each = function(object = new Object, callback){
    for( const [index, element] of entries(object) ){
        let result = callback(index, element, object);
        if(result === Break) break;
    }
}

const { Pipe } = require('./Pipe')

const bin = Symbol()
const nodes = Symbol()
const submodules = Symbol()


export class EventEmitter {

    constructor(){
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


    _nowAndOn(emit, node){
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

    _onArray(emit, events){ each(events, (index, event) => this.on(event, emit)) }

    on(events, callback){
        let stream
        if(Array.isArray(events)) stream = new Pipe( [ this, this._onArray ], events)
        else stream = this.provision(events)
        if(callback) stream.observe(callback)
        return stream;
    }

    emit(event, ...args){
        return Promise.all(this[bin].map( (node) => {
            if(this.matches( node.predicate, event)){ 
                return new Promise( resolve => {
                    let promise = node.callback(...args, event)
                    if(promise && promise.then) promise.then(resolve)
                    else resolve()
                })
            }
        }))
    }

    _provision(emit, node, calls){
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

    // of(namespace){
    //     if(this[submodules][namespace]) return this[submodules][namespace]
    //     let newEmitter = this[submodules][namespace] = new EventEmitter 
    //     const proxyMarker = Symbol()
    //     this.on(`${namespace}.*`, (payload, ...args) => {
    //         let event = args.pop()
    //         if(metadata[proxyMarker]) return 
    //         let newEvent = event.replace(`${namespace}.`, '')
    //         newEmitter.emit(newEvent, payload)
    //     })
    //     newEmitter.on('*', (...args, event) => {
    //         this.emit(`${namespace}.${event}`, payload, { [proxyMarker]: true })
    //     })
    //     return newEmitter
    // }

    matches(predicate, event){
        if(event === predicate) return true

        if(predicate === event) return true
        let predicateSegments = predicate.split('.')
        let eventSegments = event.split('.')
        
        let i = 0
        let ii = 0
    
        while(true){
            let currentPredicateSegment = predicateSegments[i]
            let currentEventSegment = eventSegments[ii]
            let previousPredicateSegment = predicateSegments[i - 1]
            let previousEventSegment = eventSegments[ii -1]
            
            if(i === predicateSegments.length && ii == eventSegments.length){
                return true
            } 
            if(i === predicateSegments.length || ii == eventSegments.length){
                return false
            }
            if(currentPredicateSegment === '*' && i === predicateSegments.length - 1){
                return true
            }
            if(currentEventSegment === '*' && i === eventSegments.length - 1){
                return true
            }
            if(currentPredicateSegment === currentEventSegment){
                i++
                ii++
                continue
            }
            if(currentPredicateSegment === '*' || currentEventSegment === '*'){
                i++
                ii++
                continue
            }
            if(currentPredicateSegment === '*' || currentEventSegment === '*'){
                i++
                ii++
                continue
            }
            if(previousPredicateSegment === '*' && i === 1){
                ii++
                continue
            }
            if(previousEventSegment === '*' && ii === 1){
                i++
                continue
            }
            return false
        }
    }

    toJSON(){
        return {}
    }


}

if(typeof window != 'undefined') window.EventEmitter = EventEmitter