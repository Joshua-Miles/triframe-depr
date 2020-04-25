import { Server } from './ws'
import cookie from 'cookie'
import { ConnectionBase } from './Base'
import { createSession } from './createSession'

let id = 0
const connections = {}
const store = (connection) => {
    connections[++id] = connection
    return id
}
const unstore = (id) => {
    delete connections[id]
}


export class Connection extends ConnectionBase {
    
    constructor(ws){
        super()
        let id = store(this)
        this.id = id
        this.bind(ws)        
        this.emit('__id__', id)
        this.clientSecret = ws.clientSecret
        ws.addEventListener('close', () => {
            clearInterval(this.clearReceiptsTimer)
            unstore(id)
        })
    }

    get session(){
        return this.sessionHead ? this.sessionHead.createSlice() : null
    }
    
    static listen(server, sessionModel, callback){

        const Session = createSession(sessionModel)

        const wss = new Server({ server });

        wss.on('headers', establishClientSecret)
       
        wss.on('connection', ws => {
            ws.addEventListener('message', establishConnection)
        })

        function establishClientSecret(headers, request, ws){
            let { clientSecret } = cookie.parse(request.headers.cookie || '')
            if(!clientSecret){
                clientSecret = createSecret()
                headers.push( `Set-Cookie: ${cookie.serialize('clientSecret', clientSecret)}`)
            }
            ws.clientSecret = clientSecret
        }

        async function establishConnection({ data, target }){
            const [ strategy, identifier ] = data.split(' ')
            switch(strategy){
                case 'initialize':
                    target.removeEventListener('message', establishConnection)
                    let connection = new Connection(target)
                    connection.sessionHead = await Session.loadFor(connection)
                    callback(connection)
                break;
                case 'mount':
                    target.removeEventListener('message', establishConnection)
                    if(connections[identifier])
                        connections[identifier].bind(target)
                    else
                        target.send('["__reload__"]')
                break;
            }
        }

    }

}

function createSecret(){
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 40; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}