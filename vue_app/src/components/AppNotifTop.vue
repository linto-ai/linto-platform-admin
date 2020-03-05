<template>
  <div id="top-notif" v-if="show" v-html="stateMsg" class="flex col">
    
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      show: false,
      stateMsg: '',
      watcher: null,
      generateFinished: false,
      generation: false
    }
  },
  mounted () {
  },
  computed: {
    lmGenerating () {
      return this.$store.getters.STT_GRAPH_GENERATION
    }
  },
  watch: {
    lmGenerating (data) {
      if (data.length > 0 ) {
        this.generation = true
        this.generateFinished = false
        this.show = true
        this.updateInfo(data)
        setTimeout(() => {
          this.dispatchLM()
        }, 5000)
      } else {
        this.generateFinished = true
      }
    },
    generateFinished (data) {
      if (data) {
        if (this.generation) {
          this.stateMsg = `
            <div class="state-item flex row">
              <span class="icon state__icon state__icon--success"></span>
              <span class="state-text success">Langage model have been successfully generated</span>
              <div class="state-progress-container">
                  <div class="state-progress" style="width: 100%"></div>
              </div>
            </div>
          `
          setTimeout(() =>{
            this.close()
          }, 2500)

        }
      }
    }
  },
  async created () {
    await this.dispatchLM()
  },
  methods: {
    close () {
      this.show = false
    },
    async dispatchLM () {
      this.lintoLoaded = await this.$options.filters.dispatchStore('getSttLanguageModels')
    },
    updateInfo (data) {
      this.stateMsg = ''
      data.map (lm => {
      this.stateMsg += `
        <div class="state-item flex row">
          <span class="icon state__icon state__icon--loading"></span>
          <span class="state-text">Language model <strong>"${lm.modelId}"</strong> is generating: <strong>${lm.updateState}%</strong></span>
          <div class="state-progress-container">
              <div class="state-progress" style="width: ${lm.updateState}%"></div>
          </div>
        </div>
        `
      })
    }
  }
}
</script>
