import {EventEmitter} from 'triframe/core'
import { sign, verify } from 'jsonwebtoken'

let encrypt = (payload, secret) => new Promise( resolve => sign(payload, secret, (err, token) => resolve(token)))
let decrypt = (token, secret) => new Promise( resolve => verify(token, secret, (err, payload) => resolve(payload)))


const each = (obj, callback) => {
    for(let i in obj){
        callback(i, obj[i])
    }
}

export const createSession = (model) => {

    const bin = {}

    const crawl = (model, namespace) => {
        class Session {
            constructor(attributes = {}, agent = null, pipes = [], callback = () => null){
                this['[[attributes]]'] = attributes
                this['[[agent]]'] = agent ? agent : new EventEmitter
                this['[[callback]]'] = callback
                this['[[pipes]]'] = pipes
            }

            onAllChanges(callback){
                this['[[agent]]'].on('*', callback)
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

            get data(){
                each(this, ( key, value ) => {
                    if(!['[[pipes]]', '[[agent]]', '[[callback]]', '[[attributes]]'].includes(key)){
                        throw Error(`Tried to assign ${key} to the session. Session properties must be initialized when 'serve' is invoked. This will result in unpredictable behavior.`)
                    }
                })
                return this['[[attributes]]']
            }

            static loadFor(connection){
                const { clientSecret } = connection;
                return new Promise( resolve => {
                    connection.emit('__load_session__', null, async (sessionToken) => {
                        let sessionData = sessionToken ?  await decrypt(sessionToken, clientSecret) : {}
                        let session = bin[clientSecret] ? bin[clientSecret] : new Session(sessionData)
                        bin[clientSecret] = session
                        session.onAllChanges(async () => {
                            let sessionToken = await encrypt(session.data, clientSecret)
                            connection.emit('__save_session__', sessionToken)
                        })
                        resolve(session)
                    })
                })
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
                       
                        return this['[[attributes]]'][key] || model[key]
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