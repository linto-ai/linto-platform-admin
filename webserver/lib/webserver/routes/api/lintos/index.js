const DBmodel = require(`${process.cwd()}/model/${process.env.BDD_TYPE}`)
const model = new DBmodel()
const request = require('request')
const fs = require('fs')
const axios = require('axios')
module.exports = (webServer) => {
    return [{
            // Get all LinTO devices (fleet) from database
            path: '/fleet',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getLintos = await model.getLintoFleet()
                    res.json(getLintos)
                } catch (error) {
                    console.error(error.toString())
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Add a new LinTO to devices list (fleet)
            path: '/fleet',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const sn = req.body.sn
                    let addLinto = await model.addLintoFleet(sn)

                    // Validation
                    if (addLinto === 'success') {
                        res.json({
                            status: 'success',
                            msg: `A LinTO has been added with serial number "${sn}"`
                        })
                    } else {
                        throw 'Error on adding a new LinTO'
                    }
                } catch (error) {
                    console.error(error.toString())
                    res.json({
                        status: 'error',
                        msg: error.toString()
                    })
                }
            }
        },
        {
            // Update linto associated context
            path: '/fleet/:sn',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const sn = req.params.sn
                    const payload = req.body.payload
                    if (payload.type === 'Fleet') {

                        // Get Linto data
                        const getLinto = await model.getLintoBySn(sn)
                        let lintoPayload = getLinto[0]

                        // Test LinTO serial number
                        if (lintoPayload.associated_context !== null) {
                            throw {
                                msg: 'This LinTO device is already used in an other context',
                                code: 'lintoDevice'
                            }
                        }

                        // Update LINTO
                        lintoPayload.associated_context = payload.context_name
                        const updateLinto = await model.updateLinto(lintoPayload)

                        // Validation
                        if (updateLinto === 'success') {
                            res.json({
                                status: 'success',
                                msg: `Linto "${sn}" has been updated`
                            })
                        } else {
                            throw {
                                msg: 'Error on updating associated LinTO',
                                code: 'updateLinto'
                            }
                        }
                    }
                } catch (error) {
                    console.error(error.toString())
                    res.json({
                        status: 'error',
                        msg: error.toString()
                    })
                }
            }
        }
    ]
}