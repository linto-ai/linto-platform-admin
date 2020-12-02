<template>
  <div v-if="dataLoaded && allRequiredAvailable">
    <h1>Deploy a device application</h1>
    <div class="flex col">
      <!-- Workflow name -->
      <AppInput 
        :label="'Application name'" 
        :obj="workflowName" 
        :test="'testStaticWorkflowName'"
        :required="true"
      ></AppInput>
      
      <!-- Workflow description -->
      <AppTextarea 
        :obj="workflowDescription" 
        :label="'Description'"
        :required="false"
      ></AppTextarea>

      <!-- device -->
      <AppSelect 
        :label="'Choose a device'" 
        :obj="associated_device" 
        :list="availableStaticDevices" 
        :params="{key:'_id', value:'sn' , optLabel: 'sn'}"
        :disabled="availableStaticDevices.length === 0"
        :disabledTxt="'No device available'"
        :required="true"
      ></AppSelect>
      

      <!-- Workflow tempalte -->
      <AppSelect 
        :label="'Workflow template'" 
        :obj="workflowTemplate" 
        :list="workflowTemplates" 
        :params="{key:'_id', value:'name' , optLabel: 'name'}"
        :disabled="workflowTemplates.length === 0"
        :disabledTxt="'No worflow template found'"
        :required="true"
      ></AppSelect>

      <!-- LinSTT language -->
      <AppSelect 
        :label="'Select a language'" 
        :obj="sttServiceLanguage" 
        :list="sttAvailableLanguages" 
        :params="{key:'value', value:'value', optLabel: 'value'}" 
        :disabled="noSttService" 
        :disabledTxt="'Create a LinSTT service'"
        :required="true"
      ></AppSelect> 

      <!-- LinSTT service command -->
      <AppSelect 
        :label="'Select a LinSTT COMMAND service'" 
        :obj="sttCommandService" 
        :list="!!sttServiceCmdByLanguage['cmd'] ? sttServiceCmdByLanguage['cmd'] : []" 
        :list2="!!sttServiceCmdByLanguage['generating'] ? sttServiceCmdByLanguage['generating'] : []"
        :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
        :disabled="sttServiceLanguage.value === ''" 
        :disabledTxt="'Please select a language'"
        :required="true"
      ></AppSelect>
      
      <!-- LinSTT Large vocabulary online (streaming) -->
      <AppSelect 
        :label="'Select a LinSTT Large vocabulary streaming service'" 
        :obj="sttLVOnlineService" 
        :list="!!sttServiceLVOnlineByLanguage['cmd'] ? sttServiceLVOnlineByLanguage['cmd'] : []" 
        :list2="!!sttServiceLVOnlineByLanguage['generating'] ? sttServiceLVOnlineByLanguage['generating'] : []"
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
        :obj="sttLVOfflineService" 
        :list="!!sttServiceLVOfflineByLanguage['cmd'] ? sttServiceLVOfflineByLanguage['cmd'] : []" 
        :list2="!!sttServiceLVOfflineByLanguage['generating'] ? sttServiceLVOfflineByLanguage['generating'] : []"
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

      <!-- Submit -->
      <div class="flex row">
        <a href="/admin/applications/device" class="button button-icon-txt button--grey" style="margin-right: 20px;">
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
  <div v-else>
    <span v-html="requiredErrorMsg"></span>
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
      sn: null,
      workflowName: {
        value: '',
        error: null,
        valid: false
      },
      workflowDescription: {
        value:'',
        error: null,
        valid: false
      },
      associated_device: {
        value: '',
        error: null,
        valid: false
      },
      sttServiceLanguage: {
        value: '',
        error: null,
        valid: false
      },
      sttCommandService: {
        value: '',
        error: null,
        valid: false
      },
      sttLVOnlineService: {
        value: '',
        error: null,
        valid: false
      },
      sttLVOfflineService: {
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
      staticClientsLoaded: false,
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
      sttLexSeedStatus: 'Updating STT service dictionnaries',
      requiredErrorMsg: ''
      
    }
  },
  computed: {
    dataLoaded () {
      return (this.sttLanguageModelsLoaded && this.sttServicesLoaded && this.tockApplicationsLoaded && this.workflowTemplatesLoaded && this.staticClientsLoaded)
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
        let resp = []
        resp['generating'] = []
        resp['cmd'] = this.sttServices.cmd.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.cmd.filter(service => service.lang === this.sttServiceLanguage.value) : []
        
        if(!!this.sttServices.generating.cmd) {
          resp['generating'] = this.sttServices.generating.cmd.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.generating.cmd.filter(service => service.lang === this.sttServiceLanguage.value) : []
        }
        return resp
      } else {
        return []
      }
    },
    sttServiceLVOnlineByLanguage () {
      if (this.sttServiceLanguage.value !== '') {
         let resp = []
        resp['generating'] = []
        resp['lvOnline'] = this.sttServices.lvOnline.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.lvOnline.filter(service => service.lang === this.sttServiceLanguage.value) : []
        
        if(!!this.sttServices.generating.lvOnline) {
          resp['generating'] = this.sttServices.generating.lvOnline.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.generating.lvOnline.filter(service => service.lang === this.sttServiceLanguage.value) : []
        }
        return resp
      } else {
        return []
      }
    },
    sttServiceLVOfflineByLanguage () {
      if (this.sttServiceLanguage.value !== '') {
        let resp = []
        resp['generating'] = []
        resp['lvOffline'] = this.sttServices.lvOffline.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.lvOffline.filter(service => service.lang === this.sttServiceLanguage.value) : []
        if(!!this.sttServices.generating.lvOffline) {
          resp['generating'] = this.sttServices.generating.lvOffline.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.generating.lvOffline.filter(service => service.lang === this.sttServiceLanguage.value) : []
        }
        return resp
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
    workflowTemplates () {
      return this.$store.getters.WORKFLOW_TEMPLATES_BY_TYPE('static')
    },
    formValid () {
      return (this.workflowName.valid && this.workflowTemplate.valid && this.sttServiceLanguage.valid && this.sttCommandService.valid && this.tockApplicationName.valid)
    },
    deployLabel () {
      if (this.submitting) {
        return 'Deploying...'
      } else {
        return 'Deploy'
      }
    },
    availableStaticDevices () {
      return this.$store.getters.STATIC_CLIENTS_AVAILABLE
    },
    allRequiredAvailable () {
      let valid = true
      // terminals
      if (this.availableStaticDevices.length === 0) {
        valid = false
        this.requiredErrorMsg = 'No device found. You firstly need to <a href="/admin/devices">create a device</a>'
      }
      // Worfklow template
      if (this.workflowTemplates.length === 0) {
        valid = false
        this.requiredErrorMsg = 'No workflow template found. You firstly need to <a href="/admin/workflow-editor">create a workflow template</a>'
      }
      // STT
      if(!!this.sttServices.cmd && this.sttServices.cmd.length === 0) {
        valid = false
        this.requiredErrorMsg = 'No STT service found. Please create one before creating an application. <a href="https://doc.linto.ai/#/services/linstt_howtouse" target="_blank">Documentation</a>'
      }

      return valid
    }
  },
  async mounted () {
    if (!!this.$route.params.sn) {
      this.sn = this.$route.params.sn
      this.associated_device.value = this.sn
      this.associated_device.valid = true
    }
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
      await this.$options.filters.testStaticWorkflowName(this.workflowName) // Test if workflow name is not used
      if (this.workflowName.error === null) {
        this.$options.filters.testName(this.workflowName) // Test if workflow name is valid
      }
      /* Workflow description */
      this.$options.filters.testContent(this.workflowDescription)

      /* Device serial number */
      await this.$options.filters.testStaticClientsSN(this.associated_device)
      if (this.associated_device.error === null) {
        this.$options.filters.testName(this.associated_device)
      }

      /* Workflow Template */ 
      this.$options.filters.testSelectField(this.workflowTemplate)

      /* STT language */ 
      this.$options.filters.testSelectField(this.sttServiceLanguage)

      /* STT service */ 
      this.$options.filters.testSelectField(this.sttCommandService)
    
      /* Tock application */ 
      this.$options.filters.testSelectField(this.tockApplicationName)

      if (this.formValid) {
        await this.deployStaticDevice()
      }
    },
    async deployStaticDevice (sn) {
      try { 
        let payload = {
          sn: this.associated_device.value,
          workflowName: this.workflowName.value,
          workflowDescription: this.workflowDescription.value.replace(/\n/g,' '),
          workflowTemplate: this.workflowTemplate.value,
          sttServiceLanguage: this.sttServiceLanguage.value,
          sttCommandService: this.sttCommandService.value,
          sttLVOnlineService: this.sttLVOnlineService.value,
          sttLVOfflineService: this.sttLVOfflineService.value,
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
              // STEP 3 : Update static device
              const updateStaticDevice = await this.updateStaticDevice(payload)
              if (updateStaticDevice === 'success' ) {
                // STEP 4 : NLU lexical seeding
                const nluLexicalSeeding = await this.nluLexicalSeeding(payload)
                if (nluLexicalSeeding === 'success') {
                  // STEP 5 : STT lexical seeding
                  const sttLexicalSeeding = await this.sttLexicalSeeding(payload)
                  if (sttLexicalSeeding === 'success') {
                    this.submitting = false
                    bus.$emit('app_notif', {
                      status: 'success',
                      msg: `device ${this.associated_device.value} has been deployed on application ${payload.workflowName}`,
                      timeout: 3000,
                      redirect: `${process.env.VUE_APP_URL}/admin/applications/device`
                      
                    })
                  }
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
        const postBls = await axios(`${process.env.VUE_APP_URL}/api/flow/postbls/static`, {
          method: 'post', 
          data: { payload }
        })
        if(postBls.data.status === 'success' && !!postBls.data.flowId) {
          this.blsFlowUpdate = true
           this.blsFlowStatus = 'The workflow template has been posted on Business Logic Server' 
          this.flowId = postBls.data.flowId
          return 'success'
        } else if (postBls.data.status === 'error'){
          this.blsFlowUpdate = false
          this.blsFlowStatus = postBls.data.msg
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
        const postWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/static`, {
          method: 'post', 
          data: { payload }
        })
        if (postWorkflow.data.status === 'success') {
          this.workflowUpdate = true
          this.workflowStatus = `The device application "${payload.workflowName}" has been registered`
          return 'success'
        } else if (postWorkflow.data.status === 'error') {
          this.workflowUpdate = false
          this.workflowStatus = postWorkflow.data.msg
          throw postWorkflow.data.msg
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
    async updateStaticDevice (payload) {
      try {
        const getWorkflowByName = await axios(`${process.env.VUE_APP_URL}/api/workflows/static/name/${payload.workflowName}`, {
          method: 'get'
        })
        if (!!getWorkflowByName.data._id && !!getWorkflowByName.data.name) {
          const clientPayload = {
            associated_workflow: {
              _id: getWorkflowByName.data._id,
              name: getWorkflowByName.data.name
            }
          }
          const updateStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/${payload.sn}`, {
            method: 'patch', 
            data: { payload: clientPayload }
          })
          if(updateStaticDevice.data.status === 'success') {
            this.staticDeviceUpdate = true
            this.staticDeviceStatus = `The device "${this.sn}" has been attached to device application "${payload.workflowName}"`
            return 'success'
          } else if (updateStaticDevice.data.status === 'error') {
            this.staticDeviceUpdate = false
            this.staticDeviceStatus = updateStaticDevice.data.msg
            throw updateStaticDevice.data.msg
          }
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
        } else if(nluLexSeed.data.status === 'error') {
          this.nluLexSeedUpdate = false
          this.nluLexSeedStatus = nluLexSeed.data.msg
          throw nluLexSeed.data
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
          timeout: false,
          redirect: false
        })
      }
    },
    async sttLexicalSeeding (data) {
        
      try {
        const payload = { 
            flowId: data.flowId,
            service_name: data.sttCommandService
        }
        
        const sttLexSeed = await axios(`${process.env.VUE_APP_URL}/api/stt/lexicalseeding`, {
          method: 'post', 
          data: { payload }
        })
        if(sttLexSeed.data.status === 'success') {
          this.sttLexSeedUpdate = true
          this.sttLexSeedStatus = 'STT service dictionnaries have been updated'
          return 'success'
        } else if(sttLexSeed.data.status === 'error') {
          this.sttLexSeedUpdate = false
          this.sttLexSeedStatus = sttLexSeed.data.msg
          throw sttLexSeed.data
        }
      } catch (error) {
        this.sttLexSeedStatus = error.msg
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
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
        await this.dispatchStore('getStaticClients')
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
        if(process.env.VUE_APP_DEBUG) {
          console.log(topic, dispatchSuccess)
        }
        switch(topic) {
          case 'getStaticClients':
            this.staticClientsLoaded = dispatchSuccess
            break
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
        if(process.env.VUE_APP_DEBUG) {
          console.error(topic, error)
        }
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