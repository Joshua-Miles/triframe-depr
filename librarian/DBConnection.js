import { migrate } from './migrator'
import { query } from './sql'

const Client = require('pg').Client

export class DBConnection {

    static query = query

    query = this.constructor.query.bind(this.constructor)

    static async connect(options){
        this.client = new Client(options);
        await this.client.connect()
    }

    static async migrate(types){
        this.types = types;
        await migrate(this.client, types)
    }
    
}