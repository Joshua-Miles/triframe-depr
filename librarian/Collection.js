import { _shared } from "../arbiter/Markers";



export class Collection {

    constructor(Type, presets){
        this.__of__ = Type
        this.__presets__ = presets
    }

    [Symbol.iterator](){
        let array = this.toArray()
        let i = 0;
        return {
            next() {
              if (i < array.length) {
                return { done: false, value: array[i++] };
              } else {
                return { done: true };
              }
            }
          };
    }

    @_shared
    toArray(){
        return this.indexes.map( index => this[index])
    }

    @_shared
    static fromArray(array){
        let collection = new this
        array.forEach( element => collection.push(element))
        return collection
    }

    @_shared
    get first(){
        const { ordered } = this
        for(let i in ordered){
            return ordered[i]
        }
        return null
    }


    @_shared
    get last(){
        let index = this.indexes[this.indexes.length-1]
        return this[index]
    }

    @_shared
    get ordered(){
        let result = {}
        for(let key in this){
            if(isNaN(key)) continue
            let index = this[key].__index__ === undefined ? key : this[key].__index__
            result[index] = this[key]
         }
        return result
    }

    @_shared 
    get indexes(){
        return Object.keys(this).filter( key => ( !isNaN(key) || key.startsWith('new')) && !this[key]['__isDeleted__']  ).sort()
    }

    @_shared
    get nextID(){
        let i = 1
        let id;
        do {
            id = `new${i++}`
        } while(this[id] !== undefined)

        return id
    }

    @_shared
    push(element){
        let { last } = this
        element.__index__ = last ? last.__index__ + 1 : 0
        return this[element.id] = element
    }

    @_shared
    new(attributes = {}){
        let assign = Object.assign.bind(Object)
        assign(attributes, this.__presets__)
        const element = this.__of__.new(attributes)
        //this.push(this.__of__.new(element))
        //this[this.nextID] = this.__of__.new(element)
        return element
    }


    @_shared
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
                console.log('Pushing', this[result.id])
                // console.log('IN HERE', result)
                this.push(result)
                //if(this[element.id]) console.log(this[element.id].symbol)
                delete this[element.id]
                // console.log(this._onChange)
                this._onChange()
            })
    }


    @_shared 
    remove(element){
        delete this[element.id]
        this._onChange()
        element.destroy()
    }

    @_shared
    map(callback){
        let result = []
        this.forEach( (...args) => {
            result.push(callback(...args))
        })
        return result
    }

    @_shared
    reduce(callback, initial){
        return this.toArray().reduce(callback, initial)
    }

    @_shared
    sort(callback){
        return this.toArray().sort(callback)
    }

    @_shared
    find(callback){
        let array = this.indexes.map( key => this[key])
        let newArray = array.find(callback)
        return newArray
    }


    @_shared
    some(callback){
        let array = this.indexes.map( key => this[key])
        let result = array.some(callback)
        return result
    }

    @_shared
    filter(callback){
        let array = this.indexes.map( key => this[key])
        let newArray = array.filter(callback)
        return newArray
    }

    @_shared
    mapCollection(callback){
        let array = this.indexes.map( key => this[key])
        let newArray = array.map(callback)
        return this.constructor.fromArray(newArray)
    }

   
    @_shared
    forEach(callback){
        let index = 0;
        const { ordered } = this
        for(let key in ordered){
            if(isNaN(key) || key.startsWith('__')) continue
            callback(ordered[key], index++)
        }
    }

    @_shared
    each(callback){
        for(let i in this){
            if(i.startsWith('_')) continue
            callback(i, this[i])
        }
    }

    @_shared
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


    @_shared
    get length(){
        return this.indexes.length
    }

}