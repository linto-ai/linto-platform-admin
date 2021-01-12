const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const clientsStaticSchema = require(`${process.cwd()}/model/mongodb/schemas/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/clients_static.json`)
const moment = require('moment')

class ClientsStaticModel extends MongoModel {
    constructor() {
        super('clients_static')
    }

    // Get all static devices from database
    async getAllStaticClients() {
        try {
            const getClients = await this.mongoRequest({})

            // Validation of data structure 
            if (this.testSchema(getClients, clientsStaticSchema)) {
                return getClients
            } else {
                throw 'Invalid document format'
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }

    // Get a static device targeted by its serial number
    async getStaticClientBySn(sn) {
        try {
            const getClient = await this.mongoRequest({ sn })

            // Validation of data structure 
            if (this.testSchema(getClient, clientsStaticSchema)) {
                return getClient[0]
            } else {
                throw 'Invalid document format'
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }

    // Add a static device by giving a serial number
    async addStaticClient(sn) {
        try {
            const payload = {
                sn,
                enrolled: true,
                associated_workflow: null,
                connexion: 'offline',
                last_up: null,
                last_down: moment().format(),
                config: {},
                meeting: []
            }
            if (this.testSchema(payload, clientsStaticSchema)) {
                const addStaticClient = await this.mongoInsert(payload)
                return addStaticClient
            } else {
                throw 'Invalid document format'
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }

    // Update a static device targeted by its serial number
    async updateStaticClient(payload) {
        try {
            if (!payload.sn) {
                throw 'A serial number must be provided'
            }
            const query = { sn: payload.sn }
            const updateClient = await this.mongoUpdate(query, payload)

            // Validation of data structure 
            const getUpdatedClient = await this.mongoRequest({ sn: payload.sn })
            if (this.testSchema(getUpdatedClient[0], clientsStaticSchema)) {
                return updateClient
            } else {
                throw 'Invalid document format'
            }

        } catch (error) {
            console.error(error)
            return error
        }
    }

    // Delete a static device targeted by its serial number
    async deleteStaticDevice(sn) {
        try {
            return await this.mongoDelete({ sn })
        } catch (error) {
            console.error(error)
            return error
        }
    }
}

module.exports = new ClientsStaticModel()