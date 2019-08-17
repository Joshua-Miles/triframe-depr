import { each, index, filter } from "../mason";
import { toUnderscored, toCamelCase, toCapitalized, toSingular, toForeignKeyName } from "../scribe";
import { Collection } from "./Collection";

export async function query(callback) {

    const database = this.client;
    const types = this.types;
    const self = this.tableName

    const main = async () => {
        let library = createLibrary(types)
        let query = callback(library)
        console.log(query)
        let response = await database.query(query, escaped)
        let results = {}
        response.rows.forEach( row => formatResult(row, results))
        const [ result ] = Object.values(results)
        return result
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
                return createLiteral(Object.keys(attributes).map(toUnderscored).join(','))
            },

            valuesOf: (attributes) => {
                return createLiteral(Object.values(attributes).map(escape).join(','))
            },

            each: (attributes, callback, seperator = ',') => {
                let result = ''
                each(attributes, (key, value) => {
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
        function ModelRep(...fields) {
            let select = fields.map((field, index) => {
                if(field == '*'){
                    return Object.keys(filter(instance.fields, (key, field) => field.type != 'virtual')).map( (key) => {
                        return `"${name}".${key} as "${name}.${key}"`
                    }).join(',')
                }
                if (!ModelRep[field]) {
                    throw Error(`No such column ${field} for table ${name}`)
                }
                return resolveParameter(ModelRep[field])
            }, '').join(',')
            return createLiteral(`${select}, '${Model.name}' as "${name}.__class__"`)
        }
        ModelRep.asLiteral = () => `${Model.tableName} as "${Model.tableName}.[i]"`
        each(instance.fields, (key, field) => {
            switch (field.alias) {
                case 'hasMany':
                    let opts = field.typeModifier
                    let alias = toForeignKeyName(toSingular(opts.as || Model.tableName))
                    let relationTable = opts.of || key;
                    let relationName = `${name}.${key}.[i]`
                    let Relation = models[relationTable]
                    if(!Relation) throw Error(`Could not find relation "${key}"`)
                    define(ModelRep, key, () => {
                        let relationCollection = createModelRep(relationName, Relation, models)
                        relationCollection.join = () => createLiteral(
                            `LEFT JOIN ${relationTable} as "${relationName}" ON "${relationName}".${alias}="${name}".id`
                        )
                        return relationCollection
                    })
                    break;
                default:
                    ModelRep[key] = createLiteral(`${name}.${toUnderscored(key)}`)
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


    let formatResult = (record, result) => {
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
                formatResult(value, lookahead)
                if(lookahead.id === null) return
                let Model = types[lookahead.__class__]
                result[lookahead.id] = result[lookahead.id] || new Model;
                formatResult(value, result[lookahead.id])
            } else {
                let lookahead = {}
                formatResult(value, lookahead)
                if(lookahead.id === null) return
                if(!key.startsWith('__')) key = toCamelCase(key)
                result[key] = result[key] || containerFor(value)
                formatResult(value, result[key])
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


