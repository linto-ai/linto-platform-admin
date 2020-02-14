const debug = require('debug')(`linto-admin:webserver`)
const express = require('express')
const Session = require('express-session')
const bodyParser = require('body-parser')
const EventEmitter = require('eventemitter3')
const cookieParser = require('cookie-parser')
const path = require('path')
const IoHandler = require('./iohandler')
const CORS = require('cors')
let corsOptions = {}
let whitelistDomains = []
if (process.env.WHITELIST_DOMAINS.length > 0) {
  whitelistDomains = process.env.WHITELIST_DOMAINS.split(',')
  corsOptions = {
    origin: function (origin, callback) {
      if (!origin || whitelistDomains.indexOf(origin) !== -1) {
        callback(null, true)
       } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }
}

let redis, redisStore, redisClient
if(process.env.NODE_ENV == 'production'){
   redis = require('redis')
   redisStore = require('connect-redis')(Session)
   redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  })
}

class WebServer extends EventEmitter {
  constructor() {
    super()
    this.app = express()
    this.app.set('etag', false)
    this.app.set('trust proxy', true)
    this.app.use('/assets', express.static(path.resolve(__dirname, '../../dist')))
    this.app.use('/public', express.static(path.resolve(__dirname, '../../public')))
    this.app.use(bodyParser.json({limit: '1000mb'}))
    this.app.use(bodyParser.urlencoded({
      extended: false
    }))
    this.app.use(cookieParser())
    this.app.use(CORS(corsOptions))
    let sessionConfig = {
      resave: false,
      saveUninitialized: true,
      secret: 'hippopoceros',
      cookie: {
        secure: false,
        maxAge: 604800 // 7 days
      }
    }

    // Redis store if "production"
    if(process.env.NODE_ENV == 'production'){
      sessionConfig.store = new redisStore({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        client: redisClient
      })
      redisClient.on('error', (err) => {
        console.error('Redis error: ', err)
      })
    }

    this.session = Session(sessionConfig)
    this.app.use(this.session)
    this.httpServer = this.app.listen(process.env.HTTP_PORT, "0.0.0.0", (err) => {
      if (err) console.error(err)
    })

    return this.init()
  }
  async init() {
    // Set ioHandler
    this.ioHandler = new IoHandler(this)

    // Router
    require('./routes')(this)

    this.app.use((req, res, next) => {
      res.status(404)
      res.setHeader("Content-Type", "text/html")
      res.sendFile(process.cwd() + '/dist/404.html')
    })

    this.app.use((err, req, res, next) => {
      console.error(err)
      res.status(500)
      res.end()
    })
    return this
  }
}

module.exports = new WebServer()