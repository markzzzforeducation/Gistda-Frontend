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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.gistda-logo {
  height: 50px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 32px;
  flex: 1;
  justify-content: center;
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
  color: #0a5f35;
}

.nav-link.router-link-active {
  color: #0a5f35;
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  height: 2px;
  background: #0a5f35;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.user-profile:hover {
  opacity: 0.8;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0a5f35, #064e2b);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
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
}

.logout-btn:hover {
  background: #dc2626;
}

.login-btn {
  padding: 8px 20px;
  background: #0a5f35;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.login-btn:hover {
  background: #064e2b;
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
