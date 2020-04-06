import { each, group, map, deepMap, index, find, filter, toClassName, toSingular, toForeignKeyName, toTableName, metadata, toUnderscored, toCamelCase, getMetadata, Pipe } from "triframe/core"
import { database } from './database'
import { parseTriQL } from "./parseTriQL"

export const literal = x => ({ isLiteral: true, value: x })

export const isLiteral = x => x && x.isLiteral

const literalValue = (x, escape) => (
    typeof x.value === 'function'
        ? x.value(escape)
        : x.value
)

export const keys = x => {
    return {
        join: sep => literal(Object.keys(x).map(toUnderscored).join(sep))
    }
}

export const values = x => {
    return {
        join: sep => literal(escape => Object.values(x).map(escape).join(sep))
    }
}

export const pairs = (x, seperator = value => value === null ?  ' IS NULL' : ` = ${escape(value)}`) => {
    let seperate;
    if( typeof seperator !== 'function') seperate = (value) => ` ${seperator} ${escape(value)}`
    else seperate = seperator
    return {
        join: sep => literal(escape => Object.keys(x).map(key => `${toUnderscored(key)}${seperate(x[key])}`).join(sep))
    }
}

const createReducer = seperator => (x, reducer) => literal( escape => {
    let result;
    each(x, (key, value) => 
        result = result === undefined 
            ? reducer(toUnderscored(key), { toString: () => escape(value)}, value)
            : `${result}${seperator}${reducer(toUnderscored(key), { toString: () => escape(value)}, value)}`
    )
    return result;
})

export const reduce = createReducer(', ')
export const all = createReducer(' AND ')
export const any = createReducer(' OR ')

let models;

let defaultOptions = {
    disableLogging: false
}

export const sql = (...args) => {
    if(Array.isArray(args[0])){
        return runQuery(defaultOptions, ...args)
    } else {
        let options = args[0]
        return (...args) => runQuery(options, ...args)
    }
}

const runQuery = (options, queryFragments, ...variables) => {
    let escaped = []
    let escape = x => {
        escaped.push(x)
        return `$${escaped.length}`
    }
    let triQL = queryFragments.reduce((triQL, fragment, index) => (
        index === 0
            ? `${fragment}`
            : (
                isLiteral(variables[index - 1])
                    ? `${triQL}${literalValue(variables[index - 1], escape)}${fragment}`
                    : `${triQL}${escape(variables[index - 1])}${fragment}`
            )
    ), '')
    const { query, events } = parseTriQL(triQL)
    return new Pipe(queryProcess, options, query, escaped, events)
}


function* queryProcess(emit, options, triQL, escaped, events) {
    if(!options.disableLogging) console.log(triQL, escaped, events.map( ({ Class, event }) => `${Class.name}.${event}`))
    for (let { Class, event } of events) yield Class.nowAndOn(event)
    const response = yield database.query(triQL, escaped)
    if (!models) models = index(metadata, (_, { className }) => className, (_, { Class }) => Class)
    return deepMap(response.rows, (value) => {
        if (value && value.__class__) {
            if(value.id === null) return null
            let Model = models[value.__class__]
            let tempInstance = new Model;
            let camelCasedKeys = key => toCamelCase(key)
            let decodedValues = (key, value) => {
                const { sqlDecode } = getMetadata(tempInstance, key)
                if (sqlDecode) return sqlDecode(value)
                else return value
            }
            return new Model(index(value, camelCasedKeys, decodedValues))
        }
        if (Array.isArray(value)) {
            return value.filter(value => value !== null && value.id !== null)
        }
        return value
    })
}