<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible' : 'hidden'">
    <div class="modal flex col">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1 flex row">Add an acoustic model</span>
        <button @click="closeModal()" class="button button--img button--img__close"></button>

      </div>
      <div class="modal-body flex1 flex col">
        <!-- Acoustic model name -->
        <AppInput :label="'Acoustic model name'" :obj="acModelName" :test="'testName'"></AppInput>
        <!-- Acoustic model language -->
        <AppSelect :label="'Select a language'" :obj="acModelLanguage" :list="languages" :params="{key:'value', value:'value', optLabel: 'label'}"></AppSelect>
        <!-- Uplaod acoustic model file -->
        <div class="flex col">
          <span class="form__label">upload model (.zip, .tar.gz) :</span>
          <input
            class="form__input form__input--file"
            type="file"
            accept="application/zip, application/gzip, application/x-gzip"
            @change="setFile($event)"
            id="acmodel-file"
            :class="[modelFile.error !== null ? 'form__input--error' : '', modelFile.valid ? 'form__input--valid' : '']"
          />
          <span class="form__error-field">{{ modelFile.error }}</span>
        </div>
        <div class="flex row">
          <button
            class="button button--valid"
            :class="sending ? 'button--loading' : ''"
            @click="handleForm()"
          >
            <span class="label">{{ sendBtnLabel }}</span>
          </button>
          <div v-if="globalError !== null">{{ globalError }}</div>
        </div>
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
      acModelName: {
        value: '',
        error: null,
        valid: false
      },
      acModelLanguage: {
        value: '',
        error: null,
        valid: false
      },
      languages: [
        {
          value: 'fr-FR',
          label: 'French'
        },
        {
          value: 'en-US',
          label: 'English'
        }
      ],
      modelFile: {
        value: '',
        error: null,
        valid: true
      },
      sending: false,
      sendBtnLabel: 'Create an acoustic model',
      globalError: null
    }
  },
  watch: {
    sending: function (data) {
      if (data) {
        this.sendBtnLabel = 'Processing...'
      } else {
        this.sendBtnLabel = 'Create an acoustic model'
      }
    }
  },
  computed: {
    formValid () {
      return (this.acModelName.valid && this.acModelLanguage.valid && this.modelFile !== null)
    }
  },
  mounted () {
    bus.$on('add_acoustic_model', (data) => {
      this.showModal = true
    })
  },
  methods: {
    closeModal () {
      this.showModal = false
    },
    setFile (event) {
      this.modelFile.value = event.target.files[0]
    },
    async createModel () {
      this.sending = true
      this.globalError = null
      const payload = {
        acmodel: this.acModelName.value,
        lang: this.acModelLanguage.value
      }
      let formData = new FormData()
      formData.append('infos', JSON.stringify(payload))
      formData.append('file', this.modelFile.value)
      const createModel = await axios(`${process.env.VUE_APP_URL}/api/stt/acmodel`, {
        method: 'post',
        data: formData
      })
      if (createModel.data.status === 'success') {
        this.sending = false
        this.closeModal()
        bus.$emit('app_notif', {
          status: createModel.data.status,
          msg: createModel.data.msg,
          timeout: 4000
        })
      } else {
        this.sending = false
        this.globalError = createModel.data.msg
      }
    },
    handleForm () {
      this.testSelectField(this.acModelLanguage)
      this.testName(this.acModelName)
      if (this.formValid) {
        this.createModel()
      }
    },
    testFile () {
      this.modelFile.error = null
      this.modelFile.valid = false
      if (this.modelFile.value !== '') {
        this.modelFile.valid = true
      } else {
        this.modelFile.error = 'Please select a file'
        this.valid = false
      }
    },
    testSelectField (obj) {
      this.$options.filters.testSelectField(obj)
    },
    testName (obj) {
      this.$options.filters.testName(obj)
    }
  },
  components: {
    AppInput,
    AppSelect
  }
}
</script>
