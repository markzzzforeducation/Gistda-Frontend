<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const isMobileMenuOpen = ref(false);

const props = defineProps<{
  variant?: 'light' | 'dark';
}>();

function logout() {
  auth.logout();
  router.push('/auth');
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}
</script>

<template>
  <div class="gistda-header" :class="{ dark: variant === 'dark' }">
    <div class="header-content">
      <div class="logo" @click="router.push('/')">
        <img src="/gistda-logo.png" alt="GISTDA" class="gistda-logo" />
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="nav-links">
        <router-link to="/" class="nav-link" @click="closeMobileMenu">หน้าหลัก</router-link>
        <router-link v-if="['admin', 'mentor', 'intern'].includes(auth.currentUser?.role || '')" to="/dashboard" class="nav-link" @click="closeMobileMenu">Dashboard</router-link>
        <router-link v-if="['admin', 'mentor', 'intern'].includes(auth.currentUser?.role || '')" to="/courses" class="nav-link" @click="closeMobileMenu">E-Learning</router-link>
        <router-link v-if="['admin', 'mentor'].includes(auth.currentUser?.role || '')" to="/evaluations" class="nav-link" @click="closeMobileMenu">Evaluation</router-link>
        <router-link v-if="auth.currentUser?.role === 'admin'" to="/admin" class="nav-link" @click="closeMobileMenu">Admin</router-link>
      </nav>
      
      <!-- Mobile Menu Button -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <svg v-if="!isMobileMenuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      
      <!-- User Section -->
      <div v-if="auth.currentUser" class="user-section">
        <div class="user-profile" @click="router.push('/profile')">
          <div class="avatar">{{ auth.currentUser.name.slice(0, 1).toUpperCase() }}</div>
          <span class="user-name">{{ auth.currentUser.name }}</span>
        </div>
        <button @click="logout" class="logout-btn">ออกจากระบบ</button>
      </div>
      <router-link v-else to="/auth" class="login-btn">เข้าสู่ระบบ</router-link>
    </div>
    
    <!-- Mobile Navigation Menu -->
    <div v-if="isMobileMenuOpen" class="mobile-menu">
      <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">หน้าหลัก</router-link>
      <router-link v-if="['admin', 'mentor', 'intern'].includes(auth.currentUser?.role || '')" to="/dashboard" class="mobile-nav-link" @click="closeMobileMenu">Dashboard</router-link>
      <router-link v-if="['admin', 'mentor', 'intern'].includes(auth.currentUser?.role || '')" to="/courses" class="mobile-nav-link" @click="closeMobileMenu">E-Learning</router-link>
      <router-link v-if="['admin', 'mentor'].includes(auth.currentUser?.role || '')" to="/evaluations" class="mobile-nav-link" @click="closeMobileMenu">Evaluation</router-link>
      <router-link v-if="auth.currentUser?.role === 'admin'" to="/admin" class="mobile-nav-link" @click="closeMobileMenu">Admin</router-link>
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
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  z-index: 2;
}

.gistda-logo {
  height: 50px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 32px;
  justify-content: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
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
  flex-shrink: 0;
  z-index: 2;
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
  display: flex;
  align-items: center;
  z-index: 2;
}

.login-btn:hover {
  background: #002855;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #374151;
  z-index: 2;
}

.mobile-menu-btn svg {
  width: 24px;
  height: 24px;
}

.mobile-menu {
  display: none;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 16px 20px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-nav-link {
  display: block;
  padding: 12px 16px;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.mobile-nav-link:hover {
  background: #f3f4f6;
  color: #003d82;
}

.mobile-nav-link.router-link-active {
  background: #e0f2fe;
  color: #003d82;
  font-weight: 600;
}

/* Show mobile menu at 1100px to prevent overlap */
@media (max-width: 1100px) {
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: block;
  }

  .user-name {
    display: none; /* Hide username in mobile view */
  }

  .logout-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
}

/* Mobile adjustments for smaller screens */
@media (max-width: 768px) {
  .header-content {
    padding: 12px 20px;
    gap: 12px;
  }

  .login-btn {
    padding: 8px 16px;
    font-size: 13px;
  }

  .user-section {
    gap: 12px;
  }

  .logout-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
