import { SessionRequest } from "./SessionRequest";
import { Pipe } from "../herald";
import { each } from "../mason";

const root = {
    flags: new Object
} 

const createOptionalArgumentDecorator = (decorator) => {
    return (...args) => {
        let arg = args[0]
        if (arg && arg.kind && arg.placement && arg.key) {
            return decorator(arg, [])
        } else {
            return (decorated) => decorator(decorated, args)
        }
    }
}

const createMarkerDecorator = name => createOptionalArgumentDecorator((decorated, methods) => {
    if (decorated.kind == 'class') {
        let temp = Symbol()
        decorated.elements.push({
            kind: "field",
            key: temp,
            placement: "own",
            descriptor: {},
            initializer() {
                delete this[temp]
                methods.forEach(method => {
                    let placement = method.startsWith('#') ? '' : '.'
                    let propertyName = `${this.constructor.name}${placement}${method}`
                    root.flags[propertyName] = root.flags[propertyName] || new Object
                    root.flags[propertyName][name] = true
                })
            }
        })

        return decorated
    } else {
        let placement = decorated.placement == 'static' ? '.' : '#'

        switch (decorated.kind) {
            case 'method':
                let temp = Symbol()
                decorated.extras = [
                    {
                        kind: "field",
                        placement: "own",
                        key: temp,
                        descriptor: {},
                        initializer() {
                            delete this[temp]
                            let propertyName = `${this.constructor.name}${placement}${decorated.key}`
                            root.flags[propertyName] = root.flags[propertyName] || new Object
                            root.flags[propertyName][name] = true
                        }
                    }
                ]
                break;
            case 'field':
                let original = decorated.initializer
                decorated.initializer = function () {
                    let propertyName = `${placement == '.' ? this.name : this.constructor.name}${placement}${decorated.key}`
                    root.flags[propertyName] = root.flags[propertyName] || new Object
                    root.flags[propertyName][name] = true
                    return original.call(this)
                }
                break
        }
        return decorated
    }
})

const markersFor = name => {
    return root.flags[name] || new Object
}

const clearMarkers = () => {
    delete root.flags
}

const _shared = createMarkerDecorator('shared')
const _authorize = createMarkerDecorator('authorize')
const _public = createMarkerDecorator('publish')

const markSession = createMarkerDecorator('session')
const markStream = createMarkerDecorator('stream')


const _session = (property) => {
    let original = property.descriptor.value
    let newFunc = function (_, ...args) {
        return original.apply(this, args)
    }
    markSession(property)
    property.descriptor.value = function (...args) {
        let model = this;
        let pipe = new Pipe(emit => {
            throw new SessionRequest(session => {
                let result = new Pipe([model, newFunc], session, ...args)
                result.observe(emit)
                result.catch(err => pipe.throwError(err))
            })
        })
        return pipe
    }

    return property
}

const _stream = function (property) {
    let value
    markStream(property)
    if (typeof property == 'function') {
        value = function (...args) {
            return new Pipe([this, property], ...args)
        }
    } else {
        let original = property.descriptor.value
        let newFunc = function (_, ...args) {
            return original.apply(this, args)
        }
        property.descriptor.value = function (...args) {
            return new Pipe([this, newFunc], ...args)
        }
    }
    return value
}

const _validate = validator => function (decorated) {
    decorated.extras = [
        ...decorated.extras || [],
        {
            kind: "method",
            placement: "static",
            key: `validate_${decorated.key}`,
            descriptor: {
                value: validator
            }
        }
    ]
    let original = decorated.initializer;
    decorated.initializer = function () {
        let propertyName = `${this.constructor.name}.validate_${decorated.key}`
        root.flags[propertyName] = root.flags[propertyName] || new Object
        root.flags[propertyName].shared = true
        return original.call(this)
    }
    return decorated
}


const _composes = function (...parents) {
    return child => {
        parents.forEach(parent => {

            let addElement = ( placement, name, descriptor ) => {
                if(name == 'constructor' || typeof name == 'symbol') return
                child.elements = child.elements.filter( element => !(element.key == name && element.placement == placement))
                if(descriptor.value !== undefined && typeof descriptor.value !== 'function'){
                    if(descriptor.enumerable == false) return
                    let value = descriptor.value;
                    delete descriptor.value
                    child.elements.push({
                        kind: 'field',
                        key: name,
                        placement: placement,
                        descriptor: descriptor,
                        initializer: () => value
                    })
                } else {
                    child.elements.push({
                        kind: 'method',
                        key: name,
                        placement: placement,
                        descriptor: descriptor,
                    })
                }
            }

            let instance = new parent
            let instanceMethods = {
                ...Object.getOwnPropertyDescriptors(parent.prototype),
                ...Object.getOwnPropertyDescriptors(instance)
            }
            each(instanceMethods, (name, descriptor) => addElement('own', name, descriptor))


            let classMethods = Object.getOwnPropertyDescriptors(parent)
            each(classMethods, (name, descriptor) => addElement('static', name, descriptor))

            // Add hook to zip flags together
            let temp = Symbol()
            child.elements.push({
                kind: "field",
                key: temp,
                placement: "own",
                descriptor: {},
                initializer() {
                    this.fields = { ...this.fields, ...instance.fields}
                    this.query = this.constructor.query.bind(this.constructor)
                    delete this[temp]
                    each(instanceMethods, (method) => {
                        let propertyName = `${this.constructor.name}#${method}`
                        let formerName = `${parent.name}#${method}`
                        root.flags[propertyName] = root.flags[propertyName] || new Object
                        Object.assign(root.flags[propertyName], root.flags[formerName])
                    })
                    each(classMethods, (method) => {
                        let propertyName = `${this.constructor.name}.${method}`
                        let formerName = `${parent.name}.${method}`
                        root.flags[propertyName] = root.flags[propertyName] || new Object
                        Object.assign(root.flags[propertyName], root.flags[formerName])
                    })
                }
            })
        })

        return child
    }
}

export {
    _shared,
    _stream,
    _session,
    _authorize,
    _public,
    _validate,
    _composes,

    markersFor,
    clearMarkers,
    root
}