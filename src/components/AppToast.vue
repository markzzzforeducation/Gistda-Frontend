<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const toasts = ref<(ToastOptions & { id: number })[]>([]);
let counter = 0;

function showToast(options: ToastOptions) {
  const id = ++counter;
  const toast = { ...options, id, type: options.type || 'info' };
  toasts.value.push(toast);

  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, options.duration || 3000);
}

// Expose globally via event bus
function handleToast(e: Event) {
  const detail = (e as CustomEvent).detail as ToastOptions;
  showToast(detail);
}

onMounted(() => {
  window.addEventListener('app-toast', handleToast);
});

onBeforeUnmount(() => {
  window.removeEventListener('app-toast', handleToast);
});

// Export helper for other components
defineExpose({ showToast });
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" :class="['toast-item', `toast-${toast.type}`]">
          <span class="toast-icon">
            <span v-if="toast.type === 'success'">✅</span>
            <span v-else-if="toast.type === 'error'">❌</span>
            <span v-else-if="toast.type === 'warning'">⚠️</span>
            <span v-else>ℹ️</span>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  animation: slideIn 0.3s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.toast-icon { font-size: 18px; flex-shrink: 0; }

.toast-success {
  background: rgba(255, 255, 255, 0.95);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.toast-error {
  background: rgba(255, 255, 255, 0.95);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.toast-warning {
  background: rgba(255, 255, 255, 0.95);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.toast-info {
  background: rgba(255, 255, 255, 0.95);
  color: #003d82;
  border: 1px solid rgba(0, 61, 130, 0.3);
}

/* Transition */
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to { opacity: 0; transform: translateX(40px); }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (max-width: 640px) {
  .toast-container {
    right: 12px;
    left: 12px;
    max-width: none;
  }
}
</style>
