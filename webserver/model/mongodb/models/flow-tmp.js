const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const flowPatternTmpSchema = require(`${process.cwd()}/model/mongodb/schemas/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/flow_tmp.json`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class FlowPatternTmpModel extends MongoModel {

    constructor() {
        super('flow_tmp')
    }

    // Get formatted object of the workflow that you are working on
    async getFullTmpFlow() {
        try {
            const query = {}
            const tmpFlow = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(tmpFlow, flowPatternTmpSchema)) {
                let tmpFlowUnformatted = tmpFlow[0].flow
                let formattedFlow = []
                tmpFlowUnformatted.map(tmp => {
                    if ((formattedFlow.filter(f => f.id === tmp.id)).length === 0) {
                        formattedFlow.push(tmp)
                    }
                })
                return formattedFlow
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            return err
        }
    }

    // Get current working workflow
    async getTmpFlow() {
        try {
            const query = {}
            const tmpFlow = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(tmpFlow, flowPatternTmpSchema)) {
                return tmpFlow[0].flow

            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            return err
        }
    }

    // update current working workflow
    async updateTmpFlow(payload) {
        try {
            const query = {
                id: "tmp"
            }
            const queryPayload = {
                flow: payload.flow,
                workspaceId: payload.workspaceId
            }

            // compare object with schema
            if (this.testSchema(queryPayload, flowPatternTmpSchema)) {
                return await this.mongoUpdate(query, queryPayload)
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }
}


module.exports = new FlowPatternTmpModel()