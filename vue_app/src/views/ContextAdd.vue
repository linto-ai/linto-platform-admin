<template>
  <div class="flex col">
    <div class="flex col" v-if="loading">
      LOADING
    </div>
    <div class="flex col" v-if="dataLoaded">
      <h1>Create a context</h1>
      <div class="block">
        <div class="flex row">
          <div class="flex col flex1">
            <h2>Context informations</h2>
            <!-- Context name -->
            <AppInput :label="'Context name'" :obj="contextName" :test="'testName'"></AppInput>
            <!-- Context Type -->
            <AppSelect :label="'Context type'" :obj="contextType" :list="contextTypes" :params="{key:'_id', value:'name', optLabel: 'name'}"></AppSelect>
            <!-- LinTO select -->
            <AppSelect :label="'Select a LinTO'" :obj="linto" :list="availableLintos" :params="{key:'_id', value:'sn', optLabel: 'sn'}" v-if="contextType.value === 'Fleet'"></AppSelect>
            <!-- Context Language -->
            <AppSelect :label="'Select a language'" :obj="sttServiceLanguage" :list="sttServicesLanguages" :params="{key:'value', value:'value', optLabel: 'value'}"></AppSelect>
            <!-- Flow pattern -->
            <AppSelect :label="'Workflow pattern'" :obj="flowPattern" :list="flowPatterns" :params="{key:'_id', value:'name' , optLabel: 'name'}" v-if="contextType.value !== ''"></AppSelect>
            <!-- NLU SERVICE -->
            <h3>NLU Service</h3>
            <div class="flex row">
              <div class="flex1 flex col">
                <AppSelect :label="'NLU service'" :obj="nluService" :list="nluServices" :params="{key:'service_name', value:'service_name', optLabel: 'service_name'}" ></AppSelect>
              </div>
              <div class="flex1 flex col">
                <AppSelect :label="'Select Tock application'" :obj="tockApplicationName" :list="tockApplications" :params="{key:'name', value:'name', optLabel: 'name'}" v-if="nluService.value==='tock'" :options="{value:'new', label:'Create a new tock application'}"></AppSelect>
              </div>
            </div>
            <!-- STT SERVICE -->
            <h3>STT service</h3>

              <AppSelect :label="'STT service'" :obj="sttService" :list="availableServices" :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" :disabled="!languageSelected" :disabledTxt="'Select a language'"></AppSelect>
            <div class="flex row">
              <button class="button button--valid" @click="handleForm()">
                <span class="label">Create a context</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      loading: true,
      lintoLoaded: false,
      mqttLoaded: false,
      sttServicesLoaded: false,
      nluLoaded: false,
      patternLoaded: false,
      contextTypeLoaded: false,
      tockAppsLoaded: false,
      languageSelected: false,
      contextName: {
        value: '',
        error: null,
        valid: false
      },
      contextType: {
        value: '',
        error: null,
        valid: false
      },
      flowPattern: {
        value: '',
        error: null,
        valid: false
      },
      linto: {
        value: '',
        error: null,
        valid: false
      },
      nluService: {
        value: '',
        error: null,
        valid: false,
        configs: {}
      },
      mqttServer: {
        host: '',
        port: '',
        scope: ''
      },
      sttService: {
        value: '',
        error: null,
        valid: false,
        configs: {}
      },
      sttServiceLanguage: {
        value: '',
        error: null,
        valid: false
      },
      tockApplicationName: {
        value: '',
        error: null,
        valid: false
      }
    }
  },
  mounted () {
  },
  created () {
    this.dispatchStore('getmqttDefaultSettings')
    this.dispatchStore('getSttServices')
    this.dispatchStore('getNluSettings')
    this.dispatchStore('getTockApplications')
    this.dispatchStore('getFlowPatterns')
    this.dispatchStore('getContextTypes')
    this.dispatchStore('getLintoFleet')
  },
  watch: {
    'nluService.value': function (data) {
      if (data.length > 0) {
        this.nluServices.map(n => {
          if (n.service_name === data) {
            this.nluService.configs = {
              host: n.host
            }
          }
        })
      }
    },
    'contextType.value': function (data) {
      this.flowPattern.value = ''
      this.flowPattern.error = null
      this.flowPattern.valid = false
      if (data === 'Fleet') {
        this.mqttServer = this.mqttDefaultSettings
      } else {
       this.mqttServer = {
         host: '',
         port: '',
         scope: ''
        }
      }
    },
    'sttService.value': function (data) {
      if (data !== null || data !== '') {
        this.sttServices.map(s => {
          if (s.serviceId === data) {
            this.sttService.configs = s
          }
        })
      } else {
        this.sttService = {
          value: '',
          error: null,
          valid: false,
          configs: {}
        }
      }
    },
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    },
    'sttServiceLanguage.value': function (data) {
      if (data.length === 0) {
        this.languageSelected = false
      } else {
        this.languageSelected = true
      }
    }
  },
  computed: {
    availableLintos () {
      return this.$store.getters.NOT_ASSOCIATED_LINTO_FLEET
    },
    contextTypes () {
      return this.$store.state.contextTypes
    },
    flowPatterns () {
      if (this.contextType.value === '') {
        return this.$store.state.flowPatterns
      } else {
        const allPatterns = this.$store.state.flowPatterns
        let filterPattern = []
        for (let i in allPatterns) {
          if (allPatterns[i].type === this.contextType.value) {
            filterPattern.push(allPatterns[i])
          }
        }
        return filterPattern
      }
    },
    nluServices () {
      return this.$store.state.nluSettings
    },
    mqttDefaultSettings () {
      return this.$store.state.mqttDefaultSettings
    },
    sttServices () {
      return this.$store.state.sttServices
    },
    availableServices () {
      if (this.sttServiceLanguage.value === '') {
        return this.$store.state.sttServices
      }
      else {
        let allServices = this.sttServices
        let filteredServices = []
        for(let i in allServices) {
          if (allServices[i].lang === this.sttServiceLanguage.value) {
            filteredServices.push(allServices[i])
          }
        }
        if (filteredServices.filter(f => f.serviceId === this.sttService.value).length === 0) {
          this.sttService = {
            value: '',
            error: null,
            valid: false
          }
        }
        return filteredServices
      }
    },
    sttServicesLanguages () {
      return this.$store.getters.STT_SERVICES_LANGUAGES
    },
    formValid () {
      if (this.nluService.value === 'tock') {
        return (this.contextName.valid && this.contextType.valid && this.flowPattern.valid && this.linto.valid && this.sttService.valid && this.nluService.valid && this.tockApplicationName.valid)
      } else {
        return (this.contextName.valid && this.contextType.valid && this.flowPattern.valid && this.linto.valid && this.sttService.valid && this.nluService.valid)
      }
    },
    tockApplications () {
      return this.$store.state.tockapps
    },
    dataLoaded () {
      return (this.lintoLoaded && this.contextTypeLoaded && this.sttServicesLoaded && this.nluLoaded && this.mqttLoaded && this.patternLoaded && this.tockAppsLoaded)
    }
  },
  methods: {
    handleForm () {
      this.testContextName()
      this.testSelectField(this.flowPattern)
      this.testSelectField(this.contextType)
      this.testSelectField(this.nluService)
      this.testSelectField(this.sttServiceLanguage)
      this.testSelectField(this.sttService)
      if (this.contextType.value === 'Fleet') {
        this.testSelectField(this.linto)
      }
      if (this.nluService.value === 'tock') {
        this.testSelectField(this.tockApplicationName)
      }
      if (this.formValid) {
        this.sendForm()
      }
    },
    async sendForm () {
      let payload = {
        context_name: this.contextName.value,
        type: this.contextType.value,
        workflowPattern: this.flowPattern.value,
        mqtt: this.mqttDefaultSettings,
        stt: {
          service_name: this.sttService.value
        },
        nlu: {
          service_name: this.nluService.value,
          configs: {
            host: this.nluService.configs.host,
            namespace: 'app'
          }
        },
        linto: this.contextType.value === 'Fleet' ? this.linto.value : [],
        language: this.sttServiceLanguage.value
      }
      if (this.nluService.value === 'tock') {
        if (this.tockApplicationName.value === 'new') {
          payload.nlu.configs.appname = this.contextName.value.toLowerCase().trim().replace(/\s/g, '_')
          payload.nlu.configs.new = true
        } else {
          payload.nlu.configs.appname = this.tockApplicationName.value
          payload.nlu.configs.new = false
        }
      }
      const createContext = await axios(`${process.env.VUE_APP_URL}/api/context`, {
        method: 'post',
        data: payload
      })
      if (createContext.data.status === 'error') {
        if (createContext.data.code === 'contextName') {
          this.contextName.error = createContext.data.msg
          this.contextName.valid = false
        } else if (createContext.data.code === 'lintoDevice') {
          this.linto.error = createContext.data.msg
          this.linto.valid = false
        }

      } else {
        bus.$emit('app_notif', {
          status: createContext.data.status,
          msg: createContext.data.msg,
          timeout: 4000
        })
      }
    },
    testContextName () {
      this.$options.filters.testName(this.contextName)
    },
    testSelectField (obj) {
      this.$options.filters.testSelectField(obj)
    },
    async dispatchStore (topic) {
      const resp = await this.$options.filters.dispatchStore(topic)
      switch(topic) {
        case 'getmqttDefaultSettings':
          this.mqttLoaded = resp
          break
        case 'getSttServices':
          this.sttServicesLoaded = resp
          break
        case 'getNluSettings':
          this.nluLoaded = resp
          break
        case 'getTockApplications':
          this.tockAppsLoaded = resp
          break
        case 'getFlowPatterns':
          this.patternLoaded = resp
          break
        case 'getContextTypes':
          this.contextTypeLoaded = resp
          break
        case 'getLintoFleet':
          this.lintoLoaded = resp
          break
        default:
          return
      }
    }
  },
  components: {
    AppInput,
    AppSelect
  }
}
</script>
