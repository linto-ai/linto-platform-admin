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
            <div class="flex col">
              <span class="form__label">Context name:</span>
              <input
                type="text"
                class="form__input"
                v-model="contextName.value"
                :class="[contextName.error !== null ? 'form__input--error' : '', contextName.valid ? 'form__input--valid' : '']"
                @blur="testContextName()"
              />
              <span class="form__error-field">{{ contextName.error }}</span>
            </div>
            <!-- Context Type -->
            <div class="flex col">
              <span class="form__label">Context type:</span>
              <select
                class="form__select"
                v-model="contextType.value"
                :class="[contextType.error !== null ? 'form__select--error' : '', contextType.valid ? 'form__select--valid' : '']"
                @change="testSelectField(contextType)"
              >
                <option
                  v-for="type in contextTypes"
                  :key="type._id"
                  :value="type.name"
                  :disabled="type.name === 'Application' ? 'disabled' : false"
                >{{ type.name }}</option>
              </select>
              <span class="form__error-field">{{ contextType.error }}</span>
            </div>
            <!-- Lintos (HW) -->
            <div class="flex col" v-if="contextType.value === 'Fleet'">
              <span class="form__label">Select a LinTO:</span>
              <select
                class="form__select"
                v-model="linto.value"
                :class="[linto.error !== null ? 'form__select--error' : '', linto.valid ? 'form__select--valid' : '']"
                @change="testSelectField(linto)"
              >
                <option v-for="lin in availableLintos" :key="lin._id" :value="lin.sn">{{ lin.sn }}</option>
              </select>
              <span class="form__error-field">{{ linto.error }}</span>
            </div>
            <!-- Flow pattern -->
            <div class="flex col">
              <span class="form__label">Workflow pattern:</span>
              <select
                class="form__select"
                v-model="flowPattern.value"
                :class="[flowPattern.error !== null ? 'form__select--error' : '', flowPattern.valid ? 'form__select--valid' : '']"
                :disabled="contextType.value === '' ? true : false"
                @change="testSelectField(flowPattern)"
              >
                <option v-for="pattern in flowPatterns" :key="pattern._id" :value="pattern.name">{{ pattern.name }}</option>
              </select>
              <span class="form__info" v-if="contextType.value === ''">Select a context type</span>
              <span class="form__error-field">{{ flowPattern.error }}</span>
            </div>
            <!-- NLU SERVICE -->
            <h3>NLU Service</h3>
            <div class="flex col">
              <span class="form__label">NLU service:</span>
              <select
                class="form__select"
                v-model="nluService.value"
                :class="[nluService.error !== null ? 'form__select--error' : '', nluService.valid ? 'form__select--valid' : '']"
                @change="testSelectField(nluService)"
              >
                <option v-for="nlu in nluServices" :key="nlu.service_name" :value="nlu.service_name">{{ nlu.service_name }}</option>
              </select>
              <span class="form__error-field">{{ nluService.error }}</span>
            </div>
            <!-- STT SERVICE -->
            <h3>STT service</h3>
            <div class="flex col">
              <span class="form__label">STT service:</span>
              <select
                class="form__select"
                v-model="sttService.value"
                :class="[sttService.error !== null ? 'form__select--error' : '', sttService.valid ? 'form__select--valid' : '']"
                @change="testSelectField(sttService)"
              >
                <option v-for="stt in sttServices" :key="stt._id" :value="stt.serviceId">{{ stt.serviceId }}</option>
              </select>
              <span class="form__error-field">{{ sttService.error }}</span>
            </div>
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
import { bus } from '../main.js'
import axios from 'axios'

export default {
  data () {
    return {
      loading: true,
      lintoLoaded: false,
      mqttLoaded: false,
      sttLoaded: false,
      nluLoaded: false,
      patternLoaded: false,
      contextTypeLoaded: false,
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
      }
    }
  },
  created () {
    this.dispatchStore('getmqttDefaultSettings')
    this.dispatchStore('getSttSettings')
    this.dispatchStore('getNluSettings')
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
              host: n.host,
              appname: n.appname,
              namespace: n.namespace
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
      return this.$store.state.sttSettings
    },
    formValid () {
      return (this.contextName.valid && this.contextType.valid && this.flowPattern.valid && this.linto.valid && this.sttService.valid && this.nluService.valid)
    },
    dataLoaded () {
      return (this.lintoLoaded && this.contextTypeLoaded && this.sttLoaded && this.nluLoaded && this.mqttLoaded && this.patternLoaded)
    },

  },
  methods: {
    handleForm () {
      this.testContextName()
      this.testSelectField(this.flowPattern)
      this.testSelectField(this.contextType)
      this.testSelectField(this.nluService)
      this.testSelectField(this.sttService)
      if (this.contextType.value === 'Fleet') {
        this.testSelectField(this.linto)
      }
      if (this.formValid) {
        this.sendForm()
      }
    },
    async sendForm () {
      const payload = {
        context_name: this.contextName.value,
        type: this.contextType.value,
        workflowPattern: this.flowPattern.value,
        mqtt: this.mqttDefaultSettings,
        stt: {
          service_name: this.sttService.value,
          configs: this.sttService.configs
        },
        nlu: {
          service_name: this.nluService.value,
          configs: this.nluService.configs
        },
        linto: this.contextType.value === 'Fleet' ? this.linto.value : []
      }
      const createContext = await axios(`${process.env.VUE_APP_URL}/api/context`, {
        method: 'post',
        data: payload
      })
      if (createContext.data.status === 'error') {
        if (createContext.data.code === 'contextName') {
          this.contextName.error = createContext.data.msg
          this.contextName.valid = false
        } else {
          // TODO ERROR
        }
      } else {
        // TODO SUCCESS
      }
      // TODO > NOTIF
    },
    testContextName () {
      this.contextName.valid = false
      this.contextName.error = null
      const regex = /^[0-9A-Za-z\s\-\_]+$/
      if (this.contextName.value.length === 0) {
        this.contextName.valid = false
        this.contextName.error = 'This field is required'
      }
      else if (this.contextName.value.match(regex)) {
        this.contextName.valid = true
        this.contextName.error = null
      } else {
        this.contextName.valid = false
        this.contextName.error = 'Invalid context name'
      }
    },
    testSelectField (obj) {
      obj.error = null
      obj.valid = false
      if (typeof(obj.value) === 'undefined') {
        obj.value = ''
      }
      if (obj.value === '' || obj.value.length === 0 ) {
        obj.valid = false
        obj.error = 'This field is required'
      } else {
        obj.valid = true
        obj.error = null
      }
    },
    dispatchStore (topic) {
      try {
        this.$store.dispatch(topic).then((resp) => {
          if (!!resp.error) {
            throw resp.error
          } else {
            switch(topic) {
              case 'getmqttDefaultSettings':
                this.mqttLoaded = true
                break;
              case 'getSttSettings':
                this.sttLoaded = true
                break;
              case 'getNluSettings':
                this.nluLoaded = true
                break;
              case 'getFlowPatterns':
                this.patternLoaded = true
                break;
              case 'getContextTypes':
                this.contextTypeLoaded = true
                break;
              case 'getLintoFleet':
                this.lintoLoaded = true
                break;
              default:
                return
            }
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
