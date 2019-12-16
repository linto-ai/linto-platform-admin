<template>
  <div id="app" class="flex col">
    <AppHeader :extraClass="fullScreenFrame ? 'fullscreen-child' : ''"></AppHeader>
    <div id="page-view" class="flex1 flex row">
      <AppVerticalNav :extraClass="fullScreenFrame ? 'fullscreen-child' : ''"></AppVerticalNav>
      <div id="view" class="flex1" :class="fullScreenFrame ? 'fullscreen-child' : ''">
        <router-view id="view-render" class="flex col"></router-view>
      </div>
    </div>
  </div>
</template>
<script>
  import AppHeader from '@/components/AppHeader.vue'
  import AppVerticalNav from '@/components/AppVerticalNav.vue'
  import { bus } from './main.js'
  export default {
    data () {
      return {
        fullScreenFrame: false
      }
    },
    components: {
      AppHeader,
      AppVerticalNav
    },
    mounted () {
      bus.$on('iframe-set-fullscreen', () => {
        this.fullScreenFrame = true
      })
      bus.$on('iframe-unset-fullscreen', () => {
        this.fullScreenFrame = false
      })
    }
  }
</script>
