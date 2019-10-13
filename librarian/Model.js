import { DBConnection } from './DBConnection'
import { _shared, _public, _stream, _authorize, _session, _validate, _composes } from '../arbiter'
import { datatypes } from './datatypes'
import { toTableName, toCamelCase, toCapitalized, toClassName, toForeignKeyName } from '../scribe'
import { map, filter } from '../mason';
import { EventEmitter } from '../herald';

const agent = new EventEmitter

agent.on('*', (payload, event) => {
    console.log('EMITTED:', event)
})


const select = (self, includes) => {

}

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
    static * find(id, includes = []) {
        yield this.nowAndOn(`updated.${id}`)

        let results = yield this.query(({ sql, self }) => (sql`
            SELECT 
                ${self(
            '*',
            ...includes.map(include => (
                self[include]('*')
            ))
        )} 
            FROM 
                ${self}
                ${includes.map(include => (
            self[include].join()
        ))}
            WHERE ${self.id}=${id}
        `))
        return results.first
    }

    @_stream
    static *where(attributes, includes = []) {

        yield this.nowAndOn('*')
        if (includes.length) yield this.global.nowAndOn(
            includes.map(include => `${this.classFor(include).name}.*`)
        )
        return this.query(({ sql, self, each }) => sql`
            SELECT 
                ${self(
            '*',
            ...includes.map(include => (
                self[include]('*')
            ))
        )} 
            FROM 
                ${self}
                ${includes.map(include => (
            self[include].join()
        ))}
            WHERE 
                ${Object.keys(attributes).length > 0 ?
                each(attributes, (key, value) => {
                    if (Array.isArray(value) && value.length > 0)
                        return `${self[key]} IN (${value.join(', ')})`
                    else if (value === null)
                        return `${self[key]} IS NULL`
                    else if (!Array.isArray(value))
                        return `${self[key]}=${value}`
                    else
                        return `false`
                }, 'AND'
                ) : 1}
        `)
    }

    @_stream
    static *firstWhere(attributes, includes) {
        let result = yield this.where(attributes, includes)
        return result.first
    }

    @_stream
    static *search(attributes, includes = []) {
        yield this.nowAndOn('*')
        return this.query(({ sql, self, each }) => sql`
            SELECT 
                ${self(
            '*',
            ...includes.map(include => (
                self[include]('*')
            ))
        )} 
            FROM 
                ${self}
                ${includes.map(include => (
            self[include].join()
        ))}
            WHERE 
                ${each(attributes, (key, value) =>
            `${key} LIKE ${value}`, 'OR'
        )}
        `)
    }

    static async truncate() {
        let result = await this.query(({ sql, self }) => (sql`
            DELETE FROM ${self};
        `))
        this.emit('truncated')
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
            console.log(this.tableName)
            await this.query(({ sql, self, each }) => {
                console.log(self)
                return sql`
                    UPDATE ${self} 
                    SET ${each(attributes, (key, value) => (
                        `"${key}"=${value}`
                    ))}
                    WHERE id=${this.id}
                    `
        })
            await this.emit(`updated.${this.id}`, this)
        } else {
            delete attributes.id
            let result = await this.query(({ sql, self, keysOf, valuesOf }) => (sql`
                INSERT INTO ${self} (${keysOf(attributes)}) VALUES (${valuesOf(attributes)})
                RETURNING id
            `))
            this.id = result.first.id
            await this.emit('created', this)
        }
        return this
    }

    async destroy() {
        let result = await this.query(({ sql, self }) => sql`
            DELETE FROM ${self}
            WHERE id=${this.id}
        `)
        this.emit(`destroyed.${this.id}`, this)
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



    // -----------------------------------UTILS-----------------------------------

    static classFor(fieldName) {
        let instance = new this
        let field = instance.fields[fieldName] || instance.fields[toForeignKeyName(fieldName)]
        let relation
        switch (field.alias) {
            case 'hasMany':
                relation = field.metadata.of || fieldName
                break;
            case 'belongsTo':
                relation = field.metadata.a || fieldName
                break;
        }
        return this.models[toTableName(relation)]
    }


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