<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const props = defineProps<{
  variant?: 'light' | 'dark';
}>();

function logout() {
  auth.logout();
  router.push('/auth');
}
</script>

<template>
  <div class="gistda-header" :class="{ dark: variant === 'dark' }">
    <div class="header-content">
      <div class="logo" @click="router.push('/')">
        <img src="/gistda-logo.png" alt="GISTDA" class="gistda-logo" />
      </div>
      <nav class="nav-links">
        <router-link to="/" class="nav-link">หน้าหลัก</router-link>
        <router-link to="/courses" class="nav-link">E-Learning</router-link>
        <router-link to="/gallery" class="nav-link">Gallery</router-link>
        <router-link v-if="['admin', 'mentor'].includes(auth.currentUser?.role || '')" to="/evaluations" class="nav-link">Evaluation</router-link>
        <router-link v-if="auth.currentUser?.role === 'admin'" to="/admin" class="nav-link">Admin</router-link>
      </nav>
      <div v-if="auth.currentUser" class="user-section">
        <div class="user-profile" @click="router.push('/profile')">
          <div class="avatar">{{ auth.currentUser.name.slice(0, 1).toUpperCase() }}</div>
          <span class="user-name">{{ auth.currentUser.name }}</span>
        </div>
        <button @click="logout" class="logout-btn">ออกจากระบบ</button>
      </div>
      <router-link v-else to="/auth" class="login-btn">เข้าสู่ระบบ</router-link>
    </div>
  </div>
</template>

<style scoped>
.gistda-header {
  background: white;
  border-bottom: 2px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.gistda-header.dark {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 40px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-self: start;
}

.gistda-logo {
  height: 50px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 32px;
  justify-content: center;
  justify-self: center;
}

.nav-link {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  transition: color 0.2s;
  position: relative;
}

.nav-link:hover {
  color: #003d82;
}

.nav-link.router-link-active {
  color: #003d82;
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  height: 2px;
  background: #003d82;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0; /* Prevent shrinking */
  justify-self: end; /* Align to the right side */
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  max-width: 250px; /* Limit maximum width */
}

.user-profile:hover {
  opacity: 0.8;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #003d82, #002855);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0; /* Avatar never shrinks */
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap; /* Keep text in one line */
  overflow: hidden; /* Hide overflow */
  text-overflow: ellipsis; /* Show ... for long text */
  max-width: 200px; /* Limit username width */
}

.logout-btn {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0; /* Prevent button from shrinking */
  white-space: nowrap; /* Keep button text in one line */
}

.logout-btn:hover {
  background: #dc2626;
}

.login-btn {
  padding: 8px 20px;
  background: #003d82;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.login-btn:hover {
  background: #002855;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    padding: 12px 20px;
    gap: 16px;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    gap: 16px;
  }

  .user-name {
    display: none;
  }
}
</style>
