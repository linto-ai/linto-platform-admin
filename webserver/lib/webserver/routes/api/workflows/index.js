const workflowsStaticModel = require(`${process.cwd()}/model/mongodb/models/workflows-static.js`)
const workflowsApplicationModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)
const clientsStaticModel = require(`${process.cwd()}/model/mongodb/models/clients-static.js`)
const tmpFlowModel = require(`${process.cwd()}/model/mongodb/models/flow-tmp.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const lexSeed = require(`${process.cwd()}/lib/webserver/middlewares/lexicalseeding.js`)
const moment = require('moment')

module.exports = (webServer) => {
    return [{
            // Update a static workflow services parameters
            /* 
            payload = {
              workflowName,
              sttServiceLanguage,
              sttService,
              tockApplicationName,
            }
            */
            path: '/:id/services',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload
                    const workflowId = req.params.id
                    let getWorkflow = []

                    // Get static workflow object
                    if (payload.type === 'static') {
                        getWorkflow = await workflowsStaticModel.getStaticWorkflowById(workflowId)

                    } else if (payload.type === 'application') {
                        getWorkflow = await workflowsApplicationModel.getApplicationWorkflowById(workflowId)
                    }
                    let workflowPayload = getWorkflow

                    // set worlflow name
                    workflowPayload.name = payload.workflowName
                    workflowPayload.description = payload.workflowDescription
                    workflowPayload.flow.label = payload.workflowName

                    // set worlflow language
                    const nodeConfig = workflowPayload.flow.nodes.filter(node => node.type === 'linto-config')
                    if (nodeConfig.length > 0) {
                        nodeConfig[0].language = payload.sttServiceLanguage
                    }

                    // set STT service 
                    const nodeSttConfig = workflowPayload.flow.configs.filter(node => node.type === 'linto-config-transcribe')
                    if (nodeSttConfig.length > 0) {
                        nodeSttConfig[0].commandOffline = payload.sttCommandService
                        nodeSttConfig[0].largeVocabStreaming = payload.largeVocabStreaming
                        nodeSttConfig[0].largeVocabOffline = payload.largeVocabOffline
                    }

                    // set Tock application
                    const nodeNluConfig = workflowPayload.flow.configs.filter(node => node.type === 'linto-config-evaluate')
                    if (nodeNluConfig.length > 0) {
                        nodeNluConfig[0].appname = payload.tockApplicationName
                    }

                    let updateWorkflow = null

                    if (payload.type === 'static') {
                        // Update static workflow
                        updateWorkflow = await workflowsStaticModel.updateStaticWorkflow(workflowPayload)
                    } else if (payload.type === 'application') {
                        // Update application workflow
                        updateWorkflow = await workflowsApplicationModel.updateApplicationWorkflow(workflowPayload)
                    }

                    if (updateWorkflow === 'success') {
                        if (payload.type === 'static') {
                            // STATIC WORKFLOW
                            // Update static device 
                            const updateStaticDevice = await clientsStaticModel.updateStaticClient({
                                sn: workflowPayload.associated_device,
                                associated_workflow: {
                                    _id: workflowId,
                                    name: workflowPayload.name
                                }
                            })
                            if (updateStaticDevice === 'success') {
                                // Update workflow on BLS (put)
                                const updateBls = await nodered.putBLSFlow(workflowPayload.flowId, workflowPayload.flow)

                                // Resonse
                                if (updateBls.status === 'success') {
                                    res.json({
                                        status: 'success',
                                        msg: `The device application "${payload.workflowName}" has been updated`
                                    })
                                } else {
                                    throw `Error on updating device application ${getWorkflow.name} on Business logic server`
                                }
                            } else {
                                throw `Error on updating associated device "${workflowPayload.associated_device}"`
                            }

                        } else if (payload.type === 'application') {
                            // APPLICATION WORKFLOW
                            // Update workflow on BLS (put)
                            const updateBls = await nodered.putBLSFlow(workflowPayload.flowId, workflowPayload.flow)

                            // Resonse
                            if (updateBls.status === 'success') {
                                res.json({
                                    status: 'success',
                                    msg: `The multi-user application "${payload.workflowName}" has been updated`
                                })
                            } else {
                                throw `Error on updating multi-user application ${getWorkflow.name} on Business logic server`
                            }
                        }
                    } else {
                        throw `Error on updating multi-user application ${getWorkflow.name}`
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            path: '/saveandpublish',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload

                    // Get tmp flow
                    const getTmpFlow = await tmpFlowModel.getTmpFlow()
                    const formattedFlow = nodered.formatFlowGroupedNodes(getTmpFlow)

                    // Update BLS
                    const putBls = await nodered.putBLSFlow(payload.noderedFlowId, formattedFlow)
                    if (putBls.status === 'success') {
                        const getUdpatedFlow = await nodered.getFlowById(payload.noderedFlowId)
                        let updateWorkflow

                        if (payload.type === 'static') { // Static
                            // update static workflow
                            updateWorkflow = await workflowsStaticModel.updateStaticWorkflow({
                                _id: payload.workflowId,
                                flow: getUdpatedFlow,
                                updated_date: moment().format()
                            })
                        } else if (payload.type === 'application') { // Application
                            // update application workflow
                            updateWorkflow = await workflowsApplicationModel.updateApplicationWorkflow({
                                _id: payload.workflowId,
                                flow: getUdpatedFlow,
                                updated_date: moment().format()
                            })
                        }
                        if (updateWorkflow === 'success') {
                            // Lexical Seeding
                            const sttService = formattedFlow.nodes.filter(f => f.type === 'linto-config-transcribe')
                            if (sttService.length > 0 && !!sttService[0].commandOffline) {
                                const lexicalSeeding = await lexSeed.doLexicalSeeding(sttService[0].commandOffline, payload.noderedFlowId)
                                if (lexicalSeeding.status === 'success') {
                                    res.json({
                                        status: 'success',
                                        msg: `The application "${payload.workflowName}" has been updated`
                                    })
                                } else {
                                    throw {
                                        msg: 'Workflow updated but error on lexical seeding',
                                        lexicalSeeding
                                    }
                                }
                            }
                        } else {
                            throw  `Error on updating application "${payload.workflowName}"`
                        }
                    } else {
                        throw 'Error on updating flow on Business Logic Server'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: !!error.msg ? error.msg : 'Error on updating workflow',
                        error
                    })
                }
            }
        }
    ]
}