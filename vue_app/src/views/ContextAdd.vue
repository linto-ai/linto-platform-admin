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
            <AppInput :label="'Context name'" :obj="contextName" :test="'testContextName'"></AppInput>
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
      contextsLoaded: false,
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
        configs: {
          host: '',
          namesapce: '',
          new: false
        }
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
      },
      blsUp: false,
      tockUp: false,
      sttUp: false

    }
  },
  beforeRouteEnter (to, form, next) {
    // Check that all the needed services are up
    next((vm) => {
      vm.isBlsUp()
      vm.isTockUp()
      vm.isSttUp()
    })
  },
  created () {
    this.dispatchStore('getmqttDefaultSettings')
    this.dispatchStore('getSttLanguageModels')
    this.dispatchStore('getFleetContexts')
    this.dispatchStore('getFlowPatterns')
    this.dispatchStore('getContextTypes')
    this.dispatchStore('getLintoFleet')
  },
  mounted () {
    bus.$on('create_context_success', (data) => {
      bus.$emit('app_notif', {
          status: 'success',
          msg: `The context ${data.context.name} has been created. You will be redirected.`,
          timeout: 4000,
          redirect: '/admin/context/overview'
        })
    })
  },
  watch: {
    'nluService.value': function (data) {
      if (data.length > 0) {
        this.nluServices.map(n => {
          if (n.service_name === data) {
            // Update NLU configs when a NLU service is selected
            this.nluService.configs = {
              host: n.host
            }
          }
        })
      }
    },
    'contextType.value': function (data) {
      // Reset selected flow pattern when the context type is updated
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
      // Update STT configs when a STT service is selected
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
    },
    /*availableServices (data) {
      if (data.filter(f => f.serviceId === this.sttService.value).length === 0) {
        this.sttService = {
          value: '',
          error: null,
          valid: false
        }
      }
    }*/
  },
  computed: {
    availableLintos () {
      return this.$store.getters.NOT_ASSOCIATED_LINTO_FLEET
    },
    contexts () {
      return this.$store.state.contextFleet
    },
    contextTypes () {
      return this.$store.state.contextTypes
    },
    nluServices () {
      return this.$store.state.nluServices
    },
    mqttDefaultSettings () {
      return this.$store.state.mqttDefaultSettings
    },
    sttServices () {
      return this.$store.getters.STT_SERVICES_AVAILABLE
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
    availableServices () {
      if (this.sttServiceLanguage.value === '') {
        return this.$store.getters.STT_SERVICES_AVAILABLE
      } else {
        let allServices = this.sttServices
        let filteredServices = []
        for (let i in allServices) {
          if (allServices[i].lang === this.sttServiceLanguage.value) {
            filteredServices.push(allServices[i])
          }
        }
        return filteredServices
      }
    },
    sttServicesLanguages () {
      let lang = []
      let resp = []
      this.availableServices.map(s => {
        if (lang.indexOf(s.lang) < 0) {
          lang.push(s.lang)
          resp.push({ value: s.lang })
        }
      })
      return resp
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
      return (this.lintoLoaded && this.contextTypeLoaded && this.sttServicesLoaded && this.nluLoaded && this.mqttLoaded && this.patternLoaded && this.tockAppsLoaded && this.contextsLoaded && this.blsUp && this.tockUp && this.sttUp)
    },
    contextPayload () {
      return {
        context_name: this.contextName.value || null,
        type: this.contextType.value || null,
        workflowPattern: this.flowPattern.value || null,
        mqtt: this.mqttDefaultSettings || null,
        stt: {
          service_name: this.sttService.value || null
        },
        nlu: {
          service_name: this.nluService.value || null,
          configs: {
            host: this.nluService.configs.host || null,
            namespace: 'app'
          }
        },
        linto: this.contextType.value === 'Fleet' ? this.linto.value : [],
        language: this.sttServiceLanguage.value || null
      }
    }
  },
  methods: {
    // Check if TOCK services are available
    async isTockUp () {
      try {
        const connectTock = await axios(`${process.env.VUE_APP_URL}/api/tock/healthcheck`)
        if (connectTock.data.status === 'success') {
          this.tockUp = true
          this.dispatchStore('getNluServices')
          this.dispatchStore('getTockApplications')
        } else {
          throw 'error'
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect to Tock services',
          timeout: false
        })
      }
    },
    // Check if the business logic server is available
    async isBlsUp () {
      try {
        const connectBls = await axios.get(`${process.env.VUE_APP_URL}/api/flow/healthcheck`)
        if (connectBls.status === 200) {
          this.blsUp = true
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect to Business logic server',
          timeout: false
        })
      }
    },
    // Check if STT services are available
    async isSttUp () {
      try {
        const connectSTT = await axios.get(`${process.env.VUE_APP_URL}/api/stt/healthcheck`)
        if (connectSTT.data.status === 'success') {
          this.sttUp = true
          this.dispatchStore('getSttServices')
        }
        else {
          throw 'error'
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect to STT service manager',
          timeout: false
        })
      }
    },
    // Test every required field in the form
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

      if (this.contexts.filter(l => l.name === this.contextName.value).length > 0) {
        this.contextName.error = 'This context name is already used'
        this.contextName.valid = false
      }

      if (this.formValid) {
        this.sendForm()
      }
    },
    // Update Context payload and trigger context creation
    async sendForm () {
      try {
        if (this.nluService.value === 'tock') {
          if (this.tockApplicationName.value === 'new') {
            this.contextPayload.nlu.configs.appname = this.contextName.value.toLowerCase().trim().replace(/\s/g, '_')
            this.contextPayload.nlu.configs.new = true
          } else {
            this.contextPayload.nlu.configs.appname = this.tockApplicationName.value
            this.contextPayload.nlu.configs.new = false
          }
        }
        // Trigger context creation steps
        bus.$emit('add_context_modal', { payload: this.contextPayload })
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'An error has occured',
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
      try {
        const resp = await this.$options.filters.dispatchStore(topic)
        if (resp.status === 'success') {
          switch (topic) {
            case 'getFleetContexts':
              this.contextsLoaded = resp
            case 'getmqttDefaultSettings':
              this.mqttLoaded = resp
              break
            case 'getSttServices':
              this.sttServicesLoaded = resp
              break
            case 'getNluServices':
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
        } else {
          bus.$emit('app_notif', {
            status: 'error',
            msg: resp.msg,
            timeout: false
          })
        }

      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'An error has occured',
          timeout: false
        })
      }
    }
  },
  components: {
    AppInput,
    AppSelect
  }
}
</script>
