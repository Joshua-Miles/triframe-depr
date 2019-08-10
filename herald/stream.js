import { Pipe } from "./Pipe";
import { localyCache } from '../arbiter/Markers'

export const stream = function(property){
    let value
    if(typeof property == 'function'){
        value = function(...args){
            return new Pipe( [ this, property ], ...args, )
        }
    } else {
        let original = property.descriptor.value
        property.descriptor.value = function(...args){
            return new Pipe( [this, original], ...args )
        }
        value = localyCache(property)
    }
    return value
}