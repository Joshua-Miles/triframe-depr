import { each, eachAsync, index, map, unique } from '../mason'
import { createTable, dropTable, addColumn, dropColumn, setType, setColumnDefault, dropColumnDefault, setNotNull, dropNotNull, addUniqueConstraint, dropUniqueConstraint, addPrimaryKeyConstraint, dropPrimaryKeyConstraint, addReference, dropReference } from './sql';

export const generatePatch = ( schema = new Object, types = new Object ) => {
    types = index(types, 'tableName')
    let tableNames = unique([ ...Object.keys(schema), ...Object.keys(types) ])
    let sql = tableNames.map( tableName => (
        patchTable(schema, types, tableName)
    )).sort( line => !line.startsWith('CREATE TABLE')).filter(a => a).join(';\n')
    return sql;
}

const patchTable = ( schema, types, tableName ) => {
    let Type = types[tableName]
    let type = Type ? new Type : null
    let { added, removed } = comparisonOf(schema, types)
    if(added(tableName))  return createTable(tableName, type.fields) 
    if(removed(tableName)) return dropTable(tableName)
    let columnUpdates =  patchColumns(schema[tableName], type.fields)
    if(columnUpdates) return `ALTER TABLE ${tableName} ${columnUpdates}`
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
    return patchColumnAttributes( columnName, currentSchema[columnName], updatedSchema[columnName] )
}

const patchColumnAttributes = (columnName, currentSchema, updatedSchema) => {
    if(columnName == 'id') return []
    let { added, removed, different } = comparisonOf(currentSchema, updatedSchema)
    let commands = new Array
    if( different('type') ){ console.log(currentSchema.type, updatedSchema.type);commands.push( setType(columnName, updatedSchema.type) )}
    if( updatedSchema.defaults && different('defaults') ) commands.push( setColumnDefault(columnName, updatedSchema.defaults) )
    if( removed('defaults') ) commands.push( dropColumnDefault(columnName) )
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

const comparisonOf = function(thing1, thing2){
    let removed = key => thing1[key] && !thing2[key]
    let added = key => !thing1[key] && thing2[key]
    let different = key => serialize(thing1[key]) != serialize(thing2[key])
    return { added, removed, different }
}

const serialize = obj => {
    return JSON.stringify(Object.values(map(obj, (key, value) => `${key}:${value}`)).sort())
}