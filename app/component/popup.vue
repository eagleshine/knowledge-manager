<template lang="html">
  <div class="container">
    <div class="columns">
      <div class="column">
        <div class="notification">
            <div>
              <p v-if="email">
                {{ email }}
                <button class="button is-primary" @click="logoutUser">Log Out</button> 
              </p>
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
import axios from "axios";
export default {
  data() {
    return {
      name: "",
      email: ""
    }
  },
  mounted() {
    chrome.storage.local.get({profile: {}}, function(result) {
      if (!(result && result.profile)) return;
      const profile = result.profile;
      this.name = profile.name;
      this.email = profile.email;
      console.log('info:' + this.email);
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
          const people = result.data;
          console.log(people);
          const profile = {
            name: people.names[0].displayName,
            email: people.emailAddresses[0].value
          }
          this.name = profile.name;
          this.email = profile.email;
          chrome.storage.local.set({ profile: profile });
          console.log('info-1:' + this.email);
        }, error => {
            console.log(error);
        });
      }.bind(this));
    },
    logoutUser: function() {
      chrome.storage.local.remove(["profile"]);
      this.name = "";
      this.email = "";
    }
  }
}
</script>

<style lang="css">
</style>
