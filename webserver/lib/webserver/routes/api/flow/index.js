const DBmodel = require(`${process.cwd()}/model/${process.env.BDD_TYPE}`)
const model = new DBmodel()
const moment = require('moment')
const axios = require('axios')
const uuid = require('uuid/v1')
/*
  [{tab},{node},{node}...] => {id, label, nodes[]}
*/
function formatFlowGroupedNodes (flow, workspaceId, workspaceLabel) {
  let formattedFlow = {}
  let nodesArray = []

  flow.map(f => {
    if (f.type === 'tab') {
      formattedFlow = {
        id: workspaceId,
        label: workspaceLabel,
        configs: [],
        nodes: []
      }
    } else {
      f.z = workspaceId
      f.id= uuid()
      nodesArray.push(f)
    }
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

module.exports = (webServer) => {
  return [{
      // Get all flows deployed on NodeRed runtime
      path: '/sandbox',
      method: 'get',
      //requireAuth: true,
      controller: async (req, res, next) => {
        try {
          const fullFlow = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flows`, {
            method: 'get'
          })
          let sandBoxId = null
          fullFlow.data.map(f => {
            if (f.type === 'tab' && f.label === "SandBox") {
              sandBoxId = f.id
            }
          })
          res.json({ sandBoxId })
        } catch (e) {
          console.error(e)
          res.json({ error: e })
        }
      }
    },
    {
    path: '/patterns',
    method: 'get',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        const allPatterns = await model.getAllFlowPatterns()
        res.json(allPatterns)
      } catch (e) {
        console.error(e)
        res.json({ error: e })
      }
    }
  },
  {
    path: '/patterns',
    method: 'post',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        const patternName = req.body.patternName
        const contextType = req.body.contextType
        const date = moment().format()
        let getAllPatterns = await model.getAllFlowPatterns()
        let patternNameExist = false
        getAllPatterns.map(p => {
          // Test if pattern name already exist
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
          // Get the flow to save
          let tmpFlow = await model.getTmpFlow()
          const payload = {
            name: patternName,
            type: contextType,
            flow: tmpFlow,
            created_date: date,
          }

          // Create new flow pattern
          let addNewPattern = await model.addFlowPattern(payload)
          if (addNewPattern === 'success') {
            res.json({
              status: 'success',
              msg: `The flow pattern "${patternName}" has been added.`
            })
          } else {
            throw 'Error on creating new flow pattern'
          }
        }
      } catch (e) {
        res.json({
          status: 'error',
          msg: e
        })
      }
    }
  },
  {
    path: '/workflow',
    method: 'put',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        /*const accessToken = await this.getAccessToken()
        const workflow = this.enableFlow(payload)
        // Check if modules need to be installed
        const checkModules = await this.checkForModulesToInstall()*/

        // Get current workspace data

        const workspaceId = req.body.workspaceId

        const getCurrentWorkspaceFlow = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flow/${workspaceId}`,
        {})
        const currentFlow = getCurrentWorkspaceFlow.data // GroupedNodes
        const workspaceLabel = currentFlow.label

        // Get selected flow pattern data
        const patternId = req.body.patternId
        let getPattern = await model.getPattternFlowById(patternId)
        let pattern = getPattern.flow

        // Format Pattern for "PUT" && update IDs
        let formattedPattern = formatFlowGroupedNodes(pattern, workspaceId, workspaceLabel)

        let blsUpdate = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URI}/flow/${workspaceId}`, {
          method: 'put',
          headers: {
            'charset': 'utf-8',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Node-RED-Deployment-Type': 'flows',
            //'Authorization': accessToken
          },
          data: formattedPattern
        })
        if (blsUpdate.status === 200) {
          res.json({
            status: 'success'
          })
        }
        else {
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
  },

  {
    path: '/tmp',
    method: 'get',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        const tmpPattern = await model.getFullTmpFlow()
        res.json([tmpPattern])
      } catch (error) {
        console.error(error)
        res.json({
          status: 'error',
          msg: error
        })
      }
    }
  },
  {
    path: '/tmp',
    method: 'put',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        let payload = req.body.payload
        let workspaceId = req.body.workspaceId
        let updateTmpFlow = await model.updateTmpFlow({
          flow: payload,
          workspaceId //curent active workspace
        })
        res.json({status: updateTmpFlow})
      } catch (error) {
        console.error(error)
        res.json({
          status: 'error',
          msg: error
        })
      }
    }
  }]
}
