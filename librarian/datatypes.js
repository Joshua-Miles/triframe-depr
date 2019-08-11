import { toColumnName } from '../scribe'
import { map } from '../mason'
import { pure } from '../arbiter/Markers'

const types = {

    string:{
        type: 'varchar'
    },

    text:{
        type: 'text'
    },

    numeric: {
        type: 'numeric'
    },

    integer: {
        type: 'int8'
    },
    
    float: {
        type: 'float8'
    },

    boolean: {
        type: 'boolean'
    },

    timestamp: {
        type: 'timestamp'
    },

    timestamptz: {
        type: 'timestamptz'
    },

    date: {
        type: 'date'
    },

    time: {
        type: 'time'
    },

    point: {
        type: 'point'
    },

    line: {
        type: 'line'
    },

    lseg: {
        type: 'lseg'
    },

    path: {
        type: 'path'
    },

    polygon: {
        type: 'polygon'
    },

    circle: {
        type: 'circle'
    },
    
}

const createFieldDecorator = (alias, { type, hasModifier, createField = defaultFieldCreator }) => function(arg1, arg2){
    let property, typeModifier, constraints;
    if(hasModifier){
        typeModifier = arg1
        constraints = arg2 || new Object
    } 
    if(arg1.key){ 
        property = arg1
    } else {
        constraints = arg1
    }
    if(property) return createField(property, type, typeModifier, constraints )
    else return property => createField(property, type, typeModifier, constraints )
}

const defaultFieldCreator = function(property, type, typeModifier, constraints = {}){
    const name = toColumnName(property.key)
    const initializer = function(){
        const defaults = property.initializer.call(this)
        this.fields[name] = ({ name, type, typeModifier, defaults, constraints })
        return defaults
    }
    return { ...property, initializer }
}

export const datatypes = { ...map(types, createFieldDecorator), reference: function(property){
    return pure({ ...property, placement: 'prototype' })
}}