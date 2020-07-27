const axios = require('axios')
const lexSeed = require(`${process.cwd()}/lib/webserver/middlewares/lexicalseeding.js`)
const flowTmpModel = require(`${process.cwd()}/model/mongodb/models/flow-tmp.js`)
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares/index.js`)


const workflowsStaticModel = require(`${process.cwd()}/model/mongodb/models/workflows-static.js`)
const workflowTemplatesModel = require(`${process.cwd()}/model/mongodb/models/workflows-templates.js`)
const clientStaticModel = require(`${process.cwd()}/model/mongodb/models/clients-static.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const moment = require('moment')

module.exports = (webServer) => {
    return [{
            path: '/healthcheck',
            method: 'get',
            requireAuth: false,
            controller: async(req, res, next) => {
                try {
                    const accessToken = await nodered.getBLSAccessToken()
                    const getBls = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': accessToken
                        }
                    })
                    if (getBls.status === 200) {
                        res.json({
                            status: 'success',
                            msg: ''
                        })
                    } else {
                        throw 'error on connecting'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'unable to connect Business logic server',
                        error
                    })
                }
            }
        },
        {
            path: '/:flowId',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const flowId = req.params.flowId
                    const deleteFlow = await nodered.deleteBLSFlow(flowId)
                    if (deleteFlow.status === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The workflow "${flowId}" has been removed`
                        })
                    } else {
                        throw `Error on deleting flow ${flowId} on the Business Logic Server`
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: error,
                        error
                    })
                }
            }
        },
        {
            // Get sandbox workflow ID
            path: '/sandbox',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const accessToken = await nodered.getBLSAccessToken()
                    let sandBoxId = null

                    // Get all workflows deployed
                    const fullFlow = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/flows`, {
                            method: 'get',
                            headers: {
                                'charset': 'utf-8',
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': accessToken
                            }
                        })
                        // Search for the "SandBox" workflow Id
                    fullFlow.data.map(f => {
                        if (f.type === 'tab' && f.label === "SandBox") {
                            sandBoxId = f.id
                        }
                    })

                    // return "SandBox" workflow Id
                    res.json({ sandBoxId })
                } catch (e) {
                    console.error(e)
                    res.json({ error: e })
                }
            }
        },
        {
            // Get sandbox workflow ID
            path: '/sandbox',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const accessToken = await nodered.getBLSAccessToken()
                    const payload = {
                        label: 'SandBox',
                        nodes: [],
                        configs: []
                    }

                    const createSandbox = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/flow`, {
                        method: 'post',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': accessToken
                        },
                        data: payload
                    })
                    if (createSandbox.status === 200) {
                        res.json({
                            status: 'success'
                        })
                    } else {
                        throw 'Error on creating SandBox workflow'
                    }
                } catch (e) {
                    console.error(e)
                    res.json({ error: e })
                }
            }
        },
        {
            // Get the working temporary workflow object
            path: '/tmp',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const tmpPattern = await flowTmpModel.getFullTmpFlow()
                    res.json([tmpPattern])
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: error.toString()
                    })
                }
            }
        },
        {
            // Update the working temporary workflow object
            path: '/tmp',
            method: 'put',
            requireAuth: false,
            controller: async(req, res, next) => {
                try {
                    let payload = req.body.payload
                    let workspaceId = req.body.workspaceId
                    let updateTmpFlow = await flowTmpModel.updateTmpFlow({
                        flow: payload,
                        workspaceId
                    })
                    res.json({ status: updateTmpFlow })
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: error.toString()
                    })
                }
            }
        },
        {
            // Get Business Logic Server credentials for requests
            path: '/getauth',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const accessToken = await nodered.getBLSAccessToken()
                    res.json({
                        token: accessToken
                    })
                } catch (error) {
                    res.json({ error })
                }
            }
        },
        {
            // Post flow on BLS on context creation
            path: '/postbls',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const workflowTemplate = await workflowTemplatesModel.getWorkflowTemplateByName(payload.workflowTemplate)
                        // Format flow to be posted on BLS
                    const formattedFlow = nodered.generateStaticWorkflowFromTemplate(workflowTemplate.flow, {
                        sn: payload.sn,
                        workflowName: payload.workflowName,
                        language: payload.sttServiceLanguage,
                        nlu: {
                            app_name: payload.tockApplicationName
                        },
                        stt: {
                            service_name: payload.sttService
                        }
                    })

                    // Post flow on BLS
                    const postFlowOnBLS = await nodered.postBLSFlow(formattedFlow)
                    res.json(postFlowOnBLS)

                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        }
    ]
}