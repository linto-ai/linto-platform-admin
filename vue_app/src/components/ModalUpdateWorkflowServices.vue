<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Application services settings</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
          <p>Update application <strong>"{{workflow.name}}"</strong> services settings. This will apply modifications to the application workflow.</p>
          <!-- Application name -->
          <AppInput 
            :label="'Application name'" 
            :obj="workflowName" 
            :test="'testName'"
            :required="true"
          ></AppInput>
          
          <!-- Descritpion -->
          <AppTextarea 
            :obj="workflowDescription" 
            :label="'Description'"
            :required="false"
          ></AppTextarea>


          <!-- STT language -->
          <AppSelect 
            :label="'Select a language'" 
            :obj="sttServiceLanguage" 
            :list="sttAvailableLanguages" 
            :params="{key:'value', value:'value', optLabel: 'value'}" 
            :disabled="noSttService" 
            :disabledTxt="'Create a STT service'"
            :required="true"
          ></AppSelect>

          <!-- STT services command -->
          <AppSelect 
            :label="'Select a STT command service'" 
            :obj="sttCommandService" 
            :list="sttServiceCmdByLanguage" 
            :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
            :disabled="sttServiceLanguage.value === ''" 
            :disabledTxt="'Please select a language'"
            :disabled2="noSttService"
            :disabled2Txt="'Create a STT service'"
            :required="true"
          ></AppSelect>
      
          <!-- LinSTT Large vocabulary online (streaming) -->
          <AppSelect 
            :label="'Select a LinSTT Large vocabulary streaming service'" 
            :obj="largeVocabStreaming" 
            :list="sttServiceLVOnlineByLanguage" 
            :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
            :disabled="sttServiceLanguage.value === ''" 
            :disabledTxt="'Please select a language'"
            :disabled2="sttServiceLVOnlineByLanguage.length === 0" 
            :disabled2Txt="'No service available'"
            :required="false"
            :resetValue="true"
          ></AppSelect>

          <!-- LinSTT Large vocabulary offline (file) -->
          <AppSelect 
            :label="'Select a LinSTT Large vocabulary file service'" 
            :obj="largeVocabOffline" 
            :list="sttServiceLVOfflineByLanguage" 
            :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
            :disabled="sttServiceLanguage.value === ''" 
            :disabledTxt="'Please select a language'"
            :disabled2="sttServiceLVOfflineByLanguage.length === 0" 
            :disabled2Txt="'No service available'"
            :required="false"
            :resetValue="true"
          ></AppSelect>
      
          <!-- TOCK application -->
          <AppSelect 
            :label="'Select Tock application'" 
            :obj="tockApplicationName" 
            :list="tockApplications" 
            :params="{key:'name', value:'name', optLabel: 'name'}" 
            :options="{value:'new', label:'Create a new tock application'}"
            :required="true"
          ></AppSelect>
          
        </div>
      </div>
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="handleForm()">
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
import AppTextarea from '@/components/AppTextarea.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      sn: null,
      workflow: null,
      workflowType: null,
      workflowInit: false,
      workflowName: {
        value: '',
        error: null,
        valid: false
      },
      workflowDescription: {
        value: '',
        error: null,
        valid: false
      },
      sttServiceLanguage: {
        value: '',
        error: null,
        valid: false
      },
      largeVocabStreaming :{
        value: '',
        error: null,
        valid: false
      },
      largeVocabOffline :{
        value: '',
        error: null,
        valid: false
      },
      sttCommandService: {
        value: '',
        error: null,
        valid: false
      },
      tockApplicationName: {
        value: '',
        error: null,
        valid: false
      },
      staticWorkflowsLoaded: false,
      staticClientsLoaded: false,
      sttServicesLoaded: false,
      tockApplicationsLoaded: false,
      sttLanguageModelsLoaded: false,
      applicationWorkflowsLoaded: false
          }
  },
  
  async mounted () {
    
    bus.$on('update_workflow_services', async (data) => {
      if (!!data.sn && data.type === 'static') {
        this.sn = data.sn
      }
      this.workflow = data.workflow
      this.workflowType = data.type
      this.workflowName = {
        value: this.workflow.name,
        error: null,
        valid: true
      }
      this.workflowDescription = {
        value: this.workflow.description,
        error: null,
        valid: true
      }

      await this.refreshStore()
      this.showModal()
      
    })

  },
  computed: {
    dataLoaded () {
      return (this.staticClientsLoaded && this.staticWorkflowsLoaded && this.sttServicesLoaded && this.applicationWorkflowsLoaded && this.tockApplicationsLoaded && this.sttLanguageModelsLoaded)
    },
    currentWorkflow () {
      if (this.workflowType === 'static' && this.dataLoaded)  {
        return this.$store.getters.STATIC_WORKFLOW_BY_ID(this.workflow._id) 
      } else if (this.workflowType === 'application') {
        return this.$store.getters.APP_WORKFLOW_BY_ID(this.workflow._id) 
      } else {
        return null
      }
    },
    sttServices () {
      return this.$store.getters.STT_SERVICES_AVAILABLE
    },
    sttAvailableLanguages () {
      if (this.sttServicesLoaded && !!this.sttServices.cmd) {
        let sttLang = []
        if (this.sttServices.cmd.length > 0) {
          this.sttServices.cmd.map(service => {
            if(sttLang.filter(lang => lang.value === service.lang).length === 0) {
              sttLang.push({ value: service.lang })
            }
          })
        }
        return sttLang
      } else {
        return ''
      }
    },
    sttServiceCmdByLanguage () {
      if (this.sttServiceLanguage.value !== '') {
        return this.sttServices.cmd.filter(service => service.lang === this.sttServiceLanguage.value)
      } else {
        return []
      }
    },
    sttServiceLVOnlineByLanguage () {
      if (this.sttServiceLanguage.value !== '') {
        return this.sttServices.lvOnline.filter(service => service.lang === this.sttServiceLanguage.value)
      } else {
        return []
      }
    },
    sttServiceLVOfflineByLanguage () {
      if (this.sttServiceLanguage.value !== '') {
        return this.sttServices.lvOffline.filter(service => service.lang === this.sttServiceLanguage.value)
      } else {
        return []
      }
    },
    noSttService () {
      return !this.sttServicesLoaded ||(!!this.sttServices.cmd && this.sttServices.cmd.length === 0)
    },
    tockApplications () {
      return this.$store.state.tockApplications
    },
    formValid () {
      return (this.workflowName.valid && this.workflowDescription.valid && this.sttServiceLanguage.valid && this.sttCommandService.valid && this.tockApplicationName.valid)
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        if (!this.workflowInit && this.currentWorkflow !== null) {
          
            // get worlflow name
            this.workflowName.value = this.currentWorkflow.name
            this.workflowName.valid = true 

            // get worlflow language
            const nodeConfig = this.currentWorkflow.flow.nodes.filter(node => node.type === 'linto-config')
            if (nodeConfig.length > 0) {
              this.sttServiceLanguage.value = nodeConfig[0].language
              this.sttServiceLanguage.valid = true
            }
            let nodeSttConfig = ''
            let nodeNluConfig = ''

            if(!!this.currentWorkflow.flow.configs && this.currentWorkflow.flow.configs.length > 0) {
              // get STT service 
              nodeSttConfig = this.currentWorkflow.flow.configs.filter(node => node.type === 'linto-config-transcribe')
              if (nodeSttConfig.length > 0 && !!nodeSttConfig[0].commandOffline) {
                this.sttCommandService.value = nodeSttConfig[0].commandOffline
                this.largeVocabStreaming.value = nodeSttConfig[0].largeVocabStreaming
                this.largeVocabOffline.value = nodeSttConfig[0].largeVocabOffline
                this.sttCommandService.valid = true
              } 

              // get Tock application
              nodeNluConfig = this.currentWorkflow.flow.configs.filter(node => node.type === 'linto-config-evaluate')
              if (nodeNluConfig.length > 0) {
                this.tockApplicationName.value = nodeNluConfig[0].appname
                this.tockApplicationName.valid = true
              }
            }
          this.workflowInit = true
        }
      }
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async handleForm () {
      // Test workflow name
      this.$options.filters.testName(this.workflowName) // Test if workflow name is valid
      
      // Test STT language
      this.$options.filters.testSelectField(this.sttServiceLanguage)

      // Test STT services
      this.$options.filters.testSelectField(this.sttCommandService)

      // Test Tock application name 
      this.$options.filters.testSelectField(this.tockApplicationName)

      if (this.workflowDescription.value.length > 0) {
       this.$options.filters.testContent(this.workflowDescription)

      } else {
        this.workflowDescription.valid = true
      }

      if (this.formValid) {
        await this.updateWorkflowSettings()
      }
    },
    async updateWorkflowSettings () {
      const payload = {
        workflowName: this.workflowName.value,
        workflowDescription: this.workflowDescription.value,
        sttServiceLanguage: this.sttServiceLanguage.value,
        sttCommandService: this.sttCommandService.value,
        largeVocabStreaming: this.largeVocabStreaming.value,
        largeVocabOffline: this.largeVocabOffline.value,
        tockApplicationName: this.tockApplicationName.value,
        type: this.workflowType
      }
      try {
        const updateWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/${this.workflow._id}/services`, {
          method: 'patch',
          data: { payload }
        })
        if (updateWorkflow.data.status === 'success') {
            bus.$emit('update_workflow_services_success', {})
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateWorkflow.data.msg,
              timeout: 3000,
              redirect: false
            })
            this.closeModal()

        } else {
          throw updateWorkflow
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Error on updating workflow',
          timeout: false,
          redirect: false
        })
      }
    },
    async refreshStore () {
      try {
        await this.dispatchStore('getStaticWorkflows')
        await this.dispatchStore('getApplicationWorkflows')
        await this.dispatchStore('getStaticClients')
        await this.dispatchStore('getSttServices')
        await this.dispatchStore('getSttLanguageModels')
        await this.dispatchStore('getTockApplications')
      } catch (error) {
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
          case 'getStaticWorkflows':
            this.staticWorkflowsLoaded = dispatchSuccess
            break
          case 'getApplicationWorkflows': 
            this.applicationWorkflowsLoaded = dispatchSuccess
            break
          case 'getStaticClients':
            this.staticClientsLoaded = dispatchSuccess
            break
          case 'getSttServices':
              this.sttServicesLoaded = dispatchSuccess
              break
          case 'getTockApplications': 
            this.tockApplicationsLoaded = dispatchSuccess
            break
          case 'getSttLanguageModels':
              this.sttLanguageModelsLoaded = dispatchSuccess
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
  },
  components: {
    AppInput,
    AppSelect,
    AppTextarea
  }
}
</script>