<template>
  <div class="flex col">
    <span class="form__label">{{ label }} :</span>
    <input
      type="text"
      class="form__input"
      v-model="obj.value"
      :class="[obj.error !== null ? 'form__input--error' : '', obj.valid ? 'form__input--valid' : '']"
      @blur="exec(test)"
    />
    <span class="form__error-field">{{ obj.error }}</span>
  </div>
</template>
<script>
export default {
  props: ['label', 'obj', 'test', 'lintos', 'patterns'],
  data () {
    return {}
  },
  computed: {
    contexts () {
      return this.$store.state.contextFleet
    },
  },
  methods: {
    testName (obj) {
      this.$options.filters.testName(obj)
    },
    testContextName (obj) {
      this.testName(obj)
      if (this.contexts.filter(l => l.name === obj.value).length > 0) {
        obj.error = 'This context name is already used'
        obj.valid = false
      }
    },
    testSerialNumber (obj) {
      if (!!this.lintos) {
        obj.error = null
        obj.valid = false
        let snExist = false
        if (obj.value.length === 0) {
          obj.error = 'This field is required'
          obj.valid = false
        } else {
          this.lintos.map(l => {
            if (l.sn === obj.value) {
              snExist = true
            }
          })
          if (snExist) {
            obj.error = 'This serial number is already used'
            obj.valid = false
          } else {
            obj.valid = true
          }
        }
      }
    },
    testPatternName (obj) {
      if (!!this.patterns) {
        obj.error = null
        obj.valid = false
        if (obj.value.length === 0) {
          obj.error = 'This field is required'
          obj.valid = false
        } else {
          let patternNameExist = false
          this.patterns.map(l => {
            if (l.name === obj.value) {
              patternNameExist = true
            }
          })
          if (patternNameExist) {
            obj.error = 'This workflow pattern name is already used'
            obj.valid = false
          } else {
            obj.valid = true
          }
        }
      }
    },
    exec (functionName) {
      switch(functionName) {
        case 'testName':
          this.testName(this.obj)
          break
        case 'testSn':
          this.testSerialNumber(this.obj)
          break
        case 'testPatternName':
          this.testPatternName(this.obj)
          break
        case 'testContextName':
          this.testContextName(this.obj)
          break
        default:
          return
      }
    }
  }
}
</script>
