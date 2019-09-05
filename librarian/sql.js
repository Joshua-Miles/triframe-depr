import { each, index, filter } from "../mason";
import { toUnderscored, toCamelCase, toCapitalized, toSingular, toForeignKeyName, toTableName } from "../scribe";
import { Collection } from "./Collection";

export async function query(callback) {

    const database = this.client;
    const types = this.types;
    const self = this.tableName

    const main = async () => {
        let library = createLibrary(types)
        let query = callback(library)
        console.log(query)
        // console.log(escaped)
        let response = await database.query(query, escaped)
        let results = {}
        response.rows.forEach( (row, index) => {
            formatResult(row, results, index)
        })
        const [ result ] = Object.values(results)
        return result || new Collection
    }

    const createLibrary = models => {

        models = index(models, 'tableName')

        const library = {

            sql: (queryFragments, ...parameters) => {
                return queryFragments.reduce((query, fragment, index) => {
                    return `${query}${resolveParameter(parameters[index - 1])}${fragment}`
                })

            },

            keysOf: (attributes) => {
                return createLiteral(Object.keys(filter(attributes, (key, value) => value !== undefined )).map(toUnderscored).join(','))
            },

            valuesOf: (attributes) => {
                return createLiteral(Object.values(filter(attributes, (key, value) => value !== undefined )).map(escape).join(','))
            },

            each: (attributes, callback, seperator = ',') => {
                let result = ''
                each(attributes, (key, value) => {
                    if(value == undefined) return
                    key = toUnderscored(key)
                    value = escape(value)
                    result = result ? `${result} ${seperator} ${callback(key, value)}` : callback(key, value)
                })
                return createLiteral(result)
            }
        }

        each(models, (key, Model) => {
            let name = `${Model.tableName}.[i]`
            define(library, Model.tableName, () => createModelRep(name, Model, models))
        })

        library.self = library[self]

        return library
    }

    const createModelRep = (name, Model, models) => {
        let instance = new Model
        const ModelRep = (...fields) => {
            let select = fields.map((field, index) => {
                if(field == '*'){
                    return Object.keys(filter(instance.fields, (key, field) => field.type != 'virtual' && key != 'id')).map( (key) => {
                        return `"${name}".${key} as "${name}.${key}"`
                    }).join(',')
                }
                if (!ModelRep[field]) {
                    throw Error(`No such column ${field} for table ${name}`)
                }
                return `${resolveParameter(ModelRep[field])} as "${name}.${field}"`
            })
            select = select.join(',')
            return createLiteral(`${select}, "${name}".id as "${name}.id", '${Model.name}' as "${name}.__class__"`)
        }
        ModelRep.asLiteral = () => `${Model.tableName} as "${Model.tableName}.[i]"`
        each(instance.fields, (key, field) => {
            switch (field.alias) {
                case 'hasMany':
                    var opts = field.typeModifier
                    var alias = toForeignKeyName(toSingular(opts.as || Model.tableName))
                    var relationTable = opts.of || key;
                    var relationName = `${name}.${key}.[i]`
                    var Relation = models[relationTable]
                    if(!Relation) throw Error(`Could not find relation "${key}"`)
                    define(ModelRep, key, () => {
                        var relationCollection = createModelRep(relationName, Relation, models)
                        relationCollection.join = () => createLiteral(
                            `LEFT JOIN ${relationTable} as "${relationName}" ON "${relationName}".${alias}="${name}".id`
                        )
                        return relationCollection
                    })
                    break;
                case 'belongsTo':
                    Object.defineProperty(ModelRep, key, {
                        value: createLiteral(`"${name}".${toUnderscored(key)}`)
                    })
                    key = key.substr(0, key.length-3)
                    var relationTable = toTableName( key);
                    var relationName = `${name}.${key}`
                    var Relation = models[relationTable]
                    if(!Relation) throw Error(`Could not find relation "${key}"`)
                    var alias = toForeignKeyName(toSingular(Relation.tableName))
                    define(ModelRep, key, () => {
                        var relationCollection = createModelRep(relationName, Relation, models)
                        relationCollection.join = () => createLiteral(
                            `LEFT JOIN ${relationTable} as "${relationName}" ON "${name}".${alias}="${relationName}".id`
                        )
                        return relationCollection
                    })
                   
                    break
                default:
                    Object.defineProperty(ModelRep, key, {
                        value: createLiteral(`"${name}".${toUnderscored(key)}`)
                    })
                break
            }
        })
        return ModelRep
    }

    const resolveParameter = (parameter) => {
        if (parameter.asLiteral) {
            return parameter.asLiteral()
        }
        if (typeof parameter == 'symbol') {
            return literals[parameter]
        } else {
            return escape(parameter)
        }
    }

    const literals = {}
    const createLiteral = str => {
        const literal = Symbol()
        literals[literal] = str
        return literal
    }

    const escaped = []
    let counter = 1;
    const escape = attribute => {
        escaped.push(attribute)
        return `$${counter++}`
    }


    let formatResult = (record, result, index) => {
        let next = {}
        each(record, ( key, value ) => {
            let [ first, ...rest ] = key.split('.')
            if(rest.length){
                next[first] = next[first] || {}
                next[first][rest.join('.')] = value
            } else {
                if(!first.startsWith('__')) first = toCamelCase(first)
                result[first] = value
            }
        })
        each(next, (key, value) => {
            if(key === '[i]'){
                let lookahead = {}
                formatResult(value, lookahead, index)
                if(lookahead.id === null) return
                let Model = types[lookahead.__class__] || Object
                result[lookahead.id] = result[lookahead.id] || new Model;
                result[lookahead.id].__index__ = result[lookahead.id].__index__ || index
                formatResult(value, result[lookahead.id], index)
            } else {
                let lookahead = {}
                formatResult(value, lookahead, index)
                if(lookahead.id === null) return
                if(!key.startsWith('__')) key = toCamelCase(key)
                if(lookahead.__class__ && typeof types[lookahead.__class__] == 'function') next = new types[lookahead.__class__]
                else next = containerFor(value)
                result[key] = result[key] ||  next
                formatResult(value, result[key], index)
            }
        })
    }

    return await main()
}

let containerFor = matrix => {
    return Object.keys(matrix)[0].startsWith('[i]') ? new Collection : new Object
}

const define = (obj, key, callback) => Object.defineProperty(obj, key, {
    get: () => {
        return callback()
    }
})


