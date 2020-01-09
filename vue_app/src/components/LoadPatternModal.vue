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
          <AppSelect :label="'Select a workflow pattern'" :obj="selectedPattern" :list="flowPatterns" :params="{key:'_id', value:'_id', optLabel: 'name'}"></AppSelect>
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
import AppSelect from '@/components/AppSelect.vue'
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
      this.testSelectField(this.selectedPattern)

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
    testSelectField (obj) {
      this.$options.filters.testSelectField(obj)
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
  },
  components: {
    AppSelect
  }
}
</script>
