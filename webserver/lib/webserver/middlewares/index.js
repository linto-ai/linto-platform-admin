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
function basicAuthToken(user, password) {
  var token = user + ":" + password;
  // Should i be encoding this value????? does it matter???
  // Base64 Encoding -> btoa
  var hash = btoa(token);
  return "Basic " + hash;
}

module.exports = {
  basicAuthToken,
  checkAuth,
  isProduction,
  logger
}
