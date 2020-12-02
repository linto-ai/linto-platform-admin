<template>
  <div id="app-notif-top" :class="showNotif ? 'opened' : 'closed'" v-if="dataLoaded">
    <div class="flex row">
      <div class="flex row">
        <h3 class="flex">Language models generating</h3>
      </div>
      <div id="app-notif-top-data" class="flex row">
        <table class="model-generating-table">
          <tbody v-if="!!modelsGenerating && modelsGenerating.length > 0">
            <tr v-for="model in modelsGenerating" :key="model.sttServiceName">
              <td class="model-generating__label">{{ model.sttServiceName }}</td>
              <td>
                <div class="model-generating__prct-wrapper">
                  <div class="model-generating__prct-value" :style="`width:${model.prct}%;`"></div>
                  <span class="model-generating__prct-label">Generating: {{ model.prct }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex row">
        <button id="model-generating-refresh" class="button button-icon button--bluemid button--with-desc" data-desc="Refresh" @click="refreshStore()" style="margin-left: 10px;">
          <span class="button__icon button__icon--reset"></span>
        </button>
      </div>
    </div>
    <button id="close-notif-top" class="button button-icon button--bluedark" @click="hideNotif()">
      <span class="button__icon button__icon--arrow" :class="showNotif ? 'opened' : 'closed'"></span>
    </button>
  </div>
</template>
<script>
export default {
  data () {
    return {
      showNotif: false,
      sttServicesLoaded: false,
      sttLanguageModelsLoaded: false
    }
  },
  async mounted () {
    await this.refreshStore()
  },
  watch: {
    modelsGenerating (data) {
      if(data.length > 0) {
        this.showNotif = true
      }
    }
  },
  computed: {
    dataLoaded () {
      return this.sttServicesLoaded && this.sttLanguageModelsLoaded
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
    }
  },
  methods: {
    hideNotif() {
      this.showNotif = !this.showNotif
    },
    async refreshStore () {
      try {
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
        if(process.env.VUE_APP_DEBUG) {
          console.log(topic, dispatchSuccess)
        }
        switch(topic) {
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
  }
}
</script>
