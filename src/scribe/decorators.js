import { saveMetadata, getMetadata, toForeignKeyName, each, metadata, index, Pipe, toCamelCase } from 'triframe/core'
import { Resource } from 'triframe/arbiter'

//  ---------------------- DATATYPES ----------------------

export const string = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'varchar',
    constraints: decoratorArgs[1] || {}
}))

export const text = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'text',
    constraints: decoratorArgs[1] || {}
}))

export const numeric = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'numeric',
    constraints: decoratorArgs[1] || {}
}))

export const float = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'float8',
    constraints: decoratorArgs[1] || {}
}))

export const integer = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'int4',
    constraints: decoratorArgs[1] || {}
}))

export const boolean = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'bool',
    constraints: decoratorArgs[1] || {}
}))

export const timestamp = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'timestamp',
    constraints: decoratorArgs[1] || {}
}))

export const timestamptz = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'timestamptz',
    constraints: decoratorArgs[1] || {}
}))

export const date = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'date',
    constraints: decoratorArgs[1] || {}
}))

export const time = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'time',
    constraints: decoratorArgs[1] || {}
}))

export const point = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'point',
    constraints: decoratorArgs[1] || {}
}))

export const line = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'line',
    constraints: decoratorArgs[1] || {}
}))

export const lseg = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'lseg',
    constraints: decoratorArgs[1] || {}
}))

export const path = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'path',
    constraints: decoratorArgs[1] || {}
}))

export const polygon = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'polygon',
    constraints: decoratorArgs[1] || {}
}))

export const circle = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'circle',
    constraints: decoratorArgs[1] || {}
}))

export const list = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'json',
    constraints: decoratorArgs[1] || {},
    sqlEncode: value => JSON.stringify(value),
    sqlDecode: value => {
        try {
            return JSON.parse(value)
        } catch(err) {
            return value;
        }
    } 
}))

export const json = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'json',
    constraints: decoratorArgs[1] || {},
    sqlEncode: value => JSON.stringify(value),
    sqlDecode: value => {
        try {
            return JSON.parse(value)
        } catch(err) {
            return value;
        }
    } 
}))

export const serial = createPropertyDecorator(({ decoratorArgs }) => ({
    datatype: 'SERIAL',
    constraints: decoratorArgs[0] || {}
}))

export const pk = serial({ primaryKey: true })

//  ---------------------- RELATIONSHIPS ----------------------
export const virtual = createDecorator(({ decoratorArgs: [definition], target, key, fieldValue, isMethod }) => {
    if(!isMethod) Object.defineProperty(target, key, createDocumentProperty(key))
    return {
        isShared: true,
        type: 'virtual',
        definition,
        defaultValue: fieldValue
    }
})

export const hasMany = createPropertyDecorator(({ decoratorArgs: [options = {}], target, key, fieldValue }) => {
    Object.defineProperty(target, key, createDocumentProperty(key))
    return {
        isShared: true,
        type: 'relationship',
        joinType: 'hasMany',
        options,
        defaultValue: fieldValue
    }
})

export const hasOne = createPropertyDecorator(({ decoratorArgs: [options = {}], target, key, fieldValue }) => {
    Object.defineProperty(target, key, createDocumentProperty(key))
    return {
        isShared: true,
        type: 'relationship',
        joinType: 'hasOne',
        options,
        defaultValue: fieldValue
    }
})

export const belongsTo = createPropertyDecorator(({ decoratorArgs: [options = {}], target, key, fieldValue }) => {
    let foreignKey = toCamelCase( toForeignKeyName(key) )
    saveMetadata(target, foreignKey, {
        type: 'persisted',
        datatype: 'int4',
        isShared: true
    })
    // hasMany would listen for a foreign key change on this side
    // target.constructor.on(`*.changed.${foreignKey}`, (e, event) => {
    //     let [ id ] = event.split('.')
    //     target.constructor.emit(`${id}.changed.${key}`)
    // })

    Object.defineProperty(target, key, createDocumentProperty(key))
    Object.defineProperty(target, foreignKey, createDocumentProperty(foreignKey))
    return {
        isShared: true,
        type: 'relationship',
        joinType: 'belongsTo',
        options,
        defaultValue: fieldValue
    }
})

//  --------------------- ACCESS LEVELS --------------------


// export const read =  createDecorator(({ decoratorArgs, fieldValue }) => ({
//     readAccess: decoratorArgs[0],
//     readAccessTest: decoratorArgs[1]
// }))

// export const write =  createDecorator(({ decoratorArgs, fieldValue }) => ({
//     writeAccess: decoratorArgs[0],
//     writeAccessTest: decoratorArgs[1]
// }))

// export const access =  createDecorator(({ decoratorArgs, fieldValue }) => ({
//     readAccess: decoratorArgs[0],
//     writeAccess: decoratorArgs[0],
//     readAccessTest: decoratorArgs[1],
//     readAccessTest: decoratorArgs[1]

// }))



export const hidden =  createDecorator(({ decoratorArgs, fieldValue }) => ({
   readAccessTest: () => false
}))

export const readonly =  createDecorator(({ decoratorArgs, fieldValue }) => ({
   writeAccessTest: () => false
}))

export const hiddenUnless =  createDecorator(({ decoratorArgs, fieldValue }) => ({
   readAccessTest: decoratorArgs[0]
}))

export const readonlyUnless =  createDecorator(({ decoratorArgs, fieldValue }) => ({
   writeAccessTest: decoratorArgs[0]
}))



//  ---------------------- MISC ----------------------

export const shared = createDecorator(({ decoratorArgs, fieldValue }) => ({
    isShared: true
}))


export const session = createDecorator(({ decoratorArgs, fieldValue }) => ({
    usesSession: true
}))

export const validate = createDecorator(({ decoratorArgs, target, key, fieldValue }) => {
    decoratorArgs.forEach( validator => target.validation.addHandler(key, validator))
    return {
        validators: decoratorArgs
    }
})

export const include = (...models) => decorated => {

    register( (target) => {    

        let Class = typeof target === 'function' ? target : target.constructor
        let prototype = typeof target === 'function' ? target.prototype : target

        
        each(models, (key, Model) => {


            // Copy Static
            each(Object.getOwnPropertyDescriptors(Model), (key, descriptor) => {
                if(key == 'name' || key == 'prototype' || key == 'length') return
                let metadata = getMetadata(Model, key)
                if(!isEmpty(metadata)) saveMetadata(Class, key, metadata)
                Object.defineProperty(Class, key, descriptor)
            })

            // Copy Prototype
            each(Object.getOwnPropertyDescriptors(Model.prototype), (key, descriptor) => {
                if(key === 'constructor' || key === 'onConstruct' || key === '[[validation]]') return
                let metadata = getMetadata({ __proto__: { constructor: Model } }, key)
                if(!isEmpty(metadata)) saveMetadata(prototype, key, metadata)
                Object.defineProperty(prototype, key, descriptor)
            })

            if(Model.prototype['[[validation]]']){
                if(prototype['[[validation]]']) prototype['[[validation]]'].handlers = { ...prototype['[[validation]]'].handlers, ...Model.prototype['[[validation]]'].handlers }
                else prototype['[[validation]]'] = Model.prototype['[[validation]]']
            }    

        })    
        
    })(decorated) 


    initialize((object) => {
        each(models, (key, Model) => {
            if(Model.prototype.onConstruct) Model.prototype.onConstruct.call(object)
        })
    })(decorated)
}

function createStream(method, prependEmit = false){
    const process = function(emit, ...args){
        if(prependEmit) args.unshift(emit)
        return method.call(this, ...args)
    }
    return function(...args){
        return new Pipe([this, process], ...args)
    }
}

export const stream = (decorated, prependEmit = false) => {
    if(typeof decorated === 'object'){
        let original;
        register( (target, key) => {
            saveMetadata( target, key, {
                isStream: true,
                prependEmit,
                original
            })
        })(decorated)
        wrap(method => {
            original = method
            return createStream(method,prependEmit)
        })(decorated)
        return decorated
    } 
    if(typeof decorated === 'function'){
        return createStream(decorated,prependEmit)
    }
    if(typeof decorated === 'boolean'){
        return x => stream(x, decorated)
    } 
}

// TODO: VALIDATION DECORATOR


function createPropertyDecorator(define) {

    const decorator = function (decorated, decoratorArgs = []) {
        decorated = register((target, key, fieldValue) => {
            saveMetadata(target, key, {
                isShared: true,
                type: 'persisted',
                defaultValue: fieldValue,
                ...define({ decoratorArgs, target, key, fieldValue })
            })
        })(decorated)
        delete decorated.initializer
        delete decorated.descriptor.value
        delete decorated.descriptor.writable
        return {
            ...decorated,
            kind: 'method',
            placement: 'prototype',
            descriptor: {
                ...decorated.descriptor,
                ...createDocumentProperty(decorated.key)
            }
        } // initialize((target, key, value) => { })(decorated)
    }

    return function (...args) {
        if (args[0] && args[0].descriptor && args[0].kind) return decorator(args[0])
        return decorated => decorator(decorated, args)
    }
}

function createDecorator(define) {

    const decorator = function (decorated, decoratorArgs = []) {
        register((target, key, fieldValue, isMethod) =>
            saveMetadata(target, key, {
                ...define({ decoratorArgs, target, key, fieldValue, isMethod })
            })
        )(decorated)
        
    }

    return function (...args) {
        if (args[0] && args[0].descriptor && args[0].kind) return decorator(args[0])
        return decorated => decorator(decorated, args)
    }
}

function createDocumentProperty(key) {
    return {
        enumerable: true,
        get: new Function(`
            return this['[[attributes]]'].${key}
        `),
        set: new Function('value', `
            this['[[attributes]]'].${key} = value
            let patch = {
                op: 'replace',
                path: '/${key}',
                value
            }
            this['[[patches]]'].push(patch)
            this.emit('Δ.change', [ patch ])
        `)
    }
}

function register(callback) {
    return function (decorated) {
        let previous = decorated.finisher
        let { initializer } = decorated
        decorated.finisher = Class => {
            if (typeof previous == 'function') previous(Class)
            let value;
            switch (decorated.placement) {
                case 'class':
                    callback(Class)
                    break;
                case 'static':
                    value = decorated.kind === 'field' && typeof initializer === 'function' ? initializer() : decorated.descriptor?.value
                    callback(Class, decorated.key, value)
                    break;
                default:
                    value = decorated.kind === 'field' && typeof initializer === 'function' ? initializer() : decorated.descriptor?.value
                    callback(Class.prototype, decorated.key, value, decorated.kind === 'method')

            }
        }
        return decorated
    }
}

function wrap(callback) {
    return function (decorated) {
        let original;
        switch (decorated.kind) {
            case 'field':
                original = typeof decorated.initializer === 'function' ? decorated.initializer : () => null
                decorated.initializer = () => function (...args) {
                    callback(() => original(...args))
                }
                break;
            case 'method':
                original = decorated.descriptor.value
                decorated.descriptor.value = callback(original)
                break;
        }
        return decorated
    }
}

function initialize(callback) {
    return function (decorated) {
        let temp = Symbol()
        decorated.extras = [  {
            kind: 'field',
            placement: 'own',
            key: temp,
            descriptor: {},
            initializer() {
                delete this[temp]
                // let value = typeof decorated.initializer === 'function' ? decorated.initializer() : undefined
                callback(this)
            }
        } ]
    }
}

const isEmpty = x => Object.keys(x).length === 0