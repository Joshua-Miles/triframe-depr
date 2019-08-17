import { toTableName, toCamelCase, toCapitalized, toUnderscored } from '../scribe'
import { EventEmitter, Pipe } from '../herald';
import { each, index } from '../mason';
import { drawQuery } from './sql';
import { Database } from './database';
import { datatypes } from './datatypes'
import { Collection } from './Collection'
import { createRelationshipDSL } from './createRelationshipDSL';
import { _shared, _public, _stream, _authorize, _session  } from '../arbiter'

let database;

export class Model {

    fields = { 
        id: { name: 'id', type: 'SERIAL', constraints: { primaryKey: true } },
        last_updated: { name: 'last_updated', type: 'int8',  constraints: {} }
    }

    constructor(){
        Object.assign(this.fields, this.constructor.fields)
    }

    @_shared
    get attributes(){
        const attributes = new Object
        Object.keys(this.fields).forEach( key => {
            attributes[key] = this[key]
        })
        return attributes
    }

    @_shared
    set(attributes){
        const assign =  Object.assign.bind(Object)
        assign(this, attributes)
        if(this._onChange) this._onChange()
    }

    @_shared
    update(attributes){
        this.set(attributes)
        this.save()
    }

    async save(){
        let record = this.toRecord()
        delete record.id
        let attributes = Number.isFinite(this.id) ? 
            await (
                drawQuery(database)
                    .selectFirst()
                    .update(this.constructor.tableName)
                    .set(record)
                    .where({ id: this.id })
            )
                :
            await (
                drawQuery(database)
                    .selectFirst()
                    .insert(this.constructor.tableName)
                    .set(record)
            )
        const instance = this.constructor.documentFrom(attributes)
        this.constructor.e.emit(`saved.*`)
        return instance
    }

    async destroy(){
        let result =  await (
            drawQuery(database)
                .delete(this.constructor.tableName)
                .where({ id: this.id })
        )
        this.constructor.e.emit(`saved.*`)
        return result
    }


    toRecord(){
        return this.constructor.recordFrom(this)
    }


    // Class Methods

    static get e() {
        if(this._e) return this._e
        return this._e = new EventEmitter
    }

    static get tableName(){
        return toTableName(this.name)
    }

    static get all(){
        return this.query({})
    }

    @_shared 
    static where(queryBuilder, options = {}){
        function createQueryOperator(name){
            return value => ({
                is: name,
                value
            })
        }
        return this.query(queryBuilder({
            includes: createQueryOperator('includes'),
            startsWith: createQueryOperator('startsWith'),
            endsWith: createQueryOperator('endsWith'),
            greaterThan: createQueryOperator('greaterThan'),
            lessThan: createQueryOperator('lessThan')
        }), options)
    }


    @_stream 
    static *find(emit, id, { include } = {}){
        yield this.e.nowAndOn(`saved.${id}`)
        let query = (
            drawQuery(database)
                .select()
                .from(this.tableName)
                .where({ id })
                .process(records => records.mapCollection(record => this.documentFrom(record)))
        )
        if(include){
            for(let i = 0; i < include.length; i++){ 
                const Class = this._relations_.classes[include[i]]
                yield Class.e.nowAndOn('saved.*')
                query = this.joinRelation(include[i], query)
            }
        }
        let result =  (yield query).first
        return result
    }

    @_stream 
    static *query(_, document, { include } = {}){
        let record = this.recordFrom(document)
        yield this.e.nowAndOn('saved.*')
        let query = (
            drawQuery(database)
                .select()
                .from(this.tableName)
                .where(record)
                .process(records => records.mapCollection( record => this.documentFrom(record)))
        )
        if(include){
            for(let i = 0; i < include.length; i++){ 
                const Class = this._relations_.classes[include[i]]
                yield Class.e.nowAndOn('saved.*')
                query = this.joinRelation(include[i], query)
            }
        }
        let result = yield query
        return result
    }

    @_shared
    static new(attributes = {}){
        let instance = new this
        instance.set(attributes)
        return instance
    }

    static create(attributes = {}){
        let instance = new this
        instance.set(attributes)
        let promise = instance.save()
        return promise
    }

    static recordFrom(document){
        let instance = new this
        let record = new Object
        each(instance.fields, sqlName => {
            let jsName = toCamelCase(sqlName)
            let value = document[jsName]
            if(value !== undefined) record[sqlName] = value
        })
        return record
    }

    static documentFrom(record){
        return record.mapCollection ? record.mapCollection( record => this.documentFrom(record)) : this.new( index( record, toCamelCase ))
    }

    static async destroy(document){
        let record = this.recordFrom(document)
        let result =  await (
            drawQuery(database)
                .delete(this.constructor.tableName)
                .where(record)
        )
        await this.constructor.emitSave(this)
        return result
    }

    static async destroyAll(){
        let result =  await (
            drawQuery(database)
                .delete(this.tableName)
        )
        await this.e.emit(`saved.*`)
        return result
    }


    // Connection Utils

    static connect(options, types){
        database = new Database(options)
        return database.patchSchema(types)
    }

    static createRelationshipDSL(){
        return createRelationshipDSL({
            get database(){
                return database
            }
        })
    }
   

    // Datatype Decorators

    static get Decorators(){ 
        return ({ ...datatypes, _shared, _public, _stream, _authorize, _session })
    }


    // Relationships 

    static _relations_ = {
        default: true,
        load: new Object,
        set: new Object,
        join: new Object,
        classes: new Object,
        foreignKeys: new Object,
        localKeys: new Object,
        names: new Array
    }

    _relations_ = {
        cache: new Object
    }


    @_stream
    *loadRelation(emit, name){
        const Class = this.constructor._relations_.classes[name]
        yield Class.e.nowAndOn('saved.*')
        return this.constructor._relations_.load[name].call(this)
    }

    setRelation(name, value){
        return this.constructor._relations_.set[name](value)
    }

    static joinRelation(name, query){
        let result = this._relations_.join[name](query)
        const Class = this._relations_.classes[name]
        let foreignKey;
        if(this._relations_.foreignKeys[name]) foreignKey = toCamelCase(this._relations_.foreignKeys[name])
        result.process( records => 
            records.mapCollection( record => {
                if(record[name] instanceof Collection){
                    const collection = new Collection(Class, { [foreignKey]: record.id  })
                    record[name].forEach( (record, i) => collection.push( Class.documentFrom(record)))
                    record[name] = collection
                } else {
                    ///console.log(records)
                   // record[name] =  Class.documentFrom(record[name]);
                }
                return record
            }
        ) )
        return result
    }


    // Utils
    static emitSave(instance){
        let id = instance ? instance.id : '*'
        this.e.emit(`saved.${id}`, instance)
    }

}
