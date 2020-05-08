const Break = '_break'

const entries = function (object) {
    if (!object) return []
    return typeof object.entries == 'function' ? object.entries() : Object.entries(object)
}

const compose = (...callbacks) => {
    return (payload) => {
        callbacks.forEach(callback => {
            payload = callback(payload)
        })
        return payload
    }
}


const index = function (subject, index = '_id', select = false, coalesceValue = undefined) {
    let returnValue = new Object;
    let indexOf = (typeof index == 'function') ? index : (key, element) => element[index]
    let selectionOf;
    if (typeof select == 'function') selectionOf = select
    else if (select) selectionOf = (key, value) => value[select]
    else selectionOf = (key, value) => value
    each(subject, (key, element) => {
        let index = indexOf(key, element)
        returnValue[index] = selectionOf(key, element);
        if (returnValue[index] === undefined) returnValue[indexOf(element)] = coalesceValue
    })
    return returnValue;
}

const group = function (subject, index = '_id', select = false, coalesceValue = undefined) {
    let returnValue = new Object;
    let indexOf = (typeof index == 'function') ? index : (key, element) => element[index]
    let selectionOf;
    if (typeof select == 'function') selectionOf = select
    else if (select) selectionOf = (key, value) => value[select]
    else selectionOf = (key, value) => value
    each(subject, (key, element) => {
        let index = indexOf(key, element)
        returnValue[index] = returnValue[index] || new Array
        returnValue[index].push(selectionOf(key, element) || coalesceValue)
    })
    return returnValue;
}

const unique = function (array) {
    return array.filter((value, index, self) => {
        return self.indexOf(value) === index;
    })
}


// Primary Iterators
const each = function (object = new Object, callback) {
    for (const [index, element] of entries(object)) {
        let result = callback(index, element, object);
        if (result === Break) break;
    }
}

const map = function (object, callback) {
    let returnValue = new Object
    each(object, (key, value) => {
        returnValue[key] = callback(key, value, object)
    })
    return Array.isArray(object) ? Object.values(returnValue) : returnValue
}

const filter = function (object, callback = (key, value) => value) {
    let returnValue = new Object
    each(object, (key, value) => {
        if (callback(key, value, object)) returnValue[key] = value
    })
    return returnValue
}

const find = function (object, callback) {
    let result = null
    each(object, (key, value) => {
        if (callback(key, value, object)) {
            result = value
            return Break
        }
    })
    return result;
}

// Synchronous Primary Iterators

const eachSync = async function (object, callback) {
    for (const [index, element] of entries(object)) {
        let result = await callback(index, element, object);
        if (result === Break) break;
    }
}

const mapSync = async function (object, callback) {
    let returnValue = new Object
    await eachSync(object, async (key, value) => {
        returnValue[key] = await callback(key, value, object)
    })
    return returnValue
}

const filterSync = async function (object, callback) {
    let returnValue = new Object
    await eachSync(object, async (key, value) => {
        if (await callback(key, value, object)) returnValue[key] = value
    })
    return returnValue
}

const findSync = async function (object, callback) {
    let result = null
    await eachSync(object, async (key, value) => {
        if (await callback(key, value, object)) {
            result = value
            return Break
        }
    })
    return result;
}

// Asynchronous Primary Iterators

const eachAsync = async function (object = new Object, callback) {
    let promises = new Array
    for (const [index, element] of entries(object)) {
        promises.push(callback(index, element, object));
    }
    await Promise.all(promises)
}

const mapAsync = async function (object, callback) {
    let promises = new Array
    let returnValue = new Object
    each(object, (key, value) => {
        promises.push((async () => returnValue[key] = await callback(key, value, object))())
    })
    await Promise.all(promises)
    return returnValue
}

const filterAsync = async function (object, callback) {
    let promises = new Array
    let returnValue = new Object
    each(object, (key, value) => {
        promises.push((async () => {
            if (await callback(key, value, object)) returnValue[key] = value
        })())
    })
    await Promise.all(promises)
    return returnValue
}

const findAsync = async function (object, callback) {
    let promises = new Array
    let result = null
    each(object, (key, value) => {
        promises.push((async () => {
            if (await callback(key, value, object) && result === null) result = value
        })())
    })
    await Promise.all(promises)
    return result;
}

const primativeTypes = ['String', 'Boolean', 'Number', 'Date', 'Function']
const isPlain = value => value && typeof value === 'object' && !primativeTypes.includes(value.constructor.name)

const deepMap = (obj, callback) => {
    if (isPlain(obj)) {
        for (let key in obj) {
            obj[key] = deepMap(obj[key], callback)
        }
        return callback(obj)
    } else {
        return obj
    }
}

function deepMerge(obj1, obj2) {
    switch (typeof obj2) {
        case "object":
            if(!obj1) return obj1 || obj2

            if(obj1['[[attributes]]']){
                obj1['[[attributes]]'] = deepMerge(obj1['[[attributes]]'], obj2['[[attributes]]'])
                obj1['[[base]]'] = deepMerge(obj1['[[base]]'], obj2['[[base]]'])
                return obj1
            }

            if(Array.isArray(obj2)){
                return obj2.map( (obj2, i) => obj1[i] && obj1[i].uid == obj2.uid ? deepMerge( obj1[i], obj2) : obj2)
            }

            return { ...obj1, ...map(obj2, (k, obj2) => deepMerge(obj1[k], obj2)) }
        case "undefined":
            return null; //this is how JSON.stringify behaves for array items
        default:
            return obj2; //no need to clone primitives
    }
}

export {
    group, index, 

    each, filter, map, find,
    eachSync, filterSync, mapSync, findSync,
    eachAsync, filterAsync, mapAsync, findAsync,
    
    deepMap, unique, deepMerge
}