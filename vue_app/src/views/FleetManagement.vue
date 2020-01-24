<template>
  <div class="flex col">
    <div class="flex col" v-if="loading">
      Loading
    </div>
    <div class="flex col" v-if="dataLoaded">
      <h1>Fleet management</h1>
      <!-- IN USE -->
      <div class="block block--transparent">
        <h2>In use</h2>
        <div class="flex row" v-if="associated_lintos.length > 0">
          <table class="table table--full">
            <thead>
              <tr>
                <th class="status">Connexion</th>
                <th>Serial number</th>
                <th>Firmware</th>
                <th>Context</th>
                <th>Last seen up</th>
                <th>Last seen down</th>
                <th>IP</th>
                <th>Monitoring</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="linto in associated_lintos"
                :key="linto._id"
              >
                <td class="center status"><span
                  class="icon icon--status"
                  :class="linto.connexion"></span></td>
                <td class="important">{{ linto.sn }}</td>
                <td>{{ linto.config.firmware }}</td>
                <td>{{ linto.associated_context }}</td>
                <td>{{ linto.last_up }}</td>
                <td>{{ linto.last_down }}</td>
                <td>0.0.0.1</td>
                <td>
                  <a
                    class="button button--bluemid"
                    :href="'/admin/fleet/monitoring/'+linto.sn"
                  >
                    <span class="button__icon button__icon--monitoring"></span>
                    <span class="label">Monitoring</span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          No LinTO in use for now
        </div>
      </div>
      <!-- Provisionning -->
      <div class="block block--transparent">
        <h2>Provisionning</h2>
        <div class="flex row" v-if="not_associated_lintos.length > 0">
          <table class="table table--shadow">
            <thead>
              <tr>
                <th>Serial number</th>
                <th>Firmware</th>
                <th>Monitoring</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="linto in not_associated_lintos"
                :key="linto._id"
              >
                <td class="important">{{ linto.sn }}</td>
                <td>{{ linto.config.firmware }}</td>
                <td>
                  <a
                    class="button button--bluemid"
                    :href="'/admin/fleet/monitoring/'+linto.sn"
                  >
                    <span class="button__icon button__icon--monitoring"></span>
                    <span class="label">Monitoring</span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          No LinTO available
        </div>
      </div>
      <div class="block block--transparent">
        <button class="button button--valid" @click="addLintoModal()">
          <span class="label">Add a LinTO device</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  data () {
    return {
      loading: true,
      lintoLoaded: false
    }
  },
  created () {
    this.dispatchLintos()
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    }
  },
  computed: {
    lintos () {
      return this.$store.state.lintoFleet
    },
    not_associated_lintos () {
      return this.$store.getters.NOT_ASSOCIATED_LINTO_FLEET
    },
    associated_lintos () {
      return this.$store.getters.ASSOCIATED_LINTO_FLEET
    },
    dataLoaded () {
      return this.lintoLoaded
    }
  },
  methods: {
    addLintoModal () {
      bus.$emit('add_linto_modal', {})
    },
    async dispatchLintos () {
      this.lintoLoaded = await this.$options.filters.dispatchStore('getLintoFleet')
    }
  }
}
</script>
