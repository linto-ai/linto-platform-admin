const debug = require('debug')(`linto-admin:/api/tock`)
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares`)
const fs = require('fs')
const request = require('request')
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const axios = require('axios')
module.exports = (webServer) => {
    return [{
            // Get all existing Tock applications
            path: '/applications',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const tockToken = middlewares.basicAuthToken(process.env.NLU_TOCK_USER, process.env.NLU_TOCK_PSWD)
                    const getTockApplications = await axios(`${process.env.NLU_TOCK_REST_HOST}/admin/applications`, {
                        method: 'get',
                        headers: {
                            'Authorization': tockToken
                        }
                    })
                    res.json(getTockApplications.data)
                } catch (error) {
                    res.json({
                        status: 'error',
                        msg: 'Error on getting tock applications'
                    })
                }
            }
        },
        {
            path: '/healthcheck',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getTock = await axios.get(process.env.NLU_TOCK_HOST)
                    if (getTock.status === 200) {
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
                        msg: 'unable to connect tock services'
                    })
                }
            }
        },
        {
            path: '/lexicalseeding',
            method: 'post',
            controller: async(req, res, next) => {
                try {
                    const flowId = req.body.flowId
                    const accessToken = await nodered.getBLSAccessToken()

                    // Get lexical seeding object to send to TOCK
                    const getNluLexicalSeeding = await axios(`${process.env.BUSINESS_LOGIC_SERVER_URL}/red-nodes/${flowId}/dataset/tock`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Node-RED-Deployment-Type': 'flows',
                            'Authorization': accessToken
                        }
                    })
                    const jsonContent = JSON.stringify(getNluLexicalSeeding.data.application)

                    // get Tock auth token
                    const token = middlewares.basicAuthToken(process.env.NLU_TOCK_USER, process.env.NLU_TOCK_PSWD)

                    // Tmp json file path
                    const filePath = process.cwd() + '/public/tockapp.json'

                    // Create json file
                    fs.writeFile(filePath, jsonContent, (err) => {
                        if (err) throw err
                        else {
                            // Tock service post request
                            request.post({
                                url: process.env.NLU_TOCK_REST_HOST + '/admin/dump/sentences',
                                headers: {
                                    'Authorization': token
                                },
                                formData: {
                                    file: fs.createReadStream(filePath),
                                    filetype: 'json'
                                },
                            }, function(error, response, body) {
                                let resp
                                if (typeof(body) !== 'object') {
                                    resp = JSON.parse(body)
                                } else {
                                    resp = body
                                }
                                if (error) {
                                    throw error
                                }
                                if (resp.success) {
                                    fs.unlinkSync(filePath)
                                    res.json({
                                        status: 'success',
                                        msg: 'Tock application has been deployed'
                                    })
                                } else {
                                    throw 'Error on creating tock application'
                                }
                            })
                        }
                    })
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: error.toString()
                    })
                }
            }
        }
    ]
}