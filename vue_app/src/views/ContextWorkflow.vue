<template>
  <div>
    <div class="flex col" v-if="loading">
      LOADING
    </div>
    <div class="flex col flex1" v-if="dataLoaded">
      <h1>Context : "{{ context.name }}" - Workflow editor</h1>

      <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
        <NodeRedIframe :contextFrame="'contextEdit'" :blsurl="blsUrl" :flowId="context.flowId" :contextId="contextId"></NodeRedIframe>
      </div>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
import NodeRedIframe from '@/components/NodeRedIframe.vue'
export default {
  data () {
    return {
      loading: true,
      contextLoaded: false,
      contextId: '',
      blsUp: false,
      blsUrl: ''
    }
  },
  beforeRouteEnter (to, form, next) {
    // Check if Business logic server is UP before enter route
    next(vm => vm.isBlsUp())
  },
  created () {
    this.contextId = this.$route.params.id
  },
  computed: {
    context () {
      return this.$store.getters.CONTEXT_BY_ID(this.contextId)
    },
    dataLoaded () {
      return (this.blsUp && this.contextLoaded)
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
    async isBlsUp () {
      try {
        const connectBls = await axios.get(process.env.VUE_APP_NODERED)
        if (connectBls.status === 200) {
          this.blsUp = true
          this.dispatchContext()
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect to Business logic server',
          timeout: false
        })
      }
    },
    async dispatchContext () {
      this.contextLoaded = await this.$options.filters.dispatchStore('getFleetContexts')
    }
  },
  components: {
    NodeRedIframe
  }
}
</script>
