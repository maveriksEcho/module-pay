import Vue from 'vue'
import App from './App.vue'

import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios);

import toaster from 'v-toaster'
Vue.use(toaster, {timeout: 3000});

Vue.component('app', App);

new Vue({
    el: '#btcu',
})
