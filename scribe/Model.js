import { sql, literal, keys, values, pairs, } from "./sql";
import { metadata, filter, index, each, getMetadata, EventEmitter, toTableName } from "../core";
import { pk, stream } from "./decorators";

class Model {

    @pk id

    static events = new EventEmitter

    // ============================ CRUDL ============================

    static async create(attributes, columns = null){
        const { relation } = this;
        const fields = this.fieldsFrom(attributes)
        let [ { id } ] = await sql`
            INSERT INTO ${relation} (${keys(fields).join(', ')}) 
            VALUES (${values(fields).join(', ')})
            RETURNING id
        `
        this.events.emit('create')
        return await this.read(id, columns)
    }

    @stream 
    static *read(id, columns = null){
        if(columns == null) columns = this.defaultSelectedColumns

        yield this.events.nowAndOn([`delete.${id}`])

        const { relation } = this;
        let [ result ] = yield sql`
            SELECT {
                ${relation} {
                    ${literal(columns)}
                }
            }
            WHERE ${relation}.id = ${id}
        `
        return result
    }

    async update(attributes = {}){
        Object.assign(this, attributes)
        const { relation } = this.constructor;
        const fields = this.constructor.fieldsFrom(this)
        emitResourceEvent(this, 'commiting', this)
        const result =  await sql`
            UPDATE ${relation} 
            SET ${pairs(fields).join(', ')}
            WHERE id = ${this.id}
        `        
        emitResourceEvent(this, 'commited', this)
        return result
    }

    delete(){
        const { relation } = this.constructor;
        const result = sql`
            DELETE FROM ${relation} WHERE id = ${this.id}
        `
        this.constructor.events.emit(`delete.${this.id}`)
        return result
    }

    @stream
    static *list(columns = null){
        if(columns == null) columns = this.defaultSelectedColumns

        yield this.events.nowAndOn('*')

        const { relation } = this;
        return sql`
            SELECT {
                ${relation} {
                    ${literal(columns)}
                }
            }
            ORDER BY ${relation}.id ASC
        `
    }

    // ============================ SEARCHERS ============================

    @stream
    static *where(conditions, columns = null){
        const { relation } = this;

        if(columns == null) columns = this.defaultSelectedColumns

        yield this.events.nowAndOn('*')

        return sql`
            SELECT {
                ${relation} {
                    ${literal(columns)}
                }
            }
            WHERE (${pairs(conditions).join(' AND ')}) 
            ORDER BY ${relation}.id ASC
        `
    }


    @stream
    static *search(conditions, columns = null){
        const { relation } = this;

        if(columns == null) columns = this.defaultSelectedColumns

        yield this.events.nowAndOn('*')

        return sql`
            SELECT {
                ${relation} {
                    ${literal(columns)}
                }
            }
            WHERE (${pairs(conditions, 'LIKE').join(' OR ')}) 
            ORDER BY ${relation}.id ASC
        `
    }


    static async truncate(){
        const { relation } = this;
        return sql`
            DELETE FROM ${relation} WHERE true
        `
    }


    // ============================ UTILS ============================




    static get defaultSelectedColumns(){
        return Object.keys(this.persistedFields).join(',\n')
    }

    static get relation(){
        return literal(toTableName(this.name))
    }

    static get persistedFields(){
        return index(filter(metadata, ( key, value ) => value.className === this.name && value.type === 'persisted'), 'key')
    }

    static fieldsFrom(obj){
        const tempInstance = new this;
        const { persistedFields } = this;
        const fields = {}
        each(persistedFields, key => {
            if(obj[key] !== undefined ){
                const { sqlEncode } = getMetadata(tempInstance, key)
                if(sqlEncode) fields[key] = sqlEncode(obj[key])
                else fields[key] = obj[key]
            }
        })
        return fields
    }


}

const emitResourceEvent = (resource, event, payload) => {
    resource.emit(`Δ.${event}`, payload)
    const methodName = `on${toCapitalized(event)}`
    if(typeof resource[methodName] === 'function') 
        resource[methodName](payload)
}

export { Model }