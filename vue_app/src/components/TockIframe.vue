<template>
  <div v-if="tockUp"
    id="iframe-container"
    :class="fullScreen ? 'iframe--fullscreen' : 'iframe--default'"
    class="flex1 flex col"
  >
    <div class="iframe__controls flex row">
      <div class="flex1 flex row iframe__controls-left">
        <button
          class="button button--img button--with-desc button--img__fullscreen"
          :class="fullScreen ? 'enabled' : 'disabled'"
          @click="toggleFullScreen()"
          :data-desc="fullScreen ? 'Leave full screen' : 'Full screen'"
        ></button>
      </div>
    </div>
    <iframe
      :src="iframeUrl"
      id="nodered-iframe"
      class="iframe flex1"
    ></iframe>
  </div>
  <div v-else>
    Loading
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      iframeUrl: '',
      fullScreen: false,
      tockUp: false,
    }
  },
  async mounted () {
    await this.isTockUp()
  },
  methods: {
    async isTockUp () {
      try {
        const connectTock = await axios(`${process.env.VUE_APP_URL}/api/tock/healthcheck`)
        if (connectTock.data.status === 'success') {
          this.tockUp = true
          this.iframeUrl = process.env.VUE_APP_NLU_URL
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect Tock interace',
          timeout: false
        })
      }
    },
    toggleFullScreen () {
      this.fullScreen = !this.fullScreen
      if (this.fullScreen) {
        bus.$emit('iframe-set-fullscreen', {})
      } else {
        bus.$emit('iframe-unset-fullscreen', {})
      }
    }
  }
}
</script>
