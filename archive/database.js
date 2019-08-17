import { generatePatch, formatSchema, selectSchema } from './migrator'
const Client = require('pg').Client

const schema = Symbol()

export class Database {

    initialized = false

    constructor(options){
        this.client = new Client(options);
    }

    async query(...args){
        if(!this.initialized){
            this.initialized = true
            await this.client.connect()
        }
        if(Array.isArray(args[0])) args = args[0]
        return await this.client.query(...args)
    }

    async patchSchema(types){
        const patch = generatePatch(await this.schema, types)
        if(patch){
            console.log('Patching:', patch)
            await this.query(patch)
        }
    }

    get schema(){
        if(!this[schema]){
            this[schema] = new Promise( async resolve => {
                resolve(formatSchema(await this.query(selectSchema())))
            })
        }
        return this[schema]
    }

}