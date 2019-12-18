<template>
  <div class="flex col">
    <div v-if="loading">
      LOADING
    </div>
    <div v-if="dataLoaded">
      <h1>Contexts overview</h1>
      <div class="block block--transparent" v-if="fleetContexts.length > 0">
        <h2>Fleet</h2>
        <div class="flex row">
          <table class="table table--full">
            <thead>
              <tr>
                <th>Context name</th>
                <th>Type</th>
                <th>Associated LinTO</th>
                <th>Last update</th>
                <th>Worfklow</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="context in fleetContexts" :key="context._id">
                <td class="important">{{ context.name }}</td>
                <td>{{ context.type }}</td>
                <td>{{ context.name }}</td>
                <td>{{ context.updated_date }}</td>
                <td>{{ context._id}} </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else>
        No context found
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      loading: true,
      contextLoaded: false
    }
  },
  created () {
    this.dispatchFleetContext()
  },
  computed: {
    fleetContexts () {
      return this.$store.state.contextFleet
    },
    dataLoaded () {
      return this.contextLoaded
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
    dispatchFleetContext () {
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
  }
}
</script>