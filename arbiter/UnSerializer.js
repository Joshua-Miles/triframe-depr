import { jsonpatch } from './jsonpatch'
import { EventEmitter, Pipe } from '../herald';
import { map, each, filter, index } from '../mason'
import { snapshot } from "../mason";
import { memoize } from '../herald/memoize';

const print = variable => JSON.parse(JSON.stringify(variable))

let compare = (obj1, obj2) => {
    let patches = jsonpatch.compare(obj1, obj2)
    return patches.filter(patch => !patch.path.includes('__'))
}


let PENDING_VALUE = Symbol()
let stringify = op => JSON.stringify(op)
export class UnSerializer {

    patches = {}

    states = {}

    constructor({ dependencies, types }) {
        if (typeof window !== 'undefined') window.patches = this.patches


        if (typeof window !== 'undefined') window.states = this.states
        this.agent = new EventEmitter
        this.dependencies = dependencies

        this.types = map(types, (key, type) => this.unSerializeType(type, this.agent.of(key)))
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
                serializer.patches[name] = patches
                let serializedResult = PENDING_VALUE
                let result = PENDING_VALUE

                const handleResponse = function (response) {
                    console.log("Received", name, response)
                    if (response && response.error) {
                        emit.throwError(response.message)
                    }
                    if (serializedResult === PENDING_VALUE || !serializedResult) {
                        serializedResult = response
                        emitDocument()
                    } else if (response) {

                        let docChanged = reconcileOperations(response)
                        if (docChanged) {
                            emitDocument()
                        }
                    } else {
                        serializedResult = response
                        emitDocument()
                    }
                }

                const emitDocument = function () {
                    let x = result
                    if (typeof serializedResult == 'object') {
                        try {
                            // console.log('Patching: ', print(patches))
                            result = snapshot(serializedResult)
                            //if(name == 'Document.editorSession') console.log(scopeMarker, 'applied', print(patches))
                            console.log("Patching:", name, print(result), print(patches))
                            jsonpatch.applyPatch(result, patches)
                            // console.log('Patched:', print(result))
                            x = unSerializeDocument(result, onChange)
                        } catch (err) { console.warn(err) }
                    } else{
                        x = serializedResult
                    }
                    // console.log(x)
                    emit(x)
                }

                const onChange = function (diff) {
                    //console.trace(diff)
                    patches.push(...diff)
                    patches = optimizePatches(patches)
                    //if(name == 'Document.editorSession') console.log(scopeMarker, 'optmized', print(patches))
                    emitDocument()
                }

                const reconcileOperations = function (ops) {
                    let changed = false
                    let reconciliationPatch = []

                    let patchHashes = patches.map(stringify)
                    let opHashes = ops.map(stringify)
                    //if(name == 'Document.editorSession') console.log(scopeMarker, 'reconciling', print(patches))
                    ops.forEach((op, opIndex) => {
                        let patchIndex = patchHashes.indexOf(opHashes[opIndex])
                        if (patchIndex > -1) {
                            // console.log("HERE-------------------------------------------------------------")
                            delete patches[patchIndex]
                        }
                        else changed = true
                        reconciliationPatch.push(op)
                    })

                    jsonpatch.applyPatch(serializedResult, reconciliationPatch)
                    // if(name == 'Document.editorSession') console.log(scopeMarker, 'rebased', 
                    //     print(reconciliationPatch)
                    // )
                    // console.log('Rebasing:', print(reconciliationPatch))
                    //if(name == 'Document.editorSession') console.log(scopeMarker, 'reconciled pre filter', print(patches))
                    serializer.patches[name] = patches = patches.filter(x => x)
                    //if(name == 'Document.editorSession') console.log(scopeMarker, 'reconciled', print(patches))
                    return changed
                }


                const optimizePatches = patches => {
                    //return patches
                    let bin = {}
                    patches.forEach(patch => {
                        if (bin[patch.path] && bin[patch.path].op == 'add' && patch.op == 'remove') {
                            delete bin[patch.path]
                        } else {
                            let temp = snapshot(serializedResult)
                            jsonpatch.applyPatch(temp, [patch])
                            let patches = compare(serializedResult, temp)
                            let changesBase = !!patches.length
                            if (changesBase) {
                                // console.log('CHANGES:', patches)
                                bin[patch.path] = patch
                            }
                        }
                    })
                    return Object.values(bin);
                }


                const read = (obj, path) => {
                    if (path.length === 0) return obj
                    let [next, ...rest] = path;
                    return read(obj[next], rest)
                }

                const unSerializeDocument = (document, callback = () => void (0), path = '') => {
                    if (!document) return document
                    if (document.__type__) return serializer.types[document.__type__]
                    if (!document.__class__ && typeof document != 'object') return document
                    let response = serializer.types[document.__class__] ? new serializer.types[document.__class__] : new Object
                    Object.assign(response, map(document, (propertyName, document) => unSerializeDocument(document, callback, `${path}/${propertyName}`)))
                    let resultSnapshot = snapshot(response)
                    Object.defineProperty(response, '_onChange', {
                        value: function () {
                            // console.log('Diffing:', print(resultSnapshot), print(response))
                            let patches = compare(resultSnapshot, response)
                            jsonpatch.applyPatch(resultSnapshot, patches)
                            // These patches may not be necessary if the base already has the update from the server
                            // Once staged, these patches will NEVER be reconciled because the server has already re-based them
                            // This creates a memory and cpu leak where the patch list grows without ever rebasing
                            this.patches.push(...patches)
                            let adjustedPatches = patches.map(patch => ({ ...patch, path: `${path}${patch.path}` }))
                            callback(adjustedPatches)
                        }
                    })
                    Object.defineProperty(response, 'patches', { value: [] })
                    return response
                }


                agent.emit('call', {
                    args,
                    patches: Number.isFinite(this.id) ? this.patches || [] : [],
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
