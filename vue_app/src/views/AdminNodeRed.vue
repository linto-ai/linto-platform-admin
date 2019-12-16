<template>
  <div class="flex col">
    <h1>Node Red Editor</h1>
    <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
      <NodeRedIframe :contextFrame="'allo?'"></NodeRedIframe>
    </div>
    <SavePatternModal></SavePatternModal>
    <LoadPatternModal></LoadPatternModal>
  </div>
</template>
<script>
import NodeRedIframe from '@/components/NodeRedIframe.vue'
import LoadPatternModal from '@/components/LoadPatternModal.vue'
import SavePatternModal from '@/components/SavePatternModal.vue'

export default {
  data () {
    return {}
  },
  components: {
    NodeRedIframe,
    LoadPatternModal,
    SavePatternModal
  }
}
</script>
