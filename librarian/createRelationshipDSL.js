import { isSingular, isPlural, toSingular, toPlural, toTableName, toCamelCase, toForeignKeyName, toCapitalized } from '../scribe'
import { drawQuery } from './sql'
import { stream } from '../herald';
import { filter, index } from '../mason';
import { root } from '../arbiter/Markers'

// Every Type instance will have a _relations_ property which will contain a cache for each relation
// Every Type will have a `loadRelation`  method
// Every Type will have a `setRelation`  method
// Every type will have a `joinRelation` method


// Every relationship will have a single, pure, getter/setter property `author`, 
// The getter for which will:
//  * check for a cache in _relations_
//  * return `loadRelation` if the cache is not present
// The setter for which will:
//  * return `joinRelation`

export const createRelationshipDSL = function (options) {


    class Cursor {

        points = new Array

        constructor(type) {
            this.type = type
        }


        get path() {
            let { points } = this

            if (points.length && pathComplexity(points) != this.complexity) throw Error(`Drawn relationship does not reference ${this.complexity}`)

            return [...points]
        }

        hasOne(propName) {
            this.propName = propName
            this.complexity = 'one'
            return this.secondaryCursor
        }

        hasMany(propName) {
            this.propName = propName
            this.complexity = 'many'
            return this.secondaryCursor
        }

        secondaryCursor = {

            relationship: this,

            throughOne(propName) {
                this.relationship.points.push({
                    propName, complexity: 'one'
                })
                return this.relationship.singularTertiaryCursor
            },

            throughMany(propName) {
                this.relationship.points.push({
                    propName, complexity: 'many'
                })
                return this.relationship.pluralTertiaryCursor
            }

        }


        singularTertiaryCursor = {

            relationship: this,

            whichHasOne(propName) {
                this.relationship.points.push({
                    propName, complexity: 'one'
                })
                return this.relationship.singularTertiaryCursor
            },

            whichHasMany(propName) {
                this.relationship.points.push({
                    propName, complexity: 'many'
                })
                return this.relationship.pluralTertiaryCursor
            }

        }

        pluralTertiaryCursor = {

            relationship: this,

            whichEachHaveOne(propName) {
                this.relationship.points.push({
                    propName, complexity: 'one'
                })
                return this.relationship.pluralTertiaryCursor
            },

            whichEachHaveMany(propName) {
                this.relationship.points.push({
                    propName, complexity: 'many'
                })
                return this.relationship.pluralTertiaryCursor
            }

        }

    }

    let a, an;
    a = an = typeName => new Cursor(typeName)

    const define = ({ relationship: leftSide }, { relationship: rightSide }) => {

        const { anchor, related } = determineSides([leftSide, rightSide])
        const AnchorClass = anchor.type
        const RelatedClass = related.type

        const foreignKey = toForeignKeyName(anchor.propName)

        // The Foreign Key field
        AnchorClass.fields = AnchorClass.fields || new Object
        AnchorClass.fields[foreignKey] = { name: foreignKey, type: 'int4', constraints: { foreignKey: true } }

        //  Properties
        Object.defineProperty(AnchorClass.prototype, anchor.propName, createAnchorProperty(anchor))
        Object.defineProperty(RelatedClass.prototype, related.propName, createProperty(related))

        if(AnchorClass._relations_.default) AnchorClass._relations_ = {
            load: new Object,
            set: new Object,
            join: new Object,
            classes: new Object,
            foreignKeys: new Object,
            localKeys: new Object,
            names: new Array
        }

        if(RelatedClass._relations_.default) RelatedClass._relations_ = {
            load: new Object,
            set: new Object,
            join: new Object,
            classes: new Object,
            foreignKeys: new Object,
            localKeys: new Object,
            names: new Array
        }

        // Names
        AnchorClass._relations_.names.push(anchor.propName)
        RelatedClass._relations_.names.push(related.propName)

        // Class Links
        AnchorClass._relations_.classes[anchor.propName] = RelatedClass
        RelatedClass._relations_.classes[related.propName] = AnchorClass

        // Foreign Key Links
        AnchorClass._relations_.foreignKeys[anchor.propName] = null
        RelatedClass._relations_.foreignKeys[related.propName] = foreignKey

        // Local Key Links
        AnchorClass._relations_.localKeys[anchor.propName] = foreignKey
        RelatedClass._relations_.localKeys[related.propName] = null

        // Load Methods
        AnchorClass._relations_.load[anchor.propName] = createRelatedLoadMethod(anchor, related)
        RelatedClass._relations_.load[related.propName] = createAnchorLoadMethod(anchor, related)

        // Set Methods
        AnchorClass._relations_.set[anchor.propName] = createRelatedSetMethod(anchor, related)
        RelatedClass._relations_.set[related.propName] = createAnchorSetMethod(anchor, related)

        // Join Methods
        AnchorClass._relations_.join[anchor.propName] = createRelatedJoinMethod(anchor, related)
        RelatedClass._relations_.join[related.propName] = createAnchorJoinMethod(anchor, related)

    }

    const infer = ({ relationship }) => {

    }

    const dsl = { a, an, define, infer }


    const pathComplexity = path => {
        let complexity = 'one'
        path.forEach(segment => {
            if (segment.complexity == 'many') complexity = 'many'
        })
        return complexity
    }

    const determineSides = (relationships) => {
        let complexities = relationships.map(relationship => relationship.complexity)
        let names = relationships.map(relationship => relationship.name)
        let relatedSide, anchorSide;
        if (complexities.every(complexity => complexity == 'many')) {
            throw Error(`Cannot Define Many to Many relationship directly: ${names}`)
        }
        if (complexities.every(complexity => complexity == 'one')) {
            relatedSide = relationships[0]
            anchorSide = relationships[1]
        }
        if (complexities.includes('one') && complexities.includes('many')) {
            relatedSide = relationships.find(side => side.complexity == 'many')
            anchorSide = relationships.find(side => side.complexity == 'one')
        }
        return { related: relatedSide, anchor: anchorSide }
    }


    // ======================== PROPERTIES =============================

    const createAnchorProperty = (anchor, related) => {
        let propName = anchor.propName
        let foreignKey = toCamelCase(toForeignKeyName(propName))
        const descriptor = {
            get() {
                if (this._relations_.cache[propName] !== undefined) {
                    return this._relations_.cache[propName]
                } else {
                    return this.loadRelation(propName)
                }
            },
            set(value) {
                this._relations_.cache[propName] = value
                this[foreignKey] = value.id
            }
        }
        let n = `${anchor.type.name}#${propName}`
        root.flags[n] = root.flags[n] || new Object
        root.flags[n].pure = { propName, foreignKey }
        return descriptor
    }


    const createProperty = (anchor, related) => {
        let propName = anchor.propName
        const descriptor = {
            get() {
                if (this._relations_.cache[propName] !== undefined) {
                    return this._relations_.cache[propName]
                } else {
                    return this.loadRelation(propName)
                }
            },
            set(value) {
                this._relations_.cache[propName] = value
                this.setRelation(propName, value)
            }
        }
        let n = `${anchor.type.name}#${propName}`
        root.flags[n] = root.flags[n] || new Object
        root.flags[n].pure = { propName }
        return descriptor
    }




    // ======================== LOAD METHODS =============================

    const createAnchorLoadMethod = (anchor, related) => {
        return async function () {
            let selection = related.complexity == 'one' ? 'selectFirst' : 'select'
            let result = await (
                drawQuery(options.database)
                [selection]()
                    .from(anchor.type.tableName)
                    .where({ [toForeignKeyName(anchor.propName)]: this.id })
                    .process(record => anchor.type.documentFrom(record))
            )
            if(related.complexity != 'one'){
                result.__of__ = anchor.type
                result.__presets__ = { [toCamelCase(toForeignKeyName(anchor.propName))]: this.id }
            }
            return result
        }
    }

    const createRelatedLoadMethod = (anchor, related) => {
        return function () {
            let selection = anchor.complexity == 'one' ? 'selectFirst' : 'select'
            return (
                drawQuery(options.database)
                [selection]()
                    .from(related.type.tableName)
                    .where({ id: this[toCamelCase(toForeignKeyName(anchor.propName))] })
                    .process(record => related.type.documentFrom(record))
            )
        }
    }

    // ======================== SET METHODS =============================

    const createAnchorSetMethod = (anchor, related) => {
        let setter = function (value) {
            const foreignKey = toForeignKeyName(anchor.propName)
            this[foreignKey] = value.id
        }
        setter.isPure = true
        return setter
    }

    const createRelatedSetMethod = (anchor, related) => {
        return function () {

        }
    }

    // ======================== JOIN METHODS =============================

    const createAnchorJoinMethod = function (anchorSide, relatedSide) {
        return function (query) {
            let instance = new anchorSide.type
            let property = relatedSide.propName
            let properties = Object.keys(instance.fields).map(field => {
                return (
                    relatedSide.complexity == 'one'
                        ?
                        `${property}.${field} as "${property}.${field}"`
                        :
                        `${property}.${field} as "${property}.[i].${field}"`
                )
            })
            return (
                query 
                    .select(...properties, `${relatedSide.type.tableName}.*`)
                    .join(anchorSide.type.tableName, {
                        as: property,
                        where: `${relatedSide.type.tableName}.id`,
                        isEqual: `${property}.${toForeignKeyName(anchorSide.propName)}`
                    })
            )
        }
    }

    const createRelatedJoinMethod = function (anchorSide, relatedSide) {
        return function (query) {
            let instance = new relatedSide.type
            let property = anchorSide.propName
            let properties = Object.keys(instance.fields).map(field => {
                return (
                    anchorSide.complexity == 'one'
                        ?
                        `${property}.${field} as "${property}.${field}"`
                        :
                        `${property}.${field} as "${property}.[i].${field}"`
                )
            })
            return (
                query
                    .select(...properties, `${anchorSide.type.tableName}.*`)
                    .join(relatedSide.type.tableName, {
                        as: property,
                        where: `${property}.id`,
                        isEqual: `${anchorSide.type.tableName}.${toForeignKeyName(anchorSide.propName)}`
                    })
            )
        }
    }
    return dsl
}