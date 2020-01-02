<template>
  <div id="app" class="flex col">
    <AppHeader :extraClass="fullScreenFrame ? 'fullscreen-child' : ''"></AppHeader>
    <div id="page-view" class="flex1 flex row">
      <AppVerticalNav :extraClass="fullScreenFrame ? 'fullscreen-child' : ''"></AppVerticalNav>
      <div id="view" class="flex1" :class="fullScreenFrame ? 'fullscreen-child' : ''">
        <router-view id="view-render" class="flex col"></router-view>
      </div>
    </div>
    <AppNotif></AppNotif>
    <AddLintoModal></AddLintoModal>
    <LoadPatternModal></LoadPatternModal>
    <SavePatternModal></SavePatternModal>
  </div>
</template>
<script>
  // Navigation
  import AppHeader from '@/components/AppHeader.vue'
  import AppVerticalNav from '@/components/AppVerticalNav.vue'
  // App notify
  import AppNotif from '@/components/AppNotif.vue'
  // Modals
  import AddLintoModal from '@/components/AddLintoModal.vue'
  import LoadPatternModal from '@/components/LoadPatternModal.vue'
  import SavePatternModal from '@/components/SavePatternModal.vue'

  import { bus } from './main.js'
  export default {
    data () {
      return {
        fullScreenFrame: false
      }
    },
    components: {
      AppHeader,
      AppNotif,
      AppVerticalNav,
      AddLintoModal,
      LoadPatternModal,
      SavePatternModal
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
