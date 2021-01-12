const MongoDriver = require(`${process.cwd()}/model/mongodb/driver.js`)
const ZSchema = require("z-schema")
const validator = new ZSchema({})

class MongoModel {
    constructor(collection) {
        this.collection = collection

    }

    getObjectId(id) {
        return MongoDriver.constructor.mongoDb.ObjectID(id)
    }

    testSchema(json, schema) {
        const schemaValid = validator.validate(json, schema)
        var schemaErrors = validator.getLastErrors() // this will return an array of validation errors encountered
        if (schemaValid) {
            return {
                valid: schemaValid,
                errors: null
            }
        } else {
            return {
                valid: schemaValid,
                errors: schemaErrors
            }
        }
    }

    /* ========================= */
    /* ===== MONGO METHODS ===== */
    /* ========================= */
    /**
     * Request function for mongoDB. This function will make a request on the "collection", filtered by the "query" passed in parameters.
     * @param {string} collection
     * @param {Object} query
     * @returns {Pomise}
     */
    async mongoRequest(query) {
        return new Promise((resolve, reject) => {
            try {
                MongoDriver.constructor.db.collection(this.collection).find(query).toArray((error, result) => {
                    if (error) {
                        reject(error)
                    }
                    resolve(result)
                })
            } catch (error) {
                console.error(error)
                reject(error)
            }
        })
    }

    /**
     * Insert/Create function for mongoDB. This function will create an entry based on the "collection", the "query" and the "values" passed in parmaters.
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoInsert(payload) {
        return new Promise((resolve, reject) => {
            try {
                MongoDriver.constructor.db.collection(this.collection).insertOne(payload, function(error, result) {
                    if (error) {
                        reject(error)
                    }
                    resolve('success')
                })
            } catch (error) {
                console.error(error)
                reject(error)
            }
        })
    }

    /**
     * Update function for mongoDB. This function will update an entry based on the "collection", the "query" and the "values" passed in parmaters.
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoUpdate(query, values) {
        if (values._id) {
            delete values._id
        }
        return new Promise((resolve, reject) => {
            try {
                MongoDriver.constructor.db.collection(this.collection).updateOne(query, {
                    $set: values
                }, function(error, result) {
                    if (error) {
                        reject(error)
                    }
                    resolve('success')
                })
            } catch (error) {
                console.error(error)
                reject(error)
            }
        })
    }



    // Update ONE, define update operator param
    async mongoUpdateMany(query, operator) {
        let operatorObj = {}
        if (!!operator.pull) {
            operatorObj.$pull = operator.pull
        }
        if (!!operator.set) {
            operatorObj.$set = operator.set
        }
        return new Promise((resolve, reject) => {
            try {
                MongoDriver.constructor.db.collection(this.collection).updateMany(query, operatorObj, (error, result) => {
                    if (error) {
                        reject(error)
                    }
                    resolve('success')
                })
            } catch (error) {
                console.error(error)
                reject(error)
            }
        })
    }

    /**
     * Delete function for mongoDB. This function will create an entry based on the "collection", the "query" passed in parmaters.
     * @param {Object} query
     * @returns {Pomise}
     */
    async mongoDelete(query) {
        return new Promise((resolve, reject) => {
            try {
                MongoDriver.constructor.db.collection(this.collection).deleteOne(query, function(error, result) {
                    if (error) {
                        reject(error)
                    }
                    resolve("success")
                })
            } catch (error) {
                console.error(error)
                reject(error)
            }
        })
    }
}

module.exports = MongoModel