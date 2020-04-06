import { EventEmitter } from "./EventEmitter"

const store = {}
const skippedPrototypes = [Object.prototype, Function.prototype, EventEmitter.prototype, undefined, null]

const getMetadata = (object, key) => {

    let metadata = {}
    let placement = typeof object == 'function' ? '.' : '#'

    for (let target = typeof object == 'function' ? object.prototype : object.__proto__; !skippedPrototypes.includes(target); target = target.__proto__) {
        let Class = target.constructor
        let namespace = `${Class.name}${placement}${key}`
        metadata = { ...store[namespace], ...metadata }
    }
    
    return metadata
}

const saveMetadata = (target, key, metadata) => {
    let Class = typeof target == 'function' ? target : target.constructor
    let placement = typeof target == 'function' ? '.' : '#'
    let namespace = `${Class.name}${placement}${key}`
    store[namespace] = store[namespace] || {}
    Object.assign(store[namespace], { ...metadata, className: Class.name, key, Class: Class, namespace })
}

const metadata = store;

export { getMetadata, saveMetadata, metadata }