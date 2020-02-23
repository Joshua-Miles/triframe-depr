import { each, group, map, index, find, filter, toClassName, toSingular, toForeignKeyName, toTableName, metadata, toUnderscored, toCamelCase, getMetadata } from "../core"
import { settings } from "./settings"
import { deepMap } from "../core/iterators"


export const literal = x => ({ isLiteral: true, value: x })

export const isLiteral = x => x && x.isLiteral

export const keys = x => {
    let resultArray = Object.keys(x).map(toUnderscored)
    return {
        join: sep => literal(resultArray.join(sep))
    }
}

export const values = x => {
    let resultArray = Object.values(x).map(escape)
    return {
        join: sep => literal(resultArray.join(sep))
    }
}

export const pairs = (x, seperator = ' = ') => {
    let resultArray = Object.keys(x).map( key => `${toUnderscored(key)}${seperator}${escape(x[key])}`)
    return {
        join: sep => literal(resultArray.join(sep))
    }
}

let escaped = []
let escape = x => {
    escaped.push(x)
    return `$${escaped.length}`
}

export const sql = async (queryFragments, ...variables) => {
    const query = queryFragments.reduce((query, fragment, index) => (
        index === 0
            ? `${fragment}`
            : (
                isLiteral(variables[index-1])
                    ? `${query}${variables[index-1].value}${fragment}`
                    : `${query}${escape(variables[index-1])}${fragment}`
            )
    ), '')
    const parsed = parse(query)
    console.log(parsed, escaped)
    const promise = settings.db.query(parsed, escaped)
    escaped = []
    let response = await promise
    let result = deepMap(response.rows, (value) => {
        if (value && value.__class__) {
            let Model = settings.models[value.__class__]
            let tempInstance = new Model;
            let camelCasedKeys =  key => toCamelCase(key)
            let decodedValues = (key, value) => {
                const { sqlDecode } = getMetadata(tempInstance, key)
                if(sqlDecode) return sqlDecode(value)
                else return value
            }
            return new Model(index(value, camelCasedKeys, decodedValues))
        }
        if (Array.isArray(value)) {
            return value.filter(value => value.id !== null)
        }
        return value
    })
    return result
}

let applicationMetadata;

function parse(query) {
    if (!applicationMetadata) applicationMetadata = map(group(filter(metadata, (key, { type }) => type != undefined), 'className'), (_, metadata) => index(metadata, 'key'))
    let obj = {};
    let pointer = obj;
    let property = ''
    let blockStart = false;
    let result = query
    let parent = Symbol()
    for (let i = 0; i < query.length; i++) {
        let character = query[i]
        if (blockStart === false) {
            if (character == '{') blockStart = i
            continue
        }
        if (isWhitespace(character)) {
            continue
        }
        if (character == '{') {
            pointer[property] = { [parent]: pointer }
            pointer = pointer[property]
            property = ''
            continue
        }
        if (character == '}') {
            if (property.length) pointer[property] = true
            if (pointer === obj) {
                result = result.slice(0, blockStart) + generateSQL(obj, result.slice(i + 1))
                blockStart = false
                pointer = obj = {}
            } else {
                pointer = pointer[parent]
            }
            property = ''
            continue
        }
        if (character == ',') {
            if (property.length) pointer[property] = true
            property = ''
            continue
        }
        property += character
    }
    return result
}

const nestedQueryMarker = Symbol()

function generateSQL(obj, remaining = '') {
    const keys = Object.keys(obj)
    if (keys.length > 1) throw Error(`Cannot select ${keys.join(', ')} simultaneously`)
    const [key] = keys
    const className = toClassName(key)
    const properties = obj[key]
    const selectClause = buildSelectClause(className, properties) // <-- `properties` WILL be mutated to account for virtual columns
    const fromClause = buildJoinClause(className, properties)
    return `${selectClause} FROM ${key} ${fromClause} ${remaining} GROUP BY "${key}".id`
}

function buildSelectClause(className, properties, { label = false, alias = false, nested = false } = {}) {
    const columns = []
    const metadata = applicationMetadata[className]
    const relationName = alias || toTableName(className)
    columns.push(
        label ? `'id', "${relationName}".id` : `"${relationName}".id`,
        label ? `'__class__', '${className}'` : `'${className}' as __class__`
    )
    each(properties, (key, value) => {
        const { type } = metadata[key]
        const endpoint = typeof value === 'boolean'
        switch (type) {
            case 'persisted':
                if (!endpoint) throw Error(`Cannot select subfields of property ${className}#${key}`)
                columns.push(
                    label ? `'${toUnderscored(key)}', "${relationName}".${toUnderscored(key)}` : `"${relationName}".${toUnderscored(key)}`
                )
                break;
            case 'relationship':
                if (endpoint) throw Error(`Must select subfields for relation ${className}#${key}`)
                const { options, joinType } = metadata[key]
                const nextRelationName = toClassName(options.a || options.an || options.of || key)
                let nextRelation;
                switch (joinType) {
                    case 'belongsTo':
                        nextRelation = `(array_agg(json_build_object(${buildSelectClause(nextRelationName, value, { label: true, alias: key, nested: true })})))[1]`
                        break;
                    case 'hasOne':
                        nextRelation = `(array_agg(json_build_object(${buildSelectClause(nextRelationName, value, { label: true, alias: key, nested: true })})))[1]`
                        break;
                    case 'hasMany':
                        nextRelation = `array_agg(json_build_object(${buildSelectClause(nextRelationName, value, { label: true, alias: key, nested: true })}))`
                        break;
                }
                if (!nested) {
                    columns.push(
                        label
                            ? `'${toUnderscored(key)}', ${nextRelation}`
                            : `${nextRelation} as ${toUnderscored(key)}`
                    )
                } else {
                    Object.defineProperty(properties, nestedQueryMarker, {
                        enumerable: false,
                        value: true
                    })
                    columns.push(
                        label ? `'${toUnderscored(key)}', "${relationName}".${toUnderscored(key)}` : toUnderscored(key)
                    )
                }
                break;
            case 'virtual':
                if (!endpoint) throw Error(`Cannot select subfields of property ${className}#${key}`)
                const { definition, defaultValue } = metadata[key]
                const testProperties = {}
                definition(buildModel(className, testProperties, { nested, alias }))
                const includesVirtualFields = find(testProperties, key => applicationMetadata[className][key].type === 'relationship')
                if (!nested || !includesVirtualFields) {
                    let columnDefinition = definition(buildModel(className, properties, { nested, alias }))
                    if (defaultValue !== undefined) columnDefinition = `COALESCE(${columnDefinition}, ${format(defaultValue)})`
                    columns.push(
                        label ? `'${toUnderscored(key)}', ${columnDefinition}` : `${columnDefinition} as ${toUnderscored(key)}`
                    )
                } else {
                    Object.defineProperty(properties, nestedQueryMarker, {
                        enumerable: false,
                        value: true
                    })
                    columns.push(
                        label ? `'${toUnderscored(key)}', "${relationName}".${toUnderscored(key)}` : toUnderscored(key)
                    )
                }
                break;
        }
    })
    return columns.join(', ')
}

function buildJoinClause(className, properties, { label = false, alias = false, nested = false } = {}) {
    const joins = []
    each(properties, (key, value) => {
        let name = key
        let joinType;
        let metadata = applicationMetadata[className]
        let { type, options } = metadata[key]
        let endpoint = typeof value === 'boolean'
        let currentClassName = className
        if (type === 'relationship') {
            if (endpoint) throw Error(`Must select subfields for relation ${className}#${key}`)
            if (options.through) {
                let path = {}
                options.through(buildModel(className, path))
                while (true) {
                    ; ([key] = Object.keys(path))
                    if (isEmpty(path[key])) break
                    const { options, joinType } = metadata[key]
                    joins.push(buildJoinClause(currentClassName, { [key]: {} }))
                    path = path[key]
                    currentClassName = toClassName(options.a || options.an || options.of || key)
                    metadata = applicationMetadata[currentClassName]
                    alias = key
                }
            }
            ; ({ options, joinType } = metadata[key])
            const relationName = alias || toTableName(currentClassName)
            const nextRelationName = toClassName(options.a || options.an || options.of || key)
            const myAliasName = options.as || currentClassName
            switch (joinType) {
                case 'belongsTo':
                    value[toForeignKeyName(key)] = true
                    joins.push(
                        !(value[nestedQueryMarker])
                            ? `LEFT JOIN ${toTableName(nextRelationName)} as ${name} ON ${relationName}.${toForeignKeyName(key)} = ${toTableName(name)}.id`
                            : `LEFT JOIN (
                                        SELECT ${generateSQL({ [toTableName(nextRelationName)]: value })}
                                    ) as ${name} ON ${relationName}.${toForeignKeyName(key)} = ${toTableName(name)}.id`
                    )
                    break;
                case 'hasOne':
                    value[toForeignKeyName(myAliasName)] = true
                    joins.push(
                        !(value[nestedQueryMarker])
                            ? `LEFT JOIN ${toTableName(nextRelationName)} as ${name} ON ${name}.${toForeignKeyName(myAliasName)} = ${relationName}.id`
                            : `LEFT JOIN (
                                    SELECT ${generateSQL({ [toTableName(nextRelationName)]: value })}
                                ) as ${name} ON ${name}.${toForeignKeyName(myAliasName)} = ${relationName}.id`
                    )
                    break;
                case 'hasMany':
                    value[toForeignKeyName(myAliasName)] = true
                    joins.push(
                        !(value[nestedQueryMarker])
                            ? `LEFT JOIN ${toTableName(nextRelationName)} as ${name} ON ${name}.${toForeignKeyName(myAliasName)} = ${relationName}.id`
                            : `LEFT JOIN (
                                    SELECT ${generateSQL({ [toTableName(nextRelationName)]: value })}
                                ) as ${name} ON ${name}.${toForeignKeyName(myAliasName)} = ${relationName}.id`
                    )
                    break;
            }
        }
    })
    return joins.join(', ')
}


function buildModel(className, properties, { nested, alias } = {}) {
    const relationName = alias || toTableName(className)

    const model = { toString: () => relationName }
    const metadata = applicationMetadata[className]

    each(metadata, (key, value) => {
        Object.defineProperty(model, key, {
            get: function () {
                const { type } = metadata[key]
                switch (type) {
                    case 'persisted':
                        properties[key] = properties[key] || true
                        return `"${relationName}".${toUnderscored(key)}`
                        break;
                    case 'relationship':
                        const { options } = metadata[key]
                        const nextRelationName = toClassName(options.a || options.an || options.of || key)
                        properties[key] = properties[key] || {}
                        return buildModel(nextRelationName, properties[key], { nested: true, alias: key })
                        break;
                    case 'virtual':
                        const { definition, defaultValue } = metadata[key]
                        if (!nested) {
                            return defaultValue !== undefined
                                ? `COALESCE(${definition(model)}, ${defaultValue})`
                                : definition(model)
                        } else {
                            definition(model)
                            return `"${relationName}".${toUnderscored(key)}`
                        }
                        break;
                }
            }
        })
    })
    return model
}

function isWhitespace(character) {
    return /\s/.test(character)
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0
}

const format = function (defaultValue) {
    if (defaultValue === null) {
        return "NULL"
    }
    if (typeof defaultValue == 'number' || typeof defaultValue == 'boolean') {
        return defaultValue
    }
    if (typeof defaultValue == 'string') {
        return `'${defaultValue}'`
    }
    if (typeof defaultValue == 'object' && (defaultValue.__proto__ == Object.prototype /* || defaultValue instanceof List */)) {
        return `'${JSON.stringify(defaultValue)}'::json`
    }
    if (defaultValue instanceof Date) {
        return "NOW()"
    }

    throw Error(`Variable type cannot be coalesced for sql query: ${defaultValue}`)
}