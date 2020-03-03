<template>
  <div id="app" class="flex col">
    <AppNotifTop></AppNotifTop>
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
    <!-- STT MODALS -->
    <addACModelModal v-if="path === '/admin/stt/overview'"></addACModelModal>
    <AddLanguageModelModal v-if="path === '/admin/stt/overview'"></AddLanguageModelModal>
    <AddSTTServiceModal v-if="path === '/admin/stt/overview'"></AddSTTServiceModal>

    <!-- Create context -->
    <AddContextModal v-if="path === '/admin/context/create'"></AddContextModal>
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
  import AddACModelModal from '@/components/AddACModelModal.vue'
  import AddLanguageModelModal from '@/components/AddLanguageModelModal.vue'
  import AddSTTServiceModal from '@/components/AddSTTServiceModal.vue'
  import AddContextModal from '@/components/AddContextModal.vue'
  import AppNotifTop from '@/components/AppNotifTop.vue'
  import { bus } from './main.js'
  export default {
    data () {
      return {
        fullScreenFrame: false,
        path: ''
      }
    },
    created () {
      this.path = this.$route.fullPath
    },
    components: {
      AppHeader,
      AppNotif,
      AppNotifTop,
      AppVerticalNav,
      AddLintoModal,
      LoadPatternModal,
      SavePatternModal,
      AddACModelModal,
      AddLanguageModelModal,
      AddSTTServiceModal,
      AddContextModal
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
