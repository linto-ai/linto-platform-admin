const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const sha1 = require('sha1')
const randomstring = require('randomstring')
const usersSchemas = require(`${process.cwd()}/model/mongodb/schemas/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/users.json`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class UsersModel extends MongoModel {
    constructor() {
        super('users')
    }

    // Get a user by its "id"
    async getUser(id) {
        try {
            const query = {
                _id: this.getObjectId(id)
            }
            const user = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(user, usersSchemas)) {
                return user
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get a user by its name
    async getUserByName(userName) {
        try {
            const query = {
                userName: userName
            }
            const user = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(user, usersSchemas)) {
                return user
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get all users
    async getUsers() {
        try {
            const query = {}
            const users = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(users, usersSchemas)) {
                return users
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Update a user data
    async updateUser(payload) {
        try {
            const query = {
                _id: this.getObjectId(payload._id)
            }
            let mutableElements = payload
            delete mutableElements._id

            // compare object with schema
            if (this.testSchema(mutableElements, usersSchemas)) {
                return await this.mongoUpdate(query, mutableElements)
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err

        }
    }

    //Create a user
    async createUser(payload)  {
        try {
            const salt = randomstring.generate(12)
            const passwordHash = sha1(payload.password + salt)
            const userPayload = {
                userName: payload.name,
                email: payload.email,
                pswdHash: passwordHash,
                salt,
                role: "administrator"
            }

            // compare object with schema
            if (this.testSchema(userPayload, usersSchemas)) {
                return await this.mongoInsert(userPayload)
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }
}


module.exports = new UsersModel()