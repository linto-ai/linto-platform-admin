import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'

// Views
/*import ContextAdd from './views/ContextAdd.vue'
import ContextOverview from './views/ContextOverview.vue'
import ContextWorkflow from './views/ContextWorkflow.vue'

import FleetManagement from './views/FleetManagement.vue'
import FleetMonitoring from './views/FleetMonitoring.vue'
import SttManagement from './views/SttManagement.vue'
import page404 from './views/404.vue'*/

import ClientStaticOverview from './views/ClientStaticOverview.vue'
import ClientStaticDeploy from './views/ClientStaticDeploy.vue'
import WorkflowEditor from './views/WorkflowEditor.vue'
import TockView from './views/TockView.vue'
import ClientStaticWorkflowEditor from './views/ClientStaticWorkflowEditor.vue'

Vue.use(Router)
const router = new Router({
    mode: 'history',
    routes: [{
            path: '/admin/clients/static',
            name: 'Static devices overview',
            component: ClientStaticOverview,
            // META DATA
            meta: [{
                    name: 'title',
                    content: 'Linto Admin - Static clients'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/clients/static/workflow/:workflowId',
            name: 'Static device Workflow editor',
            component: ClientStaticWorkflowEditor,
            // META DATA
            meta: [{
                    name: 'title',
                    content: 'Linto Admin - Static clients workflow editor'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/clients/static/:sn/deploy',
            name: 'Static devices - deployment',
            component: ClientStaticDeploy,
            // META DATA
            meta: [{
                    name: 'title',
                    content: 'Linto Admin - Static clients deployment'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
            beforeEnter: async(to, from, next) => {
                // Verify that the target device is not associated
                const sn = to.params.sn
                const getStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/${sn}`)
                if (getStaticDevice.data.associated_workflow !== null) {
                    next('/admin/clients/static')
                } else {
                    next()
                }
            }
        },
        {
            path: '/admin/workflows',
            name: 'Worflow editor',
            component: WorkflowEditor,
        }, {
            path: '/admin/nlu',
            name: 'tock interface',
            component: TockView
        }
        /*,
                {
                    path: '/admin/fleet/monitoring/:sn',
                    name: 'Fleet monitoring',
                    component: FleetMonitoring
                },
                {
                    path: '/admin/workflows',
                    name: 'Worflow editor',
                    component: WorkflowEditor,
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
                    name: 'Context worflow editor',
                    component: ContextWorkflow
                },
                {
                    path: '/admin/nlu',
                    name: 'tock interface',
                    component: TockView
                },
                {
                    path: '/admin/stt/overview',
                    name: 'STT management',
                    component: SttManagement
                },
                // Other routes > 404
                {
                    path: '/admin/*',
                    name: '404',
                    component: page404,
                },*/
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
})

export default router