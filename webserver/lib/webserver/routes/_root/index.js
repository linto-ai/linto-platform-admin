const debug = require('debug')('linto-admin:login')

module.exports = (webServer) => {
    return [{
        path: '/',
        method: 'get',
        requireAuth: false,
        controller: async(req, res, next) => {
            try {
                if (webServer.session) {
                    console.log(webServer.session)
                }
                res.redirect('/login')
            } catch (err) {
                console.error(err)
            }
        }
    }]
}