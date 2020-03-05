const DBmodel = require(`${process.cwd()}/model/${process.env.BDD_TYPE}`)
const model = new DBmodel()
const axios = require('axios')
const multer = require('multer')
const moment = require('moment')
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const AMPath = `${process.cwd()}/acousticModels/`
const AMstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AMPath)
    },
    filename: (req, file, cb) => {
        let filename = moment().format('x') + '-' + file.originalname
        cb(null, filename)
    }
})

const AMupload = multer({ storage: AMstorage }).any()
const request = require('request')
const fs = require('fs')

// Compare an intents/entities object to current services data
async function filterLMData(type, modelId, newData) {
    let getDataroutePath = ''
    if (type === 'intent') {
        getDataroutePath = 'intents'
    } else if (type === 'entity') {
        getDataroutePath = 'entities'
    }
    // Current Values of the langage model
    const getData = await axios.get(`${process.env.SERVICE_MANAGER_URL}/langmodel/${modelId}/${getDataroutePath}`)
    const currentData = getData.data.data
    let dataToSend = []

    newData.map(d => {
        let toAdd = []
        let toSendMethod = ''
        let toCompare = currentData.filter(c => c.name === d.name)
        if (toCompare.length === 0) {
            toAdd.push(...d.items)
            toSendMethod = 'post'
        } else {
            toSendMethod = 'patch'
            d.items.map(val => {
                if (toCompare[0]['items'].indexOf(val) < 0) {
                    toAdd.push(val)
                }
            })
        }
        if (toAdd.length > 0) {
            dataToSend.push({
                name: d.name,
                items: toAdd,
                method: toSendMethod
            })
        }
    })
    return {
        type,
        data: dataToSend
    }
}

// Update a langage model with intents/entities object to add/update
async function updateLangModel(payload, modelId) {
    try {
        let success = []
        let errors = []
        const type = payload.type
        for (let i in payload.data) {
            const name = payload.data[i].name
            const items = payload.data[i].items
            const method = payload.data[i].method
            const url = `${process.env.SERVICE_MANAGER_URL}/langmodel/${modelId}/${type}/${name}`
            const req = await axios(url, {
                method,
                data: items
            })
            if (req.status === 200 || req.status === '200') {
                success.push(payload.data[i])
            } else {
                errors.push(payload.data[i])
            }
            if (success.length + errors.length === payload.data.length) {
                return ({
                    errors,
                    success
                })
            }
        }
    } catch (error) {
        console.error('ERR:', error.toString())
        return ('an error has occured')
    }
}

module.exports = (webServer) => {
    return [{
            // Get all services in stt-service-manager
            path: '/services',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getServices = await axios(`${process.env.SERVICE_MANAGER_URL}/services`, {
                        method: 'get'
                    })
                    res.json({ services: getServices.data })
                } catch (error) {
                    console.error(error.toString())
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Create a service in stt-service-manager
            path: '/service',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body
                    const createService = await axios(`${process.env.SERVICE_MANAGER_URL}/service/${payload.serviceId}`, {
                        method: 'post',
                        data: payload
                    })
                    if (!!createService.status && createService.status === 200) {
                        res.json({
                            status: 'success',
                            msg: createService.data
                        })
                    } else {
                        throw createService
                    }
                } catch (error) {
                    if (!!error.response.status && error.response.status !== 200) {
                        res.json({
                            status: 'error',
                            msg: error.response.data.status
                        })
                    } else {
                        res.json({
                            error: 'An error has occured'
                        })
                    }
                }
            }
        },
        {
            path: '/langmodels',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getLanguageModels = await axios(`${process.env.SERVICE_MANAGER_URL}/langmodels`, {
                        method: 'get'
                    })
                    res.json({ services: getLanguageModels.data })
                } catch (error) {
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            path: '/langmodel',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const acmodel = req.body.acmodelname
                    const lmodel = req.body.lmodelname.replace(/\s/g, '_')
                    const createLM = await axios(`${process.env.SERVICE_MANAGER_URL}/langmodel/${lmodel}`, {
                        method: 'post',
                        data: {
                            acousticModel: acmodel
                        }
                    })
                    if (!!createLM.status && createLM.status === 200) {
                        res.json({
                            status: 'success',
                            msg: createLM.data
                        })
                    } else {
                        throw createLM
                    }
                } catch (error) {
                    if (!!error.response.status && error.response.status !== 200) {
                        res.json({
                            status: 'error',
                            msg: error.response.data.status
                        })
                    } else {
                        res.json({
                            error: 'An error has occured'
                        })
                    }
                }
            }
        },
        {
            path: '/langmodel',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const modelId = req.body.modelId
                    const deleteModel = await axios(`${process.env.SERVICE_MANAGER_URL}/langmodel/${modelId}`, {
                        method: 'delete'
                    })
                    if (!!deleteModel.status && deleteModel.status === 200) {
                        res.json({
                            status: 'success',
                            msg: deleteModel.data
                        })
                    } else {
                        throw deleteModel
                    }
                } catch (error) {
                    if (!!error.response.status && error.response.status !== 200) {
                        res.json({
                            status: 'error',
                            msg: error.response.data.status
                        })
                    } else {
                        res.json({
                            error: 'An error has occured'
                        })
                    }
                }
            }
        },
        {
            path: '/acmodels',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getACModels = await axios(`${process.env.SERVICE_MANAGER_URL}/acmodels`, {
                        method: 'get'
                    })
                    res.json({ services: getACModels.data })
                } catch (e) {
                    res.json({ error: e })
                }
            }
        },
        {
            path: '/acmodel',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    AMupload(req, res, async(error) => {
                        if (error ||  error instanceof multer.MulterError) {
                            // A Multer error occurred when uploading.
                            console.error(error.toString())
                            throw error
                        }
                        const infos = JSON.parse(req.body.infos)
                        const file = req.files[0]
                        const acModelName = infos.acmodel.replace(/\s/g, '_')
                        request.post({
                            url: `${process.env.SERVICE_MANAGER_URL}/acmodel/${acModelName}`,
                            formData: {
                                file: fs.createReadStream(AMPath + file.filename),
                                filetype: file.mimetype,
                                lang: infos.lang

                            },
                        }, (err, response, body) => {
                            if (err) {
                                res.json({
                                    status: 'error',
                                    error: err
                                })
                            }
                            if (response.statusCode === 200) {
                                fs.unlinkSync(AMPath + file.filename)
                                res.json({
                                    status: 'success',
                                    msg: body
                                })
                            } else {
                                res.json({
                                    status: 'error',
                                    msg: body
                                })
                            }
                        })
                    })
                } catch (error) {
                    console.error(error.toString())
                    res.json({
                        status: 'error',
                        msg: error
                    })
                }
            }
        },
        {
            path: '/acmodel',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const modelId = req.body.modelId
                    const deleteModel = await axios(`${process.env.SERVICE_MANAGER_URL}/acmodel/${modelId}`, {
                        method: 'delete'
                    })
                    if (!!deleteModel.status && deleteModel.status === 200) {
                        res.json({
                            status: 'success',
                            msg: deleteModel.data
                        })
                    } else {
                        throw deleteModel
                    }
                } catch (error) {
                    if (!!error.response.status && error.response.status !== 200) {
                        res.json({
                            status: 'error',
                            msg: error.response.data.status
                        })
                    } else {
                        res.json({
                            error: 'An error has occured'
                        })
                    }
                }
            }
        },
        {
            path: '/lexicalseeding',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const flowId = req.body.flowId
                    const service_name = req.body.service_name

                    // Get stt service data
                    const accessToken = await nodered.getBLSAccessToken()
                    const getSttService = await axios(`${process.env.SERVICE_MANAGER_URL}/service/${service_name}`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    })
                    const sttService = getSttService.data.data

                    // Get lexical seeding data
                    const getSttLexicalSeeding = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URL}/red-nodes/${flowId}/dataset/linstt`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Node-RED-Deployment-Type': 'flows',
                            'Authorization': accessToken
                        }
                    })
                    const sttLexicalSeedingData = getSttLexicalSeeding.data.data
                    const intents = sttLexicalSeedingData.intents
                    const entities = sttLexicalSeedingData.entities
                    let intentsUpdated = false
                    let entitiesUpdated = false
                    let updateInt = { success: '', errors: '' }
                    let updateEnt = { success: '', errors: '' }

                    // Update model intents
                    const intentsToSend = await filterLMData('intent', sttService.LModelId, intents)
                    if (intentsToSend.data.length > 0) {
                        updateInt = await updateLangModel(intentsToSend, sttService.LModelId)
                        if (!!updateInt.success && !!updateInt.errors) {
                            intentsUpdated = true

                        }
                    } else {
                        intentsUpdated = true
                    }

                    // Update model entities
                    const entitiesToSend = await filterLMData('entity', sttService.LModelId, entities)
                    if (entitiesToSend.data.length > 0) {
                        updateEnt = await updateLangModel(entitiesToSend, sttService.LModelId)
                        if (!!updateEnt.success && !!updateEnt.errors) {
                            entitiesUpdated = true
                        }
                    } else  {
                        entitiesUpdated = true
                    }

                    const getUpdatedSttLangModel = await axios(`${process.env.SERVICE_MANAGER_URL}/langmodel/${sttService.LModelId}`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    })

                    // Generate Graph if model updated
                    if (getUpdatedSttLangModel.data.data.isDirty === 1 && getUpdatedSttLangModel.data.data.updateState === 0) {
                        try {
                            const req = await axios(`${process.env.ADMIN_URL}/api/stt/generategraph`, {
                                method: 'post',
                                data: {
                                    service_name
                                }
                            })
                        } catch (error) {
                            console.error(error.toString())
                        }
                    }
                    // Result
                    if (intentsUpdated && entitiesUpdated) {
                        if (updateInt.errors.length === 0 && updateEnt.errors.length === 0) {
                            res.json({
                                status: 'success',
                                msg: 'Model language has been updated'
                            })
                        } else {
                            errorMsg = 'Model updated BUT : '
                            if (updateInt.errors.length > 0) {
                                updateInt.errors.map(e => {
                                    errorMsg += `Warning: error on updating intent ${e.name}.`
                                })
                            }
                            if (updateEnt.errors.length > 0) {
                                updateEnt.errors.map(e => {
                                    errorMsg += `Warning: error on updating entity ${e.name}.`
                                })
                            }
                            res.json({
                                status: 'success',
                                msg: errorMsg
                            })
                        }
                    } else {
                        throw 'Error on updating langage model'
                    }
                } catch (error) {
                    console.error(error.toString())
                    res.json({
                        status: 'error',
                        msg: 'Error on updating language model',
                        error: error.toString()
                    })
                }
            }
        }, {
            path: '/generategraph',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const service_name = req.body.service_name
                    const getSttService = await axios(`${process.env.SERVICE_MANAGER_URL}/service/${service_name}`, {
                        method: 'get'
                    })
                    const sttService = getSttService.data.data
                    const generateGraph = await axios(`${process.env.SERVICE_MANAGER_URL}/langmodel/${sttService.LModelId}/generate/graph`, {
                        method: 'get'
                    })
                    res.json({
                        status: 'success',
                        msg: generateGraph.data.data
                    })
                } catch (error) {
                    console.error(error.toString())
                    res.json({
                        status: 'error',
                        msg: 'error on generating graph'
                    })
                }
            }
        }, {
            path: '/healthcheck',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getSttManager = await axios(process.env.SERVICE_MANAGER_URL)
                    if (getSttManager.status === 200) {
                        res.json({
                            status: 'success',
                            msg: ''
                        })
                    } else {
                        throw 'error on connecting'
                    }
                } catch (error) {
                    res.json({
                        status: 'error',
                        msg: 'unable to connect STT services'
                    })
                }
            }
        }
    ]
}