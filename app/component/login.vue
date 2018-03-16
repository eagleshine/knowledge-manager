<template lang="html">
  <div>
    <div>{{ message | capitalize }}</div>
    <div v-if="login">
      <span>{{ input.username }}</span>
      <button class="button is-primary is-outlined is-pulled-right" @click="logoutUser()">Log Out</button>
    </div>
    <div v-else>
      <div>
        <input class="input" type="email" v-model="input.username" placeholder="email" />
        <input class="input" type="password" v-model="input.password" placeholder="password" />
      </div>
      <button class="button is-primary is-outlined" v-on:click="loginUser()">Sign In</button>
      <button class="button is-danger is-outlined is-pulled-right" v-on:click="registerUser()">Register</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const REST_API_BASE = 'http://resorttransport.corp.ne1.yahoo.com:3001/knoman/api/v1/users';
axios.defaults.baseURL = REST_API_BASE;
export default {
  data() {
    return {
      login: false,
      message: "Welcome",
      input: {
        username: "",
        password:""
      }
    }
  },
  mounted() {
    chrome.runtime.sendMessage({ mounted: true }, function(response) {
      this.message = 'Please sign in:';
      if (response.token) {
        const token = response.token;
        this.login = true;
        // check the expiration of the token
        axios.get('/me', {
          headers: {
            'content-type': 'application/json',
            'authorization': 'JWT ' + token
          }
        }).then(result => {
          this.input.username = result.data.username;
          this.input.password = '';
          this.message = 'Welcome back';
          console.log('username:' + result.data.username);
        }, err => {
          //token expired
          this.login = false;
        })
      }
    }.bind(this));
  },
  filters: {
    capitalize(v) {
      return v.charAt(0).toUpperCase() + v.slice(1);
    }
  },
  methods: {
    loginUser() {
      axios.post('/login', this.input, {
        headers: {
          'content-type': 'application/json'
        }
      }).then(result => {
        chrome.runtime.sendMessage({ login: true, user: this.input, token: result.data.token });
        this.login = true;
        this.message = 'Welcome back!';
      }, err => {
        this.login = false;
        console.log(err.response);
        console.log(err.config);
        if (err.response && err.response.data && err.response.data.message) {
          this.message = err.response.data.message;
        } else if (err.request) {
          this.message = 'No response from server. Try it later';
        } else {
          this.message = 'Login failed. Try it later.';
        }
      });
    },
    registerUser() {
      if (this.input.username === '') {
        this.message = 'Please specify a valid email address';
        return;
      }
      axios.post('/register', this.input, {
        headers: {
          'content-type': 'application/json'
        }
      }).then(result => {
        this.loginUser();
      }, err => {
        this.message = err.username;
        console.log(err);
      });
    },
    logoutUser() {
      this.message = 'Please sign in:';
      this.login = false;
      this.input.username = '';
      this.input.password = '';
      chrome.runtime.sendMessage({ logout: true, user: this.input, token:'' });
    }
  }
}
</script>

<style lang="css">
</style>