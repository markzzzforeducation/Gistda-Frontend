<script setup lang="ts">
import { onMounted } from 'vue';
import { useNotificationsStore } from './stores/notifications';
import AppToast from './components/AppToast.vue';

const noti = useNotificationsStore();

onMounted(() => {
  // Start auto-refresh for notifications (every 30s)
  noti.startAutoRefresh(30000);
});
</script>

<template>
  <div class="app-container">
    <router-view />
    <AppToast />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>