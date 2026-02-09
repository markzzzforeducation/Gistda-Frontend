<template>
  <div class="blocked-container">
    <div class="blocked-card">
      <div class="icon-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="lock-icon">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4" stroke-width="2"/>
        </svg>
      </div>
      <h1>การเข้าถึงถูกจำกัด</h1>
      <p class="message">
        บัญชีของคุณยังไม่ได้เปิดใช้งาน<br>
        กรุณาติดต่อผู้ดูแลระบบเพื่อเปิดใช้งานก่อนเข้าถึง E-Learning
      </p>
      <div class="actions">
        <button @click="goBack" class="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goBack() {
  router.push('/intern');
}
</script>

<style scoped>
.blocked-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f4a 50%, #0a0e27 100%);
  padding: 20px;
}

.blocked-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.lock-icon {
  width: 40px;
  height: 40px;
  color: #dc2626;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px;
}

.message {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 32px;
}

.actions {
  display: flex;
  justify-content: center;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}
</style>
