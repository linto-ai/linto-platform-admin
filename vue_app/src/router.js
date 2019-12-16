import Vue from 'vue'
import Router from 'vue-router'

// Views
import Login from './views/Login.vue'
import AdminDemo from './views/AdminDemo.vue'
import AdminNodeRed from './views/AdminNodeRed.vue'
import ContextAdd from './views/ContextAdd.vue'
import WorkflowEditor from './views/WorkflowEditor.vue'
import FleetManagement from './views/FleetManagement.vue'
import FleetMonitoring from './views/FleetMonitoring.vue'
Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: [
        {
          name: 'title',
          content: 'Linto Admin - Login'
        }
      ]
    },
    {
      path: '/admin/demo',
      name: 'admin demo',
      component: AdminDemo,
      meta: [
        {
          name: 'title',
          content: 'Linto Admin - Demo'
        },
        {
          name: 'robots',
          content: 'noindex, nofollow'
        }
      ]
    },
    {
      path: '/admin/nodered',
      name: 'admin nodered example',
      component: AdminNodeRed,
      meta: [
        {
          name: 'title',
          content: 'Linto Admin - NodeRed demo'
        },
        {
          name: 'robots',
          content: 'noindex, nofollow'
        }
      ]
    },
    {
      path: '/admin/fleet',
      name: 'Fleet overview',
      component: FleetManagement,
      meta: [
        {
          name: 'title',
          content: 'Linto Admin - Fleet management'
        },
        {
          name: 'robots',
          content: 'noindex, nofollow'
        }
      ]
    },
    {
      path: '/admin/fleet/monitoring/:sn',
      name: 'Fleet monitoring',
      component: FleetMonitoring,
      meta: [
        {
          name: 'title',
          content: 'Linto Admin - Fleet monitoring'
        },
        {
          name: 'robots',
          content: 'noindex, nofollow'
        }
      ]
    },
    {
      path: '/admin/workflows',
      name: 'worflow editor',
      component: WorkflowEditor,
      meta: [
        {
          name: 'title',
          content: 'Linto Admin - Flow patterns'
        },
        {
          name: 'robots',
          content: 'noindex, nofollow'
        }
      ]
    },
    {
      path: '/admin/context/create',
      name: 'Admin create context',
      component: ContextAdd,
      meta: [
        {
          name: 'title',
          content: 'Linto Admin - Create context'
        },
        {
          name: 'robots',
          content: 'noindex, nofollow'
        }
      ]
    }
  ]
})

/* The following function parse the route.meta attribtue to set page "title" and "meta" before entering a route" */
router.beforeEach((to, from, next) => {
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
  next()
})

export default router
