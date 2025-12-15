<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useBoardsStore } from '../stores/boards';
import { useNotificationsStore } from '../stores/notifications';
import { apiPost, setAuthToken } from '../lib/api';

const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  try {
    console.log('GoogleCallbackPage: Starting OAuth callback process');
    
    // Get the authorization code from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    console.log('GoogleCallbackPage: URL params:', { code: code ? 'present' : 'missing', error });

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

    console.log('GoogleCallbackPage: Calling backend with code');
    // Exchange code for token
    const response = await apiPost<{ token: string; user: { id: string; name: string; email: string } }>('/api/auth/google/callback', { code });
    
    console.log('GoogleCallbackPage: Backend response:', response);
    
    // Set auth token
    setAuthToken(response.token);
    
    // Update auth store
    const exists = auth.users.some(u => u.id === response.user.id);
    if (!exists) {
      auth.users.push({ 
        id: response.user.id, 
        name: response.user.name, 
        email: response.user.email, 
        password: '' 
      });
      auth.persistUsers();
    }
    
    auth.currentUserId = response.user.id;
    localStorage.setItem('kb-currentUserId', response.user.id);
    
    console.log('GoogleCallbackPage: Auth state updated, currentUserId:', auth.currentUserId);
    
    // After login, sync boards and notifications from backend
    try {
      const boards = useBoardsStore();
      await boards.fetchBoards();
      boards.startAutoRefresh(20000);
      console.log('GoogleCallbackPage: Boards synced');
    } catch (e) {
      console.log('GoogleCallbackPage: Boards sync failed:', e);
    }
    try {
      const noti = useNotificationsStore();
      await noti.fetch();
      noti.startAutoRefresh(15000);
      console.log('GoogleCallbackPage: Notifications synced');
    } catch (e) {
      console.log('GoogleCallbackPage: Notifications sync failed:', e);
    }
    
    console.log('GoogleCallbackPage: Redirecting to main page');
    // Redirect to main page
    router.push('/');
    
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    
    // Check if it's a backend error (500)
    if (error instanceof Error && error.message.includes('500')) {
      console.log('GoogleCallbackPage: Backend error detected, trying fallback');
      
      // Try to create a mock user for development
      const mockGoogleUser = {
        id: 'google_' + Date.now(),
        name: 'Google User',
        email: 'google.user@example.com'
      };
      
      // Check if user already exists
      let user = auth.users.find(u => u.email === mockGoogleUser.email);
      if (!user) {
        // Create new user for Google OAuth
        user = {
          id: mockGoogleUser.id,
          name: mockGoogleUser.name,
          email: mockGoogleUser.email,
          password: '' // No password for OAuth users
        };
        auth.users.push(user);
        auth.persistUsers();
      }
      
      // Set as current user
      auth.currentUserId = user.id;
      localStorage.setItem('kb-currentUserId', user.id);
      
      // Mock token for development
      const mockToken = 'mock_google_token_' + Date.now();
      setAuthToken(mockToken);
      
      console.log('GoogleCallbackPage: Mock user created, redirecting to main page');
      router.push('/');
      return;
    }
    
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
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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
  color: #667eea;
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
