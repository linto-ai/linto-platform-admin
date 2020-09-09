<template>
  <div v-if="dataLoaded">
    <h1>Multi-user applications</h1>
    <div class="flex col">
      <h2>Deployed applications</h2>
      <div class="flex row">
        <table class="table" v-if="applicationWorkflows.length > 0">
          <thead>
            <tr>
              <th>Application Name</th>
              <th>Description</th>
              <th>Users</th>
              <th>Domains</th>
              <th>Deployed workflow</th>
              <th>Services Parameters</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in applicationWorkflows" :key="app._id">
              <td><strong>{{ app.name }}</strong></td>
              <td class="table--desc">{{ !!app.description && app.description.length > 0 ? app.description : 'No description'}}</td>
              <td>
                <button 
                  class="button button-icon-txt" @click="manageAndroidUsers(app._id,  app.name)"
                  :class="!!app.flow.nodes[app.flow.nodes.findIndex(f => f.type === 'linto-application-in')].auth_android && app.flow.nodes[app.flow.nodes.findIndex(f => f.type === 'linto-application-in')].auth_android === true ? 'button--green' : 'button--grey'"
                >
                  <span class="button__icon button__icon--android"></span>
                  <span class="button__label">Users ({{ !!androidUsersByApps[app._id] ? androidUsersByApps[app._id].length : 0 }})</span>
                </button>
              </td>
              <td>
                <button 
                  class="button button-icon-txt" @click="manageWebappHosts(app._id,  app.name)"
                  :class="app.flow.nodes[app.flow.nodes.findIndex(f => f.type === 'linto-application-in')].auth_web === true ? 'button--green' : 'button--grey'"
                >
                  <span class="button__icon button__icon--webapp"></span>
                  <span class="button__label">Domains ({{ !!hostByApps[app._id] ? hostByApps[app._id].length : 0 }})</span>
                </button>
              </td>
              <td>
                <a :href="`/admin/applications/multi/workflow/${app._id}`" class="button button-icon-txt button--bluemid button--with-desc bottom" data-desc="Edit on Node-red interface">
                  <span class="button__icon button__icon--workflow"></span>
                  <span class="button__label">{{ app.name }}</span>
                </a>
              </td>
              <td class="center">
                <button class="button button-icon-txt button--blue button--with-desc bottom" data-desc="Edit services parameters" @click="updateWorkflowServicesSettings(app)">
                  <span class="button__icon button__icon--settings"></span>
                  <span class="button__label">Edit</span>
                </button>
              </td>
              <td class="center">
                  <button class="button button-icon button--red button--with-desc bottom" @click="deleteApplicationWorkflow(app)" data-desc="Remove application and dissociate users" >
                    <span class="button__icon button__icon--close"></span>
                  </button>
                </td>
            </tr>
          </tbody>
        </table>
        <div class="no-content" v-else>No multi-user application was found.</div>
      </div>
      <div class="divider"></div>
      <div class="flex row">
        <a href="/admin/applications/multi/deploy" class="button button-icon-txt button--green">
          <span class="button__icon button__icon--add"></span>
          <span class="button__label">Create a multi-user application</span>
        </a>
      </div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      applicationWorkflowsLoaded: false,
      androidUsersLoaded: false,
      webappHostsLoaded: false
    }
  },
  async created () {
    // Request store
    await this.refreshStore()
  },
  async mounted () {
    // Events
    bus.$on('update_workflow_services_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('manage_android_users_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('delete_application_workflow_success', async (data) => {
      await this.refreshStore()
    })
  },
  computed: {
    dataLoaded () {
      return this.applicationWorkflowsLoaded && this.androidUsersLoaded && this.webappHostsLoaded
    },
    applicationWorkflows () {
      return this.$store.state.applicationWorkflows
    },
    androidUsers () {
      return this.$store.state.androidUsers
    },
    androidUsersByApps () {
      return this.$store.getters.ANDROID_USERS_BY_APPS
    },
    hostByApps() {
      return this.$store.getters.WEB_APP_HOST_BY_APPS
    }
  },
  methods: {
    async manageAndroidUsers (workflowId, appName) {
      bus.$emit('manage_android_users', { workflowId, appName })
    },
    async manageWebappHosts (workflowId, appName) {
      bus.$emit('manage_webapp_hosts', { workflowId, appName })
    },
    async deleteApplicationWorkflow (app) {
      bus.$emit('delete_application_workflow', {
        _id: app._id,
        name: app.name,
        flowId: app.flowId
      })
    },
    async updateWorkflowServicesSettings (workflow) {
      bus.$emit('update_workflow_services', {
        workflow: {
          _id: workflow._id, 
          name: workflow.name
        },
        type:'application'
      })

    },
    async refreshStore () {
      try {
        await this.dispatchStore('getApplicationWorkflows')
        await this.dispatchStore('getAndroidUsers')
        await this.dispatchStore('getWebappHosts')
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
          timeout: false,
          redirect: false
        })
      }
    },
    async dispatchStore (topic) {
      try {
        const dispatch = await this.$options.filters.dispatchStore(topic)
        const dispatchSuccess = dispatch.status == 'success' ? true : false
        if (dispatch.status === 'error') {
          throw dispatch.msg
        }
        switch(topic) {
          case 'getApplicationWorkflows':
            this.applicationWorkflowsLoaded = dispatchSuccess
            break
          case 'getAndroidUsers':
            this.androidUsersLoaded = dispatchSuccess
            break
          case 'getWebappHosts':
            this.webappHostsLoaded = dispatchSuccess
            break
          default:
            return
        }  
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    }
  }
}
</script>