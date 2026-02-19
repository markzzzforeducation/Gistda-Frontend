import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import vue3GoogleLogin from 'vue3-google-login';
import th from './locales/th';
import en from './locales/en';

const savedLocale = (localStorage.getItem('gistda-locale') as 'th' | 'en') || 'th';

export const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'th',
    messages: { th, en },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(vue3GoogleLogin, {
    clientId: '955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com'
});

app.mount('#app');
