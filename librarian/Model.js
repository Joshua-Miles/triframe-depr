import { DBConnection } from './DBConnection'
import { _shared, _public, _stream, _authorize, _session, _validate, _composes } from '../arbiter'
import { datatypes } from './datatypes'
import { toTableName, toCamelCase } from '../scribe'
import { map, filter } from '../mason';
import { EventEmitter } from '../herald';

const agent = new EventEmitter

agent.on('*', (payload, event) => {
    console.log('EMITTED:', event)
})

export class Model extends DBConnection {

    // ------------------------- CLASS METHODS ----------------------------------

    static models = {}

    static get tableName() {
        return toTableName(this.name)
    }

    @_shared
    static get all() {
        return this.where({})
    }

    @_stream
    static * find(id) {
        yield this.nowAndOn(`${id}`)
        let results = yield this.query(({ sql, self }) => (sql`
            SELECT ${self('*')} FROM ${self}
            WHERE id=${id}
        `))
        return results.first
    }

    @_stream
    static *where(attributes) {
        console.log(attributes)
        yield this.nowAndOn('*')
        return this.query(({ sql, self, each }) => sql`
            SELECT ${self('*')} FROM ${self}
            WHERE ${
            Object.keys(attributes).length > 0 ?
                each(attributes, (key, value) =>
                    Array.isArray(value)
                        ? `${key} IN (${value.join(', ')})`
                        : `${key}=${value}`, 'AND'
                ) :
                1
            }
        `)
    }

    @_stream
    static *search(attributes) {
        yield this.nowAndOn('*')
        return this.query(({ sql, self, each }) => sql`
            SELECT ${self('*')} FROM ${self}
            WHERE ${each(attributes, (key, value) =>
            `${key} LIKE ${value}`, 'OR'
        )}`)
    }

    static async destroyAll() {
        let result = await this.query(({ sql, self }) => (sql`
            DELETE FROM ${self};
        `))
        this.emit('*')
        return result
    }

    static async create(attributes) {
        let record = this.new(attributes);
        return record.commit()
    }

    @_shared
    static new(attributes) {
        let record = new this;
        Object.assign(record, attributes)
        return record
    }

    // ----------------------- INSTANCE METHODS ----------------------------------

    @_shared
    set(attributes) {
        Object.assign(this, attributes)
        this._onChange()
    }


    @_shared
    save() {
        this._onChange()
        return this.commit()
    }

    @_shared
    update(attributes) {
        this.set(attributes)
        return this.commit()
    }

    async commit() {
        const { attributes } = this;
        if (attributes.id) {
            delete attributes.id
            await this.query(({ sql, self, each }) => sql`
                UPDATE ${self} 
                SET ${each(attributes, (key, value) =>
                    `"${key}"=${value}`
                )}
                WHERE id=${this.id}
            `)
            await this.emit(`${this.id}`)
        } else {
            delete attributes.id
            this.id = await this.query(({ sql, self, keysOf, valuesOf }) => (sql`
                INSERT INTO ${self} (${keysOf(attributes)}) VALUES (${valuesOf(attributes)})
                RETURNING id
            `))
            await this.emit('*')
        }
        return this
    }

    async destroy() {
        let result = await this.query(({ sql, self }) => sql`
            DELETE FROM ${self}
            WHERE id=${this.id}
        `)
        this.emit(`${this.id}`)
        return result
    }


    // --------------------------------VALIDATION ENGINE -------------------------------
    @_shared
    isValid(field) {
        return this.errorsFor(field).length == 0
    }

    @_shared
    errorsFor(field) {
        let Model = this.constructor
        let validator = Model[`validate_${field}`]
        if (!validator) return [];
        let errors = []
        let func = validator(this[field], this)
        let iterator = func.next()
        while (!iterator.done) {
            errors.push(iterator.value)
            iterator = func.next()
        }
        return errors
    }



    // --------------------------------EVENT ENGINE -------------------------------

    static on(...args) {
        return this.events.on(...args)
    }

    static emit(...args) {
        return this.events.emit(...args)
    }

    static nowAndOn(...args) {
        return this.events.nowAndOn(...args)
    }

    on(...args) {
        return this.events.on(...args)
    }

    emit(...args) {
        return this.events.emit(...args)
    }

    nowAndOn(...args) {
        return this.events.nowAndOn(...args)
    }



    // -----------------------------------UTILS------------------------------------


    static Decorators = { ...datatypes, _shared, _public, _stream, _authorize, _session, _validate, _composes }


    get persisted_fields() {
        return filter(this.fields, (name, field) => field.type !== 'virtual')
    }

    get attributes() {
        return map(this.persisted_fields, name => this[toCamelCase(name)])
    }

    _onChange() { }


    constructor() {
        super()
        this.constructor.models[this.constructor.tableName] = this.constructor
        Object.defineProperty(this, 'fields', {
            enumerable: false,
            writable: true,
            value: {
                ...this.fields,
                id: { name: 'id', type: 'SERIAL', constraints: { primaryKey: true } },
                last_updated: { name: 'last_updated', type: 'int8', constraints: {} }
            }
        })

        Object.defineProperty(this, 'global', {
            enumerable: false,
            writable: true,
            value: agent
        })

        Object.defineProperty(this, 'events', {
            enumerable: false,
            writable: true,
            value: agent.of(this.constructor.name)
        })

    }

}

Object.defineProperty(Model, 'global', {
    enumerable: false,
    writable: true,
    value: agent
})

Object.defineProperty(Model, 'events', {
    enumerable: false,
    get: function () {
        return agent.of(this.name)
    }
})