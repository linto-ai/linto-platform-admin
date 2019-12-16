<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible' : 'hidden'">
    <div class="modal flex col">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1 flex row">Save as new flow pattern</span>
        <button @click="closeModal()" class="button button--img button--img__close"></button>

      </div>
      <div class="modal-body flex1 flex col">
        <span class="modal-body__content">
          To save this flow as a new flow pattern, please fill in the following fields:
        </span>
        <div class="modal-body__form">
          <div class="flex col">
          <span class="form__label">Enter a workflow pattern name :</span>
          <input
            class="form__input"
            v-model="patternName.value"
            placeholder="Flow pattern name"
            :class="[patternName.error !== null ? 'form__input--error' : '', patternName.valid ? 'form__input--valid' : '']"
            @change="testPatternName()"
          >
          <span class="form__error-field">{{ patternName.error }}</span>
          </div>
          <div class="flex col">
            <span class="form__label">Select a workflow pattern type :</span>
            <select
              class="form__select"
              v-model="contextType.value"
              :class="[contextType.error !== null ? 'form__select--error' : '',
              contextType.valid ? 'form__select--valid' : '']"
              @change="testContextType()"
            >
              <option v-for="type in contextTypes" :value="type.name" :key="type._id">{{ type.name }}</option>
            </select>
            <span class="form__error-field">{{ contextType.error }}</span>
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
      patternName: {
        value: '',
        error: null,
        valid: false
      },
      contextType: {
        value: '',
        error: null,
        valid: false
      },
      showModal: false
    }
  },
  mounted () {
    bus.$on('save_new_pattern', () => {
      this.showModal = true
    })
  },
  created () {
    this.dispatchContextTypes()
  },
  computed: {
    contextTypes () {
      return this.$store.state.contextTypes
    },
    formValid () {
      return (this.patternName.valid && this.contextType.valid)
    }
  },
  methods: {
    closeModal () {
      this.showModal = false
    },
    handleForm () {
      this.testContextType()
      this.testPatternName()
      if (this.formValid) {
        this.sendForm()
      }
    },
    testPatternName () {
      this.patternName.error = null
      this.patternName.valid = false
      if (this.patternName.value.length === 0) {
        this.patternName.error = 'This field is required'
      } else {
        this.patternName.valid = true
      }
    },
    testContextType () {
      this.contextType.error = null
      this.contextType.valid = false
      if (this.contextType.value.length === 0) {
        this.contextType.error = 'This field is required'
      } else {
        this.contextType.valid = true
      }
    },
    async sendForm () {
      const payload = {
        patternName: this.patternName.value,
        contextType: this.contextType.value
      }
      console.log(payload)
      let saveAsPattern = await axios(`${process.env.VUE_APP_URL}/api/flow/patterns`, {
        method: 'post',
        data: payload
      })

      if (saveAsPattern.data.status === 'error_name') {
        this.patternName.valid = false
        this.patternName.error = saveAsPattern.data.msg
      } else if (saveAsPattern.data.status === 'success') {
        alert('Succes')
        this.dispatchContextTypes()
      } else {
        alert('ERROR')
      }
    },
    dispatchContextTypes () {
      this.$store.dispatch('getContextTypes').then((resp) => {
        if (!!resp.error) {
          console.log('Dispatch pattern types : Error')
        }
      })
    }
  }
}
</script>
