import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
    strict: false,
    state: {
        contextTypes: '',
        contextFleet: '',
        flowPatterns: '',
        flowPatternTmp: '',
        lintoFleet: '',
        mqttDefaultSettings: '',
        nluServices: '',
        tockapps: '',
        sttServices: '',
        sttLanguageModels: '',
        sttAcousticModels: ''
    },
    mutations: {
        SET_LINTO_FLEET: (state, data) => {
            state.lintoFleet = data
        },
        SET_CONTEXT_FLEET: (state, data) => {
            state.contextFleet = data
        },
        SET_CONTEXT_TYPES: (state, data) => {
            state.contextTypes = data
        },
        SET_PATTERNS: (state, data) => {
            state.flowPatterns = data
        },
        SET_TMP_PATTERN: (state, data) => {
            state.flowPatternTmp = data
        },
        SET_MQTT_SETTINGS: (state, data) => {
            state.mqttDefaultSettings = data
        },
        SET_NLU_SERVICES: (state, data) => {
            state.nluServices = data
        },
        SET_STT_SERVICES: (state, data) => {
            state.sttServices = data
        },
        SET_STT_LANG_MODELS: (state, data) => {
            state.sttLanguageModels = data
        },
        SET_STT_AC_MODELS: (state, data) => {
            state.sttAcousticModels = data
        },
        SET_TOCK_APPS: (state, data) => {
            state.tockapps = data
        }
    },
    actions: {
        getLintoFleet: async({ commit, state }) => {
            try {
                const getLintos = await axios.get(`${process.env.VUE_APP_URL}/api/lintos/fleet`)
                commit('SET_LINTO_FLEET', getLintos.data)
                return state.lintoFleet
            } catch (error) {
                return ({
                    error: 'Error on getting Linto(s)'
                })
            }
        },
        getFleetContexts: async({ commit, state }) => {
            try {
                const getFleetContexts = await axios.get(`${process.env.VUE_APP_URL}/api/context/fleet`)
                commit('SET_CONTEXT_FLEET', getFleetContexts.data)
                return state.contextFleet
            } catch (error) {
                return ({
                    error: 'Error on getting contexts'
                })
            }
        },
        getContextTypes: async({ commit, state }) => {
            try {
                const getTypes = await axios.get(`${process.env.VUE_APP_URL}/api/context/types`)
                commit('SET_CONTEXT_TYPES', getTypes.data)
                return state.contextTypes
            } catch (error) {
                return ({
                    error: 'Error on getting contexts types'
                })
            }
        },
        getFlowPatterns: async({ commit, state }) => {
            try {
                const getPatterns = await axios.get(`${process.env.VUE_APP_URL}/api/flow/patterns`)
                commit('SET_PATTERNS', getPatterns.data)
                return state.flowPatterns
            } catch (error) {
                return ({
                    error: 'Error on getting workflow patterns'
                })
            }
        },
        getTmpPattern: async({ commit, state }) => {
            try {
                const getTmpPattern = await axios.get(`${process.env.VUE_APP_URL}/api/flow/tmp`)
                commit('SET_TMP_PATTERN', getTmpPattern.data[0])
                return state.flowPatternTmp
            } catch (error) {
                return ({
                    error: 'Error on saving changes'
                })
            }
        },
        getNluServices: async({ commit, state }) => {
            try {
                const getSettings = await axios.get(`${process.env.VUE_APP_URL}/api/context/nluServices`)
                commit('SET_NLU_SERVICES', getSettings.data)
                return state.nluServices
            } catch (error) {
                return ({
                    error: 'Error on getting NLU services'
                })
            }
        },
        getTockApplications: async({ commit, state }) => {
            try {
                const getApps = await axios.get(`${process.env.VUE_APP_URL}/api/tock/applications`)
                if (getApps.data.status === 'error') {
                    throw getApps.data.msg
                }
                let applications = []
                getApps.data.map(app => {
                    applications.push({
                        name: app.name,
                        namespace: app.namespace
                    })
                })
                commit('SET_TOCK_APPS', applications)
                return state.tockapps
            } catch (error) {
                return ({
                    error: 'Error on getting tock applications'
                })
            }
        },
        getmqttDefaultSettings: async({ commit, state }) => {
            try {
                const getSettings = await axios.get(`${process.env.VUE_APP_URL}/api/context/getMqttDefaultSettings`)
                commit('SET_MQTT_SETTINGS', getSettings.data)
                return state.mqttDefaultSettings
            } catch (error) {
                return ({
                    error: 'Error on getting MQTT default settings'
                })
            }
        },
        getSttServices: async({ commit, state }) => {
            try {
                const getServices = await axios.get(`${process.env.VUE_APP_URL}/api/stt/services`)
                commit('SET_STT_SERVICES', getServices.data.services.data)
                return state.sttServices
            } catch (error) {
                return ({
                    error: 'Error on getting STT services'
                })
            }
        },
        getSttLanguageModels: async({ commit, state }) => {
            try {
                const getSttLanguageModels = await axios.get(`${process.env.VUE_APP_URL}/api/stt/langmodels`)
                commit('SET_STT_LANG_MODELS', getSttLanguageModels.data.services.data)
                return state.sttLanguageModels
            } catch (error) {
                return ({
                    error: 'Error on getting language models'
                })
            }
        },
        getSttAcousticModels: async({ commit, state }) => {
            try {
                const getSttAcousticModels = await axios.get(`${process.env.VUE_APP_URL}/api/stt/acmodels`)

                commit('SET_STT_AC_MODELS', getSttAcousticModels.data.services.data)
                return state.sttAcousticModels
            } catch (error) {
                return ({
                    error: 'Error on getting acoustic models'
                })
            }
        },
    },
    getters: {
        ASSOCIATED_LINTO_FLEET: (state) => {
            try {
                return state.lintoFleet.filter(f => f.associated_context !== null)
            } catch (error) {
                return error
            }
        },
        NOT_ASSOCIATED_LINTO_FLEET: (state) => {
            try {
                return state.lintoFleet.filter(f => f.associated_context === null)
            } catch (error) {
                return error
            }
        },
        LINTO_FLEET_BY_SN: (state) => (sn) => {
            try {
                return state.lintoFleet.filter(f => f.sn === sn)[0]
            } catch (error) {
                return error
            }
        },
        CONTEXT_BY_ID: (state) => (id) => {
            try {
                return state.contextFleet.filter(context => context._id === id)[0]
            } catch (error) {
                return error
            }
        },
        STT_SERVICES_AVAILABLE: (state) => {
            try {
                const services = state.sttServices
                let languageModels = state.sttLanguageModels
                let availableServices = []
                services.map(s => {
                    let lm = languageModels.filter(lm => lm.modelId === s.LModelId)[0]
                    if (lm.isDirty === 0 && lm.isGenerated === 1 || lm.isDirty === 1 && lm.updateState === 0) {
                        availableServices.push(s)
                    }
                })
                return availableServices
            } catch (error) {
                return error
            }
        },
        STT_SERVICES_LANGUAGES: (state) => {
            try {
                let lang = []
                let resp = []
                state.sttServices.map(s => {
                    if (lang.indexOf(s.lang) < 0) {
                        lang.push(s.lang)
                        resp.push({
                            value: s.lang
                        })
                    }
                })
                return resp
            } catch (error) {
                return error
            }
        },
        STT_GRAPH_GENERATION: (state) => {
            try {
                let langModels = state.sttLanguageModels
                let generating = []
                langModels.map(lm => {
                    if (lm.updateState > 0 && lm.isDirty === 1) {
                        generating.push(lm)
                    }
                })
                return generating
            } catch (error) {
                return error
            }
        }
    }
})