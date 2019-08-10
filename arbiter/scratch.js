import { snapshot } from "../mason";

let PENDING_VALUE = Symbol()
let stringify = op => JSON.stringify(op)

class Temp {
    unSerializeFunction(func, markers, agent){
        const { pure, cache } = markers
        if(pure){
            const { code, dependencyNames, dependencyValues } = func
            let dependencies = dependencyValues.map( index => this.dependencies[index])
            return new Function(...dependencyNames, `return (${code})`)(...dependencies)
        } else {
            
            let bin = {}
            const method = function(...args){
                let openPipe = () => new Pipe( ambassador, this, ...args )
                if(cache){
                    let hash = JSON.stringify(args)
                    if(!bin[hash]) bin[hash] = openPipe()
                    return bin[hash]
                } else {
                    return openPipe()
                }
            }

            let patches = []
            let emit;
            const ambassador = function*(e, ...args){
                emit = e
                agent.emit('call', {
                    args,
                    patches,
                    id: this.id,
                    attributes: this.id ? null : this,
                    respond: handleResponse
                })
            }

            let serializedResult = PENDING_VALUE
            let result = PENDING_VALUE
            let resultSnapshot = PENDING_VALUE 
            
            const handleResponse = function(response){
                if(serializedResult === PENDING_VALUE){
                    serializedResult = response
                } else {
                    reconcileOperations(response)
                }
                emitDocument()
            }

            const emitDocument = function(useCache = false){
                if(!useCache) {
                    result = this.unSerializeDocument(serializedResult, onChange)
                    jsonpatch.applyPatch(result, patches)
                }
                resultSnapshot = snapshot(result)
                emit(result)
            }

            const onChange = function(){
                patches.push( ...jsonpatch.compare(resultSnapshot, result) )
                emitDocument(true)
            }

            const reconcileOperations = function(ops){

                let reconciliationPatch = []

                let patchHashes = patches.map(stringify)
                let opHashes = ops.map(stringify)

                ops.forEach((op, opIndex) => {
                    let patchIndex = patchHashes.indexOf(opHashes[opIndex])
                    if(patchIndex > -1) delete patches[patchIndex]
                    reconciliationPatch.push(op)
                })

                jsonpatch.applyPatch(serializedResult, reconciliationPatch)
            }

            return method
        }
    }


    unSerializeDocument = (document, callback = () => void(0)) => {
        if(!document || !document.__class__) return document
        let result = this.types[document.__class__] ? new this.types[document.__class__] : new Object
        Object.assign(result, map( document, (propertyName, document) => this.unSerializeDocument(document, callback)))
        this.patches[result.id] = []
        result._onChange = callback
        return result
    }
}