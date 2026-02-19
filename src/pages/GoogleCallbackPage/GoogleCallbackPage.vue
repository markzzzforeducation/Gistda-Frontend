<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useBoardsStore } from '../../stores/boards';
import { useNotificationsStore } from '../../stores/notifications';
import { setAuthToken } from '../../lib/api';

const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  try {
    console.log('GoogleCallbackPage: Starting OAuth callback process');
    
    // Get the authorization code from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      router.push('/auth?error=google_auth_failed');
      return;
    }

    if (!code) {
      console.error('No authorization code received');
      router.push('/auth?error=no_code');
      return;
    }

    // Exchange code for token via backend
    const response = await fetch('/api/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google callback failed:', errorData);
      router.push('/auth?error=callback_failed');
      return;
    }

    const data = await response.json();
    
    // ---- New Google user: needs to complete registration (set password + profile) ----
    if (data.needsRegistration) {
      // Store temp token so AuthPage can use it to complete registration
      sessionStorage.setItem('google-onboarding-token', data.tempToken);
      sessionStorage.setItem('google-onboarding-user', JSON.stringify(data.googleProfile));
      
      router.push('/auth?googleOnboarding=true');
      return;
    }

    // ---- Existing user: logged in or linked ----
    // Set auth token
    setAuthToken(data.token);
    sessionStorage.setItem('kb-currentUserId', data.user.id);
    sessionStorage.setItem('kb-token', data.token);
    
    // Update auth store with full user data
    auth.currentUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      password: '',
      role: data.user.role || 'intern',
      avatar: data.user.avatar,
      approvalStatus: data.user.approvalStatus,
      profile: data.user.profile
    };

    // Check if existing user needs onboarding (intern without profile)
    if (data.needsOnboarding) {
      sessionStorage.setItem('google-onboarding-token', data.token);
      sessionStorage.setItem('google-onboarding-user', JSON.stringify(data.user));
      router.push('/auth?googleOnboarding=true');
      return;
    }

    
    // ---- Existing user linked/logged in ----
    try {
      const boards = useBoardsStore();
      await boards.fetchBoards();
    } catch (e) {
      console.log('Boards sync skipped');
    }
    try {
      const noti = useNotificationsStore();
      await noti.fetch();
    } catch (e) {
      console.log('Notifications sync skipped');
    }
    
    router.push('/');
    
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    router.push('/auth?error=callback_failed');
  }
});
</script>

<template>
  <div class="callback-page">
    <div class="callback-container">
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite" />
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <h2>กำลังเข้าสู่ระบบ...</h2>
      <p>กรุณารอสักครู่ขณะที่เราดำเนินการเข้าสู่ระบบด้วย Google</p>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1b3d;
  padding: 24px;
}

.callback-container {
  text-align: center;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  margin-bottom: 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  color: #6366f1;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}
</style>
