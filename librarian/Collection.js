import { pure } from "../arbiter";

export class Collection {

    constructor(Type, presets){
        this.__of__ = Type
        this.__presets__ = presets
    }

    @pure
    toArray(){
        return this.indexes.map( index => this[index])
    }

    @pure
    static fromArray(array){
        let collection = new this
        array.forEach( element => collection.push(element))
        return collection
    }

    @pure
    get first(){
        let index = this.indexes[0]
        return this[index] === undefined ? null : this[index] 
    }


    @pure
    get last(){
        let index = this.indexes[this.indexes.length-1]
        return this[index]
    }

    @pure 
    get indexes(){
        return Object.keys(this).filter( key => ( !isNaN(key) || key.startsWith('new')) && !this[key]['__isDeleted__']  ).sort()
    }

    @pure
    get nextID(){
        let i = 1
        let id;
        do {
            id = `new${i++}`
        } while(this[id] !== undefined)

        return id
    }

    @pure
    push(element){
        return this[element.id] = element
    }

    @pure
    new(attributes = {}){
        let assign = Object.assign.bind(Object)
        assign(attributes, this.__presets__)
        const element = this.__of__.new(attributes)
        //this.push(this.__of__.new(element))
        //this[this.nextID] = this.__of__.new(element)
        return element
    }


    @pure
    create(attributes = {}){
        let assign = Object.assign.bind(Object)
        assign(attributes, this.__presets__)
        const element = this.__of__.new(attributes)
        element.id = this.nextID
        this.push(this.__of__.new(element))
        this._onChange()
        element._onChange = this._onChange
        this.__of__.create(attributes)
            .then( result => {
                this[result.id] = result
                //if(this[element.id]) console.log(this[element.id].symbol)
                delete this[element.id]
                this._onChange()
            })
    }


    @pure 
    remove(element){
        delete this[element.id]
        this._onChange()
        element.destroy()
    }

    @pure
    map(callback){
        let array = this.indexes.map( key => this[key])
        let newArray = array.map(callback)
        return newArray
    }

    @pure
    reduce(callback, initial){
        return this.toArray().reduce(callback, initial)
    }

    @pure
    sort(callback){
        return this.toArray().sort(callback)
    }

    @pure
    find(callback){
        let array = this.indexes.map( key => this[key])
        let newArray = array.find(callback)
        return newArray
    }


    @pure
    some(callback){
        let array = this.indexes.map( key => this[key])
        let result = array.some(callback)
        return result
    }

    @pure
    filter(callback){
        let array = this.indexes.map( key => this[key])
        let newArray = array.filter(callback)
        return newArray
    }

    @pure
    mapCollection(callback){
        let array = this.indexes.map( key => this[key])
        let newArray = array.map(callback)
        return this.constructor.fromArray(newArray)
    }

   
    @pure
    forEach(callback){
        this.indexes.forEach( i => callback(this[i]))
    }

    @pure
    each(callback){
        for(let i in this){
            if(i.startsWith('_')) continue
            callback(i, this[i])
        }
    }

    @pure
    indexedBy(index =  '_id', select = false, coalesceValue = undefined){
        let subject = this
        let returnValue = new Object;
        let indexOf = (typeof index == 'function') ? index :  (key, element) => element[index]
        let selectionOf;
        if(typeof select == 'function' ) selectionOf = select
        else if(select) selectionOf = ( key, value ) => value[select]
        else selectionOf = ( key, value ) => value
        this.each((key, element) => {
            returnValue[indexOf(key, element)] = selectionOf(key,element);
            if(returnValue[indexOf(key, element)] === undefined) returnValue[indexOf(element)] = coalesceValue
        })
        return returnValue;
    }


    @pure
    get length(){
        return this.indexes.length
    }

}