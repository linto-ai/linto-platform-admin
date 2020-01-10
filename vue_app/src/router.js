import Vue from 'vue'
import Router from 'vue-router'
// Views
import Login from './views/Login.vue'
import AdminDemo from './views/AdminDemo.vue'
import ContextAdd from './views/ContextAdd.vue'
import ContextOverview from './views/ContextOverview.vue'
import ContextWorkflow from './views/ContextWorkflow.vue'
import WorkflowEditor from './views/WorkflowEditor.vue'
import FleetManagement from './views/FleetManagement.vue'
import FleetMonitoring from './views/FleetMonitoring.vue'
import TockView from './views/TockView.vue'

Vue.use(Router)
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/admin/demo',
      name: 'admin demo',
      component: AdminDemo
    },
    {
      path: '/admin/fleet',
      name: 'Fleet overview',
      component: FleetManagement
    },
    {
      path: '/admin/fleet/monitoring/:sn',
      name: 'Fleet monitoring',
      component: FleetMonitoring
    },
    {
      path: '/admin/workflows',
      name: 'worflow editor',
      component: WorkflowEditor
    },
    {
      path: '/admin/context/overview',
      name: 'Admin context overview',
      component: ContextOverview
    },
    {
      path: '/admin/context/create',
      name: 'Admin create context',
      component: ContextAdd
    },
    {
      path: '/admin/context/workflow/:id',
      name: 'worflow editor',
      component: ContextWorkflow
    },
    {
      path: '/admin/nlu',
      name: 'tock interface',
      component: TockView
    }
  ]
})

/* The following function parse the route.meta attribtue to set page "title" and "meta" before entering a route" */
router.beforeEach((to, from, next) => {
  if (to.meta.length > 0) {
    to.meta.map(m => {
      if (m.name === 'title') {
        document.title = m.content
      } else {
        let meta = document.createElement('meta')
        meta.setAttribute('name', m.name)
        meta.setAttribute('content', m.content)
        document.getElementsByTagName('head')[0].appendChild(meta)
      }
    })
  }
  next()
  /* EXAMPLE
  meta: [
    {
      name: 'title',
      content: 'Linto Admin - Tock interface'
    },
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
*/
})

export default router
