<template>
   <div v-if="dataLoaded">
    <h1>Skills manager</h1>
    <div class="flex col">
      <!-- Setup lists -->
      <div class="flex row">
        <!-- Installed skills -->
        <div class="flex col flex1" style="margin-right: 40px;">
          <h2>Installed skills</h2>
          <div class="skills-list-container flex col flex1">
            <table class="skills-list">
              <thead>
                <tr>
                  <th>Skill id</th>
                  <th colspan>version</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="node in installedNodes" :key="node.module">
                  <td 
                    class="skill--id"
                  ><span>{{ node.module }}</span></td>
                  <td>{{ node.version }} </td>
                  <td>
                    <button class="button button-icon-txt button--red install" @click="uninstallNode($event, node.module)">
                      <span class="button__icon button__icon--close"></span>
                      <span class="button__label">Uninstall</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Available skills -->
        <div class="flex col flex1">
          <h2>Available skills</h2>
          <div class="skills-list-container flex col flex1">
            <table class="skills-list">
              <thead>
                <tr>
                  <th>Skill id</th>
                  <th colspan="2">version</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="node in lintoSkillsToInstall" :key="node.id">
                  <td 
                    class="skill--id desc"
                  ><span :data-desc="!!node.description ? node.description : 'no description'">{{ node.id }}</span></td>
                  <td>{{ node.version }} </td>
                  <td>
                    <button class="button button-icon-txt button--green install" @click="installNode($event, node.id)">
                      <span class="button__icon button__icon--add"></span>
                      <span class="button__label">Install</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- Import skill form -->
      <div class="flex col">
        <h2>Import a skill</h2>
        <p>Import your own skills locally by uploading ".zip" or ".tar.gz" file:</p>
        <input type="file" />
      </div>
    </div>
  </div>
  <div v-else>
    Loading...
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
import { install } from 'vuex'
export default {
  data () {
    return {
      installedNodesLoaded: false,
      nodeRedCatalogueLoaded: false,
      processing: false
    }
  },
  async mounted () {
    await this.dispatchStore('getNodeRedCatalogue')
    await this.dispatchStore('getInstalledNodes')
  },
  computed: {
    dataLoaded () {
      return this.nodeRedCatalogueLoaded && this.installedNodesLoaded
    },
    lintoSkillsAvailable () {
      return this.$store.state.nodeRedCatalogue
    },
    installedNodes () {
      return this.$store.state.installedNodes
    },
    lintoSkillsToInstall () {
      let skills = []
      if (this.dataLoaded) {
        if (this.lintoSkillsAvailable.length > 0 && this.installedNodes.length > 0) {
          this.lintoSkillsAvailable.map(lintoSkill => {
            let isInstalled = this.installedNodes.filter(node => node.module.indexOf(lintoSkill.id) >= 0 && node.version === lintoSkill.version)
            if (isInstalled.length === 0) {
              skills.push(lintoSkill)
            }
          })
        }
        return skills
      } else {
        return []
      }
    }
  },
  methods: {
    async dispatchStore (topic) {
      try {
        const dispatch = await this.$options.filters.dispatchStore(topic)
        const dispatchSuccess = dispatch.status == 'success' ? true : false
        if (dispatch.status === 'error') {
          throw dispatch.msg
        }
        switch(topic) {
          case 'getNodeRedCatalogue':
            this.nodeRedCatalogueLoaded = dispatchSuccess
            break
          case 'getInstalledNodes':
            this.installedNodesLoaded = dispatchSuccess
            break
          default:
            return
        }
      } catch (error) {
        console.error(error)
        bus.$emit('app_notif', {
          status: 'error',
          msg: error.error,
          timeout: false,
          redirect: false
        })
      }
    },
    setBtnLoading (event) {
      const btn = event.target
      let parent = null
      let target = null
      if (btn.classList.contains('button__icon') || btn.classList.contains('button__label')) {
        parent = event.target.offsetParent
      } else {
        parent = event.target
      }
      if (!!parent.childNodes && parent.childNodes.length > 0) {
        for(let child of parent.childNodes) {
          if(child.classList.contains('button__icon')) {
            target = child
          }
        }
      }
      if (target !== null) {
        target.classList.add('button__icon--loading')
      }
    },
    unsetBtnLoading () {
      const installBtns = document.getElementsByClassName('button__icon--loading')
      if(installBtns.length > 0) {
        for (let i = 0; i < installBtns.length; i++) {
          installBtns[i].classList.remove('button__icon--loading')
        }
      }
    },
    async installNode (event, nodeId) {
      try {
        if (!this.processing) {
          this.processing = true
          this.setBtnLoading(event)
          const installNode = await axios(`${process.env.VUE_APP_URL}/api/flow/node`, {
            method: 'post',
            data: { module: nodeId }
          })
          if (installNode.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: installNode.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.dispatchStore('getNodeRedCatalogue')
            await this.dispatchStore('getInstalledNodes')
            this.unsetBtnLoading()
            this.processing = false
          } else {
            throw installNode
          }
        }
      } catch (error) {
        console.error(error)
        if (!!error.data) {
          bus.$emit('app_notif', {
            status: 'error',
            msg: error.data.msg,
            timeout: 3000,
            redirect: false
          })
        } else {
          bus.$emit('app_notif', {
            status: 'error',
            msg: `error on installing skill "${nodeId}"`,
            timeout: 3000,
            redirect: false
          })
        }
        await this.dispatchStore('getNodeRedCatalogue')
        await this.dispatchStore('getInstalledNodes')
        this.unsetBtnLoading()
        this.processing = false
      }
    },
    async uninstallNode (event, nodeId) {
      try {
        if (!this.processing) {
          this.processing = true
          this.setBtnLoading(event)
          const uninstallNode = await axios(`${process.env.VUE_APP_URL}/api/flow/node/remove`, {
            method: 'delete',
            data: { nodeId }
          })
          if (uninstallNode.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: uninstallNode.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.dispatchStore('getNodeRedCatalogue')
            await this.dispatchStore('getInstalledNodes')
            this.unsetBtnLoading()
            this.processing = false
          } else {
            throw uninstallNode
          }
        }
      } catch (error) {
        if (!!error.data) {
          bus.$emit('app_notif', {
            status: 'error',
            msg: error.data.msg,
            timeout: 3000,
            redirect: false
          })
        } else {
          bus.$emit('app_notif', {
            status: 'error',
            msg: `error on installing skill "${nodeId}"`,
            timeout: 3000,
            redirect: false
          })
        }
        await this.dispatchStore('getNodeRedCatalogue')
        await this.dispatchStore('getInstalledNodes')
        this.unsetBtnLoading()
        this.processing = false
      }
    }
  }
}
</script>