const flowTmpModel = require(`${process.cwd()}/model/mongodb/models/flow-tmp.js`)

module.exports = (webServer) => {
    return [{
            // Get the working temporary workflow object
            // Link : api-docs/#/flow/GetTmpFlow
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Request
                    const tmpPattern = await flowTmpModel.getFullTmpFlow()

                    // Response
                    res.json(tmpPattern)
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on getting temporary flow',
                        error
                    })
                }
            }
        },
        {
            // Update the working temporary workflow object
            // Link : /api-docs/#/flow/UpdateTmpFlow
            path: '/',
            method: 'put',
            requireAuth: false,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    let payload = req.body.payload
                    let workspaceId = req.body.workspaceId

                    // Request
                    let updateTmpFlow = await flowTmpModel.updateTmpFlow({
                        flow: payload,
                        workspaceId
                    })

                    // Response
                    res.json({ status: updateTmpFlow })
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on updating temporary flow',
                        error
                    })
                }
            }
        }
    ]
}