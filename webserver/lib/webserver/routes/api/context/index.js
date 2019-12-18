const DBmodel = require(`${process.cwd()}/model/${process.env.BDD_TYPE}`)
const model = new DBmodel()
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares`)
const axios = require('axios')
const moment = require('moment')

module.exports = (webServer) => {
  return [{
    path: '/fleet',
    method: 'get',
    //requireAuth: true,
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
    path: '/',
    method: 'post',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        const payload = req.body
        const context_name = payload.context_name
        let lintoUpdate = false
        let contextUpdate = false
        let flowUpdate = false

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
        if (payload.type === 'Fleet') {
          // UPDATE LINTO
          const getLinto = await model.getLintoBySn(payload.linto)
          let lintoPayload = getLinto[0]
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
        const getWorkflowPattern = await model.getWorlfowPatterNyName(workflowName)
        let flow = getWorkflowPattern[0].flow
        const updatedFlow = middlewares.generateContextFlow(flow, payload)

        // POST FLOW ON BLS
        let blsPost = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flow`, {
          method: 'post',
          headers: {
            'charset': 'utf-8',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Node-RED-Deployment-Type': 'flows'
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
        const now = moment().format()
        const contextPayload = {
          name: context_name,
          flowId: newFlowId,
          type: payload.type,
          associtated_linto: payload.linto,
          created_date: now,
          updated_date: now,
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
        // VALIDATION
        if (lintoUpdate && flowUpdate && contextUpdate) {
          res.json({
            status: 'success',
            msg: `The context "${context_name}" has been created`
          })
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
          code: error.code
        })
      }
    }
  },
  {
    path: '/types',
    method: 'get',
    //requireAuth: true,
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
    path: '/nlusettings',
    method: 'get',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        res.json([
          {
            "service_name": "Tock",
            "host": process.env.NLU_TOCK_HOST,
            "appname": process.env.NLU_TOCK_APP_NAME,
            "namespace": process.env.NLU_TOCK_NAMESPACE
          },
          {
            "service_name": "Rasa",
            "host": process.env.NLU_RASA_HOST,
            "appname": null,
            "namespace": null
          }
        ])
      } catch (error) {
        console.error(error)
        res.json({ error })
      }
    }
  },
  {
    path: '/getsttservices',
    method: 'get',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        res.json([
          {
            "_id": "5db8173735cd8c0019936605",
            "serviceId": "linstt_linto",
            "tag": "offline-cpu",
            "replicas": 2,
            "LModelId": "graph_lvcsr",
            "AModelId": "linstt_fr",
            "lang": "fr-FR",
            "isOn": 1,
            "isDirty": 0,
            "date": "10/30/2019-10:00:06"
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
    //requireAuth: true,
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