<template lang="html">
  <div class="container">
    <div class="columns">
      <div class="column">
        <div class="notification">
          <login></login>
        </div>
      </div>
      <div class="column">
        <p class="notification">Third column</p>
      </div>
    </div>
  </div>
</template>

<script>
import Login from './login.vue';
export default {
  data() {
    return {
    }
  },
  components: {
    login: Login
  }
}
</script>

<style lang="css">
</style>
