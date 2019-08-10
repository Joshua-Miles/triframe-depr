import { SessionRequest } from "./SessionRequest";
import { Pipe } from "../herald";

const root = {
    flags: new Object
}

const createOptionalArgumentDecorator = (decorator) => {
    return arg => {
        if(arg && arg.kind && arg.placement && arg.key){
            return decorator(arg, null)
        } else {
            return (decorated) => decorator(decorated, arg)
        }
    }
}

const createMarkerDecorator = name => createOptionalArgumentDecorator((decorated, payload)  => {
    if(payload === null) payload = true
    let placement = decorated.placement == 'static' ? '.' : '#'
    
    switch(decorated.kind){
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
                        root.flags[propertyName][name] = payload
                    }
                  }
            ]
        break;
        case 'field':
            let original = decorated.initializer
            decorated.initializer = function(){
                let propertyName = `${placement == '.' ? this.name : this.constructor.name}${placement}${decorated.key}`
                root.flags[propertyName] = root.flags[propertyName] || new Object 
                root.flags[propertyName][name] = payload
                return original()
            }
        break
    }
    return decorated
})

const markersFor = name => {
    return root.flags[name] || new Object
}

const clearMarkers = () => {
    delete root.flags
}

const  pure = createMarkerDecorator('pure')
const  markSession = createMarkerDecorator('session')
const  cache = createMarkerDecorator('cache')
const  authorize = createMarkerDecorator('authorize')
const  hidden = createMarkerDecorator('hidden')
const  localyCache = createMarkerDecorator('localyCache')

const session = (property) => {
    let original = property.descriptor.value
    markSession(property)
    property.descriptor.value = function(...args){
        let model = this;
        return new Pipe( emit => {
            throw new SessionRequest(session => {
                let result = new Pipe([model, original], session, ...args)
                result.observe(emit)
            })
        })
    }

    return property
}

export {
    pure,
    session,
    cache,
    localyCache,
    authorize,
    hidden,
    
    markersFor,
    clearMarkers,
    root
}