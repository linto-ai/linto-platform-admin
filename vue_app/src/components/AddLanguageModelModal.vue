<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible' : 'hidden'">
    <div class="modal flex col">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1 flex row">Add a Language model</span>
        <button @click="closeModal()" class="button button--img button--img__close"></button>
      </div>
      <div class="modal-body flex1 flex col" v-if="loading">
        Loading
      </div>
      <div class="modal-body flex1 flex col" v-if="dataLoaded">

        <AppInput :label="'Language model name'" :obj="langModelName" :test="'testName'"></AppInput>

        <AppSelect :label="'Select a language'" :obj="acModel" :list="acModels" :params="{key:'_id', value:'modelId', optLabel: 'modelId'}"></AppSelect>

        <div class="flex row">
          <button
            class="button button--valid"
            :class="sending ? 'button--loading' : ''"
            @click="handleForm()"
          >
            <span class="label">{{ sendBtnLabel }}</span>
          </button>
        </div>
        <span v-if="globalError !== null" >{{ globalError }}</span>
      </div>
      <div class="modal-footer flex terrow">
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
      showModal: false,
      loading: true,
      acModelLoaded: false,
      acModel: {
        value: '',
        error: null,
        valid: false
      },
      langModelName: {
        value: '',
        error: null,
        valid: false
      },
      sending: false,
      sendBtnLabel: 'Create a language model',
      globalError: null
    }
  },
  mounted () {
    bus.$on('add_language_model', async (data) => {
      await this.dispatchACModel()
      this.showModal = true
    })
  },
  computed: {
    dataLoaded () {
      return this.acModelLoaded
    },
    acModels () {
      return this.$store.state.sttAcousticModels
    },
    formValid () {
      return (this.acModel.valid && this.langModelName.valid)
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    },
    sending (data) {
      if (data) {
        this.sendBtnLabel = 'Processing...'
      } else {
        this.sendBtnLabel = 'Create a language model'
      }
    }
  },
  methods: {
    closeModal () {
      this.showModal = false
    },
    handleForm () {
      this.testSelectField(this.acModel)
      this.testName(this.langModelName)
      if (this.formValid) {
        this.createLanguageModel()
      }
    },
    testName (obj) {
      this.$options.filters.testName(obj)
    },
    testSelectField (obj) {
      this.$options.filters.testSelectField(obj)
    },
    async createLanguageModel () {
      this.globalError = null
      const payload = {
        lmodelname: this.langModelName.value,
        acmodelname: this.acModel.value
      }
      const createLM = await axios(`${process.env.VUE_APP_URL}/api/stt/langmodel`, {
        method: 'post',
        data: payload
      })
      if (createLM.data.status === 'success') {
        this.sending = false
        await this.dispatchACModel()
        this.closeModal()
        bus.$emit('app_notif', {
          status: createLM.data.status,
          msg: createLM.data.msg,
          timeout: 4000
        })
      } else {
        this.sending = false
        this.globalError = createLM.data.msg
      }
    },
    async dispatchACModel (topic) {
      this.acModelLoaded = await this.$options.filters.dispatchStore('getSttAcousticModels')
    }
  },
  components: {
    AppInput,
    AppSelect
  }
}
</script>
