const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const workflowsTemlatesSchema = require(`${process.cwd()}/model/mongodb/schemas/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/workflows_templates.json`)
class WorkflowsTemplates extends MongoModel {
    constructor() {
        super('workflows_templates')
    }

    // Get all LinTO static devices from database
    async getAllWorkflowsTemplates() {
        try {
            const getAllWorkflowsTemplates = await this.mongoRequest({})

            // compare object with schema
            if (this.testSchema(getAllWorkflowsTemplates, workflowsTemlatesSchema)) {
                return getAllWorkflowsTemplates
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getWorkflowTemplateByName(name) {
        try {
            const getWorkflow = await this.mongoRequest({ name })

            // compare object with schema
            if (this.testSchema(getWorkflow[0], workflowsTemlatesSchema)) {
                return getWorkflow[0]
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Create a new workflow template
    async addWorkflowTemplate(payload) {
        try {
            // compare object with schema
            if (this.testSchema(payload, workflowsTemlatesSchema)) {
                return await this.mongoInsert(payload)
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Delete a workflow template
    async deleteWorkflowTemplate(id) {
        try {
            const query = { _id: this.getObjectId(id) }
            return await this.mongoDelete(query)
        } catch (err) {
            console.error(err)
            return err
        }
    }
}
module.exports = new WorkflowsTemplates()