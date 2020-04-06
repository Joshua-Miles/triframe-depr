import { each, EventEmitter} from 'triframe/core'

const eventEmitters = {}

const eventEmitterFor = id => {
    if(eventEmitters[id]) return eventEmitters[id]
    else return eventEmitters[id] = new EventEmitter
}

export const createSession = (model) => {

    const crawl = (model, namespace) => {
        class Session {
            constructor(attributes = {}, agent = null, pipes = [], callback = () => null){
                this['[[attributes]]'] = attributes
                this['[[agent]]'] = agent ? agent : eventEmitterFor(attributes.id)
                this['[[callback]]'] = callback
                this['[[pipes]]'] = pipes
            }

            onChange(callback){
                this['[[callback]]'] = (session) => {
                    if(session !== this){
                        Object.assign(this['[[attributes]]'], session['[[attributes]]'])
                        callback()
                    }
                }
            }

            createSlice(){
                return new Session(this['[[attributes]]'], this['[[agent]]'])
            }

            removeListeners(){
                this['[[pipes]]'].forEach( pipe => pipe.destroy())
            }

            save(){
                each(this, ( key, value ) => {
                    if(!['[[pipes]]', '[[agent]]', '[[callback]]', '[[attributes]]'].includes(key)){
                        throw Error(`Tried to assign ${key} to the session. Session properties must be initialized when 'serve' is invoked. This will result in unpredictable behavior.`)
                    }
                })
                this['[[attributes]]'].save()
            }

        }
        each(model, (key, value) => {
            if(typeof value === 'object' && value !== null){
                const NestedSession = crawl(value, `${namespace}.${key}`)
                Object.defineProperty(Session.prototype, key, {
                    get(){
                        let nestedSession = new NestedSession(this['[[attributes]]'][key], this['[[agent]]'], this['[[pipes]]'], this['[[callback]]'])
                        return nestedSession
                    }
                })
            } else {
                Object.defineProperty(Session.prototype, key, {
                    get(){
                        let newPipe = this['[[agent]]'].on(`${namespace}.${key}`, this['[[callback]]'])
                        if(this['[[pipes]]'].find( oldPipe => oldPipe.isEqual(newPipe)))
                            newPipe.destroy()
                        else 
                            this['[[pipes]]'].push(newPipe)
                       
                        return this['[[attributes]]'][key]
                    },
                    set(value){
                        this['[[attributes]]'][key] = value
                        this['[[agent]]'].emit(`${namespace}.${key}`, this)
                    }
                })
            }
        })
        return Session
    }

    return crawl(model, 'session')
}