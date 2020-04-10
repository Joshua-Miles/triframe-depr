import { each, EventEmitter, toTitleCase } from "triframe/core"
import { initializeResource } from './core'

const batchFlag = Symbol()

export class Resource extends EventEmitter {

    static events = new EventEmitter

    static on(event, callback){
        if(Array.isArray(event)) event = event.map(event => `${this.name}.${event}`)
        else event = `${this.name}.${event}`
        return this.events.on(event, callback)
    }
    static emit(event, ...args){
        console.log(`Emitting: ${this.name}.${event}`)
        return this.events.emit(`${this.name}.${event}`, ...args)
    }
    static nowAndOn(event, callback){
        if(Array.isArray(event)) event = event.map(event => `${this.name}.${event}`)
        else event = `${this.name}.${event}`
        return this.events.nowAndOn(event, callback)
    }

    emit(event, ...args){
        if(this[batchFlag] && event == 'Δ.change') return null
        else return super.emit(event, ...args)
    }

    startBatchUpdate(){
        this[batchFlag] = true
    }

    commitBatchUpdate(){
        this[batchFlag] = false
        this.emit('Δ.change')
    }

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


    set(attributes) {
        let patches = []
        each(attributes, ( key, value ) => {
            let patch = {
                op: 'replace',
                path: `/${key}`,
                value
            }
            patches.push(patch)
        })
        this.emit('Δ.change', patches)
        this['[[patches]]'].push(...patches)
        Object.assign(this['[[attributes]]'], attributes)
    }

}

Object.defineProperty(Resource.prototype, '[[validation]]', {
    writable: true,
    enumerable: false,
    value: createResourceValidator()
})

function createResourceValidator() {

    let handlers = {};

    return {
        handlers,
        for: (resource) => { 
            
            if(!resource['[[validationState]]']) Object.defineProperty(resource, '[[validationState]]', {
                enumerable: false,
                value: {}
            })
            
            let showValidation = resource['[[validationState]]'];

            const hasErrors = (propertyName) => {
                return errorsFor(propertyName).length > 0
            }

            const errorsFor = (propertyName) => {
                const validators = handlers[propertyName]
                if (validators !== undefined) {
                    const property = resource[propertyName]
                    const errors = []
                    const label = toTitleCase(propertyName)
                    validators.forEach(validator => validator.call(resource, { property, label, errors, resource }))
                    return errors
                } else {
                    return []
                }
            }

            const validator = {

                addHandler: (propertyName, validator) => {
                    handlers[propertyName] = handlers[propertyName] || []
                    handlers[propertyName].push(validator)
                },

                errorMessageFor: (propertyName) => {
                    let errors = errorsFor(propertyName)
                    if(errors.length === 0) return ' '
                    if(errors.length === 1) return `${toTitleCase(propertyName)} ${errors[0]}`
                    let lastError = errors.pop()
                    return `${toTitleCase(propertyName)} ${errors.join(', ')} and ${lastError}`
                },

                shouldShowErrorsFor: (propertyName) => {
                    return showValidation[propertyName] === true && hasErrors(propertyName)
                },

                showErrorsFor: (propertyName) => {
                    showValidation[propertyName] = true
                    resource.emit('Δ.change')
                },

                hideErrorsFor: (propertyName) => {
                    showValidation[propertyName] = false
                    //resource.emit('Δ.change')
                },

                showAllErrors: () => {
                    each(handlers, propertyName => {
                        showValidation[propertyName] = true
                    })
                    resource.emit('Δ.change')
                },

                hideAllErrors: () => {
                    each(handlers, propertyName => {
                        showValidation[propertyName] = false
                    })
                    resource.emit('Δ.change')
                },

                get isInvalid() {
                    let isInvalid = false
                    each(handlers, propertyName => {
                        isInvalid = isInvalid || hasErrors(propertyName)
                    })
                    return isInvalid
                },

                get isValid() {
                    return !validator.isInvalid
                }
            }
            return validator
        }
    }
}