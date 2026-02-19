import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Locale = 'th' | 'en';

const STORAGE_KEY = 'gistda-locale';

export const useLanguageStore = defineStore('language', () => {
    const locale = ref<Locale>(
        (localStorage.getItem(STORAGE_KEY) as Locale) || 'th'
    );

    function setLocale(lang: Locale) {
        locale.value = lang;
        localStorage.setItem(STORAGE_KEY, lang);
    }

    function toggleLocale() {
        setLocale(locale.value === 'th' ? 'en' : 'th');
    }

    return { locale, setLocale, toggleLocale };
});
