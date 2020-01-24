<template>
  <div class="flex col">
    <span class="form__label">{{ label }} :</span>
    <select
      class="form__select"
      v-model="obj.value"
      :class="[obj.error !== null ? 'form__select--error' : '', obj.valid ? 'form__select--valid' : '']"
      @change="testSelectField(obj)"
      :disabled="disabled ? 'disabled' : false"
    >
      <option
        v-for="l in list"
        :key="l[params.key]"
        :value="l[params.value]"
      >{{ l[params.optLabel] }}</option>
      <option v-if="!!options" :value="options.value">{{ options.label }}</option>
    </select>
    <span class="form__error-field" v-if="disabled">{{ disabledTxt }}</span>
    <span class="form__error-field">{{ obj.error }}</span>
  </div>
</template>
<script>
export default {
  props: ['label','obj','list','params','options', 'disabled', 'disabledTxt'],
  data () {
    return {}
  },
  methods: {
    testSelectField (obj) {
      this.$options.filters.testSelectField(obj)
    }
  }
}
</script>
