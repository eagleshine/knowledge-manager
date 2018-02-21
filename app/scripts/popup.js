import Vue from 'vue';
import Popup from '../component/popup.vue';

var app=new Vue({
  el:'#app',
  data: {
    name: 'Knowledge Manager'
  },
  render: h =>h(Popup)
})
