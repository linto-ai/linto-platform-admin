<template>
  <div>
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
              <option v-for="type in contextTypes" :key="type._id" :value="type.name">{{ type.name }}</option>
            </select>
            <span class="form__error-field">{{ contextType.error }}</span>
          </div>
          <!-- Lintos (HW) -->
          <div class="flex col" v-if="contextType.value === 'Client Hardware'">
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
          <h3>NLU Services</h3>
          <div class="flex col">
            <span class="form__label">Nlu service:</span>
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

          <h3>STT Services</h3>
          <div class="flex col">
            <span class="form__label">STT service:</span>
            <select
              class="form__select"
              v-model="sttService.value"
              :class="[sttService.error !== null ? 'form__select--error' : '', sttService.valid ? 'form__select--valid' : '']"
              @change="testSelectField(sttService)"
            >
              <option v-for="stt in sttServices" :key="stt.service_name" :value="stt.service_name">{{ stt.service_name }}</option>
            </select>
            <span class="form__error-field">{{ sttService.error }}</span>
          </div>
          <div class="flex row">
            <button class="button button--valid button--full" @click="handleForm()">
              <span class="label">Create a context</span>
            </button>
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
      sttService: {
        value: '',
        error: null,
        valid: false,
        configs: {}
      },
      mqttServer: {
        host: '',
        port: '',
        scope: ''
      }
    }
  },
  /*
  mounted () {
    setTimeout(()=> {
      console.log(this.$store)
    },1000)
  },
  */
  created () {
    this.dispatchContextTypes()
    this.dispatchPatterns()
    this.dispatchNluConfigs()
    this.dispatchMqttDefaultSettings()
    this.dispatchSttConfigs()
    this.dispatchLintos()
  },
  watch: {
    'nluService.value': function (data) {
      if (data.length > 0) {
        this.nluServices.map(n => {
          if (n.service_name === data) {
            this.nluService.configs = {
              host: n.host,
              app_name: n.app_name,
              namespace: n.namespace
            }
          }
        })
      }
    },
    'sttService.value': function (data) {
      if (data.length > 0) {
        this.sttServices.map(s => {
          if (s.service_name === data) {
            this.sttService.configs = {
              host: s.host
            }
          }
        })
      }
    },
    'contextType.value': function (data) {
      this.flowPattern.value = ''
      this.flowPattern.error = null
      this.flowPattern.valid = false

      if (data === 'Client Hardware') {
        this.mqttServer = this.mqttDefaultSettings
      } else {
       this.mqttServer = {
         host: '',
         port: '',
         scope: ''
       }
      }
    }
  },
  computed: {
    availableLintos () {
      return this.$store.getters.NOT_ASSOCIATED_LINTOS
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
    }
  },
  methods: {
    handleForm () {

      this.testContextName()
      this.testSelectField(this.flowPattern)
      this.testSelectField(this.contextType)
      this.testSelectField(this.nluService)
      this.testSelectField(this.sttService)

      console.log(payload)
      console.log('Form valid:', this.formValid)
      if (this.formValid) {
        this.sendForm
      }
    },
    async sendForm () {
      const payload = {
        context_name: this.contextName.value,
        type: this.contextType.value,
        pattern: this.flowPattern.value,
        mqtt: this.mqttDefaultSettings,
        stt: {
          service_name: this.sttService.value,
          configs: this.sttService.configs
        },
        nlu: {
          service_name: this.nluService.value,
          configs: this.nluService.configs
        },
        linto: this.linto.value
      }
      const createContext = await axios(`${process.env.VUE_APP_URL}/api/context`, {
        method: 'post',
        data: payload
      })
      console.log(createContext)
    },
    testContextName () {
      this.contextName.valid = false
      this.contextName.error = null
      const regex = /^[0-9A-Za-z\s\-\_]+$/
      if(this.contextName.value.length === 0) {
        this.contextName.valid = false
        this.contextName.error = 'This field is required'
      }
      else if(this.contextName.value.match(regex)) {
        this.contextName.valid = true
        this.contextName.error = null
      } else {
        this.contextName.valid = false
        this.contextName.error = 'Ivalid context name'
      }
    },
    testSelectField (obj) {
      obj.error = null
      obj.valid = false
      if(typeof(obj.value) === 'undefined') {
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
    dispatchLintos () {
      this.$store.dispatch('getLintos').then((resp) => {
        if (!!resp.error) {
          console.log('Dispatch Lintos : Error')
        }
      })
    },
    dispatchMqttDefaultSettings () {
      this.$store.dispatch('getmqttDefaultSettings').then((resp) => {
        if (!!resp.error) {
          console.log('Dispatch Mqtt settings types : Error')
        }
      })
    },
    dispatchSttConfigs () {
      this.$store.dispatch('getSttSettings').then((resp) => {
        if (!!resp.error) {
          console.log('Dispatch Stt settings types : Error')
        }
      })
    },
    dispatchNluConfigs () {
      this.$store.dispatch('getNluSettings').then((resp) => {
        if (!!resp.error) {
          console.log('Dispatch Nlu Configs : Error')
        }
      })
    },
    dispatchContextTypes () {
      this.$store.dispatch('getContextTypes').then((resp) => {
        if (!!resp.error) {
          console.log('Dispatch pattern types : Error')
        }
      })
    },
    dispatchPatterns () {
      this.$store.dispatch('getFlowPatterns').then((resp) => {
        if (!!resp.error) {
          console.log('Dispatch pattern types : Error')
        }
      })
    }
  }
}
</script>
