const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const workflowsStaticSchema = require(`${process.cwd()}/model/mongodb/schemas/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/workflows_static.json`)
const moment = require('moment')

class WorkflowsStaticModel extends MongoModel {
    constructor() {
        super('workflows_static')
    }

    // Get all LinTO static devices from database
    async getAllStaticWorkflows() {
        try {
            const getAllStaticWorkflows = await this.mongoRequest({})

            // compare object with schema
            if (this.testSchema(getAllStaticWorkflows, workflowsStaticSchema)) {
                return getAllStaticWorkflows
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }
    async getStaticWorkflowByName(name) {
        try {
            const query = { name }
            const getWorkflow = await this.mongoRequest(query)
            if (getWorkflow.length > 0) {
                // compare object with schema
                if (this.testSchema(getWorkflow[0], workflowsStaticSchema)) {
                    return getWorkflow[0]
                } else {
                    throw 'Invalid document format'
                }
            } else {
                throw 'Static workflow not found'
            }
        } catch (error) {
            console.error(error)
            return { error }
        }

    }
    async getStaticWorkflowById(id) {
        try {
            const query = { _id: this.getObjectId(id) }
            const getWorkflow = await this.mongoRequest(query)
            if (getWorkflow.length > 0) {
                // compare object with schema
                if (this.testSchema(getWorkflow[0], workflowsStaticSchema)) {
                    return getWorkflow[0]
                } else {
                    throw 'Invalid document format'
                }
            } else {
                throw 'Static workflow not found'
            }
        } catch (error) {
            console.error(error)
            return { error }
        }
    }

    async updateStaticWorkflow(payload) {
        try {
            const query = { _id: this.getObjectId(payload._id) }
            let data = payload
            data.updated_date = moment().format()
            const updateWorkflow = await this.mongoUpdate(query, data)

            if (updateWorkflow === 'success') {
                // Validation of data structure 
                const getUpdatedWorkflow = await this.mongoRequest(query)
                if (this.testSchema(getUpdatedWorkflow[0], workflowsStaticSchema)) {
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

    async postStaticWorkflow(payload) {
        try {
            // compare object with schema
            if (this.testSchema(payload, workflowsStaticSchema)) {
                return await this.mongoInsert(payload)
            } else {
                throw 'Invalid document format'
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }

    async deleteStaticWorkflowById(payload) {
        try {
            const query = { _id: this.getObjectId(payload._id) }
            const deleteWorkflow = await this.mongoDelete(query)
            return deleteWorkflow
        } catch (error) {
            console.error(error)
            return error
        }
    }
}
module.exports = new WorkflowsStaticModel()