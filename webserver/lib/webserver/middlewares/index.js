const debug = require('debug')('linto-admin:middlewares')

function isProduction() {
  return process.env.NODE_ENV === 'production'
}

function logger(req, res, next) {
  debug(`[${Date.now()}] new user entry on ${req.url}`)
  next()
}

function checkAuth(req, res, next) {
  //if (isProduction()) {
    // If not connectedd
    debug(req.session)

    if (!!req && !!req.session) {
      if (!!req.session.logged) {
        debug(req.session.logged)
        if (req.session.logged == 'on' && req.url == '/login') {
          req.session.save((err) => {
            if (err && err != 'undefined') {
              console.error('Err:', err)
            }
          })
          //res.redirect('/admin/linto')
          res.redirect('/admin')
        } else if (req.session.logged == 'on' && req.url != '/login') {
          next()
        } else if (req.session.logged != 'on' && req.url != '/login') {
          res.redirect('/login')
        }
        else if (req.session.logged != 'on' && req.url == '/login') {
          next()
        }
      } else {
        if (req.url != '/login') {
          res.redirect('/login')
        } else {
          next()
        }
      }
    } else {
      res.redirect('/sessionNotFound')
    }
  /*} else {
    next()
  }*/
}
module.exports = {
  checkAuth,
  logger
}
