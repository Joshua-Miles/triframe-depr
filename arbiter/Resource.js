import { each, EventEmitter, toTitleCase } from "../core"
import { initializeResource } from './core'


export class Resource extends EventEmitter {

    constructor(attributes = {}) {
        super()
        initializeResource(this, attributes)
    }

    get uid() {
        return this.id !== undefined
            ? `${this.constructor.name}.${this.id}`
            : null
    }

    get validation() {
        return this['[[validation]]'].for(this)
    }


    set(attributes){
        Object.assign(this, attributes)
    }

}


Object.defineProperty(Resource.prototype, '[[validation]]', {
    writable: true,
    enumerable: false,
    value: createResourceValidator()
})

function createResourceValidator() {

    const handlers = {}


    return {

        for: (resource) => ({

            handlers: handlers,

            addHandler: (propertyName, validator) => {
                handlers[propertyName] = handlers[propertyName] || []
                handlers[propertyName].push(validator)
            },

            hasErrors(propertyName){
                return this.errorsFor(propertyName).length > 0
            },

            hasNoErrors(propertyName){
                return this.errorsFor(propertyName).length === 0
            },

            errorsFor(propertyName){
                const validators = handlers[propertyName]
                if (validators !== undefined) {
                    const property = resource[propertyName]
                    const errors = []
                    const label = toTitleCase(propertyName)
                    validators.forEach(validator => validator({ property, label, errors, resource }))
                    return errors
                } else {
                    return []
                }
            },

            get isInvalid() {
                let isInvalid = false
                each(handlers, propertyName => {
                    isInvalid = isInvalid || this.hasErrors(propertyName)
                })
                return isInvalid
            },

            get isValid() {
                return !this.isInvalid
            }
        })
    }
}