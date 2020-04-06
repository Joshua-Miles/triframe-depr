import { sql, literal, keys, values, pairs, all, any, reduce } from "./sql";
import { metadata, filter, index, each, getMetadata, EventEmitter, toCapitalized, toTableName } from "triframe/core";
import { pk, stream, hidden, shared } from "./decorators";


class Model {

    @pk id


    onConstruct() {
        if (this.on) this.on('Δ.sync', (e) => this.commit(e))
    }

    // ============================ CRUDL ============================

    // static async create(attributes, columns = null){
    //     const { relation } = this;
    //     const fields = this.fieldsFrom(attributes)
    //     let [ { id } ] = await sql`
    //         INSERT INTO ${relation} (${keys(fields).join(', ')}) 
    //         VALUES (${values(fields).join(', ')})
    //         RETURNING id
    //     `
    //     this.emit(`created.${id}`)
    //     return await this.read(id, columns)
    // }

    @stream
    static *read(id, columns = null) {
        if (columns == null) columns = this.defaultSelectedColumns
        const { relation } = this;
        let [result] = yield sql`
            SELECT {
                ${relation} {
                    ${literal(columns)}
                }
            }
            WHERE ${relation}.id = ${id}
        `
        return result || null
    }


    static async create(attributes) {
        let instance = new this
        Object.assign(instance, attributes)
        await instance.persist()
        return instance
    }

    @shared
    update(attributes) {
        Object.assign(this, attributes)
    }

    async commit(e) {
        if (!this.id) return false
        const { relation } = this.constructor;
        if (e.patches.length === 0) return null
        const attributes = e.patches.reduce((attributes, patch) => {
            let key = patch.path.slice(1).split('/')[0]
            return {
                ...attributes,
                [key]: this[key]
            }
        }, { })
        const fields = this.constructor.fieldsFrom(attributes)
        const result = await sql`
            UPDATE ${relation} 
            SET ${reduce(fields, (key, value) =>
            `${key} = ${value}`
        )}
            WHERE id = ${this.id}
        `
        each(fields, key => this.constructor.emit(`${this.id}.changed.${key}`))
        e.hasBeenCommitted()
        return result
    }

    async persist() {
        const { relation } = this.constructor;
        const fields = this.constructor.fieldsFrom(this)
        let [{ id }] = await sql`
            INSERT INTO ${relation} (${keys(fields).join(', ')}) 
            VALUES (${values(fields).join(', ')})
            RETURNING id
        `
        this['[[attributes]]'].id = this['[[base]]'].id = id
      
        this.constructor.emit(`created.${id}`)
        return id
    }

    async delete() {
        const { relation } = this.constructor;
        const result = await sql`
            DELETE FROM ${relation} WHERE id = ${this.id}
        `
        this.constructor.emit(`deleted.${this.id}`)
        return result
    }

    @stream
    static *list(columns = null) {
        if (columns == null) columns = this.defaultSelectedColumns
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
    static *where(conditions, columns = null) {
        const { relation } = this;

        if (columns == null) columns = this.defaultSelectedColumns

        return sql`
            SELECT {
                ${relation} {
                    ${literal(columns)}
                }
            }
            WHERE ${all(conditions, (key, value, rawValue) =>
            rawValue === null
                ? `"${relation.value}".${key} IS NULL`
                : `"${relation.value}".${key} = ${value}`
        )}
            ORDER BY ${relation}.id ASC
        `
    }

    @stream
    static *search(conditions, columns = null) {
        const { relation } = this;

        if (columns == null) columns = this.defaultSelectedColumns

        return sql`
            SELECT {
                ${relation} {
                    ${literal(columns)}
                }
            }
            WHERE ${any(conditions, (key, value) =>
            `"${relation.value}".${key} LIKE ${value}`
        )}
            ORDER BY ${relation}.id ASC
        `

    }

    static async truncate() {
        const { relation } = this;
        return sql`
            DELETE FROM ${relation} WHERE true
        `
    }


    // ============================ UTILS ============================


    static get defaultSelectedColumns() {
        return Object.keys(this.persistedFields).join(',\n')
    }

    static get relation() {
        return literal(toTableName(this.name))
    }

    static get persistedFields() {
        return index(filter(metadata, (key, value) => value.className === this.name && value.type === 'persisted'), 'key')
    }

    static fieldsFrom(obj) {
        const tempInstance = new this;
        const { persistedFields } = this;
        const fields = {}
        each(persistedFields, key => {
            if (obj[key] !== undefined) {
                const { sqlEncode } = getMetadata(tempInstance, key)
                if (sqlEncode) fields[key] = sqlEncode(obj[key])
                else fields[key] = obj[key]
            }
        })
        return fields
    }


}


export { Model }