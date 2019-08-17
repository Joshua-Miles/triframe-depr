import { SessionRequest } from "./SessionRequest";
import { Pipe } from "../herald";

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
    markSession(property)
    property.descriptor.value = function (...args) {
        let model = this;
        return new Pipe(emit => {
            throw new SessionRequest(session => {
                let result = new Pipe([model, original], session, ...args)
                result.observe(emit)
            })
        })
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
        let newFunc = function(_, ...args){
            return original.apply(this, args)
        }
        property.descriptor.value = function (...args) {
            return new Pipe([this, newFunc], ...args)
        }
    }
    return value
} 

export {
    _shared,
    _stream,
    _session,
    _authorize,
    _public,

    markersFor,
    clearMarkers,
    root
}