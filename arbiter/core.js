import { jsonpatch, JSONPatchOT } from "./jsonpatch"
import { each, toCapitalized } from "../core"

export const initializeResource = (resource, attributes) => {
    // [[base]] + [[patches]] = [[attributes]]
    Object.defineProperty(resource, '[[attributes]]', {
        writable: true,
        enumerable: false,
        value: attributes
    })
    Object.defineProperty(resource, '[[base]]', {
        writable: true,
        enumerable: false,
        value: jsonpatch.deepClone(attributes)
    })
    Object.defineProperty(resource, '[[patches]]', {
        writable: true,
        enumerable: false,
        value: []
    })
    Object.defineProperty(resource, '[[batch]]', {
        writable: true,
        enumerable: false,
        value: 1
    })
    Object.defineProperty(resource, '[[syncRate]]', {
        writable: true,
        enumerable: false,
        value: 0
    })
    subscribeToChildEvents(resource, attributes)
    if(typeof resource.onChange === 'function') 
        resource.on('Δ.change', (patches) => emitResourceEvent(resource, 'change', patches))
}

export const stageNewPatches = resource => { // unserializer -> unserialzieRemoteFunction
    let stagedPatches = []
    resource['[[patches]]'].forEach(patch => {
        let isNew = !patch.staged
        if (!patch.batchId) patch.batchId = resource['[[batch]]']
        if (isNew) {
            patch.staged = true
            stagedPatches.push(patch)
        }
    })
    return stagedPatches
}


export const appendPatches = (resource, patches) => {
    if (!resource || !resource["[[patches]]"]) return []
    jsonpatch.applyPatch(resource['[[attributes]]'], patches)
    resource["[[patches]]"].push(...patches)
    return patches
}

export const mergePatches = (resource, patches) => {
    resource['[[patches]]'] = JSONPatchOT.transform(resource['[[patches]]'], patches)
    emitResourceEvent(resource, 'merge', patches)
    return commitPatches(resource, patches)
}

export const createBatch = resource => {
    return resource['[[batch]]']++;
}

export const commitBatch = (resource, batchId) => {
    let patches = resource['[[patches]]'].filter(patch => patch.batchId === batchId)
    resource['[[patches]]'] = resource['[[patches]]'].filter(patch => patch.batchId !== batchId)
    return commitPatches(resource, patches)
}

const commitPatches = (resource, patches) => {
    jsonpatch.applyPatch(resource['[[base]]'], patches)
    let attributes = jsonpatch.deepClone(resource['[[base]]'])
    jsonpatch.applyPatch(attributes, resource['[[patches]]'])
    resource['[[attributes]]'] = attributes
    subscribeToChildEvents(resource, attributes)
    return patches
}

const subscribeToChildEvents = (resource, attributes) => {
    each(attributes, (key, value) => {
        if (value && value.on) {
            value.on('Δ.change', patches => {
                const mappedPatches = patches.map(patch => ({
                    op: patch.op,
                    path: `/${key}${patch.path}`,
                    value: patch.value,
                }))
                resource["[[patches]]"].push(...mappedPatches)
                resource.emit('Δ.change', mappedPatches)
            })
        }
    })
}

const emitResourceEvent = (resource, event, payload) => {
    resource.emit(event, payload)
    const methodName = `on${toCapitalized(event)}`
    if(typeof resource[methodName] === 'function') 
        resource[methodName](payload)
}