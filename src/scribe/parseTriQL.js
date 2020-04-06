import { each, group, map, deepMap, index, find, filter, toClassName, toSingular, toForeignKeyName, toTableName, metadata, toUnderscored, toCamelCase, getMetadata, Pipe } from "triframe/core"

const SINGLE_QUOTES = { opening: "'", closing: "'", endsTerm: true }
const DOUBLE_QUOTES = { opening: '"', closing: '"', endsTerm: false }
const TEMPLATE_STRING = { opening: "`", closing: "`", endsTerm: false }
const PARENTHESIS = { opening: "(", closing: ")", endsTerm: true }
const CURLY_BRACES = { opening: "{", closing: "}", endsTerm: false }
const SQUARE_BRACKETS = { opening: "{", closing: "}", endsTerm: false }
const symbolsByOpening = [SINGLE_QUOTES, DOUBLE_QUOTES, TEMPLATE_STRING, PARENTHESIS, CURLY_BRACES, SQUARE_BRACKETS].reduce( 
    (result, symbol) => ({ ...result, [symbol.opening]: symbol }), {}
)

const postWhereKeywords = ['GROUP', 'HAVING', 'ORDER', 'OFFSET', 'FETCH']

const nestedQueryMarker = Symbol()
const directivesMarker = Symbol()

let models, applicationMetadata;

const isKeyword = term => term.toUpperCase() === term || ['as'].includes(term);
const isWhitespace = character => /\s/.test(character)

export const parseTriQL = triQl => {
    // if(triQl.includes('UPDATE')) return { query: triQl, pipes: []} // <- Whe does update query get super skrewed up?
    if (!models) models = index(metadata, (_, { className }) => className, (_, { Class }) => Class)
    if (!applicationMetadata) applicationMetadata = map(group(filter(metadata, (key, { type }) => type != undefined), 'className'), (_, metadata) => index(metadata, 'key'))
    let query = ''
    let term = ''
    let expectedClosingSymbols = []
    let opens = char => !closes(char) && symbolsByOpening[char];
    let closes = char => char == expectedClosingSymbols[0]?.closing;
    let insideOf = symbol => !!expectedClosingSymbols.find(expected => expected.closing === symbol.closing)

    let automatedGrouping = null
    let autoGroup = grouping => automatedGrouping = grouping
    let primaryRelation = null
    let definePrimaryRelation = relation => primaryRelation = relation
    let relationAliases = {}
    let defineRelationAlias = (relationName, aliasName) => relationAliases[aliasName] = relationName
    let events = []
    let registerEventListener = (Class, event) => events.push({ Class, event })

    const append = string => query += string;
    const endTerm = (symbol) => {
        if(automatedGrouping !== null && (postWhereKeywords.includes(term)) ){
            append(` GROUP BY ${automatedGrouping} `)
            automatedGrouping = null
        }
        if (term){
            if(term === 'GROUP') automatedGrouping = null
            if (isKeyword(term)) {
                append(term)
            } else {
                if(symbol !== SINGLE_QUOTES){
                    term = term.replace(/[A-Z]/g, x => `_${x.toLowerCase()}`)
                }
                append(term)
                if(primaryRelation) {
                    let trimmedTerm = term.replace(/"/g, '')
                    let relationName, propertyName;
                    if(trimmedTerm.includes('.')) ([ relationName, propertyName] = trimmedTerm.split('.'))
                    else ([ relationName, propertyName ] = [ primaryRelation, trimmedTerm])
                    if(relationAliases[relationName]) relationName = relationAliases[relationName]
                    let className = toClassName(relationName)
                    let Model = models[className]
                    if(!Model) console.log('WARNING:', className)
                    registerEventListener(Model, `*.changed.${toCamelCase(propertyName)}`)
                }
            }
        } 
        if(automatedGrouping !== null && symbol === true  ){
            append(` GROUP BY ${automatedGrouping} `)
            automatedGrouping = null
        }
        term = ''
    }
    let selectionContext = null;
    for (let i = 0; i < triQl.length; i++) {
        let symbol;
        const character = triQl[i]
        if (opens(character)) {
            symbol = symbolsByOpening[character]
            expectedClosingSymbols.unshift(symbol)
        }
        if (closes(character)) {
            symbol = expectedClosingSymbols.shift()
        }
        if (insideOf(CURLY_BRACES) && !selectionContext) {
            selectionContext = createSelectionContext({ insideOf, autoGroup, registerEventListener, definePrimaryRelation, defineRelationAlias })
            continue
        }
        if (insideOf(CURLY_BRACES)) {
            selectionContext.parse(character)
            continue
        }
        if (!insideOf(CURLY_BRACES) && selectionContext) {
            append(selectionContext.close())
            selectionContext = null
            continue
        }
        if(symbol && symbol.endsTerm){
            endTerm(symbol)
            append(character)
            continue;
        }
        if (isWhitespace(character)) {
            endTerm()
            append(character)
            continue;
        }
        term += character
    }
    endTerm(true)
    return { query, events }
}


let createSelectionContext = ({ insideOf, autoGroup, registerEventListener, definePrimaryRelation, defineRelationAlias }) => {

    let selectionModel = {};
    let pointer = selectionModel;
    let property = ''
    let parent = Symbol()
    let directiveContext = null
    let defineSelectionEndpoint = () => {
        if(property.length) pointer[property] = pointer[property] || true
    }

    let parse = (character) => {
        if (insideOf(PARENTHESIS) && !directiveContext) {
            directiveContext = createDirectiveContext({ insideOf })
            return;
        }
        if (insideOf(PARENTHESIS)) {
            directiveContext.parse(character)
            return;
        }
        if (!insideOf(PARENTHESIS) && directiveContext) {
            let directives = directiveContext.close()
            pointer[property] = {}
            Object.defineProperty(pointer[property], directivesMarker, {
                enumerable: false,
                value: directives
            })
            directiveContext = null
            return;
        }
        if (isWhitespace(character)) {
            return
        }
        if (character == '{') {
            pointer[property] = pointer[property] || {}
            pointer[property][parent] = pointer
            pointer = pointer[property]
            property = ''
            return
        }
        if (character == '}') {
            defineSelectionEndpoint()
            pointer = pointer[parent]
            property = ''
            return
        }
        if (character == ',') {
            defineSelectionEndpoint()
            property = ''
            return
        }
        property += character
    }

    const close = () => {
        defineSelectionEndpoint()

        const keys = Object.keys(selectionModel)
        const [ key ] = keys;

        if(pointer !== selectionModel) throw SyntaxError('Unexpected End of Input for Query')
        if (keys.length > 1) throw Error(`Cannot select ${keys.join(', ')} simultaneously`)

        definePrimaryRelation(key)
        autoGroup(`${key}.id`)

        return sqlFor(selectionModel, registerEventListener, defineRelationAlias)
    }

    return { parse, close }
}


let createDirectiveContext = ({ insideOf }) => {

    let directives = {}
    let directiveKey = ""
    let directiveValue = ""
    let directiveContext = "key"

    let defineDirective = () => {
        directives[directiveKey] = directiveValue
        directiveKey = ""
        directiveValue = ""
    }

    let parse = (character) => {
        if (isWhitespace(character) && !insideOf(SINGLE_QUOTES) && !insideOf(DOUBLE_QUOTES)) {
            return
        }
        if (character === ':') {
            directiveContext = "value"
            return
        }
        if (character === ',') {
            defineDirective()
            directiveContext = "key"
            return
        }
        if (directiveContext === "key") {
            directiveKey += character
        }
        if (directiveContext === "value") {
            directiveValue += character
        }
        return
    }

    const close = () => {
        defineDirective()
        return directives
    }

    return { parse, close }
}


function sqlFor(selectionModel, registerEventListener = () => null, defineRelationAlias ) {

    const [key] = Object.keys(selectionModel)
    const className = toClassName(key)
    const properties = selectionModel[key]

    
    // TODO: ~~Parse the where clause~~ scratch that, move the residual parser here, get ALL properties involved 
    //          in the query while transforming them to snake case
    //          Maybe parse the where clause after for the id, maybe don't, idk
    // Register event listeners for the change of columns in the where clause or order by clause
    // Optimize existing event listeners by checking for the id in the where clause

    let suffix = ''
    if(!defineRelationAlias) suffix = ` GROUP BY ${key}.id`

    const selectClause = buildSelectClause(className, properties, { registerEventListener, defineRelationAlias }) // <-- `properties` WILL be mutated to account for virtual columns
    const fromClause = buildJoinClause(className, properties, { registerEventListener })

    const Class = models[className]
    registerEventListener(Class, `deleted.*`)
    registerEventListener(Class, `created.*`)

    // let [remaining1, remaining2 = ""] = remaining.split('ORDER BY')
    // if (remaining2) remaining2 = `ORDER BY ${remaining2}`
    return `${selectClause} FROM ${key} ${fromClause}${suffix}`
}

function buildSelectClause(className, properties, { label = false, alias = false, nested = false, registerEventListener = () => null, defineRelationAlias = () => null } = {}) {
    const columns = []
    const metadata = applicationMetadata[className]
    const relationName = alias || toTableName(className)
    columns.push(
        label ? `'id', "${relationName}".id` : `"${relationName}".id`,
        label ? `'__class__', '${className}'` : `'${className}' as __class__`
    )
    each(properties, (key, value) => {
        if(!metadata[key]) throw Error(`Cannot query for undefined property ${className}#${key}`)
        const { type } = metadata[key]
        const directives = value[directivesMarker]
        const endpoint = (
            typeof value === 'boolean'
                ||
            Object.keys(value).length === 0
        )
        switch (type) {
            case 'persisted':
                if (!endpoint) throw Error(`Cannot select subfields of property ${className}#${key}`)
                if(directives) throw Error(`Cannot provide directives for persisted property ${className}#${key}`)
                columns.push(
                    label ? `'${toUnderscored(key)}', "${relationName}".${toUnderscored(key)}` : `"${relationName}".${toUnderscored(key)}`
                )
                break;
            case 'relationship':
                if (endpoint) throw Error(`Must select subfields for relation ${className}#${key}`)
                const { options, joinType } = metadata[key]
                const nextRelationName = toClassName(options.a || options.an || options.of || key)
                defineRelationAlias(nextRelationName, key)
                let nextRelation;
                switch (joinType) {
                    case 'belongsTo':
                        nextRelation = `(array_agg(json_build_object(${buildSelectClause(nextRelationName, value, { label: true, alias: toUnderscored(key), nested: true, registerEventListener, defineRelationAlias })})))[1]`
                        break;
                    case 'hasOne':
                        nextRelation = `(array_agg(json_build_object(${buildSelectClause(nextRelationName, value, { label: true, alias: toUnderscored(key), nested: true, registerEventListener, defineRelationAlias })})))[1]`
                        break;
                    case 'hasMany':
                        let orderClause = ''
                        if(directives && directives.orderBy){
                            const { orderBy, orderDirection } = directives
                            const NextClass = models[nextRelationName]
                            registerEventListener(NextClass, `*.changed.${orderBy}`)
                            orderClause = `ORDER BY ${orderBy} ${orderDirection || 'ASC'}`
                        }
                        nextRelation = `array_agg(json_build_object(${buildSelectClause(nextRelationName, value, { label: true, alias: toUnderscored(key), nested: true, registerEventListener, defineRelationAlias })})${orderClause})`
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
                definition(buildModel(className, testProperties, { nested, alias }), directives || {})
                const includesVirtualFields = find(testProperties, key => applicationMetadata[className][key]?.type === 'relationship')
                if (!nested || !includesVirtualFields) {
                    // TODO 
                    // Listen for when testProperties change
                    // let CurrentClass = models[className]
                    // each(testProperties, (key, value) => {
                    //     registerEventListener(CurrentClass, `*.changed.${key}`)
                    // })

                    let columnDefinition = definition(buildModel(className, properties, { nested, alias }, registerEventListener), directives || {})
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

function buildJoinClause(className, properties, { label = false, alias = false, nested = false, registerEventListener = () => null } = {}) {
    const joins = []
    const addJoin = join => {
        if(!joins.includes(join)) joins.push(join)
    }
    each(properties, (key, value) => {
        let name = toUnderscored(key)
        let joinType;
        let metadata = applicationMetadata[className]
        let { type, options } = metadata[key]
        let endpoint = typeof value === 'boolean'
        let currentClassName = className
        let currentAlias  = alias
        if (type === 'relationship') {
            if (endpoint) throw Error(`Must select subfields for relation ${className}#${key}`)
            if (options.through) {
                let path = {}
                options.through(buildModel(className, path))
                while (true) {
                    ; ([key] = Object.keys(path))
                    if (isEmpty(path[key])) break
                    const { options, joinType } = metadata[key]
                    addJoin(buildJoinClause(currentClassName, { [key]: {} }, { registerEventListener }))
                    path = path[key]
                    currentClassName = toClassName(options.a || options.an || options.of || key)
                    metadata = applicationMetadata[currentClassName]
                    currentAlias = key
                }
            }
            ; ({ options, joinType } = metadata[key])
            const relationName = currentAlias || toTableName(currentClassName)
            const nextRelationName = toClassName(options.a || options.an || options.of || key)
            const myAliasName = options.as || currentClassName
            let CurrentClass = models[currentClassName]
            let NextClass = models[nextRelationName]

            registerEventListener(NextClass, `created.*`)
            registerEventListener(NextClass, `deleted.*`)

            switch (joinType) {
                case 'belongsTo':

                    // TODO
                    // maybe? (save a function with this event
                    // after the query returns, create the event listeners using against the id before emiting
                    // to work on nested relations, this would have to follow the nesting path in the resolver)
                    registerEventListener(CurrentClass, `*.changed.${toCamelCase(toForeignKeyName(key))}`)
                    

                    //value[toForeignKeyName(key)] = true
                    addJoin(
                        !(value[nestedQueryMarker])
                            ? `LEFT JOIN ${toTableName(nextRelationName)} as ${name} ON ${relationName}.${toForeignKeyName(key)} = ${name}.id`
                            : `LEFT JOIN (
                                        SELECT ${sqlFor({ [toTableName(nextRelationName)]: value })}
                                    ) as ${name} ON ${relationName}.${toForeignKeyName(key)} = ${name}.id`
                    )
                    break;
                case 'hasOne':

                    // TODO
                    // listen to when any one from the next class changes their foreign key
                    // if their foreign key was changed to me or from me, emit
                    registerEventListener(NextClass, `*.changed.${toCamelCase(toForeignKeyName(myAliasName))}`)

                    value[toForeignKeyName(myAliasName)] = true
                    addJoin(
                        !(value[nestedQueryMarker])
                            ? `LEFT JOIN ${toTableName(nextRelationName)} as ${name} ON ${name}.${toForeignKeyName(myAliasName)} = ${relationName}.id`
                            : `LEFT JOIN (
                                    SELECT ${sqlFor({ [toTableName(nextRelationName)]: value })}
                                ) as ${name} ON ${name}.${toForeignKeyName(myAliasName)} = ${relationName}.id`
                    )
                    break;
                case 'hasMany':

                    // TODO
                    // listen to when any one from the next class changes their foreign key
                    // if their foreign key was changed to me or from me, emit
                    registerEventListener(NextClass, `*.changed.${toCamelCase(toForeignKeyName(myAliasName))}`)

                    value[toForeignKeyName(myAliasName)] = true
                    addJoin(
                        !(value[nestedQueryMarker])
                            ? `LEFT JOIN ${toTableName(nextRelationName)} as ${name} ON ${name}.${toForeignKeyName(myAliasName)} = ${relationName}.id`
                            : `LEFT JOIN (
                                    SELECT ${sqlFor({ [toTableName(nextRelationName)]: value })}
                                ) as ${name} ON ${name}.${toForeignKeyName(myAliasName)} = ${relationName}.id`
                    )
                    break;
            }
        }
    })
    return joins.join(' ')
}


function buildModel(className, properties, { nested, alias } = {}, registerEventListener = () => null) {
    const relationName = alias || toTableName(className)

    const model = { toString: () => relationName }
    const metadata = applicationMetadata[className]
    const Class = models[className]
    each(metadata, (key, value) => {
        Object.defineProperty(model, key, {
            get: function () {
                const { type } = metadata[key]
                switch (type) {
                    case 'persisted':
                        registerEventListener(Class, `*.changed.${key}`)
                        properties[key] = properties[key] || true
                        return `"${relationName}".${toUnderscored(key)}`
                        break;
                    case 'relationship':
                        const { options } = metadata[key]
                        const nextRelationName = toClassName(options.a || options.an || options.of || key)
                        properties[key] = properties[key] || {}
                        return buildModel(nextRelationName, properties[key], { nested: true, alias: toUnderscored(key) }, registerEventListener)
                        break;
                    case 'virtual':

                        function directiveAcceptor(directives = {}) {
                            const { definition, defaultValue } = metadata[key]
                            if (!nested) {
                                return defaultValue !== undefined
                                    ? `COALESCE(${definition(model, directives)}, ${defaultValue})`
                                    : definition(model, directives)
                            } else {
                                definition(model, directives)
                                return `"${relationName}".${toUnderscored(key)}`
                            }
                        }

                        directiveAcceptor.toString = directiveAcceptor

                        return directiveAcceptor
                        break;
                }
            }
        })
    })
    return model
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

function isEmpty(obj) {
    return Object.keys(obj).length === 0
}