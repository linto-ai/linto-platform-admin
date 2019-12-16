<template>
  <div class="flex col">
    <h1>Fleet management</h1>

    <!-- IN USE -->
    <div class="block block--transparent">
      <h2>In use</h2>
      <div class="flex row">
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
              <td><button class="button"><span class="label">Monitoring</span></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="block block--transparent">
      <h2>Provisionning</h2>
      <div class="flex row">
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
              <td><button class="button"><span class="label">Monitoring</span></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="block block--transparent">
      <button class="button button--valid">
        <span class="label">Add a LinTO device</span>
      </button>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  data () {
    return {
    }
  },
  created () {
    this.dispatchLintos()
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