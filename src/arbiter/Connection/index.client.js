import { Client } from './ws'
import { ConnectionBase } from './Base'

export class Connection extends ConnectionBase {

    constructor(ws){
        super()
        this.bind(ws)
        ws.addEventListener('open', () => {
            ws.send('initialize')
        })
        ws.addEventListener('reconnect', ({ number }) => {
            ws.send(`mount ${this.id}`)
        })
        this.on('__id__', id => this.id = id)
        this.on('__reload__', () => window.location.reload())
        this.on('__load_session__', (_, respond) => respond(localStorage.getItem('session')))
        this.on('__save_session__', (session) => localStorage.setItem('session', session))
    }

    static establish(httpUrl){
        const parsed = new URL(httpUrl)
        const { protocol: httpProtocol, host, pathname, port } = parsed 
        const wsProtocol = httpProtocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new Client(`${wsProtocol}//${host}${pathname}`)
        return new Connection(ws)
    }

}