const axios = require('axios')
const uuid = require('uuid/v1')
const middlewares = require('./index.js')
const md5 = require('md5')

/**
 * @desc Format a nodered flow object to be send by POST/PUT
 */
function formatFlowGroupedNodes(flow) {
    let formattedFlow = {}
    let nodes = []
    let registeredIds = []
    flow.map(f => {
        if (f.type === 'tab') {
            formattedFlow.id = f.id
            formattedFlow.label = f.label
            formattedFlow.configs = []
            formattedFlow.nodes = []
            registeredIds.push(f.id)
        } else {
            if (registeredIds.indexOf(f.id) < 0) {
                registeredIds.push(f.id)
                nodes.push(f)
            }
        }
    })
    formattedFlow.nodes = nodes

    if (formattedFlow.nodes[0].type !== 'tab') {
        const configIndex = formattedFlow.nodes.findIndex(flow => flow.type === 'linto-config')
        let tmpIndex0 = formattedFlow.nodes[0]
        let tmpConfig = formattedFlow.nodes[configIndex]
        formattedFlow.nodes[0] = tmpConfig
        formattedFlow.nodes[configIndex] = tmpIndex0
    }
    return formattedFlow
}


/**
 * @desc Generate a workflow from a "device application" template to be posted on nodered 
 * @param {object} flow - selected worklow template 
 * @param {object} payload - data to be updated
 * @return {object} formatted flow
 */
function generateDeviceApplicationWorkflowFromTemplate(flow, payload) {
    const flowId = uuid()
    const mqttId = flowId + '-mqtt'
    const nluId = flowId + '-nlu'
    const sttId = flowId + '-stt'
    const configId = flowId + '-config'

    let idMap = [] // ID correlation array
    let nodesArray = []
    flow.filter(node => node.type === 'linto-config').map(f => {
        // Update language
        f.language = payload.language

        // Update linto-config node ID
        idMap[f.id] = configId
        f.id = configId

        // Update config-transcribe node ID
        idMap[f.configTranscribe] = sttId
        f.configTranscribe = sttId

        // Update config-mqtt node ID
        idMap[f.configMqtt] = mqttId
        f.configMqtt = mqttId

        // Update config-nlu node ID
        idMap[f.configEvaluate] = nluId
        f.configEvaluate = nluId

        nodesArray.push(f)
    })

    flow.filter(node => node.type !== 'tab' && node.type !== 'linto-config').map(f => {
        // uppdate STT node
        if (f.type === 'linto-config-transcribe') {
            f.id = sttId
            f.host = process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE
            f.api = 'linstt'
            f.commandOffline = payload.stt.service_name
            f.largeVocabStreaming = payload.stt.lv_online
            f.largeVocabOffline = payload.stt.lv_offline
        }
        // uppdate NLU node
        else if (f.type === 'linto-config-evaluate') {
            f.id = nluId
            f.api = 'tock'
            f.host = `${process.env.LINTO_STACK_TOCK_NLP_API}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}`
            f.appname = payload.nlu.app_name
            f.namespace = 'app'
        }
        // uppdate MQTT node
        else if (f.type === 'linto-config-mqtt') {
            f.id = mqttId
            f.host = process.env.LINTO_STACK_MQTT_HOST
            f.port = process.env.LINTO_STACK_MQTT_PORT
            f.scope = process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE
            f.login = process.env.LINTO_STACK_MQTT_USER
            f.password = process.env.LINTO_STACK_MQTT_PASSWORD
        }
        // Update Terminal-in node > serial number
        else {
            if (f.type === 'linto-terminal-in') {
                f.id = uuid()
                f.sn = payload.sn
            }

            if (typeof(idMap[f.id]) === 'undefined') {
                idMap[f.id] = uuid()
            }
            f.id = idMap[f.id]
            f.z = flowId

            if (!!f.wires) {
                for (let i = 0; i < f.wires.length; i++) {
                    if (typeof(idMap[f.wires[i]]) === 'undefined') {
                        idMap[f.wires[i]] = uuid()
                    }
                    f.wires[i] = idMap[f.wires[i]]
                }
            }
        }
        nodesArray.push(f)
    })
    const formattedFlow = {
        label: payload.workflowName,
        configs: [],
        nodes: nodesArray,
        id: flowId
    }
    return formattedFlow
}





/**
 * @desc Generate a workflow from a "multi-user application" template to be posted on nodered 
 * @param {object} flow - selected worklow template 
 * @param {object} payload - data to be updated
 * @return {object} formatted flow
 */
function generateMultiUserApplicationWorkflowFromTemplate(flow, payload) {
    const flowId = uuid()
    const mqttId = flowId + '-mqtt'
    const nluId = flowId + '-nlu'
    const sttId = flowId + '-stt'
    const configId = flowId + '-config'

    let idMap = [] // ID correlation array
    let nodesArray = []
    flow.filter(node => node.type === 'linto-config').map(f => {
        // Update language
        f.language = payload.language

        // Update linto-config node ID
        idMap[f.id] = configId
        f.id = configId

        // Update config-transcribe node ID
        idMap[f.configTranscribe] = sttId
        f.configTranscribe = sttId

        // Update config-mqtt node ID
        idMap[f.configMqtt] = mqttId
        f.configMqtt = mqttId

        // Update config-nlu node ID
        idMap[f.configEvaluate] = nluId
        f.configEvaluate = nluId

        nodesArray.push(f)
    })

    flow.filter(node => node.type !== 'tab' && node.type !== 'linto-config').map(f => {
        // uppdate STT node
        if (f.type === 'linto-config-transcribe') {
            f.id = sttId
            f.host = process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE
            f.api = 'linstt'
            f.commandOffline = payload.stt.service_name
            f.largeVocabStreaming = payload.stt.lv_online
            f.largeVocabOffline = payload.stt.lv_offline
        }
        // uppdate NLU node
        else if (f.type === 'linto-config-evaluate') {
            f.id = nluId
            f.api = 'tock'
            f.host = `${process.env.LINTO_STACK_TOCK_NLP_API}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}`
            f.appname = payload.nlu.app_name
            f.namespace = 'app'
        }
        // uppdate MQTT node
        else if (f.type === 'linto-config-mqtt') {
            f.id = mqttId
            f.host = process.env.LINTO_STACK_MQTT_HOST
            f.port = process.env.LINTO_STACK_MQTT_PORT
            f.scope = 'app' + md5(payload.workflowName)
            f.login = process.env.LINTO_STACK_MQTT_USER
            f.password = process.env.LINTO_STACK_MQTT_PASSWORD
        } else {
            if (typeof(idMap[f.id]) === 'undefined') {
                idMap[f.id] = uuid()
            }
            f.id = idMap[f.id]
            f.z = flowId

            if (!!f.wires) {
                for (let i = 0; i < f.wires.length; i++) {
                    if (typeof(idMap[f.wires[i]]) === 'undefined') {
                        idMap[f.wires[i]] = uuid()
                    }
                    f.wires[i] = idMap[f.wires[i]]
                }
            }
        }
        nodesArray.push(f)
    })
    const formattedFlow = {
        label: payload.workflowName,
        configs: [],
        nodes: nodesArray,
        id: flowId
    }
    return formattedFlow
}
/**
 * @desc Get a business logic server bearer token
 * @return {string}
 */

async function getBLSAccessToken() {
    if (!process.env.LINTO_STACK_BLS_USE_LOGIN || process.env.LINTO_STACK_BLS_USE_LOGIN === 'false') {
        return ''
    }
    const login = process.env.LINTO_STACK_BLS_USER
    const pswd = process.env.LINTO_STACK_BLS_PASSWORD
    const request = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/auth/token`, {
        method: 'post',
        data: {
            "client_id": "node-red-admin",
            "grant_type": "password",
            "scope": "*",
            "username": login,
            "password": pswd
        }
    })
    return 'Bearer ' + request.data.access_token
}
/**
 * @desc PUT request on business-logic-server
 * @return {object} {status, msg, error(optional)}
 */
async function putBLSFlow(flowId, workflow) {
    try {
        const accessToken = await getBLSAccessToken()
        let blsUpdate = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/flow/${flowId}`, {
            method: 'put',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            },
            data: workflow
        })
        if (blsUpdate.status == 200) {
            return {
                status: 'success'
            }
        } else {
            throw 'Error on updating flow on the Business Logic Server'
        }
    } catch (error) {
        console.error(error)
        return {
            status: 'error',
            msg: error,
            error
        }
    }
}

/**
 * @desc POST request on business-logic-server
 * @param {object} flow - flow object to be send
 * @return {object} {status, msg, error(optional)}
 */
async function postBLSFlow(flow) {
    try {
        const accessToken = await getBLSAccessToken()
        let blsPost = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/redui/flow`, {
            method: 'post',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            },
            data: flow
        })

        // Validtion
        if (blsPost.status == 200 && blsPost.data) {
            return {
                status: 'success',
                msg: 'The worfklow has been deployed',
                flowId: blsPost.data.id
            }
        } else {
            throw {
                msg: 'Error on posting flow on the business logic server'
            }
        }
    } catch (error) {
        console.error(error)
        return {
            status: 'error',
            msg: !!error.msg ? error.msg : 'Error on posting flow on business logic server',
            error
        }
    }
}

/**
 * @desc DELETE request on business-logic-server
 * @param {string} flowId - id of the nodered flow
 * @return {object} {status, msg, error(optional)}
 */
async function deleteBLSFlow(flowId) {
    try {
        const accessToken = await getBLSAccessToken()
        let blsDelete = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/redui/flow/${flowId}`, {
                method: 'delete',
                headers: {
                    'charset': 'utf-8',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Node-RED-Deployment-Type': 'flows',
                    'Authorization': accessToken
                },
            })
            // Validtion
        if (blsDelete.status == 204) {
            return {
                status: 'success',
                msg: 'The worfklow has been removed'
            }
        } else {
            throw {
                msg: 'Error on deleting flow on the business logic server'
            }
        }
    } catch (error) {
        console.error(error)
        return {
            status: 'error',
            error
        }
    }
}

/**
 * @desc request on business-logic-server to get a worflow by its id
 * @param {string} id - id of the nodered flow
 * @return {object} {status, msg, error(optional)}
 */
async function getFlowById(id) {
    try {
        const accessToken = await getBLSAccessToken()
        let getFlow = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/redui/flow/${id}`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            }
        })
        return getFlow.data
    } catch (error) {
        return {
            status: 'error',
            msg: error,
            error
        }
    }
}
module.exports = {
    deleteBLSFlow,
    formatFlowGroupedNodes,
    getBLSAccessToken,
    generateMultiUserApplicationWorkflowFromTemplate,
    generateDeviceApplicationWorkflowFromTemplate,
    getFlowById,
    postBLSFlow,
    putBLSFlow,
}