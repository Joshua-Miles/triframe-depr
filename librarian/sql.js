import { each, index, filter } from "../mason";
import { toUnderscored, toCamelCase, toCapitalized, toSingular, toForeignKeyName, toTableName } from "../scribe";
import { Collection } from "./Collection";

export async function query(callback, { disableLogging = false } = {}) {

    const database = this.client;
    const types = this.types;
    const self = this.tableName

    let group

    const main = async () => {
        let library = createLibrary(types)
        let query = callback(library)
        if(group && !query.includes('GROUP BY')) query = `${query} GROUP BY ${group}`
        
        if(!disableLogging) console.log(query, escaped)
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
            if(record[0].__isOnly__){
                if(record[0].id){
                    return crawl(record[0])
                } else {
                    return null
                }
            }
            let collection = new Collection;
            collection.__of__ = record.__of__
            collection.__presets__ = record.__presets__
            record.forEach( (record) => {
                if(record.id !== null){
                    let result = crawl(record)
                    collection.push(result)
                }
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
                    if(value === undefined) return
                    key = toUnderscored(key)
                    if(value !== null) value = Array.isArray(value) ? value.map(escape) : escape(value)
                    result = result ? `${result} ${seperator} ${callback(key, value)}` : callback(key, value)
                })
                return createLiteral(result)
            },

            literal: value => ({ asLiteral: () => value })
        }

        each(models, (key, Model) => {
            let name = `${Model.tableName}`
            define(library, Model.tableName, () => createModelRep(name, Model, models))
        })

        library.self = library[self]

        return library
    }

    const createModelRep = (name, Model, models, $as) => {
        let instance = new Model 
        const ModelRep = function(options, ...fields) {
            if(options.__proto__ != Object.prototype){
                fields.unshift(options)
                options = {}
            }
            const { orderBy } = options
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
                if(Array.isArray(field)){
                    let [ name, definition ] = field
                    return `'${name}', ${definition}`
                }
                if (!ModelRep[field]) {
                    throw Error(`No such column ${field} for table ${name}`)
                }
                return `'${field}', ${resolveParameter(ModelRep[field])}`
            })
            select = select.join(',')
           
            const orderClause = orderBy ? `ORDER BY ${orderBy}` : ''

            if($as == 'collection') select = `'${name}', array_agg(json_build_object('id', "${name}".id,\n         '__class__', '${Model.name}', \n        ${select}) ${orderClause})`
            else if($as == 'first') select = `'${name}', array_agg(json_build_object('id', "${name}".id,\n    '__isOnly__', 'true',     '__class__', '${Model.name}', \n        ${select}) ${orderClause})`
            else  select = `json_build_object('id', "${name}".id,\n         '__class__', '${Model.name}', \n        ${select})`

            return createLiteral(select)
        }
        ModelRep.asLiteral = () => `${Model.tableName}`
        each(instance.fields, (key, field) => {
            switch (field.alias) {
                case 'hasMany':
                    var opts = field.metadata || {}
                    var alias = toForeignKeyName(toSingular(opts.as || Model.tableName))
                    var relationTable = toTableName(opts.of || key);
                    var relationName = key;
                    var Relation = models[relationTable]
                    if(!Relation) throw Error(`Could not find relation "${key}"`)
                    define(ModelRep, key, () => {
                        var relationCollection = createModelRep(relationName, Relation, models, 'collection')
                        relationCollection.join = () => createLiteral(
                            `LEFT JOIN ${relationTable} as ${relationName} ON ${relationName}.${alias} = ${name}.id`
                        )
                        return relationCollection
                    })
                    break;
                case 'hasOne':
                        var opts = field.metadata || {}
                        var alias = toForeignKeyName(toSingular(opts.as || Model.tableName))
                        var relationTable = toTableName(opts.of || key);
                        var relationName = key;
                        var Relation = models[relationTable]
                        if(!Relation) throw Error(`Could not find relation "${key}"`)
                        define(ModelRep, key, () => {
                            var relationCollection = createModelRep(relationName, Relation, models, 'first')
                            relationCollection.join = () => createLiteral(
                                `LEFT JOIN ${relationTable} as ${relationName} ON ${relationName}.${alias} = ${name}.id`
                            )
                            return relationCollection
                        })
                        break;
                case 'belongsTo':
                    var opts = field.metadata || {}
                    Object.defineProperty(ModelRep, key, {
                        value: {
                            asLiteral: () => `"${name}".${toUnderscored(key)}`,
                            toString: () => `"${name}".${toUnderscored(key)}`
                        }
                    })
                    var relation = key.substr(0, key.length-3)
                    var relationTable = opts.a ? toTableName(opts.a) : toTableName( relation);
                    var relationName = `${relation}`
                    var Relation = models[relationTable]
                    if(!Relation) throw Error(`Could not find relation "${relation}"`)
                    var alias = toForeignKeyName(toSingular(relationName))
                    define(ModelRep, relation, () => {
                        var relationCollection = createModelRep(relationName, Relation, models, 'first')
                        relationCollection.join = () => createLiteral(
                            `LEFT JOIN ${relationTable} as ${relationName} ON ${name}.${alias} = ${relationName}.id`
                        )
                        return relationCollection
                    })
                   
                    break
                default:
                    Object.defineProperty(ModelRep, key, {
                        value: {
                            asLiteral: () => `"${name}".${toUnderscored(key)}`,
                            toString: () => `"${name}".${toUnderscored(key)}`
                        }
                    })
                break
            }
        })
        return ModelRep
    }

    const resolveParameter = (parameter) => {
        if(parameter === undefined){
            return undefined
        }
        if(Array.isArray(parameter)){
            return parameter.map( parameter => resolveParameter(parameter)).join("\n")
        }
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


