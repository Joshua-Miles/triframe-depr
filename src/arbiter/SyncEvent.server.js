import { stageNewPatches, mergeBatch, createBatch, stageLatentMutations, unstageLatentMutations } from "./core"

export class SyncEvent {

    constructor({ resource, batchId = null, socket = null }){
        stageNewPatches(resource)
        this.batchId = batchId ? batchId : createBatch(resource)

        this.resource = resource 
        this.socket = socket
        this.patches = mergeBatch(resource, this.batchId)

        stageLatentMutations(this.resource, this.patches)
    }

    hasBeenCommitted(){
        unstageLatentMutations(this.resource, this.patches)
    }

}