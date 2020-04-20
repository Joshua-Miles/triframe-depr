import { serialize } from './serialize'
import { createSession } from './createSession'
import { deepMerge, EventEmitter } from 'triframe/core'
import { connect } from 'triframe/scribe'

import fs from 'fs'
import mime from 'mime';
import ncp from 'ncp'

const path = require('path')
const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, { serveClient: false });
const expressCors = require('cors')
const bodyParser = require('body-parser')
const formidable = require('formidable')

// const getMemory = () => {
//     const { heapUsed } = process.memoryUsage()
//     return heapUsed / 1024 / 1024
// }

// let initialMemory = getMemory()
// setInterval(() => {
//     const memory = getMemory()
//     console.log('Memory Usage:', `${memory.toFixed(2)} MB`)
//     console.log('Diff:', `${( initialMemory - memory).toFixed(2)} MB`)
// }, 5000)

const STORAGE_PATH = './.storage';
const SESSIONS_PATH = `${STORAGE_PATH}/sessions`;
const UPLOADS_PATH = `${STORAGE_PATH}/uploads`


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
    origin: function (origin, resolve) {
        if (!config.useWhiteList || config.clientWhitelist.includes(origin)) {
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
    port: process.env.BACKEND_PORT || 8080,
    models: {},
    session: {},
    database: {
        user: process.env.DB_USER || 'Josephine',
        password: process.env.DB_PASSWORD || 'P00p!',
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
        useWhiteList: process.env.USE_CORS_WHITE_LIST || true,
        clientWhitelist: process.env.CORS_WHITE_LIST || []
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
    app.get('/init', (req, res) => res.json({ ok: true }))
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
            ncp(file.path, `${UPLOADS_PATH}/${filepath}`);
        })
        // res.writeHead(200, { 'content-type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(urls));
    });
}

let connections = {}

const createSocketHandler = (apiSchema, Session) => socket => {

    let connection;

    socket.on('initialize', (respond) => {
        let agent = new EventEmitter
        let session = new Session(socket.request.session)
        let requestId = 0;
        let id = createToken()
        bindAgent(agent)
        connection = { socket: agent, session, requestId, id }
        connections[id] = connection
        respond({ apiSchema, id })
    })

    socket.on('connect-id', (id) => {
        connection = connections[id]
        bindAgent(connection.socket)
    })


    let bindAgent = (agent) => {
        socket.use(([event, payload, respond], next) => {
            agent.emit(event, { ...payload, respond })
            next()
        })
        agent.on('*', (payload, event) => {
            socket.emit(event, payload)
        })
    }

    // const connection = { get socket(){ return internal }, session }
    socket.use(([event, payload, respond], next) => {
        if(!connection) return next();
        let { socket } = connection
        let closeHandler = () => null
        let hasResponded = false
        let hook = false;
        let send = (value, keepOpen) => {
            if (!hasResponded) {
                hasResponded = true
                if (keepOpen) {
                    hook = `${connection.requestId++}: ${event}`
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
        next()
    })
    
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
        if (key.includes('__')) return
        let path = key.replace('.js', '').split('/')
        let Model = path.pop()
        let module = r(key)
        if (module[Model]) models[Model] = module[Model]
    });
    return models
}
