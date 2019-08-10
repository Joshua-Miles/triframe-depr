import { map, group, index, compose,  each } from '../mason'
import { isNumeric } from './typing'
import { Collection } from './Collection'

// Schema Builders

export const createTable = (name, fields = new Array) => (
    `CREATE TABLE ${name} (${Object.values(map(fields, defineColumn)).join(', ')});`
)

export const dropTable = (name) => (
    `DROP TABLE ${name}`
)

export const addColumn = (name, column) => (
    `ADD COLUMN ${defineColumn(name, column)}`
)

export const dropColumn = (name) => (
    `DROP COLUMN "${name}"`
)

export const alterColumn = (name, operations) => (
    `ALTER COLUMN "${name}" ${operations.join(', ')}`
)

export const defineColumn = (name, { type, typeModifier, defaults, constraints }) => {
    let definition = `"${name}" ${type}`
    if(typeModifier) definition = `${definition}(${typeModifier})`
    if(typeof defaults == 'number' || typeof number == 'boolean') definition = `${definition} DEFAULT ${defaults}`
    else if (defaults !== undefined) definition = `${definition} DEFAULT '${defaults}'`
    if(constraints) definition = `${definition} ${defineConstraints(constraints)}`
    return definition
}

export const defineConstraints = function({ unique, notNull, primaryKey, references }){
    let definition = ''
    if(unique) definition = `${definition} UNIQUE `
    if(notNull) definition = `${definition} NOT NULL `
    if(primaryKey) definition = `${definition} PRIMARY KEY `
    if(references){
        let { table, onDelete } = references
        definition = `${definition} REFERENCES ${table}(id) ON DELETE ${mapDeleteAction.fromJS.toSQL[onDelete] || 'SET NULL'}`
    }
    return definition
}

export const setType = (name, type) => (
    `ALTER COLUMN "${name}" TYPE ${type}`
)

export const setNotNull = (name) => (
    `ALTER COLUMN "${name}" SET NOT NULL`
)

export const dropNotNull = (name) => (
    `ALTER COLUMN "${name}" DROP NOT NULL`
)

export const setColumnDefault = (name, defaults) => (
    `ALTER COLUMN "${name}" SET DEFAULT ${isNumeric(defaults) ? defaults : `'${defaults}'`}`
)

export const dropColumnDefault = (name) => (
    `ALTER COLUMN "${name}" DROP DEFAULT`
)

export const addUniqueConstraint = (name) => (
    `ADD CONSTRAINT ${name}_unique UNIQUE(${name})`
)

export const dropUniqueConstraint = (name) => (
   `DROP CONSTRAINT ${name}_unique`
)


export const addPrimaryKeyConstraint = (name) => (
    `ADD CONSTRAINT ${name}_pk PRIMARY KEY(${name})`
)

export const dropPrimaryKeyConstraint = (name) => (
    `DROP CONSTRAINT ${name}_pk`
 )
 

export const addReference = (name, { table, onDelete }) => (
    `ADD CONSTRAINT ${name}_fkey FOREIGN KEY(${name}) REFERENCES ${table}(id) ON DELETE ${mapDeleteAction.fromJS.toSQL[onDelete] || 'SET NULL'}`
)

export const dropReference =  (name) => (
    `DROP CONSTRAINT ${name}_fkey`
)

export const decodeAdsrc = function(text){
    if(!text) return text
    let [ value ] = text.split('::')
    return value.replace(/'/g, '')
}

export const selectSchema = () => (`
    SELECT 
        tab.relname as table_name,
        attr.attname as name,
        ty.typname as type,
        attr.atttypmod as type_modifier,
        con.contype as constraint_type,
        ref_table.relname as reference_table,
        con.confdeltype as on_delete,
        con.confupdtype as on_update,
        attr.attnotnull as not_null,
        de.adsrc as defaults
    FROM
        pg_class as tab
        JOIN pg_catalog.pg_namespace as n 
            ON n.oid = tab.relnamespace
        LEFT JOIN pg_attribute as attr
            ON tab.oid = attr.attrelid
        LEFT JOIN pg_type as ty
            ON attr.atttypid = ty.oid
        LEFT JOIN pg_attrdef as de
            ON  
                tab.oid = de.adrelid
            AND
                attr.attnum = de.adnum
        LEFT JOIN pg_constraint as con 
            ON 
                attr.attrelid = con.conrelid
            AND
                attr.attnum = ANY(con.conkey)
        LEFT JOIN pg_class as ref_table ON con.confrelid = ref_table.oid
    WHERE 
        tab.relkind = 'r'
            AND
        n.nspname = 'public'
            AND
        attr.attnum >= 0
            AND
        ty.typname IS NOT NULL
`)

export const formatSchema = (schema) => (
    map( group(schema.rows, 'table_name'), ( tableName, table ) => (
        map( group(table, 'name'), ( columnName, constraints ) => ({ 
            tableName: constraints[0].table_name,
            name: constraints[0].name,
            type: constraints[0].type,
            typeModifier: constraints[0].type_modifier,
            defaults: decodeAdsrc(constraints[0].defaults),
            constraints: {  notNull: constraints[0].not_null, ...map(index(constraints, byConstraintType), toFormattedConstraint) }
        }))
    ))
)

export const drawQuery = (database) => new Query(database)

class Query{

    constructor(database){
        this.database = database
    }

    columns = []
    table = null
    joins = []
    values = {}
    whereValues = {}
    limit = null
    skip = null
    first = false
    processors = []
    
    select(...args){
        this.type = 'SELECT'
        this.columns = [ ...this.columns, ...args]
        return this
    }

    selectFirst(...args){
        this.type = 'SELECT'
        this.first = true
        this.columns = [ ...this.columns, ...args]
        return this
    }

    update(table){
        this.type = 'UPDATE'
        this.table = table
        return this
    }

    insert(table){
        this.type = 'INSERT'
        this.table = table
        return this
    }

    delete(table){
        this.type = 'DELETE'
        this.table = table
        return this
    }   

    from(table, alias){
        this.table = table
        this.alias = alias
        return this
    }

    join(table, { as :alias, where :column1, isEqual :column2, select :columns = []}){
        if(!alias) alias = table
        columns = columns.map(column => `${alias}.${column}`)
        this.columns = [ ...this.columns, ...columns]
        this.joins.push({ table, alias, column1, column2 })
        return this
    }

    set(attributes){
        this.values = index(attributes, (key) => key.includes('.') ? key : `"${key}"`)
        return this
    }

    values(attributes){
        this.values = attributes
        return this
    }

    where(attributes){
        this.whereValues = attributes
        return this
    }

    limit(limit){
        this.limit = limit
        return this
    }

    skip(skip){
        this.skip = skip
        return this
    }

    process(processor){
        this.processors.push(processor)
        return this
    }

    get processor(){
        return compose(...this.processors.reverse())
    }

    then = (callback) => {
        this.database.query(this.sql).then( result => {
            result = this.structure(result.rows)
            if(this.processor) result = this.processor(result) 
            if(this.first) result = result.first
            callback(result)
        })
    }

    get sql(){
        let query;
        this.cursor = 1
        this.variables = []
        switch(this.type){
            case 'SELECT':
                query = `
                    SELECT 
                        ${this.sqlColumns} 
                    FROM ${this.table} 
                        ${this.sqlJoins}
                    WHERE ${this.sqlWhere}`
        query = `${query} ORDER BY ${this.table}.id`

            break;
            case 'DELETE':
                query = `
                    DELETE FROM ${this.table} 
                        ${this.sqlJoins}
                    WHERE ${this.sqlWhere}`
            break;
            case 'UPDATE':
                query = `
                    UPDATE 
                        ${this.table} 
                    SET ${this.sqlAttributes} 
                    WHERE ${this.sqlWhere}
                    RETURNING ${this.table}.*`
            break;
            case 'INSERT':
                query = `
                    INSERT INTO ${this.table} 
                        (${this.sqlKeys}) 
                    VALUES
                        (${this.sqlValues})
                    RETURNING *`
            break;
        }
        console.log('\x1b[34m', query)
        console.log('\x1b[36m', this.variables)
        return [ query, this.variables ]
    }

    get sqlColumns(){
        return this.columns.length ? this.columns.join(', ') : '*' 
    }

    get sqlJoins(){
        return this.joins.map(({ table, alias, column1, column2 }) => `LEFT JOIN ${table} as ${alias} ON ${column1}=${column2}`).join('\n')
    }

    get sqlWhere(){
        return Object.keys(this.whereValues).length ? this.serializeAttributes(this.whereValues) : 'true'
    }

    get sqlAttributes(){
        return this.serializeAttributes(this.values)
    }

    get sqlKeys(){
        return Object.keys(this.values).join(', ')
    }

    get sqlValues(){
        return Object.values(this.values).map(this.escape).join(', ')
    }

    serializeAttributes = (attributes) => {
        return Object.values( map( attributes, (key, value) => { 
            if(Array.isArray(value)) {
                if(value.length) return (
                    `(
                        ${value
                            .map( value => this.serializeAttribute(key, value) )
                            .join(' OR ')
                    })`
                )
                else return 'false'
            }
            else return this.serializeAttribute(key, value)
        }) ).join(', ')
    }

    serializeAttribute = (key, value) => {
        let operator = value ? value.is : undefined
        switch(operator){
            case 'includes':
            return `${key} LIKE ${this.escape(`%${value.value}%`)}`
            case 'startsWith':
            return `${key} LIKE ${this.escape(`${value.value}%`)}`
            case 'endsWith':
            return `${key} LIKE ${this.escape(`%${value.value}`)}`
            case 'greaterThan':
            return `${key} > ${this.escape(value.value)}`
            case 'lessThan':
            return `${key} < ${this.escape(value.value)}`
            case undefined:
            if(this.type != 'UPDATE' && !key.includes('.')) key = `${this.table}.${key}`
            return `${key}=${this.escape(value)}`
        }
    }

    escape = (value) => {
        this.variables.push(value)
        return `$${this.cursor++}`
    }



    structure(records){
        let result = new Collection
        records.forEach( (element, index) => {
            let record = result[element.id] ? result[element.id] : result.push(element)
            let nested = new Object
            each(element, (key, value) => {
                let index = key.indexOf('.')
                if(index != -1){
                    let domain = key.slice(0, index)
                    let rest = key.slice(index + 1)
                    if(rest.startsWith('[i]')){
                        record[domain] = record[domain] || new Collection
                        rest = rest.slice(4)
                    }
                    delete record[key]
                    nested[domain] = nested[domain] || new Object
                    nested[domain][rest] = value
                }
            })
            each( nested, ( key, value ) => {
                if(record[key] instanceof Collection && value.id !== null){
                    record[key].push(value)
                } else if(value.id != null){
                    record[key] = value
                }
            })
        })
        return result
    }
}


const byConstraintType = (key, { constraint_type }) => (
    mapConstraintType.fromEnum.toJS[constraint_type] ? mapConstraintType.fromEnum.toJS[constraint_type] : 'details'
)

const toFormattedConstraint = (type, {reference_table, on_delete, on_update}) =>{
    if(type == 'references') {
        return {
            onDelete: mapDeleteAction.fromEnum.toJS[on_delete],
            // onUpdate: on_update,
            table: reference_table
        }
    } else {
        return true
    }
}

const deleteActionMap = [
    {
        enum: 'r',
        sql: 'RESTRICT',
        js: 'restrict'
    },
    {
        enum: 'a',
        sql: 'NO ACTION',
        js: 'noAction'
    },
    {
        enum: 'd',
        sql: 'SET DEFAULT',
        js: 'setDefault'
    },
    {
        enum: 'c',
        sql: 'CASCADE',
        js: 'cascade'
    },
    {
        enum: 'n',
        sql: 'SET NULL',
        js: 'setNull'
    }
]


const mapDeleteAction = {
    fromEnum: {
        toJS: index(deleteActionMap, 'enum', 'js'),
        toSQL: index(deleteActionMap, 'enum', 'sql')
    },
    fromJS: {
        toEnum: index(deleteActionMap, 'js', 'enum'),
        toSQL: index(deleteActionMap, 'js', 'sql')
    },
    fromSQL: {
        toJS: index(deleteActionMap, 'sql', 'js'),
        toEnum: index(deleteActionMap, 'sql', 'enum')
    }
}

const constraintTypeMap = [
    {
        enum: 'p',
        js: 'primaryKey'
    },
    {
        enum: 'f',
        js: 'references'
    },
    {
        enum: 'u',
        js: 'unique'
    }
]
  
const mapConstraintType = {
    fromJS:{
        toEnum: index(constraintTypeMap, 'js', 'enum'),
    },
    fromEnum: {
        toJS: index(constraintTypeMap, 'enum', 'js')
    }
}