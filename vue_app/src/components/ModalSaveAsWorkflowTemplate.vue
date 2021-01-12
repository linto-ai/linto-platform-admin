<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Save as new workflow template</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
          <AppInput :label="'Workflow template name'" :obj="workflowTemplateName" :test="'testWorkflowTemplateName'"></AppInput>
          <AppSelect :label="'Workflow type'" :obj="workflowType" :list="workflowTypes" :params="{key:'value', value:'value', optLabel: 'label'}"></AppSelect>
        </div>
      </div>
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="saveAsNewTemplate()">
            <span class="button__icon button__icon--apply"></span>
            <span class="button__label">Apply</span>
          </button>
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
      modalVisible: false,
      workflowId: null,
      workflowTemplatesLoaded: false,
      workflowTemplateName: {
        value: '',
        error: null,
        valid: false
      },
      workflowType: {
        value: '',
        error: null,
        valid: false
      },
      workflowTypes: [{value: 'static', label:'device'}, {value: 'application', label: 'mutli-user'}]
    }
  },
  computed: {
    dataLoaded () {
      return this.workflowTemplatesLoaded
    },
    formValid () {
      return this.workflowTemplateName.valid && this.workflowType.valid
    }
  },
  async mounted () {
    bus.$on('save_as_workflow_template', async (data) => {
      this.workflowId = data.payload.worklfowId
      await this.dispatchWorkflowTempaltes()
      this.showModal()
    })
  },
  methods: {
    showModal () {
      this.modalVisible = true
      this.workflowTemplateName = {
        value: '',
        error: null,
        valid: false
      }
      this.workflowType = {
        value: '',
        error: null,
        valid: false
      }
    },
    closeModal () {
      this.modalVisible = false
    },
    async saveAsNewTemplate () {
      try {
        this.$options.filters.testWorkflowTemplateName(this.workflowTemplateName)
        if (this.workflowTemplateName.error === null) {
          this.$options.filters.testName(this.workflowTemplateName)
        }
        this.$options.filters.testSelectField(this.workflowType)
        
        const payload = {
          workflowTemplateName: this.workflowTemplateName.value,
          workflowType: this.workflowType.value
        }

        if (this.formValid) {
          const saveTemplate = await axios(`${process.env.VUE_APP_URL}/api/workflows/template`, {
            method: 'post',
            data: payload 
          })

          if (saveTemplate.data.status === 'success') {
            this.closeModal()
            bus.$emit('app_notif', {
              status: 'success',
              msg: saveTemplate.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.dispatchWorkflowTempaltes()
          } else {
            throw saveTemplate
          }
        }
      } catch (error) {
          this.closeModal()
          bus.$emit('app_notif', {
            status: 'error',
            msg: !!error.data.msg ? error.data.msg : 'Error on creating workflow template',
            timeout: false,
            redirect: false
          })
      }
    },
    async dispatchWorkflowTempaltes () {
      const dispatchWorkflowTempaltes = await this.$options.filters.dispatchStore('getWorkflowsTemplates')
      if (dispatchWorkflowTempaltes.status === 'success') {
        this.workflowTemplatesLoaded = true
      } 
    }
  },
  components: {
    AppInput,
    AppSelect
  }
}
</script>