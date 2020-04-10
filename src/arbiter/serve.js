import { serialize } from './serialize'
import { createSession } from './createSession'
import { deepMerge } from 'triframe/core'
import { connect } from 'triframe/scribe'

import fs from 'fs'
import mime from 'mime';

const path= require('path')
const express= require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, { serveClient: false });
const expressCors = require('cors')
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

const session = require('express-session');
const FileStore = require('session-file-store')(session);
const fileStore = new FileStore({ path: SESSIONS_PATH });
const cors = (config) => expressCors(deepMerge({
    origin: function(origin, resolve) {
        if( config.clientWhitelist.includes(origin) ){
            resolve(null, origin)
        } else {
            resolve(null, '')
        }
    },
    credentials: true
}, config))

const httpRedirectMiddleware = (req, res, next) => {
    if (!req.hostname.includes('localhost') && req.headers['x-forwarded-proto'] === 'http') {
        res.redirect(`https://${req.hostname}${req.originalUrl}`)
    } else {
        next()
    }
}

const defaultConfig = {
    port: process.env.PORT || 8080,
    models: {},
    session: {},
    database: {
        user: process.env.DB_USER || 'Josephine',
        password: process.env.DB_PASSWORD ||  'P00p!',
        database: process.env.DB_NAME || 'Josephine',
        port: process.env.DB_PORT || 5432
    },
    sessionStorage: {
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        store: fileStore,
        resave: true,
        saveUninitialized: true
    },
    cors: {
       clientWhitelist: []
    }
}

export async function serve(configArgument) {

    let config = deepMerge(defaultConfig, configArgument)

    const models = typeof config.models == 'function' ? loadModels(config.models) : config.models

    await connect(config.database)

    const corsMiddleware = cors(config.cors)
    const bodyParserMiddleware = bodyParser()
    const sessionMiddleware = session(config.sessionStorage)

    const Session = createSession(config.session)
    const apiSchema = serialize(models)
    const socketHandler = createSocketHandler(apiSchema, Session)

    app.use(httpRedirectMiddleware)
    app.use(sessionMiddleware);
    app.use(bodyParserMiddleware)
    app.use(corsMiddleware)
    app.use(express.static(path.resolve('./public')))
    app.get('/init', (req, res) => res.json({ ok: true }) )
    app.post('/upload', cdnUploadHandler)
    app.get('/cdn*', cdnHandler)
    app.get('/*', frontendHandler)

    io.use((socket, next) => sessionMiddleware(socket.request, socket.request.res, next));
    io.on('connection', socketHandler)

    server.listen(config.port)
    console.log(`Listening on ${config.port}`)
}


// Request Handlers

const frontendHandler = (req, res) => {
    res.sendFile(path.resolve('./public/index.html'))
}

const cdnHandler = (req, res) => {
    const path = req.url.replace('/cdn', `${UPLOADS_PATH}/`)
    const extension = path.split('.').pop()
    const stat = fs.statSync(path);
    const mimeType = mime.getType(extension);
    res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': stat.size
    });
    const readStream = fs.createReadStream(path);
    readStream.pipe(res);
}

const cdnUploadHandler = (req, res) => {
    const form = new formidable.IncomingForm();
    const urls = []
    form.parse(req, (err, fields, files) => {
        Object.values(files).forEach(file => {
            const extension = file.name.split('.').pop()
            const filepath = `${createToken()}.${extension}`
            urls.push(`/cdn/${filepath}`)
            fs.rename(file.path, `${UPLOADS_PATH}/${filepath}`, function (err) {
                if (err) throw err;
            });
        })
        // res.writeHead(200, { 'content-type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(urls));
    });
}

const createSocketHandler = (apiSchema, Session) => socket => {
    const session = new Session(socket.request.session)
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
                    socket.on(`${hook}.destroy`, () => closeHandler())
                    respond({ value, hook })
                } else {
                    respond({ value })
                }
            } else {
                socket.emit(hook, { value })
            }
        }
        let onClose = callback => closeHandler = callback
        apiSchema.emit(event, { ...payload, connection, send, onClose })
        socket.on('disconnect', () => closeHandler())
        next()
    })
    socket.emit('interface', apiSchema)
}


// UTILS

const createToken = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 12; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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
