import { EventEmitter } from "triframe/core"

export class List extends Array {

    constructor(...elements) {
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

    on(...args) {
        return this['[[events]]'].on(...args)
    }

    emit(...args) {
        return this['[[events]]'].emit(...args)
    }

    push(...elements) {
        let length = this.length
        let patches = elements.map(element => ({
            op: 'add',
            path: `/${length++}`,
            value: element
        }))
        this["[[patches]]"].push(...patches)
        this.emit('Δ.change', patches)
        super.push(...elements)
    }

    _splice(...args){
        return super.splice(...args)
    }

    splice(index, deleted, ...elements) {
        super.splice(index, deleted, ...elements)
        
        let origin = Math.min(deleted + index, elements.length + index)
    
        let replacementPatches = []
        for(let i = index; i < origin; i++) replacementPatches.push({
            op: 'replace',
            path: `/${i}`,
            value: elements[i - index]
        })

        let removedPatches = []
        for(let i = origin; i < index + deleted; i++) removedPatches.push({
            op: 'remove',
            path: `/${i}`,
        })

        let additionPatches = []
        for(let i = origin; i < index + elements.length; i++) removedPatches.push({
            op: 'add',
            path: `/${i}`,
            value: elements[i - index]
        })

        let patches = [ ...replacementPatches, ...removedPatches, ...additionPatches ]

        this["[[patches]]"].push(...patches)
        this.emit('Δ.change', patches)
    }

    insert(element, index) {
        super.splice(index, 0, element)
        let patch = {
            op: 'add',
            path: `/${index}`,
            value: element
        }
        this["[[patches]]"].push(patch)
        this.emit('Δ.change', [patch])
    }


    replace(index, value) {
        this[index] = value
        let patch = {
            op: 'replace',
            path: `/${index}`,
            value
        }
        this["[[patches]]"].push(patch)
        this.emit('Δ.change', [patch])
    }


    map$(callback) {
        let patches = []
        this.forEach((element, index) => {
            let value = callback(element, index)
            if (value != element) {
                this[index] = value
                let patch = {
                    op: 'replace',
                    path: `/${index}`,
                    value
                }
                patches.push(patch)
            }
        })
        this["[[patches]]"].push(...patches)
        this.emit('Δ.change', patches)
    }


    remove(start, end = null) {
        if (end == null) end = start
        super.splice(start, 1 + end - start)
        let patches = []
        for (let index = start; index <= end; index++) {
            patches.push({
                op: 'remove',
                path: `/${start}`
            })
        }
        this["[[patches]]"].push(...patches)
        this.emit('Δ.change', patches)
    }
}