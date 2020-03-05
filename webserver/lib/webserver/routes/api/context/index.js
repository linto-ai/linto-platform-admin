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
            requireAuth: true,
            controller: async(req, res, next) => {
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
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const flowId = req.body.flowId

                    // Get workflow
                    const accessToken = await nodered.getBLSAccessToken()
                    const getFinalFlow = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flow/${flowId}`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Node-RED-Deployment-Type': 'flows',
                            'Authorization': accessToken
                        }
                    })

                    // Format workflow 
                    let flow = getFinalFlow.data
                    if (flow.configs.length > 0) {
                        flow.configs.map(conf => {
                            if (flow.nodes.filter(n => n.id === conf.id).length === 0) {
                                flow.nodes.push(conf)
                            } else {}
                        })
                    }
                    flow.configs = []

                    // Post context
                    const now = moment().format()
                    const contextPayload = {
                        name: payload.context_name,
                        flowId: flowId,
                        type: payload.type,
                        associated_linto: payload.linto,
                        created_date: now,
                        updated_date: now,
                        flow
                    }
                    const postContext = await model.createContext(contextPayload)

                    // Validation
                    if (postContext === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The context "${payload.context_name}" has been created`
                        })
                    } else {
                        throw 'Error on creating context'
                    }
                } catch (error) {
                    console.error(error.toString())
                    res.json({
                        status: 'error',
                        msg: error.toString()
                    })
                }
            }
        },
        {
            // Get all existing context types
            path: '/types',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const contextTypes = await model.getContextTypes()
                    res.json(contextTypes)
                } catch (error) {
                    console.error(error.toString())
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Get existing NLU services (by default = "tock")
            path: '/nluservices',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    res.json([{
                        "service_name": "tock",
                        "host": process.env.NLU_TOCK_HOST
                    }])
                } catch (error) {
                    console.error(error.toString())
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Get MQTT default settings
            path: '/getMqttDefaultSettings',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    res.json({
                        "host": process.env.LOGIC_MQTT_ADDRESS,
                        "port": process.env.LOGIC_MQTT_PORT,
                        "scope": process.env.LOGIC_MQTT_HW_SCOPE
                    })
                } catch (error) {
                    console.error(error.toString())
                    res.json({ error: error.toString() })
                }
            }
        }
    ]
}