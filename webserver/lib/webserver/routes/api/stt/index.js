const DBmodel = require(`${process.cwd()}/model/${process.env.BDD_TYPE}`)
const model = new DBmodel()
const axios = require('axios')
const multer = require('multer')
const moment = require('moment')
const AMPath = `${process.cwd()}/acousticModels/`
const AMstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AMPath)
  },
  filename: (req, file, cb) => {
    let filename = moment().format('x') + '-' + file.originalname
    cb(null, filename)
  }
})

const AMupload = multer({ storage: AMstorage }).any()
const request = require('request')
const fs = require('fs')

module.exports = (webServer) => {
  return [{
      path: '/services',
      method: 'get',
      requireAuth: false,
      controller: async (req, res, next) => {
        try {
          const getServices = await axios(`${process.env.SERVICE_MANAGER_URL}/services`, {
            method: 'get'
          })
          res.json({services: getServices.data})
        } catch (e) {
          res.json({ error: e })
        }
      }
    },
    {
      path: '/service',
      method: 'post',
      requireAuth: false,
      controller: async (req, res, next) => {
        try {
          const payload = req.body
          const createService = await axios(`${process.env.SERVICE_MANAGER_URL}/service/${payload.serviceId}`, {
            method: 'post',
            data: payload
          })
          if(!!createService.status && createService.status === 200) {
            res.json({
              status: 'success',
              msg: createService.data
            })
          } else {
            throw createService
          }
        } catch (error) {
          if (!!error.response.status && error.response.status !== 200) {
            res.json({
              status: 'error',
              msg: error.response.data.status
            })
          }
          else {
            res.json({
              error: 'An error has occured'
            })
          }
        }
      }
    },
    {
      path: '/langmodels',
      method: 'get',
      requireAuth: false,
      controller: async (req, res, next) =>{
        try {
          const getLanguageModels = await axios(`${process.env.SERVICE_MANAGER_URL}/langmodels`, {
            method: 'get'
          })
          res.json({services: getLanguageModels.data})
        } catch (e) {
          res.json({ error: e })
        }
      }
    },
    {
      path: '/langmodel',
      method: 'post',
      requireAuth: false,
      controller: async (req, res, next) =>{
        try {
          const acmodel = req.body.acmodelname
          const lmodel = req.body.lmodelname.replace(/\s/g, '_')
          const createLM = await axios(`${process.env.SERVICE_MANAGER_URL}/langmodel/${lmodel}`, {
            method: 'post',
            data: {
              acousticModel: acmodel
            }
          })
          if(!!createLM.status && createLM.status === 200) {
            res.json({
              status: 'success',
              msg: createLM.data
            })
          } else {
            throw createLM
          }
        } catch (error) {
          if (!!error.response.status && error.response.status !== 200) {
            res.json({
              status: 'error',
              msg: error.response.data.status
            })
          }
          else {
            res.json({
              error: 'An error has occured'
            })
          }
        }
      }
    },
    {
      path: '/langmodel',
      method: 'delete',
      requireAuth: false,
      controller: async (req, res, next) =>{
        try {
          const modelId = req.body.modelId
          const deleteModel = await axios(`${process.env.SERVICE_MANAGER_URL}/langmodel/${modelId}`, {
            method: 'delete'
          })
          if (!!deleteModel.status && deleteModel.status === 200) {
            res.json({
              status: 'success',
              msg: deleteModel.data
            })
          } else {
            throw deleteModel
          }
        } catch (error) {
          if (!!error.response.status && error.response.status !== 200) {
            res.json({
              status: 'error',
              msg: error.response.data.status
            })
          }
          else {
            res.json({
              error: 'An error has occured'
            })
          }
        }
      }
    },
    {
      path: '/acmodels',
      method: 'get',
      requireAuth: false,
      controller: async (req, res, next) =>{
        try {
          const getACModels = await axios(`${process.env.SERVICE_MANAGER_URL}/acmodels`, {
            method: 'get'
          })
          res.json({services: getACModels.data})
        } catch (e) {
          res.json({ error: e })
        }
      }
    },
    {
      path: '/acmodel',
      method: 'post',
      requireAuth: false,
      controller: async (req, res, next) => {
        try {
          AMupload(req, res, async (error) => {
            if (error || error instanceof multer.MulterError) {
              // A Multer error occurred when uploading.
              console.error(error)
              throw error
            }
            const infos = JSON.parse(req.body.infos)
            const file = req.files[0]
            const acModelName = infos.acmodel.replace(/\s/g, '_')
            request.post({
              url: `${process.env.SERVICE_MANAGER_URL}/acmodel/${acModelName}`,
              formData: {
                file: fs.createReadStream(AMPath + file.filename),
                filetype: file.mimetype,
                lang: infos.lang
              },
            }, (err, response, body) => {
              if (err) {
                res.json({
                  status: 'error',
                  error: err
                })
              }
              if (response.statusCode === 200) {
                fs.unlinkSync(AMPath + file.filename)
                res.json({
                  status: 'success',
                  msg: body
                })
              } else {
                res.json({
                  status: 'error',
                  msg: body
                })
              }
            })
          })
        } catch (error) {
          console.error(error)
          res.json({
            status: 'error',
            msg: error
          })
        }
      }
    },
    {
      path: '/acmodel',
      method: 'delete',
      requireAuth: false,
      controller: async (req, res, next) =>{
        try {
          const modelId = req.body.modelId
          const deleteModel = await axios(`${process.env.SERVICE_MANAGER_URL}/acmodel/${modelId}`, {
            method: 'delete'
          })
          if (!!deleteModel.status && deleteModel.status === 200) {
            res.json({
              status: 'success',
              msg: deleteModel.data
            })
          } else {
            throw deleteModel
          }
        } catch (error) {
          if (!!error.response.status && error.response.status !== 200) {
            res.json({
              status: 'error',
              msg: error.response.data.status
            })
          }
          else {
            res.json({
              error: 'An error has occured'
            })
          }
        }
      }
    },
  ]
}
