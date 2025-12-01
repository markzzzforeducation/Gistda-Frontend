import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import vue3GoogleLogin from 'vue3-google-login';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vue3GoogleLogin, {
    clientId: '955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com' // Replace with your actual Google Client ID
});

app.mount('#app');
