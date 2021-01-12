const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const applicationWorkflowsSchema = require(`${process.cwd()}/model/mongodb/schemas/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/workflows_application.json`)
const moment = require('moment')
class workflowsApplication extends MongoModel {
    constructor() {
        super('workflows_application')
    }

    // Get all application workflows
    async getAllApplicationWorkflows() {
        try {
            const getApplications = await this.mongoRequest({})

            // Validation of data structure 
            if (this.testSchema(getApplications, applicationWorkflowsSchema)) {
                return getApplications
            } else {
                throw 'Invalid document format'
            }

        } catch (error) {
            console.error(error)
            return error
        }
    }

    async getApplicationWorkflowById(workflowId) {
        try {
            const query = { _id: this.getObjectId(workflowId) }
            const getApplicationWorkflow = await this.mongoRequest(query)
            if (getApplicationWorkflow.length > 0) {
                // compare object with schema
                if (this.testSchema(getApplicationWorkflow[0], applicationWorkflowsSchema)) {
                    return getApplicationWorkflow[0]
                } else {
                    throw 'Invalid document format'
                }
            } else  {
                throw 'Application workflow not found'
            }
        } catch (error) {
            return { error }
        }
    }
    async deleteApplicationWorkflow(workflowId) { 
        try {
            const query = { _id: this.getObjectId(workflowId) }
            return await this.mongoDelete(query)
        } catch (error) {
            return error

        }
    }
    async updateApplicationWorkflow(payload) {
        try {
            const query = { _id: this.getObjectId(payload._id) }
            let data = payload
            data.updated_date = moment().format()
            const updateWorkflow = await this.mongoUpdate(query, data)

            if (updateWorkflow === 'success') {
                // Validation of data structure 
                const getUpdatedWorkflow = await this.mongoRequest(query)
                if (this.testSchema(getUpdatedWorkflow[0], applicationWorkflowsSchema)) {
                    return 'success'
                } else {
                    throw 'Invalid document format'
                }
            } else {
                throw 'Error on updating Workflow'
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }
    async postApplicationWorkflow(payload) {
        try {
            // compare object with schema
            if (this.testSchema(payload, applicationWorkflowsSchema)) {
                return await this.mongoInsert(payload)
            } else {
                throw 'Invalid document format'
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }

}

module.exports = new workflowsApplication()