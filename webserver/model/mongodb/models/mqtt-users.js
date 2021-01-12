const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const MqttUsersSchema = require(`${process.cwd()}/model/mongodb/schemas/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/mqtt_users.json`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class MqttUsersModel extends MongoModel {
    constructor() {
        super('mqtt_users')
    }
    async deleteMqttUserByEmail(email) {
        try {
            const query = { email }
            return await this.mongoDelete(query)
        } catch (error) {
            console.error(error)
            return error
        }
    }
}

module.exports = new MqttUsersModel()