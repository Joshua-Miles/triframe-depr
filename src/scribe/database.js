import { migrate } from './migrate';

const Client = require('pg').Client

export let database = null;

export const connect = async options => {
    database = new Client(options);
    await database.connect()
    await migrate()
}