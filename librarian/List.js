export class List extends Array {

    insert(value, position){
        this.splice(position, 0, value)
        this._onChange([{ op: 'add', postion: `/${position}`, value }])
    }

    remove(position){
        this.splice(position, 1)
        this._onChange([ { op: 'remove', position: `/${position}` } ])
    }

    append(value){
        return this.push(value)
    }

}