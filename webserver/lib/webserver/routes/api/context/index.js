const DBmodel = require(`${process.cwd()}/model/${process.env.BDD_TYPE}`)
const model = new DBmodel()

module.exports = (webServer) => {
  return [{
    path: '',
    method: 'post',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        const payload = req.body
        console.log(payload)
        const context_name = payload.context_name

        // Test context name
        const contexts = await model.getContexts()
        if (contexts.length > 0) {
          contexts.map(c => {
            if (c.context_name === context_name) {
              throw 'The context name is already used'
            }
          })
        }

        // TODO: suite
        // >>>>>

        res.json({
          test: 'test'
        })
      } catch (error) {
        console.error(error)
        res.json({
          status: 'errro',
          error,
          msg: error
        })
      }
    }
  },{
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
            "service_name": "tock",
            "host": process.env.NLU_TOCK_HOST,
            "app_name": process.env.NLU_TOCK_APP_NAME,
            "namespace": process.env.NLU_TOCK_NAMESPACE
          },
          {
            "service_name": "rasa",
            "host": process.env.NLU_RASA_HOST,
            "app_name": null,
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
            "service_name":"linstt_fr",
            "type": "large vocabulary",
            "audio": "stream",
            "endpoint": "http://localhost:STT_PORT/stream/LV/FR"
          },
          {
            "service_name":"linstt_fr",
            "type": "command",
            "audio": "file",
            "endpoint": "http://localhost:STT_PORT/file/command/FR"
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