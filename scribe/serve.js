import { createSerializer } from '../arbiter'
import { EventEmitter } from '../core'
import { settings } from "./settings";
import { migrate } from "./migrate";
import fs from 'fs'
import mime from 'mime';
const app = require('express')();
const Client = require('pg').Client
const server = require('http').Server(app);
const io = require('socket.io')(server, { serveClient: false });
const cors = require('cors')
const bodyParser = require('body-parser')
const formidable = require('formidable')


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


const corsMiddleware = cors({
    origin: (origin, resolve) => {
        if( true /* clientWhitelist.includes(origin) */){
            resolve(null, origin)
        } else {
            resolve(null, '')
        }
    },
    credentials: true
})

const bodyParserMiddleware = bodyParser()
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const fileStoreOptions = { path: SESSIONS_PATH };
const sessionMiddleware = session({
    store: new FileStore(fileStoreOptions),
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
})

export async function serve(models, options) {
    models = typeof models == 'function' ? loadModels(models) : models
    settings.models = models;
    settings.db = new Client(options);
    await settings.db.connect()
    await migrate()
    const router = new EventEmitter
    const serialize = createSerializer(router)
    const apiSchema = serialize(models)

    
    app.use(sessionMiddleware);
    app.use(bodyParserMiddleware)
    app.use(corsMiddleware)
    app.get('/init', (req, res) => res.json({ ok: true }) )
    app.post('/upload', cdnUploadHandler)
    app.get('/cdn*', cdnHandler)

    io.use((socket, next) => sessionMiddleware(socket.request, socket.request.res, next));


    io.on('connection', socket => {
        const { session } = socket.request;
        let requestId = 0;
        const connection = { socket, session }
        socket.use(([event, payload, respond], next) => {
            let closeHandler = () => null
            let hasResponded = false
            let hook = false;
            let send = (value, keepOpen) => {
                if (!hasResponded) {
                    hasResponded = true
                    if (keepOpen) {
                        hook = `${requestId++}: ${event}`
                        respond({ value, hook })
                    } else {
                        respond({ value })
                    }
                } else {
                    socket.emit(hook, { value })
                }
            }
            let onClose = callback => closeHandler = callback
            router.emit(event, { ...payload, connection, send, onClose })
            socket.on('disconnect', () => closeHandler())
            next()
        })
        socket.emit('interface', apiSchema)
    })

    server.listen(8080)
}

const cdnUploadHandler = (req, res) => {
    const form = new formidable.IncomingForm();
    const urls = []
    form.parse(req, (err, fields, files) => {
        let form = { ...fields, ...files }
        for (let index = 0; index < form.length; index++) {
            const file = form[index]
            const extension = file.name.split('.').pop()
            const filepath = `${createToken()}.${extension}`
            urls.push(`/cdn/${filepath}`)
            fs.rename(file.path, `${UPLOADS_PATH}/${filepath}`, function (err) {
                if (err) throw err;
            });
        }
        // res.writeHead(200, { 'content-type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(urls));
    });
}

const cdnHandler = (req, res) => {
    const path = req.url.replace('/cdn', `${UPLOADS_PATH}/`)
    const extension = path.split('.').pop()
    const stat = fs.statSync(path);
    const mimeType = mime.lookup(extension);
    res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': stat.size
    });
    const readStream = fs.createReadStream(path);
    readStream.pipe(res);
}

const createToken = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 12; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}