<template>
  <div>
    <div v-if="loading">
      Loading
    </div>
    <div v-if="dataLoaded && linto === null">
      No LinTO found for this serial number : {{ sn }}
    </div>
    <div v-if="dataLoaded && linto !== null" class="flex col">
      <h1>Monitoring : LinTO - {{ sn }}</h1>

      <div class="block block--transparent">
        <h2>Global informations</h2>
        <div class="flex row">
          <table class="table table--full">
            <thead>
              <tr>
                <th class="status">Connexion</th>
                <th>Serial number</th>
                <th>Type</th>
                <th>Firmware</th>
                <th>Context</th>
                <th>Last seen up</th>
                <th>Last seen down</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="center status"><span
                  class="icon icon--status"
                  :class="linto.connexion"></span></td>
                <td class="important">{{ linto.sn }}</td>
                <td>{{ linto.type }}</td>
                <td>{{ linto.config.firmware }}</td>
                <td>{{ linto.associated_context }}</td>
                <td>{{ linto.last_up }}</td>
                <td>{{ linto.last_down }}</td>
                <td>0.0.0.1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="block block--transparent">
        <h2>Network informations</h2>
        <div class="flex row">
          TODO
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      sn: '',
      lintoLoaded: false,
      loading: true
    }
  },
  created () {
    this.sn = this.$router.currentRoute.params.sn
    this.dispatchLintos()
  },
  computed: {
    linto () {
      if (this.$store.getters.LINTO_FLEET_BY_SN(this.sn) !== null) {
        return this.$store.getters.LINTO_FLEET_BY_SN(this.sn)
      } else {
        return null
      }
    },
    dataLoaded () {
      return this.lintoLoaded
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    }
  },
  methods: {
    async dispatchLintos () {
      this.lintoLoaded = await this.$options.filters.dispatchStore('getLintoFleet')
    }
  }
}
</script>
