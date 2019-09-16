import { UnSerializer, Serializer, _public, _stream } from '../arbiter/'
import { EventEmitter, Pipe } from '../herald'

function random(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let messages = []
function log(...args){
    messages.push(args)
}

const print = message => process.stdout.write(message)
const sleep = time => new Promise( resolve => setTimeout(resolve, time))
const networkDelays = () => sleep(random(0, 100))
const toJSON = (x) => JSON.stringify(x)

class User {

    static data = [ { name: "Josh" }, { name: "Mark" }, { name: "McMillan" }]

    static events = new EventEmitter

    @_public
    @_stream
    static *all(){
        yield this.events.nowAndOn('new')
        return this.data
    }

    @_public
    @_stream
    static *first(){
        yield this.events.nowAndOn('0')
        return this.data[0]
    }

    @_public
    static create(user){
        this.data.push(user)
        this.events.emit('new')
    }

    @_public
    static async update(index, values){
        this.data[index] = values
        await this.events.emit(`${index}`)
    }

}


let serializer = new Serializer({ User })
let unserializer = new UnSerializer(serializer.interface)

beforeAll(function(){
    let session = {}
    let socket = { on: () => void(0) }
    unserializer.agent.on('*', async (payload, event) => {
        log(event)
        await networkDelays()
        serializer.agent.emit(event, { ...payload, emit: payload.respond, session, socket })
    })
})

afterAll(async function(){
    messages.map((args) => console.log(...args))
    console.log('\n\n\n\n\n\n')
})

describe('Arbiter', () => {
    let { User } = unserializer.types;

    it('to parse an interface', async () => {
        let users = await User.all()
        expect(users.length).toBe(3)
    })

    it('can sync two versions of a document', async () => {

        let client_1 = {
            user: null
        }

        let client_2 = {
            user: null
        }

        await stream( function*() {    
            
            client_1.user = yield User.first()
            return null;
        })
        

        await stream( function*() {    
            
            client_2.user = yield User.first()
            return null;
        })

        expect(client_1.user.name).toBe("Josh")
        expect(client_2.user.name).toBe("Josh")


        await User.update(0, { name: 'Jude'})

        expect(client_1.user.name).toBe("Jude")

        expect(client_2.user.name).toBe("Jude")
            
    })
   

    it('syncs performantly', async () => {

        let client_1 = {
            user: null
        }

        let client_2 = {
            user: null
        }

        await stream( function*() {    
            
            client_1.user = yield User.first()
            return null;
        })
        

        await stream( function*() {    
            
            client_2.user = yield User.first()
            return null;
        })


        let start_2 = process.hrtime.bigint()

        let end_2 = process.hrtime.bigint()

        // expect(end_2 - start_2).toBe(0)


        let start = process.hrtime.bigint()

        await User.update(0, { name: 'Jason'})

        let end = process.hrtime.bigint()

        expect(end - start).toBe(0)

            
    

    })


   
})


let stream = (callback) => {
    return new Pipe(callback).observe( () => void(0))
}