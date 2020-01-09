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
    nluSettings: '',
    tockapps: '',
    sttSettings: ''
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
    SET_NLU_SETTINGS: (state, data) => {
      state.nluSettings = data
    },
    SET_STT_SETTINGS: (state, data) => {
      state.sttSettings = data
    },
    SET_TOCK_APPS: (state, data) => {
      state.tockapps = data
    }
  },
  actions: {
    getLintoFleet: async ({ commit, state }) => {
      try {
        const getLintos = await axios.get(`${process.env.VUE_APP_URL}/api/lintos/fleet`)
        commit('SET_LINTO_FLEET', getLintos.data)
        return state.lintoFleet
      } catch (error) {
        return { error }
      }
    },
    getFleetContexts: async ({ commit, state }) => {
      try {
        try {
          const getFleetContexts = await axios.get(`${process.env.VUE_APP_URL}/api/context/fleet`)
          commit('SET_CONTEXT_FLEET', getFleetContexts.data)
          return state.contextFleet
        } catch (error) {
          return { error }
        }
      } catch (error) {
        return { error }
      }
    },
    getContextTypes: async ({ commit, state }) => {
      try {
        const getTypes = await axios.get(`${process.env.VUE_APP_URL}/api/context/types`)
        commit('SET_CONTEXT_TYPES', getTypes.data)
        return state.contextTypes
      } catch (error) {
        return { error }
      }
    },
    getFlowPatterns: async ({ commit, state }) => {
      try {
        const getPatterns = await axios.get(`${process.env.VUE_APP_URL}/api/flow/patterns`)
        commit('SET_PATTERNS', getPatterns.data)
        return state.flowPatterns
      } catch (error) {
        return { error }
      }
    },
    getTmpPattern: async ({ commit, state }) => {
      try {
        const getTmpPattern = await axios.get(`${process.env.VUE_APP_URL}/api/flow/tmp`)
        commit('SET_TMP_PATTERN', getTmpPattern.data[0])
        return state.flowPatternTmp
      } catch (error) {
        return {
          error
        }
      }
    },
    getNluSettings: async ({ commit, state }) => {
      try {
        const getSettings = await axios.get(`${process.env.VUE_APP_URL}/api/context/nlusettings`)
        commit('SET_NLU_SETTINGS', getSettings.data)
        return state.nluSettings
      } catch (error) {
        return { error }
      }
    },
    getTockApplications: async ({ commit, state }) => {
      try {
        const getApps = await axios.get(`${process.env.VUE_APP_URL}/api/context/tockapps`)
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
        return { error }
      }
    },
    getmqttDefaultSettings: async ({ commit, state }) => {
      try {
        const getSettings = await axios.get(`${process.env.VUE_APP_URL}/api/context/getMqttDefaultSettings`)
        commit('SET_MQTT_SETTINGS', getSettings.data)
        return state.mqttDefaultSettings
      } catch (error) {
        return { error }
      }
    },
    getSttSettings: async ({ commit, state }) => {
      try {
        const getSettings = await axios.get(`${process.env.VUE_APP_URL}/api/context/getsttservices`)
        commit('SET_STT_SETTINGS', getSettings.data)
        return state.sttSettings
      } catch (error) {
        return { error }
      }
    }

  },
  getters: {
    ASSOCIATED_LINTO_FLEET: (state) => {
      try {
        return state.lintoFleet.filter(f => f.associated_context !== null)
      } catch (error) {
        return { error }
      }
    },
    NOT_ASSOCIATED_LINTO_FLEET: (state) => {
      try {
        return state.lintoFleet.filter(f => f.associated_context === null)
      } catch (error) {
        return { error }
      }
    },
    LINTO_FLEET_BY_SN: (state) => (sn) => {
      try {
        return state.lintoFleet.filter(f => f.sn === sn)[0]
      } catch (error) {
        return { error }
      }
    },
    CONTEXT_BY_ID: (state) => (id) => {
      try {
        return state.contextFleet.filter(context => context._id === id)[0]
      } catch (error) {
        return { error }
      }
    }
  }
})
