import { EventEmitter } from "../core"

export class List extends Array {

    constructor(...elements){
        super(...elements)
        Object.defineProperty(this, '[[patches]]', {
            enumerable: false,
            value: []
        })
        Object.defineProperty(this, '[[events]]', {
            enumerable: false,
            value: new EventEmitter
        })
    }

    on(...args){
        return this['[[events]]'].on(...args)
    }

    emit(...args){
        return this['[[events]]'].emit(...args)
    }

    push(...elements){
        let length = this.length
        let patches = elements.map( element => ({
            op: 'add',
            path: `/${length++}`,
            value: element
        }))
        this["[[patches]]"].push(...patches)
        this.emit('Δ.change', patches)
        super.push(...elements)
    }
    
    insert(element, index){
        this.splice(index, 0, element)
        let patch = {
            op: 'add',
            path: `/${index}`,
            value: element
        }
        this["[[patches]]"].push(patch)
        this.emit('Δ.change', [ patch ])
    }

    
    replace(index, value){
        this[index] = value
        let patch = {
            op: 'replace',
            path: `/${index}`,
            value
        }
        this["[[patches]]"].push(patch)
        this.emit('Δ.change', [ patch ])
    }


    remove(index){
        this.splice(index, 1)
        let patch = {
            op: 'remove',
            path: `/${index}`
        }
        this["[[patches]]"].push(patch)
        this.emit('Δ.change', [ patch ])
    }
}