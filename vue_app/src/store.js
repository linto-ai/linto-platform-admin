import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: false,
  state: {
    contextTypes: '',
    flowPatterns: '',
    flowPatternTmp: '',
    lintoFleet: '',
    mqttDefaultSettings: '',
    nluSettings: '',
    sttSettings: ''
  },
  mutations: {
    SET_LINTO_FLEET: (state, data) => {
      state.lintoFleet = data
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
        let lintos = state.lintoFleet
        let associatedLintos = []
        for (let i in lintos) {
          if (lintos[i].associated_context !== null) {
            associatedLintos.push(lintos[i])
          }
        }
        return associatedLintos
      } catch (error) {
        return { error }
      }
    },
    NOT_ASSOCIATED_LINTO_FLEET: (state) => {
      try {
        let lintos = state.lintoFleet
        let notAssociatedLintos = []
        for (let i in lintos) {
          if (lintos[i].associated_context === null) {
            notAssociatedLintos.push(lintos[i])
          }
        }
        return notAssociatedLintos
      } catch (error) {
        return { error }
      }
    },
    LINTO_FLEET_BY_SN: (state) => (sn) => {
      try {
        let lintos = state.lintoFleet
        let resp = null
        for (let i in lintos) {
          if (lintos[i].sn === sn) {
            resp = lintos[i]
          }
        }
        return resp
      } catch (error) {
        return { error }
      }
    }
  }
})
