const debug = require('debug')('linto-admin:middlewares')
const uuid = require('uuid/v1')
const axios = require('axios')
function isProduction() {
  return process.env.NODE_ENV === 'production'
}

function logger(req, res, next) {
  debug(`[${Date.now()}] new user entry on ${req.url}`)
  next()
}

function checkAuth(req, res, next) {
  //if (isProduction()) {
    // If not connectedd
    debug(req.session)

    if (!!req && !!req.session) {
      if (!!req.session.logged) {
        debug(req.session.logged)
        if (req.session.logged == 'on' && req.url == '/login') {
          req.session.save((err) => {
            if (err && err != 'undefined') {
              console.error('Err:', err)
            }
          })
          //res.redirect('/admin/linto')
          res.redirect('/admin')
        } else if (req.session.logged == 'on' && req.url != '/login') {
          next()
        } else if (req.session.logged != 'on' && req.url != '/login') {
          res.redirect('/login')
        }
        else if (req.session.logged != 'on' && req.url == '/login') {
          next()
        }
      } else {
        if (req.url != '/login') {
          res.redirect('/login')
        } else {
          next()
        }
      }
    } else {
      res.redirect('/sessionNotFound')
    }
  /*} else {
    next()
  }*/
}

function createFlowPattern (flow, workspaceId, workspaceLabel) {
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
  {id, label, nodes[]} => [{tab},{node},{node}...]
*/
function formaFlowSplitNodes (flow, workspaceId) {
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

/* update existing workflow with a flow pattern */
function updateGroupedNodesId (workFlow, patternFlow) {
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

function generateContextFlow (flow, payload) {
  console.log(payload)
  const flowId = uuid()
  const mqttId = flowId + '-mqtt'
  const nluId = flowId + '-nlu'
  const sttId = flowId +'-stt'
  const configId = flowId + '-config'
  let formattedFlow = {
    label: payload.context_name,
    configs: [],
    nodes: []
  }
  let idMap = [] // ID correlation array
  let nodesArray = []
  flow.filter(node => node.type !== 'tab').map(f => {
    if (f.type === 'linto-config') {
      // Update language
      f.language = payload.stt.configs.lang

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
      f.host = `${process.env.SERVICE_MANAGER_URL}/${payload.stt.configs.serviceId}/transcribe`
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

      for(let i = 0; i < f.wires.length; i++) {
        if (typeof(idMap[f.wires[i]]) === 'undefined') {
          idMap[f.wires[i]] = uuid()
        }
        f.wires[i] = idMap[f.wires[i]]
      }
    }
    nodesArray.push(f)
  })

  formattedFlow.nodes = nodesArray
  return formattedFlow
}

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

module.exports = {
  checkAuth,
  createFlowPattern,
  formaFlowSplitNodes,
  getBLSAccessToken,
  generateContextFlow,
  updateGroupedNodesId,
  logger
}
