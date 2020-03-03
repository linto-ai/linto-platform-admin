const debug = require('debug')('linto-admin:model:mongodb')
const MONGODB_DBNAME = process.env.MONGODB_DBNAME
const mongoDb = require('mongodb')
let urlMongo = 'mongodb://'
if (process.env.MONGODB_REQUIRE_LOGIN) {
    urlMongo += process.env.MONGODB_USER + ':' + process.env.MOGODB_PSWD + '@'
}
urlMongo += process.env.MONGODB_HOST + ':' + process.env.MONGODB_PORT + '/'
if (process.env.MONGODB_REQUIRE_LOGIN) {
    urlMongo += '?authSource=' + process.env.MONGODB_DBNAME
}
debug(urlMongo)

class modelMongoDb {
    constructor() {
        this.mongoDb = mongoDb
        this.urlMongo = urlMongo
        this.client = mongoDb.MongoClient
        this.dbOptions = {
            host: process.env.MONGODB_HOST,
            port: process.env.MONGODB_PORT,
            database: process.env.MONGODB_DBNAME,
            auth: process.env.MONGODB_REQUIRE_LOGIN,
            user: process.env.MONGODB_USER,
            password: process.env.MOGODB_PSWD
        }
        return this
    }

    /*************/
    /*** USERS ***/
    /*************/
    async getUser(id) {
        try {
            const query = {
                _id: this.mongoDb.ObjectID(id)
            }
            return await this.mongoRequest('users', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getUserByName(userName) {
        try {
            const query = {
                userName: userName
            }
            return await this.mongoRequest('users', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getUsers() {
        try {
            const query = {}
            return await this.mongoRequest('users', query)
        } catch (error) {
            console.error(err)
            return err
        }
    }

    async updateUser(payload) {
        try {
            const query = {
                _id: this.mongoDb.ObjectID(payload._id)
            }
            let mutableElements = payload
            delete mutableElements._id
            return await this.mongoUpdate('users', query, mutableElements)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    /**************/
    /*** LINTOS ***/
    /**************/
    async getLintoFleet() {
        try {
            const query = { type: 'fleet' }
            return await this.mongoRequest('lintos', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getLintoBySn(sn) {
        try {
            const query = { sn }
            return await this.mongoRequest('lintos', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async updateLinto(payload) {
        try {
            const query = {
                _id: this.mongoDb.ObjectID(payload._id)
            }
            let mutableElements = payload
            delete mutableElements._id
            return await this.mongoUpdate('lintos', query, mutableElements)
        } catch (err) {
            return err
        }
    }

    async addLintoFleet(sn) {
        try {
            const payload = {
                enrolled: true,
                connexion: 'offline',
                last_up: '-',
                last_down: '-',
                associated_context: null,
                type: 'fleet',
                sn,
                config: {
                    network: [],
                    firmware: '0.0.1',
                    ftp: {},
                    sound: {},
                    disk: {},
                    mqtt: {}
                },
                meeting: []
            }
            return await this.mongoInsert('lintos', payload)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    /****************/
    /*** CONTEXTS ***/
    /****************/
    async getContexts() {
        try {
            const query = {}
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getContextById(id) {
        try {
            const query = {
                _id: this.mongoDb.ObjectID(id)
            }
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getFleetContexts() {
        try {
            const query = { type: 'Fleet' }
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getContextTypes() {
        try {
            const query = {}
            return await this.mongoRequest('context_types', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async createContext(payload) {
        try {
            return await this.mongoInsert('context', payload)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async updateContext(payload) {
        try {
            const query = {
                _id: this.mongoDb.ObjectID(payload._id)
            }
            let mutableElements = payload
            delete mutableElements._id
            return await this.mongoUpdate('context', query, mutableElements)
        } catch (err) {
            return err
        }
    }

    /****************/
    /*** WORFLOWS ***/
    /****************/
    async getAllWorkflowPatterns() {
        try {
            const query = {}
            return await this.mongoRequest('flow_pattern', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getWorkflowPatternByName(name) {
        try {
            const query = { name }
            return await this.mongoRequest('flow_pattern', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getWorkflowPatternById(id) {
        try {
            const query = { _id: this.mongoDb.ObjectID(id) }
            const tmpFlow = await this.mongoRequest('flow_pattern', query)
            return tmpFlow[0]
        } catch (err) {
            return err
        }
    }

    async addWorkflowPattern(payload) {
            try {
                return await this.mongoInsert('flow_pattern', payload)
            } catch (err) {
                console.error(err)
                return err
            }
        }
        /*******************/
        /*** TMP WORFLOW ***/
        /*******************/
    async getFullTmpFlow() {
        try {
            const query = {}
            const tmpFlow = await this.mongoRequest('flow_pattern_tmp', query)
            let tmpFlowUnformatted = tmpFlow[0].flow
            let formattedFlow = []
            tmpFlowUnformatted.map(tmp => {
                if ((formattedFlow.filter(f => f.id === tmp.id)).length === 0) {
                    formattedFlow.push(tmp)
                }
            })
            return formattedFlow
        } catch (err) {
            return err
        }
    }

    async getTmpFlow() {
        try {
            const query = {}
            const tmpFlow = await this.mongoRequest('flow_pattern_tmp', query)
            return tmpFlow[0].flow
        } catch (err) {
            return err
        }
    }

    async updateTmpFlow(payload) {
        try {
            const query = {
                id: "tmp"
            }
            return await this.mongoUpdate('flow_pattern_tmp', query, {
                flow: payload.flow,
                workspaceId: payload.workspaceId
            })
        } catch (err) {
            console.error(err)
            return err
        }
    }


    /*******************/
    /*** Mongo CRUD ***/
    /******************/
    /**
     * Update function for mongoDB. This function will update an entry based on the "collection", the "query" and the "values" passed in parmaters.
     * @param {string} collection
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoUpdate(collection, query, values) {
        if (values._id) {
            delete values._id
        }
        return new Promise((resolve, reject) => {
            try {
                this.client.connect(this.urlMongo, {
                    useNewUrlParser: true
                }, (err, db) => {
                    if (err) {
                        db.close()
                        reject(err)
                    }
                    const dbo = db.db(MONGODB_DBNAME)
                    dbo.collection(collection).updateOne(query, {
                        $set: values
                    }, function(error, res) {
                        if (error) {
                            db.close()
                            reject(error)
                        }
                        db.close()
                        resolve('success')
                    })
                })
            } catch (err) {
                return err
            }
        })
    }

    /**
     * Insert/Create function for mongoDB. This function will create an entry based on the "collection", the "query" and the "values" passed in parmaters.
     * @param {string} collection
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoInsert(collection, payload) {
        return new Promise((resolve, reject) => {
            try {
                this.client.connect(this.urlMongo, {
                    useNewUrlParser: true
                }, (err, db) => {
                    if (err) {
                        db.close()
                        reject(err)
                    }
                    const dbo = db.db(MONGODB_DBNAME)
                    dbo.collection(collection).insertOne(payload, function(error, res) {
                        if (error) {
                            db.close()
                            reject(error)
                        }
                        db.close()
                        resolve('success')
                    })
                })
            } catch (err) {
                return err
            }
        })
    }

    /**
     * Request function for mongoDB. This function will make a request on the "collection", filtered by the "query" passed in paramters.
     * @param {string} collection
     * @param {Object} query
     * @returns {Pomise}
     */
    async mongoRequest(collection, query) {
        return new Promise((resolve, reject) => {
            try {
                this.client.connect(this.urlMongo, {
                    useNewUrlParser: true
                }, (err, db) => {
                    if (err) {
                        db.close()
                        reject(err)
                    }
                    const dbo = db.db(MONGODB_DBNAME)
                    dbo.collection(collection).find(query).toArray((error, result) => {
                        if (error) {
                            db.close()
                            reject(error)
                        }
                        db.close()
                        resolve(result)
                    })
                })
            } catch (err) {
                return err
            }
        })
    }

    /**
     * Delete function for mongoDB. This function will create an entry based on the "collection", the "query" passed in parmaters.
     * @param {string} collection
     * @param {Object} query
     * @returns {Pomise}
     */
    async mongoDelete(collection, query) {
        return new Promise((resolve, reject) => {
            try {
                this.client.connect(this.urlMongo, {
                    useNewUrlParser: true
                }, (err, db) => {
                    if (err) {
                        db.close()
                        reject(err)
                    }
                    const dbo = db.db(MONGODB_DBNAME)
                    dbo.collection(collection).deleteOne(query, function(error, obj) {
                        if (error) {
                            db.close()
                            reject(error)
                        }
                        db.close()
                        resolve("success")
                    })
                })
            } catch (err) {
                return err
            }
        })
    }

    async insertCollection(collection, payload) {
        return new Promise((resolve, reject) => {
            try {
                this.client.connect(this.urlMongo, {
                    useNewUrlParser: true
                }, (err, db) => {
                    if (err) {
                        db.close()
                        reject(err)
                    }
                    const dbo = db.db(MONGODB_DBNAME)
                    dbo.collection(collection).insertMany(payload, function(error, res) {
                        if (error) {
                            db.close()
                            reject(error)
                        }
                        db.close()
                        resolve('success')
                    })
                })
            } catch (err) {
                return err
            }
        })
    }
    async dropCollection(collection) {
        try {
            return new Promise((resolve, reject) => {
                this.client.connect(this.urlMongo, {
                    useNewUrlParser: true
                }, (err, db) => {
                    if (err) {
                        db.close()
                        reject(err)
                    }
                    const dbo = db.db(MONGODB_DBNAME)
                    dbo.collection(collection).drop(function(error, result) {
                        if (error) {
                            db.close()
                            reject(error)
                        }
                        db.close()
                        resolve('success')
                    })
                })
            })
        } catch (err) {
            db.close()
            return err
        }
    }
    async createCollection(collection) {
        try {
            return new Promise((resolve, reject) => {
                this.client.connect(this.urlMongo, {
                    useNewUrlParser: true
                }, (err, db) => {
                    if (err) {
                        db.close()
                        reject(err)
                    }
                    let collectionBson = require('./collections/' + collection)
                    const dbo = db.db(MONGODB_DBNAME)
                    dbo.createCollection(collection, collectionBson, (error, res) => {
                        if (error) {
                            db.close()
                            reject(error)
                        }
                        db.close()
                        resolve('success')
                    })
                })
            })
        } catch (err) {
            return err
        }
    }
    async listCollections() {
        try {
            return new Promise((resolve, reject) => {
                this.client.connect(this.urlMongo, {
                    useNewUrlParser: true
                }, (err, db) => {
                    if (err) {
                        db.close()
                        reject(err)
                    }
                    const dbo = db.db(MONGODB_DBNAME)
                    dbo.listCollections().toArray(function(error, collections) {
                        if (error) {
                            db.close()
                            reject(error)
                        }
                        let collectionsNames = []
                        collections.map(c => {
                            collectionsNames.push(c.name)
                        })
                        db.close()
                        resolve(collectionsNames)
                    })
                })
            })
        } catch (err) {
            return err
        }
    }

}

module.exports = modelMongoDb