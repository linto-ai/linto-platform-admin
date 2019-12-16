import Vue from 'vue'
import Login from './views/Login.vue'
import router from './router.js'

new Vue({
  router,
  render: h => h(Login)
}).$mount('#app')
