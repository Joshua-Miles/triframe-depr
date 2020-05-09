import { serialize } from './serialize'
import { deepMerge, EventEmitter } from 'triframe/core'
import { connect } from 'triframe/scribe'
import { Connection } from './Connection'

import fs from 'fs'
import mime from 'mime';
import ncp from 'ncp'

const path = require('path')
const express = require('express')
const { Server } = require('http')

const expressCors = require('cors')
const bodyParser = require('body-parser')
const formidable = require('formidable')

const STORAGE_PATH = './.storage';
const UPLOADS_PATH = `${STORAGE_PATH}/uploads`


if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH);
}

if (!fs.existsSync(UPLOADS_PATH)) {
    fs.mkdirSync(UPLOADS_PATH);
}

const cors = (config) => expressCors(deepMerge({
    origin: function (origin, resolve) {
        if (origin.includes('localhost') || !config.useWhiteList || config.clientWhitelist.includes(origin)) {
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
    cors: {
        useWhiteList: process.env.USE_CORS_WHITE_LIST || true,
        clientWhitelist: process.env.CORS_WHITE_LIST || []
    }
}

class Api extends EventEmitter{

    constructor(configOptions){
        super()
        let config = deepMerge(defaultConfig, configOptions)
        let router = express()
        this.config = config
        this.router = router
        this.server = Server(router);
        this.models = typeof config.models == 'function' ? loadModels(config.models) : config.models
        this.schema = serialize(this.models)
        this.boot()
    }

    async boot(){
        const { config, server } = this;
        await connect(config.database)
        server.listen(config.port, () => {
            this.drawRoutes() // <-- Draw routes after connection, allowing user defined routes to 
                              //       supercede the frontendHandler
            console.log(`Listening on ${config.port}`)
        })
    }

    drawRoutes(){
        const { config, router, server, cdnUploadHandler, cdnHandler, frontendHandler, socketHandler } = this;

        const corsMiddleware = cors(config.cors)
        const bodyParserMiddleware = bodyParser()
    
        router.use(httpRedirectMiddleware)
        router.use(bodyParserMiddleware)
        router.use(corsMiddleware)
        router.use(express.static(path.resolve('./public')))
        router.post('/upload', cdnUploadHandler)
        router.get('/cdn*', cdnHandler)
        router.get('/*', frontendHandler)
    
        Connection.listen(server, config.session, socketHandler)
    }

    frontendHandler = (req, res) => {
        res.sendFile(path.resolve('./public/index.html'))
    }
    
    cdnHandler = (req, res) => {
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
    
    cdnUploadHandler = (req, res) => {
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
    
    socketHandler = socket => {
        const { schema } =  this

        socket.on('*', (payload, send, event) => {
            schema.emit(event, { ...payload, socket, send,  /*onClose*/ })
        })

        this.emit('connection', socket)
    
        socket.emit('install', schema)
    }


}


export const serve = configOptions => {
    return new Api(configOptions)
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
