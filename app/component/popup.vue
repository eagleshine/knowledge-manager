<template lang="html">
  <div class="container">
    <div class="columns">
      <div class="column">
        <div class="notification">
            <div>
              <!-- input type="text" v-model="info" placeholder="Info" /-->
              <p v-if="info">{{info}}</p>
              <button v-else class="button is-primary" v-on:click="loginUser">Login with Google</button>
            </div>
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
      info: ""
    }
  },
  mounted() {
    chrome.storage.local.get({profile: {}}, function(result) {
      if (!result) return;
      const profile = result.profile;
      this.info = profile.name + "(" + profile.email + ")";
      console.log('info:' + this.info);
    }.bind(this));
  },
  methods: {
    loginUser: function() {
      chrome.identity.getAuthToken({ 'interactive': true }, function(access_token) {
        var url = 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses';
        axios({
          method: "GET",
          url: url,
          headers: {"Authorization": "Bearer " + access_token}
        }).then(result => {
          const people = JSON.parse(result);
          const profile = {
            name: people.names[0].displayName,
            email: people.emailAddresses[0].value
          }
          this.info = profile.name + "(" + profile.email + ")";
          chrome.storage.local.set({profile: profile});
          console.log('info-1:' + this.info);
        }, error => {
            console.log(error);
        });
      });
    }.bind(this)
  }
}
</script>

<style lang="css">
</style>
