import { jsonpatch, JSONPatchOT } from "./jsonpatch"
import { each } from "triframe/core"
import { SyncEvent } from "./SyncEvent"
import { eachAsync, getMetadata } from "triframe/core"

export const initializeResource = (resource, attributes = {}) => {
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
    Object.defineProperty(resource, 'toJSON', {
        value: function(){
            return this['[[attributes]]']
        }
    })

    subscribeToChildEvents(resource, attributes)

    let timer;
    resource.on('Δ.change', () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            if(resource.uid) resource.emit('Δ.sync', new SyncEvent({ resource }))
        }, resource['[[syncRate]]'])
    })

    resource.on('Δ.sync', ({ socket, patches, batchId, resource : what }) => {
        if(global[resource.uid]) global[resource.uid].forEach(({ socket: otherSocket, resource }) => {
            if (socket != otherSocket) {
                try{
                    mergePatches(resource, patches)
                    otherSocket.emit(`${resource.uid}.mergePatches`, patches)
                } catch(err){
                    // ?
                }
            }
        })
        if(socket) socket.emit(`${resource.uid}.mergeBatch`, batchId)
    })

    if (latentMutations[resource.uid]) {
        jsonpatch.applyPatch(attributes, latentMutations[resource.uid])
    }

}

const latentMutations = {}

export const stageLatentMutations = function (resource, patches) {
    latentMutations[resource.uid] = latentMutations[resource.uid] || []
    latentMutations[resource.uid].push(...patches)
}

export const unstageLatentMutations = function (resource, patches) {
    latentMutations[resource.uid] = latentMutations[resource.uid].filter(patch => !patches.includes(patch))
}

export const stageNewPatches = resource => {
    if(!resource['[[patches]]']) return []
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

export const mergePatches = (resource, patches) => {
    resource['[[patches]]'] = JSONPatchOT.transform(resource['[[patches]]'], patches)
    return applyPatchesToBase(resource, patches)
}

export const createBatch = resource => {
    return resource['[[batch]]']++;
}

export const mergeBatch = (resource, batchId) => {
    let patches = resource['[[patches]]'].filter(patch => patch.batchId === batchId)
    resource['[[patches]]'] = resource['[[patches]]'].filter(patch => patch.batchId !== batchId)
    return applyPatchesToBase(resource, patches)
}

export const rollbackPatches = (resource, patches) => {
    let hashes = JSON.stringify(patches)
    resource['[[patches]]'] = resource['[[patches]]'].filter(patch => !hashes.includes(JSON.stringify(patch)))
    let attributes = jsonpatch.deepClone(resource['[[base]]'])
    jsonpatch.applyPatch(attributes, resource['[[patches]]'])
    resource['[[attributes]]'] = attributes
    subscribeToChildEvents(resource, attributes)
}

const appendPatches = (resource, patches) => {
    if (!resource || !resource["[[patches]]"]) return []
    jsonpatch.applyPatch(resource['[[attributes]]'], patches)
    resource["[[patches]]"].push(...patches)
    return patches
}

const applyPatchesToBase = (resource, patches) => {
    jsonpatch.applyPatch(resource['[[base]]'], patches)
    let attributes = jsonpatch.deepClone(resource['[[base]]'])
    jsonpatch.applyPatch(attributes, resource['[[patches]]'])
    resource['[[attributes]]'] = attributes
    subscribeToChildEvents(resource, attributes)
    resource.emit('Δ.rebase', resource['[[base]]'])
    return patches
}

export const upstreamMerge = (resource, resource2) => {
    let attributes = jsonpatch.deepMerge(resource['[[attributes]]'], resource2['[[attributes]]'])
    let base = jsonpatch.deepMerge(resource['[[base]]'], resource2['[[base]]'])
    jsonpatch.applyPatch(attributes, resource['[[patches]]'])
    resource['[[base]]'] = base
    resource['[[attributes]]'] = attributes
    subscribeToChildEvents(resource, attributes)
    resource.emit('Δ.rebase', resource['[[base]]'])
}


// Something about Lists are getting lost after an upstream update
// Must have to do with Object.assign in unserializer and or subscribeToChildEvents; the stream get's broken?

const subscribeToChildEvents = (resource, attributes, namespace = false) => {
    each(attributes, (key, value) => {
        if (value && value.on) {
            value.on('Δ.rebase', base => {
                let target = resource['[[base]]']
                if(namespace !== false) target = target[namespace]
                target[key] = base
            })
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

const global = {}

export const createCache = (socket) => {

    const bin = {}
    const { session }= socket

    const cache = resource => {
        if(bin[resource.uid]) {
            upstreamMerge(bin[resource.uid], resource)
            return
        }
        global[resource.uid] = global[resource.uid] || []
        global[resource.uid].push({ resource, socket })
    
        bin[resource.uid] = resource
        socket.on(`${resource.uid}.sync`, async ({ batchId, patches, attributes }, respond) => {
            const { updateSuccessful, invalidPatches } = await updateResource(resource, patches, session)
            respond({ updateSuccessful, invalidPatches })
            resource.emit('Δ.sync', new SyncEvent({ resource, batchId, socket }))
        })
    }

    const getCached = async (uid) => {
       return bin[uid]
    }

    return { cache, getCached }
}

export const updateResource = async (resource, patches, session) => {
    const validPatches = []
    const invalidPatches = []
    await eachAsync(patches, async (index, patch) => {
        const [ key ] = patch.path.split('/').slice(1)
        const { writeAccessTest, namespace } = getMetadata(resource, key)
        if(writeAccessTest === undefined){
            validPatches.push(patch)
        } else {
            let hasAccess = await writeAccessTest.call(resource, { session, resource })
            if(hasAccess) validPatches.push(patch)
            else invalidPatches.push(patch)
        }
    })
    appendPatches(resource, validPatches)
    let updateSuccessful = validPatches.length === patches.length
    return { updateSuccessful, validPatches, invalidPatches }
}