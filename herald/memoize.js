import { remove } from "../mason";
import { sleep } from "./sleep";

const cache = []

export const memoize = (process, time = undefined) => {
    return async function(...args){
        if(cache.includes(process)) return
        cache.push(process)
        await sleep(time)
        process(...args)
        remove(cache, process)
    }
}