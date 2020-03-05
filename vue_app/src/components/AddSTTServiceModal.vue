<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible' : 'hidden'">
    <div v-if="loading">Loading</div>
    <div class="modal flex col" v-if="dataLoaded">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1 flex row">Add a STT Service</span>
        <button @click="closeModal()" class="button button--img button--img__close"></button>
      </div>
      <div class="modal-body flex1 flex col">
        <!-- Service name -->
        <AppInput :label="'Service name'" :obj="serviceName" :test="'testName'"></AppInput>
        <!-- Service tag -->
        <AppSelect :label="'Select a tag'" :obj="serviceTag" :list="tags" :params="{key:'value', value:'value', optLabel: 'value'}"></AppSelect>
        <!--- Service replicas -->
        <div class="flex col">
          <span class="form__label">Select a number of replicas :</span>
          <input
            type="number"
            min="0"
            class="form__input"
            v-model="serviceReplicas.value"
            :class="[serviceReplicas.error !== null ? 'form__input--error' : '', serviceReplicas.valid ? 'form__input--valid' : '']"
            @change="testNumber(serviceReplicas)"
          />
          <span class="form__error-field">{{ serviceReplicas.error }}</span>
        </div>
        <!-- Service Language model -->
        <AppSelect :label="'Select a language model'" :obj="serviceLM" :list="languageModels" :params="{key:'_id', value:'modelId', optLabel: 'modelId'}"></AppSelect>

        <div class="flex row">
          <button
            class="button button--valid"
            :class="sending ? 'button--loading' : ''"
            @click="handleForm()"
          >
            <span class="label">{{ sendBtnLabel }}</span>
          </button>
        </div>
      </div>
      <div class="modal-footer flex row">
        <button class="button button--cancel" @click="closeModal()"><span class="label">Cancel</span></button>
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
      showModal: false,
      lmLoaded: false,
      tags: [
        { value: 'online-cpu' },
        { value: 'offline-cpu' },
        { value: 'online-gpu' },
        { value: 'offine-gpu' },
      ],
      serviceReplicas: {
        value: '',
        error: null,
        valid: false
      },
      serviceTag: {
        value: '',
        error: null,
        valid: false
      },
      serviceLM: {
        value: '',
        error: null,
        valid: false
      },
      serviceName: {
        value: '',
        error: null,
        valid: false
      },
      sending: false,
      sendBtnLabel: 'Create a language model',
      globalError: null
    }
  },
  created () {
    this.dispatchLanguageModels()
  },
  computed: {
    formValid () {
      return (this.serviceName.valid && this.serviceReplicas.valid && this.serviceLM.valid && this.serviceTag.valid)
    },
    dataLoaded () {
      return this.lmLoaded
    },
    languageModels () {
      return this.$store.state.sttLanguageModels
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    },
    sending: function (data) {
      if (data) {
        this.sendBtnLabel = 'Processing...'
      } else {
        this.sendBtnLabel = 'Create an acoustic model'
      }
    }
  },
  mounted () {
    bus.$on('add_stt_service', (data) => {
      this.showModal = true
    })
  },
  methods: {
    closeModal () {
      this.showModal = false
    },
    handleForm () {
      this.testName(this.serviceName)
      this.testSelectField(this.serviceLM)
      this.testSelectField(this.serviceTag)
      this.testNumber(this.serviceReplicas)
      if (this.formValid) {
        this.sendForm()
      }
    },
    async sendForm () {
      try {
        this.sending = true
        this.globalError = null
        const payload = {
          serviceId: this.serviceName.value,
          replicas: this.serviceReplicas.value,
          tag: this.serviceTag.value,
          languageModel: this.serviceLM.value
        }
        const createService = await axios(`${process.env.VUE_APP_URL}/api/stt/service`, {
          method: 'post',
          data: payload
        })
        if (createService.data.status === 'success') {
          this.sending = false
          this.closeModal()
          bus.$emit('app_notif', {
            status: createService.data.status,
            msg: createService.data.msg,
            timeout: 4000
          })
        } else {
          this.sending = false
          this.globalError = createService.data.msg
        }
      } catch (error) {
        console.error(error)
      }
    },
    testName (obj) {
      this.$options.filters.testName(obj)
    },
    testSelectField (obj) {
      this.$options.filters.testSelectField(obj)
    },
    testNumber (obj) {
      obj.error = null
      obj.valid = false
      if (obj.value.length === 0) {
        obj.error = 'This field is required'
      } else {
        obj.valid = true
      }
    },
    async dispatchLanguageModels (topic) {
      this.lmLoaded = await this.$options.filters.dispatchStore('getSttLanguageModels')
    }
  },
  components: {
    AppInput,
    AppSelect
  }
}
</script>
