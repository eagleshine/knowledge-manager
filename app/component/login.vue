<template lang="html">
  <div>
    <p v-if="email">
      {{email}}
      <button class="button is-primary" @click="logoutUser">Log Out</button> 
    </p>
    <button v-else class="button is-primary" v-on:click="loginUser">Login with Google</button>
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
    chrome.storage.local.get({ profile: {} }, function(result) {
      if (!(result && result.profile)) return;
      const profile = result.profile;
      this.name = profile.name;
      this.email = profile.email;
      console.log('email:' + this.email);
    }.bind(this));
  },
  methods: {
    loginUser: function() {
      this.authenticatedXhr('GET', 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', function(err, httpStatus, response) {
        if (err || httpStatus !== 200) {
          return;
        }
        const people = JSON.parse(response);
        this.name = people.names[0].displayName;
        this.email = people.emailAddresses[0].value;
        const profile = {
          name: this.name,
          email: this.email
        };
        chrome.storage.local.set({ profile: profile });
      }.bind(this));
    },
    logoutUser: function() {
      chrome.storage.local.remove(['profile']);
      this.name = '';
      this.email = '';
    },
    authenticatedXhr: function(method, url, callback) {
      let retry = true;
      function getTokenAndXhr() {
        chrome.identity.getAuthToken({ 'interactive': true }, function (access_token) {
          console.log('access token:' + access_token);
          if (chrome.runtime.lastError) {
            callback(chrome.runtime.lastError);
            return;
          }

          var xhr = new XMLHttpRequest();
          xhr.open(method, url);
          xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);

          xhr.onload = function () {
            if (this.status === 401 && retry) {
              // This status may indicate that the cached
              // access token was invalid. Retry once with
              // a fresh token.
              retry = false;
              chrome.identity.removeCachedAuthToken(
                  { 'token': access_token },
                  getTokenAndXhr);
              return;
            }
            callback(null, this.status, this.responseText);
          }
          xhr.send();
        });
      }
      getTokenAndXhr();
    }
  }
}
</script>

<style lang="css">
</style>