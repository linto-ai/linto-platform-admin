const DBmodel = require(`${process.cwd()}/model/${process.env.BDD_TYPE}`)
const model = new DBmodel()
const moment = require('moment')
const axios = require('axios')
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)

module.exports = (webServer) => {
    return [{
            path: '/healthcheck',
            method: 'get',
            requireAuth: false,
            controller: async(req, res, next) => {
                try {
                    const getBls = await axios(process.env.BUSINESS_LOGIC_SERVER_URI)
                    if (getBls.status === 200) {
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
                        msg: 'unable to connect Business logic server'
                    })
                }
            }
        }, {
            // Get sandbox workflow ID
            path: '/sandbox',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const accessToken = await nodered.getBLSAccessToken()
                    let sandBoxId = null

                    // Get all workflows deployed
                    const fullFlow = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flows`, {
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
            // Get all workflow patterns in database
            path: '/patterns',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const allPatterns = await model.getAllWorkflowPatterns()
                    res.json(allPatterns)
                } catch (e) {
                    console.error(e)
                    res.json({ error: e })
                }
            }
        },
        {
            // Create a new workflow pattern
            path: '/patterns',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const patternName = req.body.patternName
                    const contextType = req.body.contextType
                    const date = moment().format()
                    let getAllPatterns = await model.getAllWorkflowPatterns()
                    let patternNameExist = false

                    // Test if pattern name already exist
                    getAllPatterns.map(p => {
                        if (p.name.indexOf(patternName) >= 0) {
                            patternNameExist = true
                        }
                    })
                    if (patternNameExist) {
                        res.json({
                            status: 'error_name',
                            msg: 'This flow pattern name is already used'
                        })
                    } else {
                        // Get workflow object to create
                        let tmpFlow = await model.getTmpFlow()
                        const payload = {
                            name: patternName,
                            type: contextType,
                            flow: tmpFlow,
                            created_date: date,
                        }

                        // Create new workflow pattern
                        let addNewPattern = await model.addWorkflowPattern(payload)
                        if (addNewPattern === 'success') {
                            res.json({
                                status: 'success',
                                msg: `The flow pattern "${patternName}" has been added.`
                            })
                        } else {
                            throw 'Error on creating new flow pattern'
                        }
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
            // Update a workflow from an existing workflow patterns
            path: '/loadpattern',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const accessToken = await nodered.getBLSAccessToken()
                    const workspaceId = req.body.workspaceId

                    // Get current BLS workspace
                    const getCurrentWorkspaceFlow = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flow/${workspaceId}`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Node-RED-Deployment-Type': 'flows',
                            'Authorization': accessToken
                        }
                    })
                    const currentFlow = getCurrentWorkspaceFlow.data // GroupedNodes
                    const workspaceLabel = currentFlow.label

                    // Get selected flow pattern data
                    const patternId = req.body.patternId
                    let getPattern = await model.getWorkflowPatternById(patternId)
                    let pattern = getPattern.flow

                    // Format Patten: update id, format workflow for request
                    let formattedPattern = nodered.createFlowPattern(pattern, workspaceId, workspaceLabel)
                    const blsUpdate = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flow/${workspaceId}`, {
                        method: 'put',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Node-RED-Deployment-Type': 'flows',
                            'Authorization': accessToken
                        },
                        data: formattedPattern
                    })

                    // Validation
                    if (blsUpdate.status === 200) {
                        res.json({
                            status: 'success'
                        })
                    } else {
                        throw 'Error on updating flow on the Business Logic Server'
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
            // Save and publish a workflow on BLS
            path: '/publish',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const flowId = req.body.flowId
                    const contextId = req.body.contextId
                    let flowUpdated = false
                    let contextUpdated = false

                    // Get workflow to update
                    const getWorkflow = await model.getFullTmpFlow()
                    const workflow = getWorkflow
                    const formattedFlow = nodered.formatFlowGroupedNodes(workflow)

                    // Publish on BLS
                    const putBls = await nodered.putBLSFlow(flowId, formattedFlow)
                    if (putBls.status === 'success') {
                        flowUpdated = true
                    }

                    // Update context
                    const getContext = await model.getContextById(contextId)
                    let context = getContext[0]
                    context.flow = formattedFlow
                    const updateContext = await model.updateContext(context)
                    if (updateContext === 'success') {
                        contextUpdated = true
                    }

                    if (contextUpdated && flowUpdated) {
                        // STT lexical seeding
                        const sttconfig = context.flow.nodes.filter(c => c.type === 'linto-config-transcribe')[0]
                        const splitHost = sttconfig.host.split('/')
                        const service_name = splitHost[splitHost.length - 1]
                        const sttLexicalSeeding = await axios(`${process.env.ADMIN_URL}/api/stt/lexicalseeding`, {
                            method: 'post',
                            data: {
                                flowId,
                                service_name
                            }
                        })

                        // Tock lexical seeding
                        const nluLexicalSeeding = await axios(`${process.env.ADMIN_URL}/api/tock/lexicalseeding`, {
                            method: 'post',
                            data: {
                                flowId
                            }
                        })

                        // Validation
                        if (sttLexicalSeeding.data.status === 'success' && nluLexicalSeeding.data.status === 'success') {
                            res.json({
                                status: 'success',
                                msg: 'The workflow has been updated'
                            })
                        } else {
                            throw 'Error on lexical seeding'
                        }

                    } else {
                        throw 'Error on updating workflow'
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
            // Get the working temporary workflow object
            path: '/tmp',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const tmpPattern = await model.getFullTmpFlow()
                    res.json([tmpPattern])
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
            // Update the working temporary workflow object
            path: '/tmp',
            method: 'put',
            requireAuth: false,
            controller: async(req, res, next) => {
                try {
                    let payload = req.body.payload
                    let workspaceId = req.body.workspaceId
                    let updateTmpFlow = await model.updateTmpFlow({
                        flow: payload,
                        workspaceId
                    })
                    res.json({ status: updateTmpFlow })
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
                    // FORMAT WORKFLOW
                    const payload = req.body.payload
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

                    // Validtion
                    if (blsPost.status == 200 && blsPost.data) {
                        res.json({
                            status: 'success',
                            msg: 'The worfklow has been deployed',
                            flowId: blsPost.data.id
                        })
                    } else {
                        throw {
                            msg: 'Error on posting flow on the business logic server',
                            code: 'postBls'
                        }
                    }
                } catch (error) {
                    console.error(error.toString())
                    res.json({
                        status: 'error',
                        msg: error.toString()
                    })
                }
            }
        }
    ]
}