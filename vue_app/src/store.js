import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
    strict: false,
    state: {
        applicationWorkflows: '',
        androidUsers: '',
        staticClients: '',
        staticWorkflows: '',
        sttServices: '',
        sttLanguageModels: '',
        sttAcousticModels: '',
        tockApplications: '',
        workflowsTemplates: '',
    },
    mutations: {
        SET_APPLICATION_WORKFLOWS: (state, data) => {
            state.applicationWorkflows = data
        },
        SET_STATIC_CLIENTS: (state, data) => {
            state.staticClients = data
        },
        SET_STATIC_WORKFLOWS: (state, data) => {
            state.staticWorkflows = data
        },
        SET_WORKFLOWS_TEMPLATES: (state, data) => {
            state.workflowsTemplates = data
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
            state.tockApplications = data
        },
        SET_ANDROID_USERS: (state, data) => {
            state.androidUsers = data
        }
    },
    actions: {
        // Static clients
        getStaticClients: async({ commit, state }) => {
            try {
                const getStaticClients = await axios.get(`${process.env.VUE_APP_URL}/api/clients/static`)
                commit('SET_STATIC_CLIENTS', getStaticClients.data)
                return state.staticClients
            } catch (error) {
                return ({
                    error: 'Error on getting Linto(s) static devices'
                })
            }
        },
        // Static workflows
        getStaticWorkflows: async({ commit, state }) => {
            try {
                const getStaticWorkflows = await axios.get(`${process.env.VUE_APP_URL}/api/workflows/static`)
                commit('SET_STATIC_WORKFLOWS', getStaticWorkflows.data)
                return state.staticWorkflows
            } catch (error) {
                return ({
                    error: 'Error on getting static workflows'
                })
            }
        },
        // Application workflows
        getApplicationWorkflows: async({ commit, state }) => {
            try {
                const getApplicationWorkflows = await axios.get(`${process.env.VUE_APP_URL}/api/workflows/application`)
                commit('SET_APPLICATION_WORKFLOWS', getApplicationWorkflows.data)
                return state.applicationWorkflows
            } catch (error) {
                return ({
                    error: 'Error on getting Linto(s) static devices'
                })
            }
        },
        getWorkflowsTemplates: async({ commit, state }) => {
            try {
                const getWorkflowsTemplates = await axios.get(`${process.env.VUE_APP_URL}/api/workflows/templates`)
                commit('SET_WORKFLOWS_TEMPLATES', getWorkflowsTemplates.data)
                return state.workflowsTemplates
            } catch (error) {
                return ({
                    error: 'Error on getting workflow templates'
                })
            }
        },
        // Android users 
        getAndroidUsers: async({ commit, state }) => {
            try {
                const getAndroidUsers = await axios.get(`${process.env.VUE_APP_URL}/api/workflows/application/androidusers`)
                let nestedObj = []
                getAndroidUsers.data.map(user => {
                    nestedObj.push({
                        _id: user._id,
                        email: user.email,
                        applications: user.applications
                    })
                })
                commit('SET_ANDROID_USERS', nestedObj)
                return state.androidUsers
            } catch (error) {
                return ({
                    error: 'Error on getting android applications users'
                })
            }
        },
        // Stt services
        getSttServices: async({ commit, state }) => {
            try {
                const getServices = await axios.get(`${process.env.VUE_APP_URL}/api/stt/services`)
                commit('SET_STT_SERVICES', getServices.data)
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
                commit('SET_STT_LANG_MODELS', getSttLanguageModels.data)
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

                commit('SET_STT_AC_MODELS', getSttAcousticModels.data)
                return state.sttAcousticModels
            } catch (error) {
                return ({
                    error: 'Error on getting acoustic models'
                })
            }
        },
        // Tock
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
                return state.tockApplications
            } catch (error) {
                return { error: 'Error on getting tock applications' }
            }
        }
    },
    getters: {
        STT_SERVICES_AVAILABLE: (state) => {
            try {
                let services = state.sttServices || []
                let languageModels = state.sttLanguageModels || []
                let availableServices = []
                if (services.length > 0) {
                    services.map(s => {
                        let lm = languageModels.filter(l => l.modelId === s.LModelId)
                        if (lm.length > 0) {
                            if (lm[0].isGenerated === 1 || lm[0].isDirty === 1 && lm[0].isGenerated === 0 && lm[0].updateState >= 0) {
                                availableServices.push(s)
                            }
                        }
                    })
                    return availableServices
                } else {
                    throw 'No service found.'
                }
            } catch (error) {
                return { error }
            }
        },
        WORKFLOW_TEMPLATES_BY_TYPE: (state) => (type) => {
            try {
                if (state.workflowsTemplates.length > 0) {
                    return state.workflowsTemplates.filter(wf => wf.type === type)
                } else {
                    throw 'No workflow template found'
                }
            } catch (error) {
                return { error }
            }
        },
        STATIC_CLIENTS_AVAILABLE: (state) => {
            try {
                return state.staticClients.filter(sc => sc.associated_workflow === null)
            } catch (error) {
                return { error }
            }
        },
        STATIC_WORKFLOW_BY_ID: (state) => (id) => {
            try {
                return state.staticWorkflows.filter(sw => sw._id === id)[0]
            } catch (error) {
                return { error }
            }
        },
        ANDROID_USERS_BY_APPS: (state) => {
            try {
                const users = state.androidUsers
                let usersByApp = []

                if (users.length > 0) {
                    users.map(user => {
                        user.applications.map(app => {
                            if (!usersByApp[app]) {
                                usersByApp[app] = [user.email]
                            } else {
                                usersByApp[app].push(user.email)
                            }
                        })
                    })
                }
                return usersByApp

            } catch (error) {
                return { error }
            }
        },
        ANDROID_USERS_BY_APP_ID: (state) => (workflowId) => {
            try {
                const users = state.androidUsers
                return users.filter(user => user.applications.indexOf(workflowId) >= 0)
            } catch (error) {
                return { error }
            }
        },
        ANDROID_USER_BY_ID: (state) => (userId) => {
            try {
                const users = state.androidUsers
                const user = users.filter(user => user._id.indexOf(userId) >= 0)
                return user[0]
            } catch (error) {
                return { error }
            }
        },
        APP_WORKFLOW_BY_ID: (state) => (workflowId) => {
            try {
                const workflows = state.applicationWorkflows
                const workflow = workflows.filter(wf => wf._id === workflowId)
                return workflow[0]
            } catch (error) {
                return { error }
            }
        },
        APP_WORKFLOWS_NAME_BY_ID: (state) => {
            const workflows = state.applicationWorkflows
            let workflowNames = []
            if (workflows.length > 0) {
                workflows.map(wf => {
                    workflowNames[wf._id] = wf.name
                })
            }

            return workflowNames
        }

        /*
        STT_SERVICES_AVAILABLE: (state) => {
            try {
                let services = state.sttServices || []
                let languageModels = state.sttLanguageModels || []
                let availableServices = []
                if (services.length > 0) {
                    services.map(s => {
                        let lm = languageModels.filter(l => l.modelId === s.LModelId)
                        if (lm.length > 0) {
                            if (lm[0].isGenerated === 1 || lm[0].isDirty === 1 && lm[0].isGenerated === 0 && lm[0].updateState >= 0) {
                                availableServices.push(s)
                            }
                        }
                    })
                    return availableServices
                } else {
                    throw 'No service found.'
                }
            } catch (error) {
                return error.toString()
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
                return error.toString()
            }
        },
        STT_LM_ERRORS: (state) => {
            try {
                const langModels = state.sttLanguageModels
                const brokenModel = []
                if (!!langModels) {
                    langModels.map(lm => {
                        if (lm.updateState < 0 && lm.isDirty === 1) {
                            brokenModel.push(lm)
                        }
                    })
                    return brokenModel
                }
            } catch (error) {
                return error.toString
            }
        },
        STT_GRAPH_GENERATION: (state) => {
            try {
                const langModels = state.sttLanguageModels
                let generating = []
                if (!!langModels) {
                    langModels.map(lm => {
                        if (lm.updateState > 0 && lm.isDirty === 1) {
                            generating.push(lm)
                        }
                    })
                    return generating
                }
            } catch (error) {
                return error.toString
            }
        }*/
    }
})