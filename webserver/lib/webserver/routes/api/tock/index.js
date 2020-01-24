const debug = require('debug')(`linto-admin:/api/tock`)
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares`)
const fs = require('fs')
const request = require('request')

module.exports = (webServer) => {
  return [{
    // Create a new tock application
    path: '/',
    method: 'post',
    requireAuth: false,
    controller: async (req, res, next) => {
      try {
        const jsonContent = JSON.stringify(req.body.nlu)
        // get Tock auth token
        const token = middlewares.basicAuthToken(process.env.NLU_TOCK_USER, process.env.NLU_TOCK_PSWD)
        // Tmp json file path
        const filePath = process.cwd() + '/public/tockapp.json'
        // Create json file
        fs.writeFile(filePath, jsonContent, (err) => {
          if (err) throw err
          else {
            // Tock service post request
            request.post({
              url: process.env.NLU_TOCK_REST_HOST + '/admin/dump/sentences',
              headers: {
                'Authorization': token
              },
              formData: {
                  file: fs.createReadStream(filePath),
                  filetype: 'json'
              },
            }, function (error, response, body) {
              let resp
              if(typeof(body) !== 'object') {
                 resp = JSON.parse(body)
              } else {
                resp = body
              }

              if (error) {
                throw error
              }
              if (resp.success) {
                fs.unlinkSync(filePath)
                res.json({
                  status: 'success',
                  msg: 'A new tock application has been deployed'
                })
              } else {
                throw 'Error on creating tock application'
              }
            })
          }
        })
      } catch (error) {
        res.json({
          status: 'error',
          error
        })
      }
    }
  }]
}