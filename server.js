import { Serializer, UnSerializer } from './arbiter'
import { Model } from './librarian';
import fs from 'fs'
import mime from 'mime';

const formidable  = require('formidable')
const http  = require('http')

const socketIo = require('socket.io')

const SESSIONS_PATH = './.sessions';

const UPLOADS_PATH = './.uploads'

if (!fs.existsSync(SESSIONS_PATH)){
    fs.mkdirSync(SESSIONS_PATH);
}

if (!fs.existsSync(UPLOADS_PATH)){
    fs.mkdirSync(UPLOADS_PATH);
}

function loadModels(r) { 
    const models = {}
    r.keys().forEach(key => {
        let [ Model ] = key.substr(2).split(/\.|\//)
        let module = r(key)
        if(module[Model]) models[Model] = module[Model]
        if(module._default && key.includes(`${Model}/index`)) models[Model] = module._default
    }); 
    return models
}

export default class Server {

    constructor(...args){
        this.boot(...args)
    }

    async boot(types, { user, password, database, port } = {}){
        types = typeof types == 'function' ? loadModels(types) : types
        await Model.connect({ user, password, database, port })
        await Model.migrate(types)
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
        this.listenForFileUploads()
    }


    loadSession(oldToken){
        let session;
        if(oldToken && fs.existsSync(`${SESSIONS_PATH}/${oldToken}.json`)){
            try {
                session = this.unserializer.unSerializeDocument(JSON.parse(fs.readFileSync(`${SESSIONS_PATH}/${oldToken}.json`)))
                fs.unlinkSync(`${SESSIONS_PATH}/${oldToken}.json`)
            } catch(err){
                console.log(err)
                session = {} 
            }
        } else {
            session = {}
        }
        
        let token = this.createToken()
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

    createToken() {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 12; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }


     listenForFileUploads(){
        http.createServer((req, res) => {
            if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
                const form = new formidable.IncomingForm();
                const urls = []
                form.parse(req, (err, fields, files) => {
                    let form = { ...fields, ...files } 
                    for(let index = 0; index < form.length; index++){
                        const file = form[index]
                        const extension = file.name.split('.').pop()
                        const filepath = `${this.createToken()}.${extension}`
                        urls.push(`/cdn/${filepath}`)
                        fs.rename(file.path, `${UPLOADS_PATH}/${filepath}`, function (err) {
                            if (err) throw err;
                        });
                    }
                    res.writeHead(200, {'content-type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
                    res.end(JSON.stringify(urls));
                });
           
              return;
            }

            if(req.url.startsWith('/cdn')){
                const path = req.url.replace('/cdn', `${UPLOADS_PATH}/`)
                const extension = path.split('.').pop()
                const stat = fs.statSync(path);
                const mimeType = mime.getType(extension); 
                console.log(stat, mimeType)
            
                res.writeHead(200, {
                    'Content-Type': mimeType,
                    'Content-Length': stat.size
                });
            
                const readStream = fs.createReadStream(path);
                // We replaced all the event handlers with a simple call to readStream.pipe()
                readStream.pipe(res);
            }
                
          }).listen(8081);
     }

}

