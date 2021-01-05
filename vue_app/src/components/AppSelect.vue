<template>
  <div class="flex col">
    <span class="form__label" v-if="!noLabel">{{ label }} <strong v-if="required">*</strong> :</span>
    <select
      v-if="!type"
      class="form__select"
      v-model="obj.value"
      :class="[
        obj.error !== null ? 'form__select--error' : '', 
        obj.valid ? 'form__select--valid' : ''
      ]"
      @change="testSelectField(obj)"
      :disabled="disabled || disabled2 ? 'disabled' : false"
    >
      <option v-if="!!resetValue && resetValue === true" value="">None</option>
      <option 
        v-for="l in list"
        :key="l[params.key]"
        :value="l[params.value]"
      >{{ l[params.optLabel] }} </option>
        <option 
        v-for="l2 in list2"
        :key="l2[params.key]"
        :value="l2[params.value]"
        :disabled="'disabled'"
      >{{ l2[params.optLabel] }} (Generating...)</option>

      <option v-if="!!options" :value="options.value">{{ options.label }}</option>
    </select>

    <span class="form__error-field" v-if="disabled">{{ disabledTxt }}</span>
    <span class="form__error-field" v-if="!disabled && disabled2">{{ disabled2Txt }}</span>
    <span class="form__error-field" v-if="extraClass !== 'form__select--inarray'">{{ obj.error }}</span>
  </div>
</template>
<script>
export default {
  props: ['label','obj','list', 'list2','options','params', 'disabled', 'disabledTxt', 'disabled2', 'disabled2Txt', 'type', 'extraClass', 'noLabel', 'required', 'resetValue'],
  data () {
    return {}
  },
  methods: {
    testSelectField (obj) {
      if(!this.resetValue) {
        this.$options.filters.testSelectField(obj)
      }
    },
    testInteger (obj) {
      this.$options.filters.testInteger(obj)
    }
  }
}
</script>
