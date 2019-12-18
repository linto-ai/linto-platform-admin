<template>
  <div>
    <h1>Node Red Editor</h1>
    <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
      <NodeRedIframe :contextFrame="'manager'" v-if="sandBoxFound" :blsurl="sandBoxUrl"></NodeRedIframe>
    </div>
    <SavePatternModal></SavePatternModal>
    <LoadPatternModal></LoadPatternModal>
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
      sandBoxId: null,
      sandBoxUrl: null,
      sandBoxFound: false
    }
  },
  components: {
    NodeRedIframe,
    LoadPatternModal,
    SavePatternModal
  },
  async created () {
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
</script>
