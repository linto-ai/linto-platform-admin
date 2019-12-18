<template>
  <div>
    <div class="flex col" v-if="loading">
      LOADING
    </div>
    <div class="flex col flex1" v-if="dataLoaded">
      <h1>Context : - Workflow editor</h1>
      {{ context }}
      <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
        <NodeRedIframe :contextFrame="'contextEdit'" :blsurl="blsUrl"></NodeRedIframe>
      </div>
      <SavePatternModal></SavePatternModal>
      <LoadPatternModal></LoadPatternModal>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import NodeRedIframe from '@/components/NodeRedIframe.vue'
import LoadPatternModal from '@/components/LoadPatternModal.vue'
import SavePatternModal from '@/components/SavePatternModal.vue'

export default {
  data () {
    return {
      loading: true,
      contextLoaded: false,
      contextId: '',
      blsUrl: ''
    }
  },
  mounted () {
    setTimeout(() => {
      console.log(this.$store.state)
    }, 1000)
  },
  created () {
    this.dispatchContext()
    this.contextId = this.$route.params.id
  },
  computed: {
    context () {
      return this.$store.getters.CONTEXT_BY_ID(this.contextId)
    },
    dataLoaded () {
      return this.contextLoaded
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
        this.blsUrl = `${process.env.VUE_APP_NODERED}/#flow/${this.context.flowId}`
      }
    }
  },
  methods: {
    dispatchContext () {
      try {
        this.$store.dispatch('getFleetContexts').then((resp) => {
          if (!!resp.error) {
            throw resp.error
          } else {
            this.contextLoaded = true
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  },
  components: {
    NodeRedIframe,
    LoadPatternModal,
    SavePatternModal
  }
}
</script>
