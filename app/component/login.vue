<template lang="html">
  <div>
    <input type="text" v-model="info" placeholder="Info" />
    <p v-if="info">{{info}}</p>
    <button v-else class="button is-primary" v-on:click="loginUser">Login with Google</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      info: ""
    }
  },
  beforeCreated() {
    chrome.storage.local.get({profile: {}}, function(result) {
      if (!result) return;
      const profile = result.profile;
      this.info = profile.name + "(" + profile.email + ")";
      console.log('info:' + this.info);
    });
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
      return;
      this.authenticatedXhr('GET', 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', function(err, httpStatus, response) {
        const people = JSON.parse(response);
        chrome.storage.local.set({people: people});
        this.name = people.names[0].displayName;
        this.email = people.emailAddresses[0].value;
        const profile = {
          name: this.name,
          email: this.email
        };
        chrome.storage.local.set({profile: profile});
      });
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