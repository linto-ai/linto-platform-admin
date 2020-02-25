<template>
  <div>
    <h1>Node Red Editor</h1>
    <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
      <NodeRedIframe :contextFrame="'manager'" v-if="sandBoxFound" :blsurl="sandBoxUrl"></NodeRedIframe>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import { bus } from '../main.js'
import NodeRedIframe from '@/components/NodeRedIframe.vue'
export default {
  data () {
    return {
      sandBoxId: null,
      sandBoxUrl: null,
      sandBoxFound: false,
      blsUp: false
    }
  },
  components: {
    NodeRedIframe
  },
  mounted () {
    setTimeout(async () => {
      await this.isBlsUp()
    }, 500)
  },
  methods: {
    async isBlsUp () {
      try {
        const connectBls = await axios.get(process.env.VUE_APP_NODERED)
        if (connectBls.status === 200) {
          this.blsUp = true
          this.getSandBoxId()
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect to Business logic server',
          timeout: false
        })
      }
    },
    async getSandBoxId () {
      const getSandBoxId = await axios(`${process.env.VUE_APP_URL}/api/flow/sandbox`, {
        method: 'get'
      })
      if (getSandBoxId.data.sandBoxId !== null) {
        this.sandBoxId = getSandBoxId.data.sandBoxId
        this.sandBoxUrl = process.env.VUE_APP_NODERED + '/#flow/' + this.sandBoxId
        this.sandBoxFound = true
      }
    }
  }
}
</script>
