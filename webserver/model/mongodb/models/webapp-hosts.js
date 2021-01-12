const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const WebAppHostsSchema = require(`${process.cwd()}/model/mongodb/schemas/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/webapp_hosts.json`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class WebAppHosts extends MongoModel {
    constructor() {
        super('webapp_hosts')
    }

    // Get all web-application hosts
    async getAllWebAppHosts() {
        try {
            const getAllWebAppHosts = await this.mongoRequest({})

            // compare object with schema
            if (this.testSchema(getAllWebAppHosts, WebAppHostsSchema)) {
                return getAllWebAppHosts
            } else {
                throw 'Invalid document format'
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }

    // Create a web-application hosts
    async createWebAppHost(payload) {
        try {
            const hostPayload = {
                originUrl: payload.originUrl,
                applications: []
            }
            if (this.testSchema(hostPayload, WebAppHostsSchema)) {
                return await this.mongoInsert(hostPayload)
            } else {
                throw 'Invalid document format'
            }

        } catch (error) {
            console.error(error)
            return error
        }
    }

    async updateWebAppHost(payload) {
        try {
            const query = { _id: this.getObjectId(payload._id) }

            // Validation of data structure 
            if (this.testSchema(payload, WebAppHostsSchema)) {
                return await this.mongoUpdate(query, payload)
            } else {
                throw 'Invalid document format'
            }

        } catch (error) {
            console.error(error)
            return error
        }
    }

    // Delete a web-application hosts
    async deleteWebAppHost(id) {
        try {
            const query = { _id: this.getObjectId(id) }
            return await this.mongoDelete(query)
        } catch (error) {
            console.error(error)
            return error
        }
    }

    // Get a web-application hosts by its ID
    async getWebappHostById(id) {
        try {
            const query = { _id: this.getObjectId(id) }
            const getWebappHost = await this.mongoRequest(query)
            if (getWebappHost.length > 0) {
                // compare object with schema
                if (this.testSchema(getWebappHost[0], WebAppHostsSchema)) {
                    return getWebappHost[0]
                } else {
                    throw 'Invalid document format'
                }
            } else {
                throw 'Webapp host not found'
            }
        } catch (error) {
            return { error }
        }
    }

    // Update a web-application hosts
    async updateWebappHost(payload) {
        try {
            const query = { _id: this.getObjectId(payload._id) }

            // Validation of data structure 
            if (this.testSchema(payload, WebAppHostsSchema)) {
                return await this.mongoUpdate(query, payload)
            } else {
                throw 'Invalid document format'
            }

        } catch (error) {
            console.error(error)
            return error
        }
    }

    // Remove an application from all web-application hosts
    async removeApplicationForAllHosts(applicationId) {
        try {
            const query = {
                'applications.applicationId': applicationId
            }
            const operators = {
                pull: {
                    applications: {
                        applicationId: {
                            $in: [applicationId]
                        }
                    }
                }
            }
            return await this.mongoUpdateMany(query, operators)

        } catch (error) {
            console.error(error)
            return error
        }
    }
}

module.exports = new WebAppHosts()