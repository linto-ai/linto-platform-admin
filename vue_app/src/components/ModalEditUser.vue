<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded && user !== null">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Edit an user</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          <span class="subtitle" v-if="!addAppFormVisible">User informations</span>
          <div class="flex row" v-if="!addAppFormVisible">
            <AppInput :label="'Email'" :obj="userEmail" :test="'testAndroidUserEmail'" :class="'flex2'"></AppInput>
            <div class="flex flex1 row">
              <button class="button button-icon-txt button--green" style="margin: 23px 0 0 10px" @click="updateUserEmail(user)">
                <span class="button__icon button__icon--save"></span>
                <span class="button__label">Save</span>
              </button>
            </div>
          </div>

          <span class="subtitle" v-if="!addAppFormVisible">Update password</span>
          <div class="flex row" v-if="!addAppFormVisible">
            <div class="flex col flex2">
              <AppInput :label="'New password'" :obj="userPswd" :test="'testPassword'" :type="'password'"></AppInput>

              <AppInput :label="'Password confirmation'" :obj="userPswdConfirm" :test="'testPasswordConfirm'" :compare="userPswd" :type="'password'"></AppInput>
            </div>
            <div class="flex flex1 row">
               <button class="button button-icon-txt button--green" style="margin: 103px 0 0 10px" @click="updateUserPassword(user)">
                <span class="button__icon button__icon--save"></span>
                <span class="button__label">Save</span>
              </button>
            </div>
          </div>

          <div class="flex row" v-if="addAppFormVisible">
            <button class="button button-icon-txt button--orange" @click="hideAddAppForm()">
              <span class="button__icon button__icon--back"></span>
              <span class="button__label">Back to user infos</span>
            </button>
          </div>
          <div class="flex col" v-if="!addAppFormVisible">
            <span class="subtitle" v-if="user.applications.length > 0">Applications</span>
            <div class="flex row"  v-if="user.applications.length > 0">
              <table class="table">
                <thead>
                  <tr>
                    <th>Application name</th>
                    <th>Dissociate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="app in user.applications" :key="app">
                    <td>{{ workflowByName[app] }}</td>
                    <td class="center"><button class="button button-icon button--red" @click="removeUserFromApp(user, app)">
                        <span class="button__icon button__icon--trash"></span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="no-content" v-else>No application associated</div>
            <div class="divider small"></div>
            <div class="flex row" v-if="filteredApplicationWorkflows.length > 0">
              <button class="button button-icon-txt button--green" @click="showAddAppForm()">
                <span class="button__icon button__icon--add"></span>
                <span class="button__label">Associate to other applications</span>
              </button>
            </div>
          </div>
          <div class="flex col" v-else>
            <p>Please select applications to <strong>associate</strong> with the user "<strong>{{ user.email }}</strong>"</p>
            <div class="flex col">
              <ul class="checkbox-list">
                <li v-for="wf in filteredApplicationWorkflows" :key="wf._id">
                  <input type="checkbox" :value="wf._id" name="app-workflow" @change="updateSelectedApps($event, wf._id)">
                  <span class="checkbox__label">{{ wf.name }}</span>
                </li>
              </ul>
            </div>
            <div class="divider small"></div>
            <div class="flex row">
              <button class="button button-icon-txt button--green" @click="addAppToUser()">
                <span class="button__icon button__icon--apply"></span>
                <span class="button__label">Associate applications</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
    <!-- End FOOTER -->
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      userId: null,
      selectedApps: [],
      addAppFormVisible: false,
      applicationWorkflowsLoaded: false,
      androidUsersLoaded: false,
      userEmail: {
        value: '',
        error: null,
        valid: false
      },
      userPswd: {
        value: '',
        error: null,
        valid: false
      },
      userPswdConfirm: {
        value: '',
        error: null,
        valid: false
      },
    }
  },
  async mounted () {
    bus.$on('edit_android_user', async (data) => {
      this.showModal()
      await this.refreshStore()
      this.userId = data.user._id
      this.userEmail.value = data.user.email
      this.userEmail.valid = true
    })
  },
  computed: {
    dataLoaded () {
      return this.applicationWorkflowsLoaded && this.androidUsersLoaded
    },
    workflowByName () {
      return this.$store.getters.APP_WORKFLOWS_NAME_BY_ID
    },
    applicationWorkflows () {
      return this.$store.state.applicationWorkflows
    },
    filteredApplicationWorkflows () {
      const userWorkflows = this.user.applications
      if (userWorkflows.length > 0) {
        return this.applicationWorkflows.filter(wf => userWorkflows.indexOf(wf._id) < 0)
      } else {
        return this.applicationWorkflows
      }
    },
    user () {
      if(this.userId !== null) {
        return this.$store.getters.ANDROID_USER_BY_ID(this.userId)
      } else {
        return null
      }
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
      this.hideAddAppForm()
    },
    closeModal () {
      this.modalVisible = false
      this.selectedApps = []
      this.userEmail = {
        value: '',
        error: null,
        valid: false
      }
    },
    showAddAppForm () {
      this.addAppFormVisible = true
    },
    hideAddAppForm () {
      this.addAppFormVisible = false
      this.selectedApps = []
    },
    updateSelectedApps (event, workflowId) {
      if (event.srcElement.checked) {
        this.selectedApps.push(workflowId)
      } else {
        this.selectedApps.pop(workflowId)
      }
    },
    async addAppToUser () {
      try {
        if (this.selectedApps.length > 0) {
          const payload = {
            applications: this.selectedApps
          }
          const updateUser = await axios(`${process.env.VUE_APP_URL}/api/androidusers/${this.user._id}/applications`, {
            method: 'put',
            data: { payload }
          })
          if (updateUser.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateUser.data.msg,
              timeout: 3000,
              redirect: false
            })
            this.hideAddAppForm()
            await this.refreshStore()
          }
        }
      } catch (error) {
        console.error(error)
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async updateUserEmail (user) {
      try {
        this.$options.filters.testAndroidUserEmail(this.userEmail)
        if (this.userEmail.valid) {
          const payload = {
            _id: user._id,
            email: this.userEmail.value
          }

          const updateUser = await axios(`${process.env.VUE_APP_URL}/api/androidusers/${payload._id}`,{
            method: 'put',
            data: { payload }
          })

          if (updateUser.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateUser.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.refreshStore()
            this.closeModal()
          } else {
            throw updateUser.data.msg
          }
        }
        
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async removeUserFromApp (user, appId) {
      try {
        const removeUserFromApp = await axios(`${process.env.VUE_APP_URL}/api/androidusers/${user._id}/applications/${appId}/remove`, {
          method: 'patch'
        })
        if (removeUserFromApp.data.status === 'success'){
          bus.$emit('app_notif', {
            status: 'success',
            msg: removeUserFromApp.data.msg,
            timeout: 3000,
            redirect: false
          })
          await this.refreshStore()
        } else {
          throw removeUserFromApp.data.msg
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async updateUserPassword (user) {
      try {
        this.$options.filters.testPassword(this.userPswd)
        this.$options.filters.testPasswordConfirm(this.userPswdConfirm, this.userPswd)
        if (this.userPswd.valid && this.userPswdConfirm.valid) {
          const payload = {
            email: user.email,
            _id: user._id,
            newPswd: this.userPswd.value,
            newPswdConfirmation: this.userPswd.value
          }
          const updateUser = await axios(`${process.env.VUE_APP_URL}/api/androidusers/${user._id}/pswd`, {
            method: 'put',
            data: { payload }
          })

          if (updateUser.data.status === 'success'){
            this.userPswd = {
              value: '',
              error: null,
              valid: false
            }
            this.userPswdConfirm = this.userPswd

            bus.$emit('app_notif', {
              status: 'success',
              msg: updateUser.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.refreshStore()
          } else {
            throw updateUser.data.msg
        }
        } 
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
          timeout: false,
          redirect: false
        })
      }
    },
    async refreshStore () {
      try {
        await this.dispatchStore('getAndroidUsers')
        await this.dispatchStore('getApplicationWorkflows')
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
          default:
            return
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
          timeout: false,
          redirect: false
        })
      }
    }
  },
  components: {
    AppSelect,
    AppInput
  }
}
</script>