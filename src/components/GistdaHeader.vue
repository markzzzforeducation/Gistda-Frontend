<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNotificationsStore } from '../stores/notifications';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const notifications = useNotificationsStore();
const router = useRouter();
const isMobileMenuOpen = ref(false);
const showNotifications = ref(false);

const props = defineProps<{
  variant?: 'light' | 'dark';
}>();

// Start fetching notifications when logged in
onMounted(() => {
  if (auth.currentUser) {
    notifications.startAutoRefresh(30000);
  }
});

onUnmounted(() => {
  notifications.stopAutoRefresh();
});

function logout() {
  notifications.stopAutoRefresh();
  auth.logout();
  router.push('/auth');
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
}

function closeNotifications() {
  showNotifications.value = false;
}

async function markAllRead() {
  if (auth.currentUser) {
    await notifications.markAllRead(auth.currentUser.id);
  }
}

async function clearNotifications() {
  if (auth.currentUser) {
    await notifications.clearAll(auth.currentUser.id);
  }
}

// Computed properties
const avatarUrl = computed(() => {
  const avatar = auth.currentUser?.avatar;
  if (avatar) {
    if (avatar.startsWith('http')) return avatar;
    return avatar;
  }
  return null;
});

const dashboardPath = computed(() => {
  const role = auth.currentUser?.role;
  if (role === 'admin') return '/admin';
  if (role === 'mentor') return '/mentor';
  if (role === 'intern') return '/intern';
  return '/dashboard';
});

const unreadNotifications = computed(() => {
  if (!auth.currentUser) return [];
  return notifications.unreadForUser(auth.currentUser.id);
});

const allNotifications = computed(() => {
  if (!auth.currentUser) return [];
  return notifications.allForUser(auth.currentUser.id).slice(0, 10);
});

const unreadCount = computed(() => unreadNotifications.value.length);

function formatTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${days} วันที่แล้ว`;
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.notification-wrapper')) {
    showNotifications.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
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
        <router-link v-if="['admin', 'mentor', 'intern'].includes(auth.currentUser?.role || '')" to="/courses" class="nav-link" @click="closeMobileMenu">E-Learning</router-link>
        <router-link v-if="['admin', 'mentor', 'intern'].includes(auth.currentUser?.role || '')" :to="dashboardPath" class="nav-link" @click="closeMobileMenu">Dashboard</router-link>
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
        <!-- Notification Bell -->
        <div class="notification-wrapper">
          <button class="notification-btn" @click.stop="toggleNotifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
          </button>
          
          <!-- Notification Dropdown -->
          <div v-if="showNotifications" class="notification-dropdown">
            <div class="dropdown-header">
              <h3>การแจ้งเตือน</h3>
              <div class="header-actions">
                <button v-if="unreadCount > 0" @click="markAllRead" class="action-btn mark-read">
                  อ่านทั้งหมด
                </button>
                <button v-if="allNotifications.length > 0" @click="clearNotifications" class="action-btn clear-all">
                  ลบทั้งหมด
                </button>
              </div>
            </div>
            
            <div class="dropdown-content">
              <div v-if="allNotifications.length === 0" class="empty-notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <p>ไม่มีการแจ้งเตือน</p>
              </div>
              
              <div v-else class="notification-list">
                <div 
                  v-for="noti in allNotifications" 
                  :key="noti.id" 
                  class="notification-item"
                  :class="{ unread: !noti.read }"
                >
                  <div class="notification-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div class="notification-content">
                    <p class="notification-message">{{ noti.message }}</p>
                    <span class="notification-time">{{ formatTime(noti.createdAt) }}</span>
                  </div>
                  <span v-if="!noti.read" class="unread-dot"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="user-profile" @click="router.push('/profile')">
          <div class="avatar">
            <img v-if="avatarUrl" :src="avatarUrl" alt="Profile" class="avatar-image" />
            <span v-else>{{ auth.currentUser.name.slice(0, 1).toUpperCase() }}</span>
          </div>
          <span class="user-name">{{ auth.currentUser.name }}</span>
        </div>
        <button @click="logout" class="logout-btn">ออกจากระบบ</button>
      </div>
      <router-link v-else to="/auth" class="login-btn">เข้าสู่ระบบ</router-link>
    </div>
    
    <!-- Mobile Navigation Menu -->
    <div v-if="isMobileMenuOpen" class="mobile-menu">
      <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">หน้าหลัก</router-link>
      <router-link v-if="['admin', 'mentor', 'intern'].includes(auth.currentUser?.role || '')" to="/courses" class="mobile-nav-link" @click="closeMobileMenu">E-Learning</router-link>
      <router-link v-if="['admin', 'mentor', 'intern'].includes(auth.currentUser?.role || '')" :to="dashboardPath" class="mobile-nav-link" @click="closeMobileMenu">Dashboard</router-link>
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

/* Notification Bell Styles */
.notification-wrapper {
  position: relative;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s;
}

.notification-btn:hover {
  background: #f3f4f6;
  color: #003d82;
}

.notification-btn svg {
  width: 22px;
  height: 22px;
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
  z-index: 1001;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn.mark-read {
  color: #003d82;
}

.action-btn.mark-read:hover {
  background: #e0f2fe;
}

.action-btn.clear-all {
  color: #ef4444;
}

.action-btn.clear-all:hover {
  background: #fee2e2;
}

.dropdown-content {
  max-height: 400px;
  overflow-y: auto;
}

.empty-notifications {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-notifications svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-notifications p {
  margin: 0;
  font-size: 14px;
}

.notification-list {
  padding: 8px 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: #eff6ff;
}

.notification-item.unread:hover {
  background: #dbeafe;
}

.notification-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #003d82, #0066cc);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon svg {
  width: 18px;
  height: 18px;
  color: white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 14px;
  color: #374151;
  margin: 0 0 4px;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #9ca3af;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #003d82;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  max-width: 250px;
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
  flex-shrink: 0;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
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
  flex-shrink: 0;
  white-space: nowrap;
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
    display: none;
  }

  .logout-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
  
  .notification-dropdown {
    width: 320px;
    right: -60px;
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
    gap: 8px;
  }

  .logout-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .notification-dropdown {
    width: 300px;
    right: -100px;
  }
}
</style>
