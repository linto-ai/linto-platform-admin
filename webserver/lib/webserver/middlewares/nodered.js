const axios = require('axios')
const uuid = require('uuid/v1')

/* Format a workflow pattern to be post in database */
function createFlowPattern(flow, workspaceId, workspaceLabel) {
    let formattedFlow = {
        id: workspaceId,
        label: workspaceLabel,
        configs: [],
        nodes: []
    }
    let nodesArray = []
    flow.filter(node => node.type !== 'tab').map(f => {
        f.z = workspaceId
        f.id = uuid()
        nodesArray.push(f)
    })
    formattedFlow.nodes = nodesArray
    return formattedFlow
}

/*
  Format a nodered flow from grouped nodes to splitted nodes
  {id, label, nodes[]} => [{tab},{node},{node}...]
*/
function formaFlowSplitNodes(flow, workspaceId) {
    let formattedFlow = []
    let tabNode = {
        id: workspaceId,
        type: 'tab',
        label: flow.label,
        disabled: false,
        info: ''
    }
    formattedFlow.push(tabNode)

    flow.nodes.map(n => {
        formattedFlow.push(n)
    })
    return formattedFlow
}
/*
  Format a nodered flow from splitted nodes to grouped nodes
  [{tab},{node},{node}...] => {id, label, nodes[]}
*/
function formatFlowGroupedNodes(flow) {
    let formattedFlow = {}
    let nodes = []
    flow.map(f => {
        if (f.type === 'tab') {
            formattedFlow.id = f.id
            formattedFlow.label = f.label
            formattedFlow.configs = []
            formattedFlow.nodes = []
        } else  {
            nodes.push(f)
        }
    })
    formattedFlow.nodes = nodes
    return formattedFlow
}

/* Update an existing workflow with a flow pattern */
function updateGroupedNodesId(workFlow, patternFlow) {
    const workspaceId = workFlow.id
    let formatted = workFlow
    let updatedNodes = []
    patternFlow.flow.map(p => {
        if (p.type !== 'tab') {
            if (p.z !== workspaceId) {
                p.z = workspaceId
            }
            updatedNodes.push(p)
        }
    })
    formatted.nodes = updatedNodes
    return formatted
}
/* Generate a workflow to be posted on BLS */
function generateContextFlow(flow, payload) {
    const flowId = uuid()
    const mqttId = flowId + '-mqtt'
    const nluId = flowId + '-nlu'
    const sttId = flowId + '-stt'
    const configId = flowId + '-config'

    let idMap = [] // ID correlation array
    let nodesArray = []
    flow.filter(node => node.type !== 'tab').map(f => {
        if (f.type === 'linto-config') {
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

        }
        // uppdate STT node
        else if (f.type === 'linto-config-transcribe') {
            f.id = sttId
            f.host = `${process.env.SERVICE_MANAGER_URL}/${payload.stt.service_name}`
            f.api = 'linstt'
        }
        // uppdate NLU node
        else if (f.type === 'linto-config-evaluate') {
            f.id = nluId
            f.api = payload.nlu.service_name
            f.host = payload.nlu.configs.host
            f.appname = payload.nlu.configs.appname
            f.namespace = payload.nlu.configs.namespace
        }
        // uppdate MQTT node
        else if (f.type === 'linto-config-mqtt') {
            f.id = mqttId
            f.host = payload.mqtt.host
            f.port = payload.mqtt.port
            f.scope = payload.mqtt.scope
            nodesArray.push(f)
        } else {
            if (typeof(idMap[f.id]) === 'undefined') {
                idMap[f.id] = uuid()
            }
            f.id = idMap[f.id]

            for (let i = 0; i < f.wires.length; i++) {
                if (typeof(idMap[f.wires[i]]) === 'undefined') {
                    idMap[f.wires[i]] = uuid()
                }
                f.wires[i] = idMap[f.wires[i]]
            }
        }
        nodesArray.push(f)
    })
    const formattedFlow = {
        label: payload.context_name,
        configs: [],
        nodes: nodesArray
    }
    return formattedFlow
}

/* Get a business logic server bearer token */
async function getBLSAccessToken() {
    if (!process.env.BLS_AUTH || process.env.BLS_AUTH === 'false') {
        return ''
    }
    const login = process.env.BLS_LOGIN
    const pswd = process.env.BLS_PSWD
    const request = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/auth/token`, {
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

async function putBLSFlow(flowId, workflow) {
    try {
        const accessToken = await getBLSAccessToken()
        let blsUpdate = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flow/${flowId}`, {
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
    } catch (err) {
        console.error(err)
        return {
            status: 'error',
            msg: err
        }
    }
}

module.exports = {
    createFlowPattern,
    formaFlowSplitNodes,
    formatFlowGroupedNodes,
    getBLSAccessToken,
    generateContextFlow,
    putBLSFlow,
    updateGroupedNodesId
}