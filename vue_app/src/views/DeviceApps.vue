<template>
  <div v-if="dataLoaded">
    <h1>Device applications</h1>
    <div class="flex col" >
      <h2>Deployed applications</h2>
      <div class="flex row">
        <table class="table" v-if="staticWorkflows.length > 0">
          <thead>
            <tr>
              <th>Application name</th>
              <th>Associated device</th>
              <th>Description</th>
              <th>Deployed workflow</th>
              <th>Application parameters</th>
              <th>Dissociate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="wf in staticWorkflows" :key="wf._id">
              <td><strong>{{wf.name}}</strong></td>
              <td class="right">
                <strong class="button__label">{{ wf.associated_device }}</strong>
                <button class="button button-icon button--bluemid button--with-desc bottom" data-desc="Use an other device" @click="updateEnrolledStaticDevice(wf.associated_device, {name: wf.name, _id: wf._id})">
                  <span class="button__icon button__icon--settings"></span>
                </button>
              </td>
              <td class="table--desc">{{ !!wf.description && wf.description.length > 0 ? wf.description : 'No description'}}</td>
              <td>
                <a :href="`/admin/applications/device/workflow/${wf._id}`" class="button button-icon-txt button--bluemid button--with-desc bottom" data-desc="Edit on Node-red interface">
                  <span class="button__icon button__icon--workflow"></span>
                  <span class="button__label">{{wf.name}}</span>
                </a>
              </td>
              <td class="center">
                <button class="button button-icon-txt button--blue button--with-desc bottom" data-desc="Edit services parameters" @click="updateWorkflowServicesSettings(wf.associated_device, {name: wf.name, _id: wf._id, description: wf.description})">
                  <span class="button__icon button__icon--edit"></span>
                  <span class="button__label">Edit</span>
                </button>
              </td>
              <td class="center">
                <button class="button button-icon button--red button--with-desc bottom" data-desc="Dissociate device and delete workflow" @click="dissociateTerminal(wf.associated_device, {name: wf.name, _id: wf._id})">
                  <span class="button__icon button__icon--close"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="no-content" v-else>No device application found</div>
      </div>
      <div class="divider"></div>
      <div class="flex row">
        <a href="/admin/applications/device/deploy" class="button button-icon-txt button--green">
          <span class="button__icon button__icon--add"></span>
          <span class="button__label">Create a device application</span>
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
      staticClientsLoaded: false,
      staticWorkflowsLoaded: false,
      socket: null
    }
  },
  async created () {
    // Request store
    await this.refreshStore()
  },
  async mounted () {
    // Events
    bus.$on('update_enrolled_static_device_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('update_workflow_services_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('update_enrolled_static_device', async (data) => {
      await this.refreshStore()
    })
    bus.$on('dissociate_static_device_success', async (data) => {
      await this.refreshStore()
    })
  },
  computed: {
    staticClients () {
      return this.$store.state.staticClients
    },
    associatedStaticClients () {
      return this.store.getters.STATIC_CLIENTS_ENROLLED
    },
    workflowByClients () {
      return this.$store.getters.STATIC_WORKFLOWS_BY_CLIENTS
    },
    dataLoaded () {
      return this.staticClientsLoaded && this.staticWorkflowsLoaded
    },
    staticWorkflows () {
      return this.$store.state.staticWorkflows
    }
  },
  methods: {
    // Update serial number static device associated to a workflow
    updateEnrolledStaticDevice (sn, workflow) {
      bus.$emit('update_enrolled_static_device', {sn, workflow})
    },
    // Updat a static workflow settings (mqtt, stt, nlu...)
    updateWorkflowServicesSettings (sn, workflow) {
      bus.$emit('update_workflow_services', {sn, workflow, type: 'static'})
    },
    // Dissociate device from a workflow and remove workflow
    dissociateTerminal (sn, workflow){
      bus.$emit('dissociate_static_device', {sn , workflow})
    },
    
    async refreshStore () {
      try {
        await this.dispatchStore('getStaticClients')
        await this.dispatchStore('getStaticWorkflows')
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
          case 'getStaticClients':
            this.staticClientsLoaded = dispatchSuccess
            break
          case 'getStaticWorkflows':
            this.staticWorkflowsLoaded = dispatchSuccess
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