const workflowTemplatesModel = require(`${process.cwd()}/model/mongodb/models/workflows-templates.js`)

module.exports = (webServer) => {
    return [{
        // Get all flow templatesfrom database
        path: '/',
        method: 'get',
        requireAuth: true,
        controller: async(req, res, next) => {
            try {
                // Request
                const getWorkflowTemplates = await workflowTemplatesModel.getAllWorkflowsTemplates()

                // Response
                res.json(getWorkflowTemplates)
            } catch (error) {
                console.error(error)
                res.json({
                    status: 'error',
                    error
                })
            }
        }
    }]
}