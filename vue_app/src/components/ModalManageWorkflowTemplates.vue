<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Workflow templates</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          <h3>Static workflows</h3>
          <table class="table" v-if="staticWorkflowTemplates.length > 0">
            <thead>
              <tr>
                <th colspan="3">Workflow name</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staticWF in staticWorkflowTemplates" :key="staticWF._id">
                <td><strong>{{ staticWF.name }}</strong></td>
                <td class="center">
                  <button class="button button-icon-txt button--blue" @click="loadFlow(staticWF)">
                    <span class="button__icon button__icon--load"></span>
                    <span class="button__label">Load flow</span>
                  </button>
                </td>
                <td class="center">
                  <button class="button button-icon button--red" @click="deleteWorflowTemplate(staticWF._id, staticWF.name)">
                    <span class="button__icon button__icon--delete"></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="divider small"></div>
          <h3>Application workflows</h3>
          <table class="table" v-if="applicationWorkflowTemplates.length > 0">
            <thead>
              <tr>
                <th colspan="2">Workflow name</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="applicationWF in applicationWorkflowTemplates" :key="applicationWF._id">
                <td><strong>{{ applicationWF.name }}</strong></td>
                <td class="center">
                  <button class="button button-icon-txt button--blue" @click="loadFlow(applicationWF)">
                    <span class="button__icon button__icon--load"></span>
                    <span class="button__label">Load flow</span>
                  </button>
                </td>
                <td class="center">
                  <button class="button button-icon button--red" @click="deleteWorflowTemplate(applicationWF._id, applicationWF.name)">
                    <span class="button__icon button__icon--delete"></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
      <!-- End FOOTER -->
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      workflowTemplatesLoaded: false
    }
  },
  async mounted () {
    bus.$on('manage_workflow_templates', async (data) => {
      this.showModal()
      await this.dispatchStore('getWorkflowsTemplates')
    })
  },
  computed: {
    applicationWorkflowTemplates () {
      return this.$store.getters.WORKFLOW_TEMPLATES_BY_TYPE('application')
    },
    staticWorkflowTemplates () {
      return this.$store.getters.WORKFLOW_TEMPLATES_BY_TYPE('static')
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async loadFlow (workflow) {
      try {
        const getSandBoxId = await axios(`${process.env.VUE_APP_URL}/api/flow/sandbox`, {
          method: 'get'
        })
        const sandBoxId = getSandBoxId.data.sandBoxId 
        const payload = {
          flowId: sandBoxId,
          flow: workflow.flow
        }
        const loadflow = await axios(`${process.env.VUE_APP_URL}/api/flow/sandbox/load`, {
          method: 'put',
          data : { payload }
        })
        if (loadflow.data.status === 'success') {
          this.closeModal()
          bus.$emit('iframe_reload', {})
        }
      } catch (error) {
        console.error(error)
      }
    },
    async deleteWorflowTemplate (templateId, templateName) {
      try {
        const payload = {
          name: templateName
        }
        const deleteTemplate = await axios(`${process.env.VUE_APP_URL}/api/workflows/template/${templateId}`, {
          method: 'delete',
          data: { payload }
        })
        if (deleteTemplate.data.status === 'success') {
          await this.dispatchStore('getWorkflowsTemplates')
          bus.$emit('app_notif', {
            status: 'success',
            msg: deleteTemplate.data.msg,
            timeout: 3000,
            redirect: false
          })
        } else {
          throw deleteTemplate.data.msg
        }
      } catch (error) {
        console.error(error)
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async dispatchStore (topic) {
      try {
        const dispatch = await this.$options.filters.dispatchStore(topic)
        const dispatchSuccess = dispatch.status == 'success' ? true : false
        if (dispatch.status === 'error') {
          throw dispatch.msg
        }
        switch(topic) {
          case 'getWorkflowsTemplates':
            this.workflowTemplatesLoaded = dispatchSuccess
            break
          default:
            return
        }  
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    }
  }
}
</script>