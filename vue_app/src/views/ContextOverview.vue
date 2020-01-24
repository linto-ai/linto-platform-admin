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
                <td>{{ context.associated_linto }}</td>
                <td>{{ context.updated_date }}</td>
                <td>
                  <a
                    class="button button--bluemid"
                    :href="'/admin/context/workflow/' + context._id"
                  >
                    <span class="button__icon button__icon--workflow"></span>
                    <span class="label">Workflow</span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="block block--transparent">
          <a class="button button--valid" href="/admin/context/create">
            <span class="label">Create a new context</span>
          </a>
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
      contextLoaded: false,
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
    async dispatchFleetContext () {
      this.contextLoaded = await this.$options.filters.dispatchStore('getFleetContexts')
    }
  }
}
</script>
