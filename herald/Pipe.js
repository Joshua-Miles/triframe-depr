const execute = Symbol()

export class Pipe {

    listeners = []
    observers = []
    dependencies = []
    errorHandlers = []
    cancelationHandlers = []

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
    }

    unobserve(callback) {
        this.observers = this.observers.filter(observer => observer != callback)
    }

    then(callback, errorHandler = null) {
        if (errorHandler) this.catch(errorHandler)
        if (this.currentValue) callback(this.currentValue)
        let resolve = () => resolve = true
        this.listeners.push(async (...args) => {
            await callback(...args)
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

    apply(callback) {
        if (this.currentValue) {
            callback(this.currentValue)
        } else {
            this.then(callback);
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
        this.errorHandlers.forEach(handler => handler(err))
    }

    [execute] = async () => {
        let cursor;
        try {
            cursor = this.process.call(this.thisArg, this.emit, ...this.args)
        } catch (err) {
            this.throwError(err)
        }



        const process = ({ value, done }) => {
            return new Promise(async () => {
                const { isPipe, isPromise } = this.constructor
                const { cached, cache } = this
                const cachedValue = cached(value)

                let next;
                if (done && value === undefined) return
                if (done) next = this.emit
                else next = moveCursor

                if (cachedValue) await next(cachedValue.currentValue);
                else if (isPipe(value)) { 
                    value.apply(result => { 
                        cache(value); 
                        next(result); 
                    }); 
                    value.catch(this.throwError)
                }
                else if (isPromise(value)) { 
                    await value
                            .then(next)
                            .catch(this.throwError)
                }
                else await next(value);
            })
        }

        const moveCursor = result => process(cursor.next(result))

        if (cursor && typeof cursor.next == 'function') await moveCursor();
        else await process({ value: cursor, done: true })
    }

    cache = pipe => {
        let observer = () => {
            if ((this.observers.length || this.listeners.length) && !this.isCanceled) this[execute]()
        }
        pipe.observe(observer)
        this.onCancel(() => pipe.unobserve(observer))
        this.dependencies.push(pipe)
    }

    destroy() {
        this.isCanceled = true
        this.cancelationHandlers.forEach(callback => callback())
    }

    cached = pipe => {
        let cachedPipe = this.dependencies.find(dependency => dependency.isEqual(pipe))
        if (cachedPipe) {
            if (cachedPipe !== pipe) pipe.destroy()
            return cachedPipe
        }
    }

    isEqual = pipe => pipe && pipe.process == this.process && JSON.stringify(pipe.args) === JSON.stringify(this.args)

    static isPipe = value => value && typeof value.observe == 'function'

    static isPromise = value => value && typeof value.then == 'function'
}