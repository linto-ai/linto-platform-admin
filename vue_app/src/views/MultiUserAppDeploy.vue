<template>
  <div v-if="dataLoaded">
    <h1>Create a new application</h1>
    <div class="flex col">
      <!-- Workflow name -->
      <AppInput 
        :label="'Application name'" 
        :obj="workflowName" 
        :test="'testApplicationWorkflowName'"
      ></AppInput>

      <!-- Workflow description -->
      <AppTextarea 
        :obj="workflowDescription" 
        :label="'Application description'"
      ></AppTextarea>

      <!-- Workflow tempalte -->
      <AppSelect 
        :label="'Workflow template'" 
        :obj="workflowTemplate" 
        :list="workflowTemplates" 
        :params="{key:'_id', value:'name' , optLabel: 'name'}" 
        :disabled="workflowTemplates.length === 0" 
        :disabledTxt="'No application workflow template was found.'"
      ></AppSelect>

      <!-- STT language -->
      <AppSelect 
        :label="'Select a language'" 
        :obj="sttServiceLanguage" 
        :list="sttAvailableLanguages" 
        :params="{key:'value', value:'value', optLabel: 'value'}" 
        :disabled="noSttService" 
        :disabledTxt="'Create a STT service'"
      ></AppSelect>

      <!-- STT services command -->
      <AppSelect 
        :label="'Select a STT command service'" 
        :obj="sttService" 
        :list="sttServiceCmdByLanguage" 
        :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
        :disabled="sttServiceLanguage.value === ''" 
        :disabledTxt="'Please select a language'"
      ></AppSelect>
      
      <!-- LinSTT Large vocabulary online (streaming) -->
      <AppSelect 
        :label="'Select a LinSTT Large vocabulary streaming service'" 
        :obj="sttLVOnlineService" 
        :list="sttServiceLVOnlineByLanguage" 
        :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
        :disabled="sttServiceLanguage.value === ''" 
        :disabledTxt="'Please select a language'"
        :disabled2="sttServiceLVOnlineByLanguage.length === 0" 
        :disabled2Txt="'No service available'"
      ></AppSelect>

      <!-- LinSTT Large vocabulary offline (file) -->
      <AppSelect 
        :label="'Select a LinSTT Large vocabulary file service'" 
        :obj="sttLVOfflineService" 
        :list="sttServiceLVOfflineByLanguage" 
        :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
        :disabled="sttServiceLanguage.value === ''" 
        :disabledTxt="'Please select a language'"
        :disabled2="sttServiceLVOfflineByLanguage.length === 0" 
        :disabled2Txt="'No service available'"
      ></AppSelect>

      <!-- TOCK application -->
      <AppSelect 
        :label="'Select Tock application'" 
        :obj="tockApplicationName" 
        :list="tockApplications" 
        :params="{key:'name', value:'name', optLabel: 'name'}" 
        :options="{value:'new', label:'Create a new tock application'}"
      ></AppSelect>

      <!-- Submit -->
      <div class="flex row">
        <a href="/admin/applications/multi" class="button button-icon-txt button--grey">
          <span class="button__icon button__icon--cancel"></span>
          <span class="button__label">Cancel</span>
        </a>
        <button class="button button-icon-txt button--green" @click="handleForm()">
          <span class="button__icon" :class="submitting ? 'button__icon--loading' : 'button__icon--deploy'"></span>
          <span class="button__label">{{ deployLabel }}</span>
        </button> 
      </div>
    </div>
  </div>
  <div v-else>Loading...</div>
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
      workflowName: {
        value: '',
        error: null,
        valid: false
      },
      workflowDescription: {
        value: '',
        error: null,
        valid: true
      },
      sttServiceLanguage: {
        value: '',
        error: null,
        valid: false
      },
      sttService: {
        value: '',
        error: null,
        valid: false
      },
      sttLVOnlineService: {
        value: '',
        error: null,
        valid: false
      },
      sttLVOfflineService: {
        value: '',
        error: null,
        valid: false
      },
      tockApplicationName: {
        value: '',
        error: null,
        valid: false
      },
      workflowTemplate : {
        value: '', 
        error: null,
        valid: false
      },
      flowId: null,
      // Services loading status
      sttLanguageModelsLoaded:false,
      sttServicesLoaded: false,
      tockApplicationsLoaded: false,
      workflowTemplatesLoaded: false,
      // Workflow creation steps
      submitting: false,
      blsFlowUpdate: false,
      blsFlowStatus: 'Posting workflow on Business logic Server',
      workflowUpdate: false,
      workflowStatus: 'Registering the new workflow',
      staticDeviceUpdate: false,
      staticDeviceStatus: 'Attaching static device to created workflow',
      nluLexSeedUpdate: false,
      nluLexSeedStatus: 'Updating natural language understanding dictionnaries',
      sttLexSeedUpdate: false,
      sttLexSeedStatus: 'Updating LinSTT service dictionnaries'
    }
  },
  computed: {
    dataLoaded () {
      return (this.sttLanguageModelsLoaded && this.sttServicesLoaded && this.tockApplicationsLoaded && this.workflowTemplatesLoaded)
    },
    sttServices () {
      return this.$store.getters.STT_SERVICES_AVAILABLE
    },
    sttAvailableLanguages () {
      if (this.sttServicesLoaded) {
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
      return !this.sttServicesLoaded || this.sttServices.length === 0
    },
    tockApplications () {
      return this.$store.state.tockApplications
    },
    workflowTemplates () {
      return this.$store.getters.WORKFLOW_TEMPLATES_BY_TYPE('application')
    },
    formValid () {
      return (this.workflowName.valid && this.workflowTemplate.valid && this.sttServiceLanguage.valid && this.sttService.valid && this.tockApplicationName.valid && this.workflowDescription.valid)
    },
    deployLabel () {
      if (this.submitting) {
        return 'Creating application'
      } else {
        return 'Create application'
      }
    }
  },
  async created () {
    await this.refreshStore()
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async handleForm () {

      /* Workflow Name */ 
      this.$options.filters.testApplicationWorkflowName(this.workflowName) // Test if workflow name is not used
      if (this.workflowName.error === null) {
        this.$options.filters.testName(this.workflowName) // Test if workflow name is valid
      }

      /* Workflow description */
       this.$options.filters.testContent(this.workflowDescription)

      /* Workflow Template */ 
      this.$options.filters.testSelectField(this.workflowTemplate)

      /* STT language */ 
      this.$options.filters.testSelectField(this.sttServiceLanguage)

      /* STT service */ 
      this.$options.filters.testSelectField(this.sttService)
    
      /* Tock application */ 
      this.$options.filters.testSelectField(this.tockApplicationName)

      if (this.formValid) {
        await this.createApplication()
      }
    },
    async createApplication (sn) {
      try { 

        let payload = {
          workflowName: this.workflowName.value,
          workflowDescription: this.workflowDescription.value.replace(/\n/g,' '),
          workflowTemplate: this.workflowTemplate.value,
          sttServiceLanguage: this.sttServiceLanguage.value,
          sttService: this.sttService.value,
          tockApplicationName: this.tockApplicationName.value !== 'new' ? this.tockApplicationName.value : this.workflowName.value.replace(/[\s\_]/g, '-').toLowerCase()
        }

        this.submitting = true

        // STEP 1 : Post workflow template on BLS
        const postBls = await this.postFlowOnBLS(payload)
        if(postBls === 'success') {
          if (this.flowId !== null) {
            payload.flowId = this.flowId
            // STEP 2 : Post workflow on Database
            const postWorkflow = await this.postWorkflow(payload)
            if (postWorkflow === 'success') {
              // STEP 3 : NLU lexical seeding
              const nluLexicalSeeding = await this.nluLexicalSeeding(payload)
              if (nluLexicalSeeding === 'success') {
                // STEP 4 : STT lexical seeding
                const sttLexicalSeeding = await this.sttLexicalSeeding(payload)
                if (sttLexicalSeeding === 'success') {
                  this.submitting = false
                  bus.$emit('app_notif', {
                    status: 'success',
                    msg: `Application ${this.workflowName.value} has been created`,
                    timeout: 3000,
                    redirect: `${process.env.VUE_APP_URL}/admin/applications/multi`
                  })
                }
              }
            }
          }
        }
      } catch (error) {
        this.submitting = false
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async postFlowOnBLS (payload) {
      try {
        const postBls = await axios(`${process.env.VUE_APP_URL}/api/flow/postbls/application`, {
          method: 'post', 
          data: { payload }
        })
        if(postBls.data.status === 'success' && !!postBls.data.flowId) {
          this.blsFlowUpdate = true
          this.blsFlowStatus = 'The workflow template has been posted on Business Logic Server' 
          this.flowId = postBls.data.flowId
          return 'success'
        } else {
          throw postBls.data.msg
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async postWorkflow (payload) {
      try {
        const postWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/application`, {
            method: 'post', 
            data: { payload }
          })
          if (postWorkflow.data.status === 'success') {
            this.workflowUpdate = true
            this.workflowStatus = `The workflow "${payload.workflowName}" has been registered`
            return 'success'
          }  
      } catch (error) {
         bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async nluLexicalSeeding (payload) {
      try {
        const nluLexSeed = await axios(`${process.env.VUE_APP_URL}/api/tock/lexicalseeding`, {
          method: 'post', 
          data: { payload }
        })
        if(nluLexSeed.data.status === 'success') {
          this.nluLexSeedUpdate = true
          this.nluLexSeedStatus = 'Natural language understanding dictionnaries have been updated'
          return 'success'
        } else {
          throw nluLexSeed
        }
          
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async sttLexicalSeeding (payload) {
      try {
        const sttLexSeed = await axios(`${process.env.VUE_APP_URL}/api/stt/lexicalseeding`, {
          method: 'post', 
          data: { 
            payload : {
              flowId: payload.flowId,
              service_name: payload.sttService
            }
          }
        })
        if(sttLexSeed.data.status === 'success') {
          this.sttLexSeedUpdate = true
          this.sttLexSeedStatus = 'STT service dictionnaries have been updated'
          return 'success'
        } else {
          throw sttLexSeed
        }
      } catch (error) {
        this.sttLexSeedStatus = error.data.msg
        bus.$emit('app_notif', {
          status: 'error',
          msg: error.data.msg,
          timeout: false,
          redirect: false
        })
      }
    },
    async refreshStore () {
      try {
        await this.dispatchStore('getWorkflowsTemplates')
        await this.dispatchStore('getSttServices')
        await this.dispatchStore('getSttLanguageModels')
        await this.dispatchStore('getTockApplications')
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
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