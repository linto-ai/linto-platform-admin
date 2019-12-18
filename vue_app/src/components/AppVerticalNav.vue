<template>
  <div id="vertical-nav" class="flex col" :class="extraClass">
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(fleetManagementUrl) >= 0 ? 'active' : ''">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        :href="fleetManagementUrl"
      >Fleet management</a>
    </div>
    <div class="vertical-nav-item flex col">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        href="#"
      >Application management</a>
    </div>
    <div class="vertical-nav-item flex col">
      <a
        class="vertical-nav-item__link vertical-nav-item__link--parent flex1 closed"
        href="#"
        @click="toggleChildren($event, 'context-links')"
      >Context</a>
      <div
        class="vertical-nav-item--children flex col hidden"
        id="context-links"
      >
        <a class="vertical-nav-item__link vertical-nav-item__link--children flex1" href="/admin/context">Overview</a>
        <a class="vertical-nav-item__link vertical-nav-item__link--children flex1
        " href="/admin/context/create">Create context</a>
      </div>
    </div>
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(workflowEditorUrl) >= 0 ? 'active' : ''">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        :href="workflowEditorUrl"
      >Workflow editor</a>
    </div>
    <div class="vertical-nav-item flex col">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        href="/admin/workflows"
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
      routePath: ''
    }
  },
  created () {
    this.routePath = this.$route.fullPath
  },
  methods: {
    toggleChildren (e, id) {
      e.preventDefault()
      const parent = e.srcElement
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
