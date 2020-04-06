import { stageNewPatches } from "./core"

export class SyncEvent {

    constructor({ resource }){
        this.resource = resource
        this.patches = stageNewPatches(resource)
    }

}