<template>
  <div>
    <h1>Lorem ipsum</h1>

    <button @click="testSocket()">TEST SOCKET</button>
    <div class="block block--transparent flex1">
      <h2>Table</h2>
      <table class="table table--shadow">
        <thead>
          <tr>
            <th>Label</th>
            <th>Label</th>
            <th>Label</th>
            <th>Label</th>
            <th>Label</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Value</td>
            <td>Value</td>
            <td>Value</td>
            <td>Value</td>
            <td>Value</td>
          </tr>
          <tr>
            <td>Value</td>
            <td>Value</td>
            <td>Value</td>
            <td>Value</td>
            <td>Value</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="block flex col btn-container">
      <h2>Buttons</h2>
      <button class="button">.button (default)</button>
      <button class="button button--with-desc" data-desc="Button with description">.button--with-desc</button>
      <button class="button button--valid"><span class="label">.button--valid</span></button>
      <button class="button button--cancel"><span class="label">.button--cancel</span></button>
      <button class="button button--important"><span class="label">.button--important</span></button>
      <button class="button button--important">
        <span class="label">.button--important</span>
      </button>
      <button class="button button--full"><span class="label">.button--full</span></button>
      <button class="button button--valid">
        <span class="button__icon button__icon--save"></span>
        <span class="label">button w/ icon</span>
      </button>

    </div>
    <div class="block flex col">
      <h2>Inputs</h2>
      <input type="text" class="form__input" placeholder=".form__input (default)"/>
      <input type="text" class="form__input form__input--error" placeholder=".form__input--error"/>
      <input type="text" class="form__input form__input--valid" placeholder=".form__input--valid"/>
    </div>
  </div>
</template>
<script>
import io from 'socket.io-client'
export default {
  data () {
    return {
      socket: null
    }
  },
  created () {
    this.socket = new io('http://127.0.0.1:8081')
    this.socket.on('stt', (data) => {
      console.log('Resp form STT: ', data)
    })
  },
  methods: {
    testSocket() {
      this.socket.emit('linto_admin', 'TEST FROM LINTO ADMIN')
    }
  }
}
</script>
<style scoped>
.btn-container{
  align-items: flex-start;
}
.button {
  margin: 5px 0;
}
</style>


