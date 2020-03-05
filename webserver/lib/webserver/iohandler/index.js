const debug = require('debug')('linto-admin:ioevents')
const EventEmitter = require('eventemitter3')

class IoHandler extends EventEmitter {
    constructor(webServer) {
            super()
            this.webServer = webServer
                //Adds socket.io
            webServer.io = require('socket.io').listen(webServer.httpServer)

            //http AND io uses same session middleware
            webServer.io.use((socket, next) => {
                if (socket) {
                    webServer.session(socket.request, socket.request.res, next)
                }
            })
            webServer.io.on('connection', (socket) => {
                console.log('Connection socketio ???')
                debug(webServer.io)
                    //Secures websocket usage with session
                if (process.env.NODE_ENV !== 'production') {
                    socket.request.session.logged = 'on'
                    socket.request.session.save()
                }
                if (!socket.request.session || socket.request.session.logged != 'on') return socket.disconnect()
                debug('new Socket connected')

            })
        }
        //broadcasts to connected sockets
    notify(msgType, payload) {
        this.webServer.io.emit('linto_' + msgType, payload)
    }
}

module.exports = IoHandler