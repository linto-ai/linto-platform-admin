<template>
  <div class="flex col">
    <div v-if="loading">
      LOADING
    </div>
    <div v-if="dataLoaded">
      <h1>STT services management</h1>
      <!-- STT SERVICES -->
      <div class="block block--transparent" v-if="sttServices.length > 0">
        <h2>STT services</h2>
        <div class="flex row">
          <table class="table table--full">
            <thead>
              <tr>
                <th>Service ID</th>
                <th>Tag</th>
                <th>Replicas</th>
                <th>Language Model</th>
                <th>Acoustic Model</th>
                <th>Language</th>
                <th>isOn</th>
                <th>isDirty</th>
                <th>Created date</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in sttServices" :key="service._id">
                <td class="important">{{ service.serviceId }}</td>
                <td>{{ service.tag }}</td>
                <td>{{ service.replicas }}</td>
                <td>{{ service.LModelId }}</td>
                <td>{{ service.AModelId }}</td>
                <td>{{ service.lang }}</td>
                <td>{{ service.isOn }}</td>
                <td>{{ service.isDirty }}</td>
                <td>{{ service.date }}</td>
                <td>Todo</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="block block--transparent">
          <button class="button button--valid" @click="addSttService()">
            <span class="label">Create a service</span>
          </button>
        </div>
      </div>
      <div v-else>
        No STT service found
      </div>
      <!-- STT Language models -->
      <div class="block block--transparent" v-if="!!sttLangModels && sttLangModels.length > 0">
        <h2>STT Language models</h2>
        <div class="flex row">
          <table class="table table--full">
            <thead>
              <tr>
                <th>Model ID</th>
                <th>Acoustic model</th>
                <th>Lang</th>
                <th>Intents</th>
                <th>Entities</th>
                <th>isGenerated</th>
                <th>Generated date</th>
                <th>isDirty</th>
                <th>Created date</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lm in sttLangModels" :key="lm._id">
                <td class="important">{{ lm.modelId }}</td>
                <td>{{ lm.acmodelId }}</td>
                <td>{{ lm.lang }}</td>
                <td>{{ lm.intents.length }}</td>
                <td>{{ lm.entities.length }}</td>
                <td>{{ lm.isGenerated }}</td>
                <td>{{ lm.dateGen === null ? '' : lm.dateGen }}</td>
                <td>{{ lm.isDirty }}</td>
                <td>{{ lm.date }}</td>
                <td>
                  <button @click="deleteLM(lm.modelId)">DEL</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="block block--transparent">
          <button class="button button--valid" @click="addLanguageModelModal()">
            <span class="label">Create a language model</span>
          </button>
        </div>
      </div>
      <div v-else>
        No Language model found
      </div>
      <!-- STT Language models -->
      <div class="block block--transparent" v-if="sttAcModels.length > 0">
        <h2>STT acoustics models</h2>
        <div class="flex row">
          <table class="table table--full">
            <thead>
              <tr>
                <th>Model ID</th>
                <th>Lang</th>
                <th>Description</th>
                <th>Date</th>
                <th>DELETE</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ac in sttAcModels" :key="ac._id">
                <td class="important">{{ ac.modelId }}</td>
                <td>{{ ac.lang }}</td>
                <td>{{ ac.desc }}</td>
                <td>{{ ac.date }}</td>
                <td>
                  <button @click="deleteACModel(ac.modelId)">DEL</button>
                  </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="block block--transparent">
          <button class="button button--valid" @click="addACModelModal()">
            <span class="label">Create an acoustic model</span>
          </button>
        </div>
      </div>
      <div v-else>
        No acoustic model found
      </div>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      loading: true,
      sttServicesLoaded: false,
      sttAcModelsLoaded: false,
      sttLangModelsLoaded: false
    }
  },
  created () {
    this.dispatchStore('getSttServices')
    this.dispatchStore('getSttAcousticModels')
    this.dispatchStore('getSttLanguageModels')
  },
  computed: {
    dataLoaded () {
      return (this.sttServicesLoaded && this.sttAcModelsLoaded && this.sttLangModelsLoaded)
    },
    sttServices () {
      return this.$store.state.sttServices
    },
    sttLangModels () {
      return this.$store.state.sttLanguageModels
    },
    sttAcModels () {
      return this.$store.state.sttAcousticModels
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
    addSttService () {
      bus.$emit('add_stt_service', {})
    },
    addLanguageModelModal () {
      bus.$emit('add_language_model', {})
    },
    addACModelModal () {
      bus.$emit('add_acoustic_model', {})
    },
    async deleteLM (modelId) {
      const del = await axios(`${process.env.VUE_APP_URL}/api/stt/langmodel`, {
        method: 'delete',
        data: { modelId }
      })
      if (!!del.data) {
      await this.dispatchStore('getSttLanguageModels')
      bus.$emit('app_notif', {
        status: del.data.status,
        msg: del.data.msg,
        timeout: 4000
      })
      }
    },
    async deleteACModel (modelId) {
      const del = await axios(`${process.env.VUE_APP_URL}/api/stt/acmodel`, {
        method: 'delete',
        data: { modelId }
      })
      if (!!del.data) {
        await this.dispatchStore('getSttAcousticModels')
        bus.$emit('app_notif', {
          status: del.data.status,
          msg: del.data.msg,
          timeout: 4000
        })
      }
    },
    async dispatchStore (topic) {
      const resp = await this.$options.filters.dispatchStore(topic)
      switch(topic) {
        case 'getSttServices':
          this.sttServicesLoaded = resp
          break
        case 'getSttAcousticModels':
          this.sttAcModelsLoaded = resp
          break
        case 'getSttLanguageModels':
          this.sttLangModelsLoaded = resp
          break
        default:
          return
      }
    }
  }
}
</script>
