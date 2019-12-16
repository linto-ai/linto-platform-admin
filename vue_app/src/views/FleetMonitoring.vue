<template>
  <div>
    <div v-if="linto === null">
      No LinTO found for this serial number : {{ sn }}
    </div>
    <div v-else>
      {{ linto }}
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      sn: '',
    }
  },
  created () {
    this.sn = this.$router.currentRoute.params.sn
    this.dispatchLintos()
  },
  computed: {
    linto () {
      if(this.$store.getters.LINTO_FLEET_BY_SN(this.sn) !== null) {
        return this.$store.getters.LINTO_FLEET_BY_SN(this.sn)
      } else {
        return null
      }

    }
  },
  methods: {
    dispatchLintos () {
      this.$store.dispatch('getLintoFleet').then((resp) => {
        if (!!resp.error) {
          console.log('Dispatch Lintos : Error')
        }
      })
    }
  }
}
</script>