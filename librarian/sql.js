import { each, index, filter } from "../mason";
import { toUnderscored, toCamelCase, toCapitalized, toSingular, toForeignKeyName, toTableName } from "../scribe";
import { Collection } from "./Collection";

export async function query(callback) {

    const database = this.client;
    const types = this.types;
    const self = this.tableName

    let group

    const main = async () => {
        let library = createLibrary(types)
        let query = callback(library)
        if(group && !query.includes('GROUP BY')) query = `${query} GROUP BY ${group}`
        console.log(query)
        let response = await database.query(query, escaped)
        let result = Collection.fromArray(response.rows.map( (row, index) => {
            let document = crawl(row.json_build_object || row) 
            document.__index__ = index
            return document
        }))
        return result || new Collection
    }

    const crawl = ( record ) => {
        if(!record){
            return record
        } else if(record.__class__){
            let Model = types[record.__class__];
            let document = new Model;
            each(record, ( key, value ) => {
                if(!key.startsWith('__')) key = toCamelCase(key)
                if(document[key] instanceof Collection){
                    value.__of__ = document[key].__of__
                    value.__presets__ = document[key].__presets__
                }
                document[key] = crawl(value)
            })
            return document
        } else if(Array.isArray(record)){
            let collection = new Collection;
            collection.__of__ = record.__of__
            collection.__presets__ = record.__presets__
            record.forEach( record => {
                collection.push(crawl(record))
            })
            return collection;
        }  else {
            return record
        }
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
                return createLiteral(Object.keys(filter(attributes, (key, value) => value !== undefined ))
                            .map( key => `"${toUnderscored(key)}"`).join(','))
            },

            valuesOf: (attributes) => {
                return createLiteral(Object.values(filter(attributes, (key, value) => value !== undefined )).map(escape).join(','))
            },

            each: (attributes, callback, seperator = ',') => {
                let result = ''
                each(attributes, (key, value) => {
                    if(value == undefined) return
                    key = toUnderscored(key)
                    value = Array.isArray(value) ? value.map(escape) : escape(value)
                    result = result ? `${result} ${seperator} ${callback(key, value)}` : callback(key, value)
                })
                return createLiteral(result)
            }
        }

        each(models, (key, Model) => {
            let name = `${Model.tableName}`
            define(library, Model.tableName, () => createModelRep(name, Model, models))
        })

        library.self = library[self]

        return library
    }

    const createModelRep = (name, Model, models, asCollection) => {
        let instance = new Model 
        const ModelRep = function(...fields) {
            let select = fields.map((field, index) => {
                if(field == '*'){
                    return Object.keys(filter(instance.fields, (key, field) => field.type != 'virtual' && key != 'id')).map( (key) => {
                        return `'${key}', "${name}"."${key}"`
                    }).join(',\n        ')
                }
                if(typeof field == 'symbol'){
                    group = `"${name}".id`
                    return resolveParameter(field)
                }
                if (!ModelRep[field]) {
                    throw Error(`No such column ${field} for table ${name}`)
                }
                return `'${field}', ${resolveParameter(ModelRep[field])}`
            })
            select = select.join(',')
            select = `json_build_object('id', "${name}".id,\n         '__class__', '${Model.name}', \n        ${select})`
            if(asCollection) select = `'${name}', array_agg(${select})`
            return createLiteral(select)
        }
        ModelRep.asLiteral = () => `${Model.tableName}`
        each(instance.fields, (key, field) => {
            switch (field.alias) {
                case 'hasMany':
                    var opts = field.typeModifier
                    var alias = toForeignKeyName(toSingular(opts.as || Model.tableName))
                    var relationTable = opts.of || key;
                    var relationName = key;
                    var Relation = models[relationTable]
                    if(!Relation) throw Error(`Could not find relation "${key}"`)
                    define(ModelRep, key, () => {
                        var relationCollection = createModelRep(relationName, Relation, models, true)
                        relationCollection.join = () => createLiteral(
                            `LEFT JOIN ${relationTable} ON ${relationTable}.${alias} = ${name}.id`
                        )
                        return relationCollection
                    })
                    break;
                case 'belongsTo':
                    var opts = field.typeModifier || {}
                    Object.defineProperty(ModelRep, key, {
                        value: createLiteral(`"${name}".${toUnderscored(key)}`)
                    })
                    key = key.substr(0, key.length-3)
                    var relationTable = opts.a ? toTableName(opts.a) : toTableName( key);
                    var relationName = `${name}.${key}`
                    var Relation = models[relationTable]
                    if(!Relation) throw Error(`Could not find relation "${key}"`)
                    var alias = toForeignKeyName(toSingular(Relation.tableName))
                    define(ModelRep, key, () => {
                        var relationCollection = createModelRep(relationName, Relation, models)
                        relationCollection.join = () => createLiteral(
                            `LEFT JOIN ${relationTable} ON ${name}.${alias} = ${relationName}.id`
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

    try {

    return await main()

    }catch( err ) {
        console.log(err)
    }
}

let containerFor = matrix => {
    return Object.keys(matrix)[0].startsWith('[i]') ? new Collection : new Object
}

const define = (obj, key, callback) => Object.defineProperty(obj, key, {
    get: () => {
        return callback()
    }
})


