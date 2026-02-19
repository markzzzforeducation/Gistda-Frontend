<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useNotificationsStore } from './stores/notifications';
import AppToast from './components/AppToast.vue';
import { useIdleTimeout } from './utils/useIdleTimeout';
import { useLanguageStore } from './stores/language';
import { useI18n } from 'vue-i18n';
import { i18n } from './main';

const noti = useNotificationsStore();
const { showWarning, remainingSeconds, stayLoggedIn, performLogout } = useIdleTimeout();
const langStore = useLanguageStore();
const { t } = useI18n();

// Sync i18n locale with language store
watch(() => langStore.locale, (newLocale) => {
  i18n.global.locale.value = newLocale;
}, { immediate: true });

onMounted(() => {
  // Start auto-refresh for notifications (every 30s)
  noti.startAutoRefresh(30000);
});
</script>

<template>
  <div class="app-container">
    <router-view />
    <AppToast />

    <!-- Idle Timeout Warning Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showWarning" class="idle-overlay">
          <div class="idle-modal">
            <div class="idle-icon">⏰</div>
            <h2 class="idle-title">{{ t('idle.title') }}</h2>
            <p class="idle-text">
              {{ langStore.locale === 'th' ? 'ระบบไม่พบการใช้งานมาสักพัก' : 'No activity detected for a while.' }}<br>
              {{ langStore.locale === 'th' ? 'จะออกจากระบบอัตโนมัติใน' : 'You will be logged out in' }}
            </p>
            <div class="idle-countdown">
              <span class="countdown-number">{{ remainingSeconds }}</span>
              <span class="countdown-label">{{ t('idle.seconds') }}</span>
            </div>
            <div class="idle-actions">
              <button class="idle-btn stay" @click="stayLoggedIn">
                {{ t('idle.stayLoggedIn') }}
              </button>
              <button class="idle-btn logout" @click="performLogout">
                {{ t('idle.logout') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

/* ===== Idle Timeout Modal ===== */
.idle-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.idle-modal {
  background: white;
  border-radius: 24px;
  padding: 40px 48px;
  text-align: center;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalPop 0.3s ease;
}

.idle-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.idle-title {
  font-size: 22px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 8px;
}

.idle-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 16px;
}

.idle-countdown {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 28px;
}

.countdown-number {
  font-size: 48px;
  font-weight: 900;
  color: #ef4444;
  line-height: 1;
}

.countdown-label {
  font-size: 16px;
  font-weight: 600;
  color: #9ca3af;
}

.idle-actions {
  display: flex;
  gap: 12px;
}

.idle-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.idle-btn.stay {
  background: linear-gradient(135deg, #003d82, #0066cc);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 61, 130, 0.3);
}
.idle-btn.stay:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 61, 130, 0.4);
}

.idle-btn.logout {
  background: #f3f4f6;
  color: #6b7280;
}
.idle-btn.logout:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>