const debug = require('debug')('linto-admin:middlewares')
const uuid = require('uuid/v1')
const axios = require('axios')
const btoa = require('btoa')

function isProduction() {
  return process.env.NODE_ENV === 'production'
}

function logger(req, res, next) {
  debug(`[${Date.now()}] new user entry on ${req.url}`)
  next()
}

function checkAuth(req, res, next) {
  //if (isProduction()) {
  // If not connected
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
        res.redirect('/admin/fleet')
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
    res.redirect('/login')
  }
}

// Get a Basic Auth token from user and password
function basicAuthToken(user, password) {
  var token = user + ":" + password;
  var hash = btoa(token);
  return "Basic " + hash;
}

module.exports = {
  basicAuthToken,
  checkAuth,
  isProduction,
  logger
}
