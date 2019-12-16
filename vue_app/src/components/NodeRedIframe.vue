<template>
  <div
    id="nodered-iframe-container"
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
      <div class="flex1 flex row iframe__controls-right">
        <button
          class="button button--valid"
          @click="OpenSavePatternModal()"
        >
          <span class="button__icon button__icon--save"></span>
          <span class="label">Save as new flow pattern</span></button>
        <button
          class="button button--valid"
          @click="OpenLoadFromPatternModal()"
        >
          <span class="button__icon button__icon--load"></span>
          <span class="label">Load from flow pattern</span>
        </button>
      </div>
    </div>
    <iframe
      :src="iframeUrl"
      id="nodered-iframe"
      class="iframe flex1"
    ></iframe>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  props: ['contextFrame', 'blsurl'],
  data () {
    return {
      iframeUrl: '',
      fullScreen: false
    }
  },
  mounted () {
    if (this.blsurl !== null && typeof(this.blsurl) !== 'undefined') {
      this.iframeUrl = this.blsurl
    } else {
      this.iframeUrl = process.env.VUE_APP_NODERED
    }

    bus.$on('iframe_reload', () => {
      setTimeout(() => {
        const test = this.iframeUrl
        this.iframeUrl = ""
          setTimeout(() => {
            this.iframeUrl = test
          },100)
        },100)
    })
  },
  watch: {
    contextFrame: function (data) {
      console.log('context:', data)
    }
  },
  methods: {
    toggleFullScreen () {
      this.fullScreen = !this.fullScreen
      if (this.fullScreen) {
        bus.$emit('iframe-set-fullscreen', {})
      } else {
        bus.$emit('iframe-unset-fullscreen', {})
      }
    },
    OpenSavePatternModal () {
      bus.$emit('save_new_pattern', {})
    },
    OpenLoadFromPatternModal () {
      bus.$emit('load_from_pattern', {})
    }
  }
}
</script>
