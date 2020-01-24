<template>
  <div id="vertical-nav" class="flex col" :class="extraClass">
    <!-- LinTO fleet -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(fleetManagementUrl) >= 0 ? 'active' : ''">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        :href="fleetManagementUrl"
      >Fleet management</a>
    </div>
    <!-- Context -->
    <div class="vertical-nav-item flex col">
      <a
        class="vertical-nav-item__link vertical-nav-item__link--parent flex1 closed"
        href="#"
        :class="routePath.indexOf(contextUrl) >= 0 ? 'opened' : 'closed'"
        @click="toggleChildren($event, 'context-links')"

      >Context</a>
      <div
        class="vertical-nav-item--children flex col"
        :class="routePath.indexOf(contextUrl) >= 0 ? 'visible' : 'hidden'"
        id="context-links"
      >
        <a
          class="vertical-nav-item__link vertical-nav-item__link--children flex1"
          href="/admin/context/overview"
          :class="routePath.indexOf('/admin/context/overview') >= 0 ? 'active' : ''"
        >
          Overview
        </a>
        <a
          class="vertical-nav-item__link vertical-nav-item__link--children flex1"
          href="/admin/context/create"
          :class="routePath.indexOf('/admin/context/create') >= 0 ? 'active' : ''">
            Create context
        </a>
      </div>
    </div>
    <!-- Workflow editor -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(workflowEditorUrl) >= 0 ? 'active' : ''">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        :href="workflowEditorUrl"
      >Workflow editor</a>
    </div>
    <!-- STT interface -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(sttUrl) >= 0 ? 'active' : ''">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        :href="sttUrl"
      >STT</a>
    </div>
    <!-- NLU interface -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(nluUrl) >= 0 ? 'active' : ''">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        :href="nluUrl"
      >NLU</a>
    </div>
  </div>
</template>
<script>
export default {
  props: ['extraClass'],
  data () {
    return {
      fleetManagementUrl: '/admin/fleet',
      workflowEditorUrl: '/admin/workflows',
      contextUrl: '/admin/context',
      sttUrl: '/admin/stt/overview',
      nluUrl: '/admin/nlu',
      routePath: ''
    }
  },
  created () {
    this.routePath = this.$route.fullPath
  },
  methods: {
    toggleChildren (e, id) {
      e.preventDefault()
      const parent = e.target
      const childContainer = document.getElementById(id)
      const childs = childContainer.childNodes
      const nbItems = childs.length
      let childContainerHeight = 0
      for (let i = 0; i < nbItems; i++) {
        childContainerHeight += childs[i].offsetHeight
      }
      if (childContainer.classList.contains('hidden')) {
        // show children
        parent.classList.remove('closed')
        parent.classList.add('opened')
        childContainer.classList.remove('hidden')
        childContainer.classList.add('visible')
        childContainer.setAttribute('style', 'height: ' + childContainerHeight + 'px;')
      } else if (childContainer.classList.contains('visible')) {
        // hide children
        parent.classList.remove('opened')
        parent.classList.add('closed')
        childContainer.classList.remove('visible')
        childContainer.classList.add('hidden')
        childContainer.setAttribute('style','height: 0px;')
      }
    }
  }
}
</script>
