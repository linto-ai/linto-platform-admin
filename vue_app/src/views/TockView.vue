<template>
  <div>
    <h1>Tock interface</h1>
    <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
      <TockIframe></TockIframe>
    </div>

  </div>
</template>
<script>
import axios from 'axios'
import TockIframe from '@/components/TockIframe.vue'
export default {
  data () {
    return {
    }
  },
  components: {
    TockIframe
  }
}
</script>
