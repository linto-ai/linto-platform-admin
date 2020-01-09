import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

export const bus = new Vue()
Vue.config.productionTip = false

Vue.filter('testSelectField', function (obj) {
  obj.error = null
  obj.valid = false
  if (typeof (obj.value) === 'undefined') {
    obj.value = ''
  }
  if (obj.value === '' || obj.value.length === 0) {
    obj.valid = false
    obj.error = 'This field is required'
  } else {
    obj.valid = true
    obj.error = null
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
