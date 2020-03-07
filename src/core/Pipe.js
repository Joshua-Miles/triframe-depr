import { each } from "./iterators"
import { EventEmitter } from './EventEmitter'

const execute = Symbol()
const pending = Symbol()


export class Pipe {

    listeners = []
    observers = []
    dependencies = []
    errorHandlers = []
    cancelationHandlers = []

    executions = []

    currentValue = pending

    resources = {}


    constructor(process, ...args) {
        let thisArg;
        if (Array.isArray(process)) {
            thisArg = process[0];
            process = process[1];
        }
        this.process = process
        this.thisArg = thisArg
        this.args = args
        setTimeout(() => {
            if (!this.alreadyInitialized && !this.isCanceled) this[execute]()
        })
    }

    observe(callback) {
        if (this.cachedValue) callback(this.cachedValue)
        this.observers.push(callback)
        return this
    }

    unobserve(callback) {
        this.observers = this.observers.filter(observer => observer != callback)
        if(this.observers.length == 0){
            this.destroy()
        }
    }

    then(callback, errorHandler = () => void (0)) {
        if (this.currentValue !== pending) return this.currentValue instanceof Error
            ? errorHandler(this.currentValue)
            : callback(this.currentValue)
        let catchHandler = (err) => {
            this.errorHandlers = this.errorHandlers.filter(handler => handler != catchHandler)
            errorHandler(err)
        }
        this.catch(catchHandler)
        let resolve = () => resolve = true
        this.listeners.push(async (...args) => {
            this.errorHandlers = this.errorHandlers.filter(handler => handler != catchHandler)
            if(resolve !== true) await callback(...args)
            resolve()
        })
        return new Promise(ref => resolve === true ? ref() : resolve = ref)
    }

    catch(callback) {
        this.errorHandlers.push(callback)
    }

    onCancel(callback) {
        this.cancelationHandlers.push(callback)
    }

    apply(callback, errorHandler = () => void (0)) {
        if (this.currentValue != pending) {
            if (this.currentValue instanceof Error) errorHandler(this.currentValue)
            else callback(this.currentValue)
        } else {
            this.then(callback, errorHandler);
            this.alreadyInitialized = true;
            this[execute]()
        }
    }

    emit = async (...args) => {
        this.currentValue = args[0];
        let listeners = [...this.listeners]
        let observers = [...this.observers]
        this.listeners = []
        await Promise.all([
            ...listeners.map(listener => listener(...args)),
            ...observers.map(observer => observer(...args))
        ])
    }

    throwError = (err) => {
        this.currentValue = err
        this.errorHandlers.forEach(handler => handler(err))
    }

    [execute] = async () => {
        let cursor;
        let aborted = false
        let abortThis = () => aborted = true
        let index = 0;

        this.executions.push(abortThis)

        let emit = (...args) => {
            if (aborted) return
            while (this.executions.length && this.executions[0] != abortThis) {
                let abort = this.executions.shift()
                abort()
            }
            this.executions.shift()
            this.emit(...args)
        }

        emit.throw = this.throwError
        emit.pipe = this

        try {
            cursor = this.process.call(this.thisArg, emit, ...this.args)
        } catch (err) {
            this.throwError(err)
        }

        const process = ({ value, done }) => {
            index++
            const { isPipe, isPromise, isObservable } = this.constructor
            const { cached, cache } = this
            const cachedPromise = cached(value)
            const cachedResource = this.getCachedResource(value, index)

            const throwError = err => {
                if (cursor.throw) {
                    return process(cursor.throw(err))
                } else {
                    return this.throwError(err)
                }
            }

            let next;
            if (done && value === undefined) return
            if (done) next = (...args) => !aborted && emit(...args)
            else next = (...args) => !aborted && moveCursor(...args)
            return new Promise(async () => {
                if (cachedPromise) cachedPromise.currentValue instanceof Error
                    ? throwError(cachedPromise.currentValue)
                    : await next(cachedPromise.currentValue);
                else if(cachedResource) await next(cachedResource)
                else if (isPipe(value)) {
                    this.dependencies.push(value)
                    value.apply(result => {
                        cache(value);
                        next(result);
                    }, err => {
                        cache(value)
                        throwError(err)
                    });
                }
                else if (isPromise(value)) {
                    await value
                        .then(next)
                        .catch(err => throwError(err))
                }
                else {
                    if(!done) this.cacheResource(value, index)
                    await next(value)
                }
            })
        }

        const moveCursor = result => {
            try {
                result = cursor.next(result)
                process(result)
            } catch (err) {
                this.throwError(err)
            }
        }

        if (cursor && typeof cursor.next == 'function') await moveCursor();
        else await process({ value: cursor, done: true })
    }

    cache = pipe => {
        let observer = (err) => {
            if ((this.observers.length || this.listeners.length) && !this.isCanceled) this[execute]()
        }
        pipe.catch(observer)
        pipe.observe(observer)
        this.onCancel(() => pipe.unobserve(observer))
    }

    destroy() {
        this.isCanceled = true
        this.cancelationHandlers.forEach(callback => callback())
    }

    cached = pipe => {
        let cachedPipe = this.dependencies.find(dependency => dependency.isEqual(pipe))
        if (cachedPipe) {
            if (cachedPipe !== pipe) {
                pipe.destroy()
            }
            return cachedPipe
        }
    }

    cacheResource(resource, index){
        if(!resource) return resource
        let id;
        if(resource.uid) {
            id = resource.uid
        } else {
            let hash = JSON.stringify(resource)
            id = `${hash}.${index}`
            if(this.currentValue != pending){
                each(this.resources, key => {
                    let [cachedHash] = key.split('.')
                    if(cachedHash === hash) 
                         throw Error('A new resource was conditionally yielded identical to a prior resource. This behavior is not supported, as TriFrame will not know where to properly yield state. Please give your resources unique `uid` properties')
                })
            }
        }
        
        this.resources[id] = resource
        const agent = new EventEmitter;
        const monitor = node => {
            if(typeof node.on === 'function') node.on('Δ.change', () => agent.emit(`change`) )
            else each(node, (key, value) => {
                Object.defineProperty(node, key, {
                        get: () => value,
                        set: newValue => {
                            value = newValue
                            agent.emit(`change`)
                        }
                    })
            })
        }
        this.cache(agent.on('change'))
        crawl(resource, monitor)
    }

    getCachedResource = (resource = {}, index) => {
        if(!resource) return
        let id = resource.uid || `${JSON.stringify(resource)}.${index}`
        return this.resources[id]
    }

    isEqual = pipe => pipe && pipe.process == this.process && JSON.stringify(pipe.args) === JSON.stringify(this.args) && (pipe.thisArg == this.thisArg || !pipe.thisArg || !this.thisArg || this.thisArg.id == pipe.thisArg.id)

    static isPipe = value => value && typeof value.observe == 'function'

    static isPromise = value => value && typeof value.then == 'function'

} 

const primativeTypes = ['String', 'Boolean', 'Number', 'Date', 'Function']
const isPlain = value => value && typeof value === 'object' && !primativeTypes.includes(value.constructor.name)
const crawl = (obj, callback) => {
    if (isPlain(obj)) {
        callback(obj)
        for (let key in obj) {
            let value = obj[key]
            crawl(value, callback)
        }
    }
}