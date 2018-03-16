<template lang="html">
  <div>
    <div v-if="email">
      <span>{{email}}</span>
      <button class="button is-primary is-pulled-right" @click="logoutUser">Log Out</button> 
    </div>
    <div v-else>
      <span>Welcome</span>
      <button class="button is-primary is-pulled-right" v-on:click="loginUser">Login with Google</button>
    </div>
  </div>
</template>

<script>
// import axios from "axios";
export default {
  data() {
    return {
      name: "",
      email: ""
    }
  },
  mounted() {
    chrome.storage.local.get({ profile: '' }, function(result) {
      if (!(result && result.profile)) return;
      const profile = result.profile;
      this.name = profile.name;
      this.email = profile.email;
      chrome.runtime.sendMessage({ login: true, profile: {
        name: profile.name,
        email: profile.email
      } });
      console.log('email:' + this.email);
    }.bind(this));
  },
  methods: {
    loginUser: function() {
      this.authenticatedXhr('GET', 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', function(err, httpStatus, response) {
        if (err || httpStatus !== 200) {
          console.log("err: " + err + "; httpStatus:" + httpStatus);
          return;
        }
        const people = JSON.parse(response);
        const profile = {
          name: people.names[0].displayName,
          email: people.emailAddresses[0].value
        };
        this.name = profile.name;
        this.email = profile.email;
        chrome.storage.local.set({ profile: profile });
        console.log('Sent profile: ' + JSON.stringify(profile));
        chrome.runtime.sendMessage({ login: true, profile: profile });
      }.bind(this));
    },
    logoutUser: function() {
      this.revokeToken();
      chrome.storage.local.remove(['profile']);
      this.name = '';
      this.email = '';
    },
    authenticatedXhr: function(method, url, callback) {
      let retry = true;
      function getTokenAndXhr() {
        chrome.identity.getAuthToken({ 'interactive': true }, function (access_token) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
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
    },
    revokeToken: function() {
      chrome.identity.getAuthToken({ 'interactive': false }, function(current_token) {
        if (!chrome.runtime.lastError) {
          // @corecode_begin removeAndRevokeAuthToken
          // @corecode_begin removeCachedAuthToken
          // Remove the local cached token
          chrome.identity.removeCachedAuthToken({ token: current_token },
            function() {});
          // @corecode_end removeCachedAuthToken

          // Make a request to revoke token in the server
          var xhr = new XMLHttpRequest();
          xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' +
                  current_token);
          xhr.send();
          // @corecode_end removeAndRevokeAuthToken

          // Update the user interface accordingly
          // $('#revoke').get(0).disabled = true; 
          console.log('Token revoked and removed from cache. ' +
            'Check chrome://identity-internals to confirm.');
        }
      });
    }
  }
}
</script>

<style lang="css">
</style>