const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const AndroidUsersSchema = require(`${process.cwd()}/model/mongodb/schemas/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/android_users.json`)
const randomstring = require('randomstring')
const sha1 = require('sha1')

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class AndroidUsersModel extends MongoModel {
    constructor() {
        super('android_users')
    }

    // Get all android applications users
    async getAllAndroidUsers() {
        try {
            const getAllAndroidUsers = await this.mongoRequest({})

            // compare object with schema
            if (this.testSchema(getAllAndroidUsers, AndroidUsersSchema)) {
                let filteredData = []
                getAllAndroidUsers.map(user => {
                    filteredData.push({
                        _id: user._id,
                        email: user.email,
                        applications: user.applications

                    })
                })
                return filteredData
            } else {
                throw 'Invalid document format'
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }

    async getUserByEmail(email) {
        try {
            const getUser = await this.mongoRequest({ email })
            if (getUser.length > 0) {
                // compare object with schema
                if (this.testSchema(getUser[0], AndroidUsersSchema)) {
                    const resp = {
                        _id: getUser[0]._id,
                        email: getUser[0].email,
                        applications: getUser[0].applications
                    }
                    return resp
                } else {
                    throw 'Invalid document format'
                }
            } else {
                throw 'User not found'
            }

        } catch (error) {
            return { error }
        }
    }
    async getUserById(userId) {
        try {
            const query = { _id: this.getObjectId(userId) }
            const getUser = await this.mongoRequest(query)
            if (getUser.length > 0) {
                // compare object with schema
                if (this.testSchema(getUser[0], AndroidUsersSchema)) {
                    const resp = {
                        _id: getUser[0]._id,
                        email: getUser[0].email,
                        applications: getUser[0].applications
                    }
                    return resp
                } else {
                    throw 'Invalid document format'
                }
            } else {
                throw 'User not found'
            }
        } catch (error) {
            return { error }
        }
    }

    async createAndroidUsers(payload) {
        try {
            const salt = randomstring.generate(12)
            let userPayload = {
                email: payload.email,
                pswdHash: sha1(payload.pswd + salt),
                salt,
                applications: payload.applications
            }
            if (this.testSchema(userPayload, AndroidUsersSchema)) {
                const addAndroidUser = await this.mongoInsert(userPayload)
                return addAndroidUser
            } else {
                throw 'Invalid document format'
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }

    async updateAndroidUser(payload) {
        try {
            const query = { _id: this.getObjectId(payload._id) }

            // Validation of data structure 
            if (this.testSchema(payload, AndroidUsersSchema)) {
                return await this.mongoUpdate(query, payload)
            } else {
                throw 'Invalid document format'
            }

        } catch (error) {
            console.error(error)
            return error
        }
    }

    async upadeAndroidUserPassword(payload) {
        try {
            const query = { _id: this.getObjectId(payload._id) }
            const salt = randomstring.generate(12)
            let userPayload = {
                pswdHash: sha1(payload.pswd + salt),
                salt
            }
            return await this.mongoUpdate(query, userPayload)
        } catch (error) {
            console.error(error)
            return error
        }
    }

    async removeApplicationFromAndroidUsers(applicationId) {
        try {
            const query = {
                applications: {
                    $in: [applicationId]
                }
            }
            const operators = {
                pull: {
                    applications: applicationId
                }
            }
            return await this.mongoUpdateMany(query, operators)

        } catch (error) {
            console.error(error)
            return error
        }
    }

    async deleteAndroidUser(userId) {
        try {
            const query = { _id: this.getObjectId(userId) }
            return await this.mongoDelete(query)
        } catch (error) {
            console.error(error)
            return error
        }
    }
}

module.exports = new AndroidUsersModel()