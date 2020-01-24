<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible' : 'hidden'">
    <div class="modal flex col">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1 flex row">Save as new flow pattern</span>
        <button @click="closeModal()" class="button button--img button--img__close"></button>
      </div>
      <div class="modal-body flex1 flex col" v-if="loading">
        Loading
      </div>
      <div class="modal-body flex1 flex col" v-if="dataLoaded">
        <span class="modal-body__content">
          To save this flow as a new flow pattern, please fill in the following fields:
        </span>
        <div class="modal-body__form">
          <AppInput :label="'Enter a workflow pattern name'" :obj="patternName" :test="'testPatternName'" :patterns="patterns"></AppInput>
          <AppSelect :label="'Select a workflow pattern type'" :obj="contextType" :list="contextTypes" :params="{key:'_id', value:'name', optLabel: 'name'}"></AppSelect>
        </div>
      </div>
      <div v-else>Loading</div>
      <div class="modal-footer flex row">
        <button class="button button--cancel" @click="closeModal()"><span class="label">Cancel</span></button>
        <button class="button button--valid" @click="handleForm()"><span class="label">Submit</span></button>
      </div>
    </div>
  </div>
</template>
<script>
import AppSelect from '@/components/AppSelect.vue'
import AppInput from '@/components/AppInput.vue'
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
      showModal: false,
      contextTypesLoaded: false,
      patternsLoaded: false,
      loading: true
    }
  },
  mounted () {
    bus.$on('save_new_pattern', () => {
      this.showModal = true
    })
  },
  created () {
    this.dispatchStore('getContextTypes')
    this.dispatchStore('getFlowPatterns')
  },
  computed: {
    contextTypes () {
      return this.$store.state.contextTypes
    },
    formValid () {
      return (this.patternName.valid && this.contextType.valid)
    },
    patterns () {
      return this.$store.state.flowPatterns
    },
    dataLoaded () {
      return (this.contextTypesLoaded && this.patternsLoaded)
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    }
  },
  methods: {
    closeModal () {
      this.showModal = false
    },
    handleForm () {
      this.testSelectField(this.contextType)
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
        this.patternName.valid = false
      } else {
        let patternNameExist = false
        this.patterns.map(l => {
          if (l.name === this.patternName.value) {
            patternNameExist = true
          }
        })
        if (patternNameExist) {
          this.patternName.error = 'This workflow pattern name is already used'
          this.patternName.valid = false
        } else {
          this.patternName.valid = true
        }
      }
    },
    testSelectField (obj) {
      this.$options.filters.testSelectField(obj)
    },
    async sendForm () {
      const payload = {
        patternName: this.patternName.value,
        contextType: this.contextType.value
      }
      let saveAsPattern = await axios(`${process.env.VUE_APP_URL}/api/flow/patterns`, {
        method: 'post',
        data: payload
      })
      if (saveAsPattern.data.status === 'error_name') {
        this.patternName.valid = false
        this.patternName.error = saveAsPattern.data.msg
      } else {
        this.showModal = false
        bus.$emit('app_notif', {
          status: saveAsPattern.data.status,
          msg: saveAsPattern.data.msg,
          timeout: 4000
        })
      }
    },
    async dispatchStore (topic) {
      const resp = await this.$options.filters.dispatchStore(topic)
      switch(topic) {
        case 'getContextTypes':
          this.contextTypesLoaded = resp
          break
        case 'getFlowPatterns':
          this.patternsLoaded = resp
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
