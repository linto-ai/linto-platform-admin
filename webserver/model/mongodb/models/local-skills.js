const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const localSkillsSchema = require(`${process.cwd()}/model/mongodb/schemas/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/local_skills.json`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class LocalSkillsModel extends MongoModel {

    constructor() {
        super('local_skills')
    }

    // Get all local skill
    async getLocalSkills() {
        try {
            const query = {}
            const localSkills = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(localSkills, localSkillsSchema)) {
                return localSkills
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            return err
        }
    }

    // Add a local skill
    async addLocalSkill(payload) {
        try {
            if (this.testSchema(payload, localSkillsSchema)) {
                const addLocalSkill = await this.mongoInsert(payload)
                return addLocalSkill
            } else {
                throw 'Invalid document format'
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }

    // Delete a local skill
    async removeLocalSkill(id) {
        try {
            const query = { _id: this.getObjectId(id) }
            return await this.mongoDelete(query)
        } catch (err) {
            console.error(err)
            return err
        }
    }
}


module.exports = new LocalSkillsModel()