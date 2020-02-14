const DBmodel = require(`${process.cwd()}/model/${process.env.BDD_TYPE}`)
const model = new DBmodel()
const axios = require('axios')
const multer = require('multer')
const moment = require('moment')
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
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


async function updateLangModel (type, modelId, list) {
  let success = []
  let errors = []
    for(let i = 0; i < list.length; i++) {
    let dataExist = false
    const name = list[i].name
    const data = list[i].items
    const url = `${process.env.SERVICE_MANAGER_URL}/langmodel/${modelId}/${type}/${name}`
    // Test if intent name already exist
    try {
      let testExist = await axios(url, {
        method: 'get'
      })
      if(!!testExist.data) {
        dataExist = true
      }
    } catch (error) {
      if(error.response.status === 404) {
        dataExist = false
      }
    }
    /* Intents: update or create intent */
    if (!dataExist) {
      reqMethod = 'post'
    } else {
      reqMethod = 'patch'
    }
    // updating
    try {
      let updateModel = await axios(url, {
        method: reqMethod,
        data: data
      })
      if (!!updateModel.status && updateModel.status === 200) {
        success.push(name)
      } else {
        throw 'error on updating ' + name
      }
    } catch (error) {
      console.error(error)
      errors.push(name)
    }
    if(success.length + errors.length === list.length) {
      return({
        success,
        errors
      })
    }
  }
}


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
    {
      path: '/lexicalseeding',
      method: 'post',
      requireAuth: false,
      controller: async (req, res, next) =>{
        try {
          const flowId = req.body.flowId
          const service_name = req.body.service_name
          // Get stt service data
          const accessToken = await nodered.getBLSAccessToken()
          const getSttService = await axios(`${process.env.SERVICE_MANAGER_URL}/service/${service_name}`, {
            method: 'get',
            headers: {
              'charset': 'utf-8',
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Node-RED-Deployment-Type': 'flows',
              'Authorization': accessToken
            }
          })
          const sttService = getSttService.data.data

          // Get lexical seeding data
          const getSttLexicalSeeding = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URL}/red-nodes/${flowId}/dataset/linstt`, {
            method: 'get',
            headers: {
              'charset': 'utf-8',
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Node-RED-Deployment-Type': 'flows',
              'Authorization': accessToken
            }
          })
          const sttLexicalSeedingData = getSttLexicalSeeding.data.data
          const intents = sttLexicalSeedingData.intents
          const entities = sttLexicalSeedingData.entities
          // update model intents
          const postIntents = await updateLangModel('intent', sttService.LModelId, intents)
          // update model entities
          const postEntities = await updateLangModel('entity', sttService.LModelId, entities)

          if (postIntents.errors.length === 0 && postEntities.errors.length === 0) {
            res.json({
              status: 'success',
              msg: 'The language model has been updated'
            })
          } else {
            let errorMsg = ''
            if (postIntents.errors.length > 0) {
              errorMsg += 'Error on adding intents to the model : '
              for (let i = 0; i < postIntents.errors.length; i++) {
                errorMsg += `"${postIntents.errors[i]}", `
              }
            }
            if (postEntities.errors.length > 0) {
              errorMsg += 'Error on adding entities to the model : '
              for (let i = 0; i < postEntities.errors.length; i++) {
                errorMsg += `"${postpostEntitiesIntents.errors[i]}", `
              }
            }
            res.json({
              status: 'success',
              msg: 'Language model updated but: ' + errorMsg
            })
          }

        } catch (error) {
          console.error(error)
          res.json({
            status: 'error',
            msg: 'Error on updating language model',
            error: error.toString()
          })
        }
      }
    },
    {
      path: '/generategraph',
      method: 'post',
      requireAuth: false,
      controller: async (req, res, next) =>{
        try {
          req.setTimeout(900000)
          const service_name = req.body.service_name
          const getSttService = await axios(`${process.env.SERVICE_MANAGER_URL}/service/${service_name}`, {
            method: 'get'
          })
          const sttService = getSttService.data.data

          const generateGraph = await axios(`${process.env.SERVICE_MANAGER_URL}/langmodel/${sttService.LModelId}/generate/graph`, {
            method: 'post'
          })
          console.log('Generate graph ?', generateGraph.data.toSTring())

          res.json({
            status: 'success',
            msg:'TESTING'
          })
        } catch (error) {
          res.json({
            status:'error',
            msg: 'error on generating graph'
          })
        }
      }
    },
    {
      path: '/healthcheck',
      method: 'get',
      requireAuth: false,
      controller: async (req, res, next) =>{
        try {
          const getSttManager = await axios(process.env.SERVICE_MANAGER_URL)
          if (getSttManager.status === 200) {
            res.json({
              status: 'success',
              msg: ''
            })
          } else {
            throw 'error on connecting'
          }
        } catch (error) {
          res.json({
            status: 'error',
            msg: 'unable to connect STT services'
          })
        }
      }
    }
  ]
}
