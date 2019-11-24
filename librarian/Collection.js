
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

    toArray(){
        return this.indexes.map( index => this[index])
    }

    static fromArray(array){
        let collection = new this
        let homogeneous = true

        array.forEach( (element, index) => {
            collection.push(element)
            if(index < Array.length -1 && element.__class__ != array[index+1].__class__){
                homogeneous = false
            }
        })
        if(homogeneous && array[0]){
            collection.__of__ = array[0].constructor
        }
        return collection
    }

    get first(){
        const { ordered } = this
        for(let i in ordered){
            return ordered[i]
        }
        return null
    }


    get last(){
        let result = null
        const { ordered } = this
        for(let i in ordered){
            result = ordered[i]
        }
        return result
    }

    get ordered(){
        let result = {}
        for(let key in this){
            if(isNaN(key)) continue
            let index = this[key].__index__ === undefined ? key : this[key].__index__
            result[index] = this[key]
         }
        return result
    }

    get indexes(){
        return Object.keys(this).filter( key => ( !isNaN(key) || key.startsWith('new')) && !this[key]['__isDeleted__']  ).sort()
    }

    get nextID(){
        let i = 1
        let id;
        do {
            id = `new${i++}`
        } while(this[id] !== undefined)

        return id
    }

    push(element){
        let { last } = this
        element.__index__ = last ? last.__index__ + 1 : 0
        return this[element.id] = element
    }

    new(attributes = {}){
        let assign = Object.assign.bind(Object)
        assign(attributes, this.__presets__)
        const element = this.__of__.new(attributes)
        this.push(this.__of__.new(element))
        //this[this.nextID] = this.__of__.new(element)
        this._onChange()
        return element
    }


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


    remove(element){
        delete this[element.id]
        this._onChange()
        element.destroy()
    }

    map(callback){
        let result = []
        this.forEach( (...args) => {
            result.push(callback(...args))
        })
        return result
    }

    reduce(callback, initial){
        return this.toArray().reduce(callback, initial)
    }

    sort(callback){
        return this.toArray().sort(callback)
    }

    find(callback){
        let array = this.indexes.map( key => this[key])
        let newArray = array.find(callback)
        return newArray
    }


    some(callback){
        let array = this.indexes.map( key => this[key])
        let result = array.some(callback)
        return result
    }

    filter(callback){
        let array = this.indexes.map( key => this[key])
        let newArray = array.filter(callback)
        return newArray
    }

    mapCollection(callback){
        let array = this.indexes.map( key => this[key])
        let newArray = array.map(callback)
        return this.constructor.fromArray(newArray)
    }

   
    forEach(callback){
        let index = 0;
        const { ordered } = this
        for(let key in ordered){
            if(isNaN(key) || key.startsWith('__')) continue
            callback(ordered[key], index++)
        }
    }

    each(callback){
        for(let i in this){
            if(i.startsWith('_')) continue
            callback(i, this[i])
        }
    }

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


    get length(){
        return this.indexes.length
    }

}