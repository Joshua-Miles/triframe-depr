import { toColumnName, toForeignKeyName, toCamelCase, toSingular } from '../scribe'
import { map } from '../mason'
import { root } from '../arbiter/Markers'

const types = {

    string: {
        type: 'varchar'
    },

    text: {
        type: 'text'
    },

    numeric: {
        type: 'numeric'
    },

    integer: {
        type: 'int8'
    },

    hasOne: {
        type: 'virtual'
    },

    hasMany: {
        type: 'virtual'
    },

    belongsTo: {
        type: 'int8',
        constraints: {
            foreignKey: true
        }
    },

    float: {
        type: 'float8'
    },

    boolean: {
        type: 'bool'
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

const createFieldDecorator = (alias, { type, hasModifier, createField = defaultFieldCreator, constraints = {} }) => function (arg1, arg2) {
    let property, typeModifier, metadata;

    if (arg1.key) {
        property = arg1
    } else {
        metadata = arg1
        if(arg2) Object.assign(constraints, arg2)
    }


    if(hasModifier){
        typeModifier = metadata
    }

    if (property) return createField(alias, property, type, metadata, typeModifier, constraints)
    else return property => createField(alias, property, type, metadata, typeModifier, constraints)
}

const defaultFieldCreator = function (alias, property, type, metadata, typeModifier, constraints = {}) {
    const format = constraints.foreignKey ? toForeignKeyName : toColumnName;
    const name = format(property.key)
    const initializer = function () {
        let propertyName = `${this.constructor.name}#${property.key}`
        let columnName = `${this.constructor.name}#${toCamelCase(name)}`
        root.flags[propertyName] = root.flags[propertyName] || {}
        root.flags[columnName] = root.flags[propertyName]
        const defaults = property.initializer.call(this)
        if(!this.fields) Object.defineProperty(this, 'fields', { enumerable: false, value: {} })
        this.fields[name] = ({ alias, name, type, metadata, defaults, typeModifier, constraints })
        if(alias == 'hasMany'){
            let relationTable = constraints.of || property.key;
            let foreignKey = toCamelCase(toForeignKeyName(toSingular(constraints.as || this.constructor.tableName)))
            Object.defineProperty(defaults, '__of__', {
                enumerable: true,
                get: () => {
                    let Model = this.constructor.models[relationTable]
                    return Model
                } 
            })
            Object.defineProperty(defaults, '__presets__', {
                enumerable: true,
                get: () => {
                    return { [foreignKey]: this.id }
                } 
            })
        }
        return defaults
    }
    return { ...property, initializer }
}

export const datatypes = map(types, createFieldDecorator)