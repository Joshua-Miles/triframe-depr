import { DBConnection } from './DBConnection'
import { _shared, _public, _stream, _authorize, _session  } from '../arbiter'
import { datatypes } from './datatypes'
import { toTableName, toCamelCase } from '../scribe'
import { map, filter } from '../mason';
import { EventEmitter } from '../herald';

const global = new EventEmitter

export class Model extends DBConnection {

    // ------------------------- CLASS METHODS ----------------------------------

    static get tableName(){
        return toTableName(this.name)
    }

    static get all(){
        return this.query( ({ sql, self }) => (sql`
            SELECT ${self('*')} FROM ${self};
        `))
    }

    @_stream
    static  * find(id){
        yield this.nowAndOn(`${id}`)
        let results = yield this.query( ({ sql, self }) => (sql`
            SELECT ${self('*')} FROM ${self}
            WHERE id=${id}
        `))
        return results.first
    }

    @_stream
    static *where(attributes){
        yield this.nowAndOn('*')
        return this.query( ({ sql, self, each }) => sql`
            SELECT ${self('*')} FROM ${self}
            WHERE ${each(attributes, (key, value) => 
                `${key}=${value}`, 'AND'
            )}
        `)
    }

    @_stream
    static *search(attributes){
        yield this.nowAndOn('*')
        return this.query( ({ sql, self, each }) => sql`
            SELECT ${self('*')} FROM ${self}
            WHERE ${each(attributes, (key, value) => 
                `${key} LIKE ${value}`, 'OR'
            )}
        `)
    }

    static async destroyAll(){
        let result = await this.query( ({ sql, self }) => (sql`
            DELETE FROM ${self};
        `))
        this.emit('*')
        return result
    }

    static async create(attributes){
        let result = await this.query( ({ sql, self, keysOf, valuesOf }) => (sql`
            INSERT INTO ${self} (${keysOf(attributes)}) VALUES (${valuesOf(attributes)})
            RETURNING id
        `))
        this.emit('*')
        return result
    }

    // ----------------------- INSTANCE METHODS ----------------------------------

    @_shared
    set(attributes){
        Object.assign(this, attributes)
        this._onChange()
    }


    @_shared
    save(){
        this._onChange()
        return this.commit()
    }

    update(attributes){
        Object.assign(attributes)
        return this.commit()
    }

    async commit(){
        const { attributes } = this;
        delete attributes.id
        let result = await this.query( ({ sql, self, each }) => sql`
            UPDATE ${self} 
            SET ${each(attributes, (key, value) => 
                `${key}=${value}`
            )}
            WHERE id=${this.id}
        `)
        this.emit(`${this.id}`)
        return result
    }

    async destroy(){
        let result = await this.query( ({ sql, self }) => sql`
            DELETE FROM ${self}
            WHERE id=${this.id}
        `)
        this.emit(`${this.id}`)
        return result
    }


    // --------------------------------EVENT ENGINE -------------------------------

    static global = global

    static get events(){
        return global.of(this.name)
    }

    static on(...args){
        return this.events.on(...args)
    }

    static emit(...args){
        return this.events.emit(...args)
    }

    static nowAndOn(...args){
        return this.events.nowAndOn(...args)
    }

    global = global

    events = global.of(this.constructor.name)

    on(...args){
        return this.events.on(...args)
    }

    emit(...args){
        return this.events.emit(...args)
    }

    nowAndOn(...args){
        return this.events.nowAndOn(...args)
    }



    // -----------------------------------UTILS------------------------------------


    static Decorators = { ...datatypes, _shared, _public, _stream, _authorize, _session }

    fields = { 
        id: { name: 'id', type: 'SERIAL', constraints: { primaryKey: true } },
        last_updated: { name: 'last_updated', type: 'int8',  constraints: {} }
    }

    get persisted_fields(){
        return filter(this.fields, (name, field) => field.type !== 'virtual')
    }

    get attributes(){
        return map(this.persisted_fields, name => this[toCamelCase(name)])
    }

    _onChange(){}

}