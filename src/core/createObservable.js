import { EventEmitter } from "./EventEmitter"
import { each } from './iterators'

const primativeTypes = ['String', 'Boolean', 'Number', 'Date', 'Function']
const isPlain = value => value && typeof value === 'object' && !primativeTypes.includes(value.constructor.name)

const crawl = (obj, callback, path = "/") => {
    if (isPlain(obj)) {
        callback(obj, path)
        for (let key in obj) {
            let value = obj[key]
            crawl(value, callback,`${path}${key}/`)
        }
    }
}

export const createObservable = resource => {
    const agent = new EventEmitter;
    const monitor = (node, path) => {
        if (typeof node.on === 'function') node.on('Δ.change', (patches) => agent.emit(`change`, patches))
        else each(node, (key, value) => {
            Object.defineProperty(node, key, {
                enumerable: true,
                get: () => value,
                set: newValue => {
                    value = newValue
                    agent.emit(`change`, [ {
                        op: 'replace',
                        path: `${path}${key}`,
                        value: newValue
                    } ])
                }
            })
        })
    }
    crawl(resource, monitor)
    return agent.on('change')
}