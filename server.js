import { Serializer, UnSerializer } from './arbiter'
import { Model } from './librarian';
import fs from 'fs'
import mime from 'mime';
import { map } from './mason';

const formidable = require('formidable')
const http = require('http')

const socketIo = require('socket.io')

const SESSIONS_PATH = './.sessions';

const UPLOADS_PATH = './.uploads'

if (!fs.existsSync(SESSIONS_PATH)) {
    fs.mkdirSync(SESSIONS_PATH);
}

if (!fs.existsSync(UPLOADS_PATH)) {
    fs.mkdirSync(UPLOADS_PATH);
}

function loadModels(r) {
    const models = {}
    r.keys().forEach(key => {
        if(key.includes('__')) return
        let path = key.replace('.js', '').split('/')
        let Model = path.pop()
        let module = r(key)
        if (module[Model]) models[Model] = module[Model]
    });
    return models
}

let id= 0

export default class Server {

    constructor(...args) {
        this.boot(...args)
    }

    async boot(types, { user, password, database, port } = {}) {
        types = typeof types == 'function' ? loadModels(types) : types
        await Model.connect({ user, password, database, port })
        await Model.migrate(types)
        const server = http.Server(this.cdnListener)
        this.io = socketIo(server);
        this.types = types;
        const serializer = this.serializer = new Serializer(types)
        const unserializer = this.unserializer = new UnSerializer(serializer.interface)
        this.io.on('connection', socket => {
            const { session, token } = this.loadSession(socket.handshake.query.token, socket.id)
            socket.emit('token', token)
            socket.emit('interface', serializer.interface)
            socket.on('message', ({ action, payload, id }) => {
                serializer.agent.emit(action, {
                    ...payload, socket, session, requestId: id, emit: (result) => {
                        socket.emit(id, result)
                    }
                })
            })
            socket.on('disconnect', () => {
                this.saveSession(token, session)
            })
            process.on('exit', function () {
                this.saveSession(token, session)
            });
        })
        server.listen(80)
    }


    loadSession(oldToken) {
        let session;
        if (oldToken && fs.existsSync(`${SESSIONS_PATH}/${oldToken}.json`)) {
            try {
                session = this.unserializeSession(JSON.parse(fs.readFileSync(`${SESSIONS_PATH}/${oldToken}.json`)))
                fs.unlinkSync(`${SESSIONS_PATH}/${oldToken}.json`)
            } catch (err) {
                console.log(err)
                session = { id: id++ }
            }
        } else {
            session = { id: id++ }
        }

        let token = this.createToken()
        this.saveSession(token, session)
        return { session, token }
    }

    saveSession(token, session) {
        let sessionData = { ...session };
        delete sessionData.destroy
        fs.writeFileSync(`${SESSIONS_PATH}/${token}.json`, JSON.stringify(this.serializer.serializeDocument(sessionData)))
    }

    createToken() {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 12; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }


    cdnListener = (req, res) => {
        if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
            const form = new formidable.IncomingForm();
            const urls = []
            form.parse(req, (err, fields, files) => {
                let form = { ...fields, ...files }
                for (let index = 0; index < form.length; index++) {
                    const file = form[index]
                    const extension = file.name.split('.').pop()
                    const filepath = `${this.createToken()}.${extension}`
                    urls.push(`/cdn/${filepath}`)
                    fs.rename(file.path, `${UPLOADS_PATH}/${filepath}`, function (err) {
                        if (err) throw err;
                    });
                }
                res.writeHead(200, { 'content-type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify(urls));
            });

            return;
        }

        if (req.url.startsWith('/cdn')) {
            const path = req.url.replace('/cdn', `${UPLOADS_PATH}/`)
            const extension = path.split('.').pop()
            const stat = fs.statSync(path);
            const mimeType = mime.getType(extension);
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Content-Length': stat.size
            });
            const readStream = fs.createReadStream(path);
            // We replaced all the event handlers with a simple call to readStream.pipe()
            readStream.pipe(res);
        }
    }



    unserializeSession(document) {
        if (!document) return document
        if (document.__type__) return this.types[document.__type__]
        if (!document.__class__ && typeof document != 'object') return document
        let result = this.types[document.__class__] ? new this.types[document.__class__] : new Object
        Object.assign(result, map(document, (propertyName, document) => this.unserializeSession(document)))
        console.log(result)
        return result
    }
}
