<template>
  <div class="flex col">
    <span class="form__label">{{ label }} <strong v-if="required">*</strong> :</span>
    
    <input
      :type="type || 'text'"
      class="form__input"
      v-model="obj.value"
      :class="[obj.error !== null ? 'form__input--error' : '', obj.valid ? 'form__input--valid' : '', !!extraClass ? extraClass : '']"
      @blur="exec(test)"
      :min="type == 'number' ? 0 : ''"
    />
    <span class="form__error-field">{{ obj.error }}</span>
  </div>
</template>
<script>
export default {
  props: ['label', 'obj', 'test', 'type', 'compare', 'required', 'extraClass'],
  data () {
    return {}
  },
  computed: {
    staticWorkflow () {
      return this.$store.state.deviceApplications
    }
  },
  methods: {
    testDeviceWorkflowName (obj) {
      // Test if workflow name is not used
      this.$options.filters.testDeviceWorkflowName(obj)
      if (obj.error === null) {
        // Test if workflow name format is valid
        this.$options.filters.testName(obj)
      }
    },
    testMultiUserWorkflowName (obj) {
      // Test if workflow name is not used
      this.$options.filters.testMultiUserWorkflowName(obj)
      if (obj.error === null) {
        // Test if workflow name format is valid
        this.$options.filters.testName(obj)
      }
    },
    testName (obj) {
      // Test if name is valid
      this.$options.filters.testName(obj)
    },
    testWorkflowTemplateName (obj) {
      // Test if workflow name is not used
      this.$options.filters.testWorkflowTemplateName(obj)
      if (obj.error === null) {
        // Test if workflow name format is valid
        this.$options.filters.testName(obj)
      }
    },
    testStaticClientsSN (obj) {
      // Test if serial number is not used
      this.$options.filters.testStaticClientsSN(obj)
      if (obj.error === null) {
        // Test if serial number format is valid
        this.$options.filters.testName(obj)
      }
    },
    testEmail (obj) {
      // Test if email format is valid
      this.$options.filters.testEmail(obj)
    },
    testAndroidUserEmail (obj) {
      // Test if andoid use email format is valid
      this.$options.filters.testAndroidUserEmail(obj)
    },
    testPassword (obj) {
      // Test if password format is valid
      this.$options.filters.testPassword(obj)
    },
    testPasswordConfirm (obj) {
      if (!!this.compare) {
        // Test if confirmation password format is valid
        this.$options.filters.testPasswordConfirm(obj, this.compare)
      }
    },
    testUrl (obj) {
      // Test if url format is valid
      this.$options.filters.testUrl(obj)
    },
    testContentSay(obj) {
      // Test if content format is valid
       this.$options.filters.testContentSay(obj)
    },
    testInteger (obj) {
      // Test if integer format is valid
      this.$options.filters.testInteger(obj)
    },
    exec (functionName) {
      switch(functionName) {
        case 'testName':
          this.testName(this.obj)
          break
        case 'testDeviceWorkflowName':
          this.testDeviceWorkflowName(this.obj)
          break
        case 'testMultiUserWorkflowName':
          this.testMultiUserWorkflowName(this.obj)
          break
        case 'testWorkflowTemplateName':
          this.testWorkflowTemplateName(this.obj)
          break
        case 'testStaticClientsSN': 
          this.testStaticClientsSN(this.obj)
          break
        case 'testEmail':
          this.testEmail(this.obj)
          break
        case 'testAndroidUserEmail':
          this.testAndroidUserEmail(this.obj)
          break
        case 'testPassword': 
          this.testPassword(this.obj)
          break
        case 'testPasswordConfirm':
          this.testPasswordConfirm(this.obj)
          break
        case 'testUrl':
          this.testUrl(this.obj)
          break
        case 'testContentSay':
          this.testContentSay(this.obj)
          break
        case 'testInteger':
          this.testInteger(this.obj)
        default:
          return
      }
    }
  }
}
</script>
