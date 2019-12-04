import { jsonpatch } from './jsonpatch'
import { EventEmitter, Pipe } from '../herald';
import { map, each, filter, index } from '../mason'
import { snapshot } from "../mason";
import { memoize } from '../herald/memoize';
import { Collection } from '../librarian/Collection';

let compare = (obj1, obj2) => {
    let patches = jsonpatch.compare(obj1, obj2)
    return patches.filter(patch => !patch.path.includes('__'))
}

let PENDING_VALUE = Symbol()
export class UnSerializer {

    nodes = {}


    constructor({ dependencies, types }) {
        if (typeof window !== 'undefined') window.nodes = this.nodes


        this.agent = new EventEmitter
        this.dependencies = dependencies

        this.types = { 
            ...map(types, (key, type) => this.unSerializeType(type, this.agent.of(key))),
            Collection
        }
            this.types.Array = Array
        if (typeof window !== 'undefined') Object.assign(window, this.types)
    }

    unSerializeType({ name, classProperties, instanceProperties }, agent) {
        const Type = class {
            constructor(attributes) {
                Object.assign(this, attributes)
            }
        }
        Object.defineProperty(Type, 'name', { value: name })
        this.unSerializeObject(Type, classProperties, agent.of('class'))
        this.unSerializeObject(Type.prototype, instanceProperties, agent.of('instance'))
        return Type
    }

    unSerializeObject(target, properties, agent) {

        each(properties, (key, property) => {
            if (!target.hasOwnProperty(key)) {
                Object.defineProperty(target, key, this.unSerializeProperty(property, agent.of(key)))
            }
        })
    }

    unSerializeProperty({ name, type, value, markers }, agent) {
        switch (type) {
            case 'method':
                return {
                    value: this.unSerializeFunction(name, value, markers, agent)
                }
                break;
            case 'property':
                let getter = this.unSerializeFunction(name, value.get, markers, agent)
                let setter = this.unSerializeFunction(name, value.set, markers, agent)
                return {
                    get: value.get ? getter : function () {
                        return getter.call(this)
                    },
                    set: value.set ? setter : function (value) {
                        return setter.call(this, value)
                    }
                }
                break;
            case 'attribute':
                return {
                    writable: true,
                    value: value
                }
                break;
        }
    }

    unSerializeFunction(name, func, markers, agent) {
        const serializer = this
        const { shared, stream } = markers
        const cache = stream;
        if (shared && func) {
            const { code, dependencyNames, dependencyValues } = func
            let dependencies = dependencyValues.map(index => this.dependencies[index])
            return new Function(...dependencyNames, `return (${code})`)(...dependencies)
        } else {

            let bin = {}
            const method = function (...args) {
                let openPipe = () => new Pipe([this, ambassador], ...args)
                if (cache) {
                    let hash = JSON.stringify({ args, attributes: this })
                    if (!bin[hash]) {
                        bin[hash] = openPipe()
                    }
                    return bin[hash]
                } else {
                    return openPipe()
                }
            }


            const ambassador = function* (emit, ...args) {
                let patches = []
                let base = PENDING_VALUE;

                serializer.nodes[name] = { 
                    get patches(){
                        return patches
                    },
                    get base(){
                        return base
                    },
                    get emitDocument(){
                        return emitDocument
                    }
                }

                const handleResponse = function (response) {
                    if (response && response.error) {
                        return emit.throwError(new Error(response.message))
                    }
                    if (base === PENDING_VALUE || !base) {
                        base = response
                        emitDocument()
                    } else if (response) {
                        let docChanged = reconcileOperations(response)
                        if (docChanged) {
                            emitDocument()
                        }
                    } else {
                        base = response
                        emitDocument()
                    }
                }

                const emitDocument = function () {
                    let result = base;
                    if (typeof base == 'object') {
                        try {
                            let clone = snapshot(base)
                            jsonpatch.applyPatch(clone, patches)
                            result = unSerializeDocument(clone)
                        } catch (err) { console.warn(err) }
                    } 
                    emit(result)
                }

                const onChange = function (diff) {
                    patches.push(...diff)
                    patches = optimizePatches(patches)
                    emitDocument()
                }

                const reconcileOperations = function (ops) {
                    let changed = false
                    let reconciliationPatch = []
                    ops.forEach((op) => {
                        reconciliationPatch.push(op)
                        for(let index in patches){
                            let patch = patches[index];
                            if(op.op == 'remove' && patch.path.startsWith(op.path)){
                                delete patches[index]
                            }
                            if(compare(op, patch).length == 0){
                                delete patches[index]
                                return;
                            }
                        }
                        changed = true
                    })
                    jsonpatch.applyPatch(base, reconciliationPatch)
                    patches = patches.filter(x => x)
                    return changed
                }


                const optimizePatches = patches => {
                    //return patches
                    let bin = {}
                    let temp = base
                    patches.forEach(patch => {
                        if (bin[patch.path] && bin[patch.path].op == 'add' && patch.op == 'remove') {
                            delete bin[patch.path]
                        } else {
                            let previous = temp
                            temp = snapshot(temp)
                            jsonpatch.applyPatch(temp, [patch])
                            let patches = compare(previous, temp)
                            let changesBase = !!patches.length
                            if (changesBase) {
                                bin[patch.path] = patch
                            }
                        }
                    })
                    return Object.values(bin);
                }

                const unSerializeDocument = (document, path = '') => {
                    if (!document) return document
                    if (document.__type__) return serializer.types[document.__type__]
                    if (!document.__class__ && typeof document != 'object') return document
                    if(Array.isArray(document)) return document.map( (doc, index) => unSerializeDocument(doc, `${path}/${index}`))
                    let response = serializer.types[document.__class__] ? new serializer.types[document.__class__] : new Object
                    Object.assign(response, map(document, (propertyName, document) => unSerializeDocument(document, `${path}/${propertyName}`)))
                    let resultSnapshot = snapshot(response)
                    Object.defineProperty(response, '_onChange', {
                        value: function () {
                            let patches = compare(resultSnapshot, response)
                            jsonpatch.applyPatch(resultSnapshot, patches)
                            // These patches may not be necessary if the base already has the update from the server
                            // Once staged, these patches will NEVER be reconciled because the server has already re-based them
                            // This creates a memory and cpu leak where the patch list grows without ever rebasing
                            this.patches.push(...patches)
                            let adjustedPatches = patches.map(patch => ({ ...patch, path: `${path}${patch.path}` }))
                            onChange(adjustedPatches)
                        }
                    })
                    // TODO: This is wrong (not scoped correctly, only works if response is the top of the node)
                    Object.defineProperty(response, 'patches', { value: patches })
                    return response
                }


                agent.emit('call', {
                    args,
                    patches: Number.isFinite(this.id) ? this.patches.filter( patch => patch) || [] : [],
                    id: this.id,
                    attributes: Number.isFinite(this.id) ? null : this,
                    respond: handleResponse
                })
                try {
                    this.patches = []
                } catch (err) { }
            }
            return method
        }
    }


}
