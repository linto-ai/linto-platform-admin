<template>
  <div v-if="dataLoaded && sttServicesAvailable">
    <div class="flex1 flex col">
      <h1>Workflow editor - {{ currentWorkflow.name }}</h1>
      <div class="flex col flex1">
        <details open class="description">
          <summary>Infos</summary>
          <span>The workflow editor uses an embedded application called node-red. You will have to log in to the node-red application to be able to edit workflows.<br/>
          <strong>Please log in with the following credentials :</strong>
          <ul>
            <li>Login : <strong>{{ noderedUser }}</strong> </li>
            <li>Password : <strong>{{ noderedPassword }}</strong></li>
          </ul>
          For more informations about node-red workflows, please read the <a href="https://doc.linto.ai/" target="_blank">documentation</a>.
          </span>
        </details>
        <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
          <NodeRedIframe :contextFrame="'staticWorkflow'" :blsurl="blsUrl" :noderedFlowId="currentWorkflow.flowId" :workflowId="staticWorkflowId" :workflowName="currentWorkflow.name" v-if="dataLoaded"></NodeRedIframe>
        </div>
      </div>
    </div>
    
  </div>
  <div v-else>
    <div v-if="dataLoaded && !sttServicesAvailable">
      Used STT language model(s) in generation process. Please come back later.
    </div>
    <div v-if="!dataLoaded && !sttServicesAvailable">Loading...</div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
import NodeRedIframe from '@/components/NodeRedIframe.vue'
export default {
  data () {
    return {
      blsUp: false,
      blsUrl: '',
      noderedUser: process.env.VUE_APP_NODERED_USER,
      noderedPassword: process.env.VUE_APP_NODERED_PASSWORD,
      staticWorkflowsLoaded: false,
      staticWorkflowId: null,
      sttCommandService: null,
      largeVocabStreaming: null,
      largeVocabOffline: null,
      sttServicesLoaded: false,
      sttLanguageModelsLoaded: false
    }
  },
  beforeRouteEnter (to, form, next) {
    // Check if Business logic server is UP before enter route
    next(vm => vm.isBlsUp())
  },
  async mounted () {
    this.staticWorkflowId = this.$route.params.workflowId
    await this.refreshStore()
    
    bus.$on('save_as_workflow_template_success', async (data) => {
      await this.refreshStore()
    })
  },
  computed: {
    dataLoaded () {
      return this.staticWorkflowsLoaded && this.blsUp && !this.currentWorkflow.error && this.sttServicesLoaded && this.sttLanguageModelsLoaded
    },
     currentWorkflow () {
      return this.$store.getters.STATIC_WORKFLOW_BY_ID(this.staticWorkflowId)
    },
    sttServices () {
      return this.$store.getters.STT_SERVICES_AVAILABLE
    },
    sttLanguageModels () {
      return this.$store.state.sttLanguageModels
    },
    modelsGenerating () {
      let generating = []
      if(!!this.sttServices.generating) {
        if(!!this.sttServices.generating.cmd && this.sttServices.generating.cmd.length > 0) {
          this.sttServices.generating.cmd.map(cmd => {
            let langmodel = this.sttLanguageModels.filter(lm => lm.modelId === cmd.LModelId)
            if(langmodel.length > 0) {
              generating.push({
                sttServiceName: cmd.serviceId,
                prct: langmodel[0].updateState
              })
            }
          })
        }
        if(!!this.sttServices.generating.lvOnline && this.sttServices.generating.lvOnline.length > 0) {
          this.sttServices.generating.lvOnline.map(lvOnline => {
            let langmodel = this.sttLanguageModels.filter(lm => lm.modelId === lvOnline.LModelId)
            if(langmodel.length > 0) {
              generating.push({
                sttServiceName: lvOnline.serviceId,
                prct: langmodel[0].updateState
              })
            }
          })
        }
        if(!!this.sttServices.generating.lvOffline && this.sttServices.generating.lvOffline.length > 0) {
          this.sttServices.generating.lvOffline.map(lvOffline => {
            let langmodel = this.sttLanguageModels.filter(lm => lm.modelId === lvOffline.LModelId)
            if(langmodel.length > 0) {
              generating.push({
                sttServiceName: lvOffline.serviceId,
                prct: langmodel[0].updateState
              })
            }
          })
        }
      }
      return generating
    },
    sttServicesAvailable () {
      if (this.sttCommandService !== '') {
        let sttServiceCmdGenerating = this.modelsGenerating.filter(mg => mg.sttServiceName === this.sttCommandService) 
        
        let sttServiceLVOnlineGenerating = this.modelsGenerating.filter(mg => mg.sttServiceName === this.largeVocabStreaming)
        
        let sttServiceLVOfflineGenerating = this.modelsGenerating.filter(mg => mg.sttServiceName === this.largeVocabOffline)

        if (sttServiceCmdGenerating.length > 0 || sttServiceLVOnlineGenerating.length > 0 || sttServiceLVOfflineGenerating.length > 0) {
          return false
        } else {
          return true
        }
      }
    }
  },
  watch: {
    currentWorkflow (data) {
      if(!data.error) {
        this.blsUrl = `${process.env.VUE_APP_NODERED}/#flow/${this.currentWorkflow.flowId}`
         if(!!data.flow && !!data.flow.configs && data.flow.configs.length > 0) {
              // get STT service 
              let nodeSttConfig = data.flow.configs.filter(node => node.type === 'linto-config-transcribe')
              if (nodeSttConfig.length > 0 && !!nodeSttConfig[0].commandOffline) {
                this.sttCommandService = nodeSttConfig[0].commandOffline
                this.largeVocabStreaming = nodeSttConfig[0].largeVocabStreaming
                this.largeVocabOffline = nodeSttConfig[0].largeVocabOffline
              }
          }
      } 
    }
  },
  methods: {
    async isBlsUp () {
      try {
        const connectBls = await axios.get(process.env.VUE_APP_NODERED)
        if (connectBls.status === 200) {
          this.blsUp = true
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect to Business logic server',
          timeout: false
        })
      }
    },
     async refreshStore () {
      try {
        await this.dispatchStore('getStaticWorkflows')
        await this.dispatchStore('getSttServices')
        await this.dispatchStore('getSttLanguageModels')
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
          case 'getStaticWorkflows':
            this.staticWorkflowsLoaded = dispatchSuccess
            break
          case 'getSttServices':
            this.sttServicesLoaded = dispatchSuccess
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
    NodeRedIframe
  }
}
</script> 