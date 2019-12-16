<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible' : 'hidden'">
    <div class="modal flex col">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1 flex row">Load a flow from existing pattern</span>
        <button @click="closeModal()" class="button button--img button--img__close"></button>

      </div>
      <div class="modal-body flex1 flex col">
        <span class="modal-body__content">
          Select the workflow pattern you want to use:
        </span>
        <div class="modal-body__form">
          <div class="flex col">
            <span class="form__label">Select a workflow pattern :</span>
            <select
              class="form__select"
              v-model="selectedPattern.value"
              :class="[selectedPattern.error !== null ? 'form__select--error' : '',
              selectedPattern.valid ? 'form__select--valid' : '']"
              @change="testPattern()"
            >
              <option v-for="pattern in flowPatterns" :value="pattern._id" :key="pattern._id">{{ pattern.name }} ({{ pattern.type }})</option>
            </select>
            <span class="form__error-field">{{ selectedPattern.error }}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer flex row">
        <button class="button button--cancel" @click="closeModal()"><span class="label">Cancel</span></button>
        <button class="button button--valid" @click="handleForm()"><span class="label">Submit</span></button>
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
      selectedPattern: {
        value: '',
        error: null,
        valid: false
      },
      workspaceId: '',
      workflow: '',
      showModal: false
    }
  },
  mounted () {
    bus.$on('load_from_pattern', (data) => {
      this.dispatchTmpPattern()
      this.showModal = true
    })
  },
  created () {
    this.dispatchPatterns()
  },
  computed: {
    flowPatterns () {
      return this.$store.state.flowPatterns
    },
    formValid () {
      return this.selectedPattern.valid
    },
    tmpPattern () {
      return this.$store.state.flowPatternTmp
    }
  },
  watch: {
    showModal: function (data) {
      if(data) {
        this.dispatchPatterns()
      }
    },
    tmpPattern: function (data) {
      this.workspaceId = data.workspaceId
    }
  },
  methods: {
    closeModal () {
      this.showModal = false
    },
    handleForm () {
      this.testPattern()

      if (this.formValid) {
        this.sendForm()
      }
    },
    async sendForm () {
      const sendForm = await axios(`${process.env.VUE_APP_URL}/api/flow/workflow`, {
        method: 'put',
        data: {
          workspaceId: this.workspaceId,
          patternId: this.selectedPattern.value
        }
      })
      if(sendForm.data.status === 'success') {
        this.showModal = false
        bus.$emit('iframe_reload', {})
      }
    },
    testPattern () {
      this.selectedPattern.error = null
      this.selectedPattern.valid = false
      if(this.selectedPattern.value.length === 0) {
        this.selectedPattern.error = 'This field is required'
        this.selectedPattern.valid = false
      } else {
        this.selectedPattern.valid = true
      }
    },
    dispatchPatterns () {
      this.$store.dispatch('getFlowPatterns').then((resp) => {
        if (!!resp.error) {
          console.log('Dispatch pattern types : Error')
        }
      })
    },
    dispatchTmpPattern () {
      this.$store.dispatch('getTmpPattern').then((resp) => {
        if (!!resp.error) {
          console.log('Dispatch pattern types : Error')
        }
      })
    }
  }
}
</script>
