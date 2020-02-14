import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

export const bus = new Vue()
Vue.config.productionTip = false

Vue.filter('dispatchStore', async function (label) {
  try {
    const req = await store.dispatch(label)
    if (!!req.error) {
      throw req.error
    }
    if (typeof req !== 'undefined') {
      return {
        status: 'success',
        msg: ''
      }
    } else {
      throw 'an error has occured'
    }
  } catch (error) {
    return ({
      status: 'error',
      msg: error
    })
  }
})

Vue.filter('testSelectField', function (obj) {
  obj.error = null
  obj.valid = false
  if (typeof (obj.value) === 'undefined') {
    obj.value = ''
  }
  if (obj.value === '' || obj.value.length === 0) {
    obj.error = 'This field is required'
  } else {
    obj.valid = true
  }
})

Vue.filter('testName', function (obj) {
  const regex = /^[0-9A-Za-z\s\-\_]+$/
  obj.valid = false
  obj.error = null
  if (obj.value.length === 0) {
    obj.error = 'This field is required'
  } else if (obj.value.match(regex)) {
    obj.valid = true
  } else {
    obj.error = 'Invalid name'
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
