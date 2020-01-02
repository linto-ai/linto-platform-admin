<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible' : 'hidden'">
    <div v-if="loading">Loading</div>
    <div class="modal flex col" v-if="dataLoaded">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1 flex row">Add a LinTO</span>
        <button @click="closeModal()" class="button button--img button--img__close"></button>

      </div>
      <div class="modal-body flex1 flex col">
        <span class="modal-body__content">
          Add a LinTO device by entering its serial number:
        </span>
        <div class="modal-body__form">
          <div class="flex col">
            <span class="form__label">Serial number :</span>
            <input
              type="text"
              class="form__input"
              v-model="serialNumber.value"
              :class="[serialNumber.error !== null ? 'form__input--error' : '', serialNumber.valid ? 'form__input--valid' : '']"
              @blur="testSerialNumber()"
            >
            <span class="form__error-field">{{ serialNumber.error }}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer flex row">
        <button class="button button--cancel" @click="closeModal()"><span class="label">Cancel</span></button>
        <button class="button button--valid" @click="handleForm()"><span class="label">Submit</span></button>
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
      lintosLoaded: false,
      serialNumber: {
        value: '',
        error: null,
        valid: false
      },
      showModal: false
    }
  },
  computed: {
    lintos () {
      return this.$store.state.lintoFleet
    },
    formValid () {
      return this.serialNumber.valid
    },
    dataLoaded () {
      return this.lintosLoaded
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    }
  },
  mounted () {
    bus.$on('add_linto_modal', (data) => {
      this.dispatchLintos()
      this.showModal = true
    })
  },
  methods: {
    closeModal () {
      this.showModal = false
    },
    handleForm () {
      this.testSerialNumber()
      if (this.formValid) {
        this.sendForm()
      }
    },
    testSerialNumber () {
      this.serialNumber.error = null
      this.serialNumber.valid = false
      let snExist = false
      if (this.serialNumber.value.length === 0) {
        this.serialNumber.error = 'This field is required'
        this.serialNumber.valid = false
      } else {
        this.lintos.map(l => {
          if (l.sn === this.serialNumber.value) {
            snExist = true
          }
        })
        if (snExist) {
          this.serialNumber.error = 'This serial number is already used'
          this.serialNumber.valid = false
        } else {
          this.serialNumber.valid = true
        }
      }
    },
    async sendForm () {
      try {
        const addLinto = await axios(`
        ${process.env.VUE_APP_URL}/api/lintos/fleet`, {
          method: 'post',
          data: { sn: this.serialNumber.value }
        })
        if (addLinto.data.status === 'success') {
          this.dispatchLintos()
          this.closeModal()
        }
        bus.$emit('app_notif', {
          status: addLinto.data.status,
          msg: addLinto.data.msg,
          timeout: 4000
        })
      } catch (error) {
        console.log(error)
      }
    },
    dispatchLintos () {
      try {
        this.$store.dispatch('getLintoFleet').then((resp) => {
          if (!!resp.error) {
            throw resp.error
          } else {
            this.lintosLoaded = true
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
