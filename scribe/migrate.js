import { group, index, map, unique, filter, metadata, toUnderscored, toTableName } from '../core'
import { settings } from './settings'

export const migrate = async () => {
    const database = settings.db
    const newSchema = map(group(filter(metadata, (_, metadata) => metadata.type === 'persisted'), (_, d) => toTableName(d.className)), (_, metadata) => index(metadata, (_, metadata) => toUnderscored(metadata.key)))
    const schema = formatSchema(await database.query(selectSchema()))
    const patch = generatePatch(schema, newSchema)
    if (patch) {
        console.log('Patching:', patch)
        await database.query(patch)
    }
}

const createTable = (name, fields = new Array) => (
    `CREATE TABLE "${name}" (${Object.values(map(fields, defineColumn)).join(', ')});`
)

const dropTable = (name) => (
    `DROP TABLE "${name}"`
)

const addColumn = (name, column) => (
    `ADD COLUMN ${defineColumn(name, column)}`
)

const dropColumn = (name) => (
    `DROP COLUMN "${name}"`
)

const alterColumn = (name, operations) => (
    `ALTER COLUMN "${name}" ${operations.join(', ')}`
)

const defineColumn = (name, { datatype, typeModifier, defaultValue, constraints }) => {
    let definition = `"${name}" ${datatype}`
    if(typeModifier) definition = `${definition}(${typeModifier})`
    if(defaultValue !== undefined) definition = `${definition} DEFAULT ${format(defaultValue)}`
    if(constraints) definition = `${definition} ${defineConstraints(constraints)}`
    return definition
}

// 2004-10-19 10:23:54+02
const format = function(defaultValue){
    if(defaultValue === null){
        return "NULL"
    }
    if(typeof defaultValue == 'number' || typeof defaultValue == 'boolean'){
        return defaultValue
    }
    if(typeof defaultValue == 'string'){
        return `'${defaultValue}'`
    }
    if(typeof defaultValue == 'object' && (defaultValue.__proto__ == Object.prototype /* || defaultValue instanceof List */)){
        return `'${JSON.stringify(defaultValue)}'::json`
    }
    if(defaultValue instanceof Date){
        return "NOW()"
    }
    if(Array.isArray(defaultValue)){
        return `'${JSON.stringify(defaultValue)}'`
    }
    
    throw Error(`Variable type cannot be coalesced for sql query: ${defaultValue}`)
}

const defineConstraints = function({ unique, notNull, primaryKey, references }){
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

const setType = (name, type) => (
    `ALTER COLUMN "${name}" TYPE ${type}`
)

const setNotNull = (name) => (
    `ALTER COLUMN "${name}" SET NOT NULL`
)

const dropNotNull = (name) => (
    `ALTER COLUMN "${name}" DROP NOT NULL`
)

const setColumnDefault = (name, defaultValue) => (
    `ALTER COLUMN "${name}" SET DEFAULT ${format(defaultValue)}`
)

const dropColumnDefault = (name) => (
    `ALTER COLUMN "${name}" DROP DEFAULT`
)

const addUniqueConstraint = (name) => (
    `ADD CONSTRAINT ${name}_unique UNIQUE(${name})`
)

const dropUniqueConstraint = (name) => (
   `DROP CONSTRAINT ${name}_unique`
)


const addPrimaryKeyConstraint = (name) => (
    `ADD CONSTRAINT ${name}_pk PRIMARY KEY(${name})`
)

const dropPrimaryKeyConstraint = (name) => (
    `DROP CONSTRAINT ${name}_pk`
 )
 

const addReference = (name, { table, onDelete }) => (
    `ADD CONSTRAINT ${name}_fkey FOREIGN KEY(${name}) REFERENCES ${table}(id) ON DELETE ${mapDeleteAction.fromJS.toSQL[onDelete] || 'SET NULL'}`
)

const dropReference =  (name) => (
    `DROP CONSTRAINT ${name}_fkey`
)

const decodeAdsrc = function(text){
    if(!text) return text
    let [ value ] = text.split('::')
    return value.replace(/'/g, '')
}

const selectSchema = () => (`
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
        pg_get_expr(de.adbin, de.adrelid) as default_value
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

const formatSchema = (schema) => (
    map( group(schema.rows, 'table_name'), ( tableName, table ) => (
        map( group(table, 'name'), ( columnName, constraints ) => {
        return ({ 
            tableName: constraints[0].table_name,
            key: constraints[0].name,
            datatype: constraints[0].type,
            typeModifier: constraints[0].type_modifier,
            defaultValue: decodeAdsrc(constraints[0].default_value),
            constraints: {  notNull: constraints[0].not_null, ...map(index(constraints, byConstraintType), toFormattedConstraint) }
        }) 
    })
    ))
)


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

const generatePatch = ( schema = new Object, newSchema = new Object ) => {
    let tableNames = unique([ ...Object.keys(schema), ...Object.keys(newSchema) ])
    let sql = tableNames.map( tableName => (
        patchTable(schema, newSchema, tableName)
    )).sort( line => !line.startsWith('CREATE TABLE')).filter(a => a).join(';\n')
    return sql;
}

const patchTable = ( schema, newSchema, tableName ) => {
    let { added, removed } = comparisonOf(schema, newSchema)
    if(added(tableName))  return createTable(tableName, newSchema[tableName]) 
    if(removed(tableName)) return dropTable(tableName)
    let columnUpdates =  patchColumns(schema[tableName], newSchema[tableName])
    if(columnUpdates) return `ALTER TABLE "${tableName}" ${columnUpdates}`
}

const patchColumns = ( currentSchema, updatedSchema ) => {
    let columnNames = unique([ ...Object.keys(currentSchema), ...Object.keys(updatedSchema)])
    return columnNames.map( columnName => (
        patchColumn(currentSchema, updatedSchema, columnName)
    )).filter(a => a.length).join(', ')
}

const patchColumn = ( currentSchema, updatedSchema, columnName ) => {
    let { added, removed } = comparisonOf(currentSchema, updatedSchema)
    if(added(columnName)) return addColumn(columnName, updatedSchema[columnName])
    if(removed(columnName)) return dropColumn(columnName)
    if(updatedSchema[columnName].datatype === 'SERIAL') return []
    return patchColumnAttributes( columnName, currentSchema[columnName], updatedSchema[columnName] )
}

const patchColumnAttributes = (columnName, currentSchema, updatedSchema) => {
    // if(columnName == 'id') return []
    let { added, removed, different } = comparisonOf(currentSchema, updatedSchema)
    let commands = new Array
    if( different('datatype') ) commands.push( setType(columnName, updatedSchema.datatype) )
    if( removed('defaultValue') ) commands.push( dropColumnDefault(columnName) )
    else if( different('defaultValue') )  commands.push( setColumnDefault(columnName, updatedSchema.defaultValue) )
    commands = [ ...commands, patchColumnConstraints(columnName, currentSchema.constraints, updatedSchema.constraints)]
    return commands.filter( a => a.length).join(', ')
}

const patchColumnConstraints = (columnName, currentSchema, updatedSchema) => {
    let { added, removed, different } = comparisonOf(currentSchema, updatedSchema)
    let commands = []
    if( added('primaryKey') ) commands.push( addPrimaryKeyConstraint(columnName) )
    if( removed('primaryKey') ) commands.push( dropPrimaryKeyConstraint(columnName) )
    if( added('notNull') ) commands.push( setNotNull(columnName)  )
    if( removed('notNull') ) commands.push( dropNotNull(columnName) )
    if( added('unique') ) commands.push( addUniqueConstraint(columnName) )
    if( removed('unique') ) commands.push( dropUniqueConstraint(columnName) )
    if( added('references') ) commands.push( addReference(columnName, updatedSchema.references) )
    if( removed('references') ) commands.push( dropReference(columnName) )
    if( different('references') ) commands.push( `${dropReference(columnName)};\n ${addReference(columnName, updatedSchema.references)}` )
    return commands
}

const comparisonOf = function(thing1 = {}, thing2 = {}){
    let removed = key => thing1[key] && thing2[key] === undefined
    let added = key => thing1[key] === undefined && thing2[key]
    let different = key => {
        if(thing2[key] instanceof Date) return thing1[key] != 'now()'
        if(typeof thing2[key] == 'boolean') return (thing1[key] === 'true') != thing2[key]
        return thing1[key] != thing2[key] 
    }
    return { added, removed, different }
}