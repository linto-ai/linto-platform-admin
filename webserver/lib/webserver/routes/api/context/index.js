const DBmodel = require(`${process.cwd()}/model/${process.env.BDD_TYPE}`)
const model = new DBmodel()
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const axios = require('axios')
const moment = require('moment')

module.exports = (webServer) => {
  return [{
    // Get all existing contexts from database
    path: '/fleet',
    method: 'get',
    requireAuth: false,
    controller: async (req, res, next) => {
      try {
        const fleetContexts = await model.getFleetContexts()
        res.json(fleetContexts)
      } catch (error) {
        res.json({ error })
      }
    } 
  },
  {
    // Create a context in database
    path: '/',
    method: 'post',
    requireAuth: false,
    controller: async (req, res, next) => {
      try {
        const payload = req.body
        const context_name = payload.context_name
        let lintoUpdate = false
        let contextUpdate = false
        let flowUpdate = false
        let tockUpdate = false

        // Test context name
        const contexts = await model.getContexts()
        if (contexts.length > 0) {
          contexts.map(c => {
            if (c.name === context_name) {
              throw {
                msg: 'The context name is already used',
                code: 'contextName'
              }
            }
          })
        }
        // LINTO
        if (payload.type === 'Fleet') {
          const getLinto = await model.getLintoBySn(payload.linto)
          let lintoPayload = getLinto[0]
          // Test LinTO serial number
          if (lintoPayload.associated_context !== null) {
            throw {
              msg: 'This LinTO device is already used in an other context',
              code: 'lintoDevice'
            }
          }
          // Update LINTO
          lintoPayload.associated_context = payload.context_name
          const updateLinto = await model.updateLinto(lintoPayload)
          if(updateLinto === 'success') {
            lintoUpdate = true
          } else {
            throw {
              msg: 'Error on updating associated LinTO',
              code: 'updateLinto'
            }
          }
        }

        // FORMAT WORKFLOW
        const workflowName = payload.workflowPattern
        const getWorkflowPattern = await model.getWorkflowPatternByName(workflowName)
        let flow = getWorkflowPattern[0].flow
        const updatedFlow = nodered.generateContextFlow(flow, payload)

        // POST WORKFLOW ON BLS
        const accessToken = await nodered.getBLSAccessToken()
        let blsPost = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flow`, {
          method: 'post',
          headers: {
            'charset': 'utf-8',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Node-RED-Deployment-Type': 'flows',
            'Authorization': accessToken
          },
          data: updatedFlow
        })
        if (blsPost.status == 200 && blsPost.data) {
          flowUpdate = true
        } else {
          throw {
            msg: 'Error on posting flow on the business logic server',
            code: 'postBls'
          }
        }
        // POST CONTEXT
        const newFlowId = blsPost.data.id
        const getFinalFlow = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flow/${newFlowId}`, {
          method: 'get',
          headers: {
            'charset': 'utf-8',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Node-RED-Deployment-Type': 'flows',
            'Authorization': accessToken
          }
        })

        const now = moment().format()
        const contextPayload = {
          name: context_name,
          flowId: newFlowId,
          type: payload.type,
          associated_linto: payload.linto,
          created_date: now,
          updated_date: now,
          flow: getFinalFlow.data
        }
        const postContext = await model.createContext(contextPayload)
        if (postContext === 'success') {
          contextUpdate = true
        } else {
          throw {
            msg: 'Error on creating context',
            code: 'updateContext'
          }
        }

        // NLU : If "new tock application"
        if (payload.nlu.configs.new) {
          const getNluLexicalSeeding = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URL}/red-nodes/${newFlowId}/dataset/tock`, {
            method: 'get',
            headers: {
              'charset': 'utf-8',
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Node-RED-Deployment-Type': 'flows',
              'Authorization': accessToken
            }
          })
          // NLU Lexical seeding
          const createTockApp = await axios(`${process.env.ADMIN_URL}/api/tock`, {
            method: 'post',
            data: {
              nlu: getNluLexicalSeeding.data.application
            }
          })
          if (createTockApp.data.status === 'success') {
           tockUpdate = true
          } else {
            throw {
              msg: 'Error on creating a new Tock application',
              code: 'tockApp'
            }
          }
        }

        /* >>> TODO <<<

        // STT Lexical seeding
        const getSttLexicalSeeding = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URL}/red-nodes/${newFlowId}/dataset/linstt`, {
          method: 'get',
          headers: {
            'charset': 'utf-8',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Node-RED-Deployment-Type': 'flows',
            'Authorization': accessToken
          }
        })
        */
        // VALIDATION
        if (lintoUpdate && flowUpdate && contextUpdate) {
          if (payload.nlu.configs.new) {
            if (tockUpdate) {
              res.json({
                status: 'success',
                msg: `The context "${context_name}" has been created`
              })
            }
          } else {
            res.json({
              status: 'success',
              msg: `The context "${context_name}" has been created`
            })
          }
        } else {
          throw {
            msg: 'Error on creating context',
            code: 'unkownError'
          }
        }
      } catch (error) {
        console.error(error)
        res.json({
          status: 'error',
          msg: error.msg,
          code: error.code,
          error
        })
      }
    }
  },
  {
    // Get all existing context types
    path: '/types',
    method: 'get',
    requireAuth: false,
    controller: async (req, res, next) => {
      try {
        const contextTypes = await model.getContextTypes()
        res.json(contextTypes)
      } catch (error) {
        console.error(error)
        res.json({ error })
      }
    }
  },
  {
    // Get all existing Tock applications
    path: '/tockapps',
    method: 'get',
    requireAuth: false,
    controller: async (req, res, next) => {
      try {
        const tockToken = middlewares.basicAuthToken(process.env.NLU_TOCK_USER, process.env.NLU_TOCK_PSWD)
        const getTockApplications = await axios(`${process.env.NLU_TOCK_REST_HOST}/admin/applications`,
        {
          method: 'get',
          headers: {
            'Authorization': tockToken
          }
        })
        res.json(getTockApplications.data)
      } catch (error) {
        console.error(error)
        res.json({ error })
      }
    }
  },
  {
    path: '/nlusettings',
    method: 'get',
    requireAuth: false,
    controller: async (req, res, next) => {
      try {
        res.json([
          {
            "service_name": "tock",
            "host": process.env.NLU_TOCK_HOST
          },
          {
            "service_name": "rasa",
            "host": process.env.NLU_RASA_HOST
          }
        ])
      } catch (error) {
        console.error(error)
        res.json({ error })
      }
    }
  },
  {
    path: '/getMqttDefaultSettings',
    method: 'get',
    requireAuth: false,
    controller: async (req, res, next) => {
      try {
        res.json({
          "host": process.env.LOGIC_MQTT_ADDRESS,
          "port": process.env.LOGIC_MQTT_PORT,
          "scope": process.env.LOGIC_MQTT_HW_SCOPE
        })
      } catch (error) {
        console.error(error)
        res.json({ error })
      }
    }
  }]
}