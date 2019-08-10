import { Serializer, UnSerializer } from './arbiter'
import { Model } from './librarian';
import fs from 'fs'
const socketIo = require('socket.io')

const SESSIONS_PATH = './.sessions';
if (!fs.existsSync(SESSIONS_PATH)){
    fs.mkdirSync(SESSIONS_PATH);
}

export default class Server {

    constructor(types, { drawRelationships, user, password, database, port } = {}){
        if(drawRelationships) drawRelationships.call(types, Model.createRelationshipDSL())
        Model.connect({ user, password, database, port }, types)
        this.io = socketIo(80);
        const serializer = this.serializer = new Serializer(types)
        const unserializer = this.unserializer = new UnSerializer(serializer.interface)
        this.io.on('connection', socket => {
            const { session, token } = this.loadSession(socket.handshake.query.token)
            socket.emit('token', token)
            socket.emit('interface', serializer.interface)
            socket.on('message', ( { action, payload, id }, respond) => {
                serializer.agent.emit(action, { ...payload, socket, session, respond, emit: (result) => {
                    socket.emit(id, result)
                }})
            })
            socket.on('disconnect', () => {
                this.saveSession(token, session)
            })
            process.on('exit', function() {
                this.saveSession(token, session)
            });
        })
    }


    loadSession(oldToken){
        let session;
        if(oldToken && fs.existsSync(`${SESSIONS_PATH}/${oldToken}.json`)){
            try {
                session = this.unserializer.unSerializeDocument(JSON.parse(fs.readFileSync(`${SESSIONS_PATH}/${oldToken}.json`)))
                fs.unlinkSync(`${SESSIONS_PATH}/${oldToken}.json`)
            } catch(err){
                session = {} 
            }
        } else {
            session = {}
        }
        
        let token = this.createSessionToken()
        this.saveSession(token, session)
        session.destroy = function(){
            Object.keys(session).forEach(key => {
                if(key != 'destroy') delete session[key]
            })
        }
        return { session, token }
    }

    saveSession(token, session){
        let sessionData = { ...session };
        delete sessionData.destroy
        fs.writeFileSync(`${SESSIONS_PATH}/${token}.json`, JSON.stringify(this.serializer.serializeDocument(sessionData)))
    }

    createSessionToken() {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 12; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }

}

