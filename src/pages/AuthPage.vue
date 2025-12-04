<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { googleTokenLogin } from 'vue3-google-login';

const router = useRouter();
const auth = useAuthStore();

const isRegister = ref(false);
const name = ref('');
const email = ref('Alice@example.com');
const password = ref('123456');
const error = ref('');
const isLoading = ref(false);
const showPassword = ref(false);
const isGoogleLoading = ref(false);

async function submit() {
  if (isLoading.value) return;

  error.value = '';
  isLoading.value = true;

  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isRegister.value) {
      if (!name.value.trim()) {
        error.value = 'Name is required';
        return;
      }
      const res = await auth.register(name.value.trim(), email.value, password.value);
      if (!res.ok) {
        error.value = res.message || 'Registration failed';
        return;
      }
    } else {
      const res = await auth.login(email.value, password.value);
      if (!res.ok) {
        error.value = res.message || 'Invalid email or password';
        return;
      }
    }

    router.push('/');
  } catch (err) {
    error.value = 'Something went wrong. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

function toggleMode() {
  isRegister.value = !isRegister.value;
  error.value = '';
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

async function loginWithGoogle() {
  if (isGoogleLoading.value) return;
  
  isGoogleLoading.value = true;
  error.value = '';
  
  try {
    const response = await googleTokenLogin();
    if (response.access_token) {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${response.access_token}` }
      });
      const userInfo = await userInfoResponse.json();
      
      const res = await auth.loginWithGoogle({
        name: userInfo.name,
        email: userInfo.email
      });

      if (!res.ok) {
        error.value = res.message || 'Google login failed';
        return;
      }
      router.push('/');
    }
  } catch (err: any) {
    console.error(err);
    error.value = 'Google login failed. Please try again.';
  } finally {
    isGoogleLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <!-- Top Header Bar -->
    <div class="top-header">
      <div class="header-content">
        <img src="/gistda-logo.png" alt="GISTDA" class="header-logo" />
      </div>
    </div>

    <!-- Main Content -->
    <div  class="auth-main">
      <div class="auth-container">
        <!-- Auth Card -->
        <div class="auth-card">
          <!-- Logo -->
          <div class="card-logo">
            <img src="/gistda-logo.png" alt="GISTDA" class="logo-image" />
          </div>

          <!-- Title -->
          <div class="auth-title">
            <h1>{{ isRegister ? 'Create Account' : 'Welcome Back' }}</h1>
            <p>{{ isRegister ? 'Sign up to continue' : 'Sign in to continue' }}</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="submit" class="auth-form">
            <!-- Name (Register only) -->
            <div v-if="isRegister" class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Full Name
              </label>
              <input v-model="name" type="text" class="form-input" placeholder="Enter your name" required />
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Email Address
              </label>
              <input v-model="email" type="email" class="form-input" placeholder="Alice@example.com" required />
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Password
              </label>
              <div class="password-wrapper">
                <input v-model="password" :type="showPassword ? 'text' : 'password'" class="form-input" placeholder="••••••" required />
                <button type="button" class="toggle-password" @click="togglePasswordVisibility">
                  <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99264 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M1 1L23 23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <!-- Submit Button -->
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <svg v-if="isLoading" class="spinner" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10">
                  <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-31.4" repeatCount="indefinite"/>
                </circle>
              </svg>
              {{ isLoading ? (isRegister ? 'Creating...' : 'Signing In...') : (isRegister ? 'Create Account' : 'Sign In') }}
            </button>

            <!-- Divider -->
            <div class="divider">
              <div class="divider-line"></div>
              <span class="divider-text">or</span>
              <div class="divider-line"></div>
            </div>

            <!-- Google Login Button -->
            <button type="button" class="google-btn" @click="loginWithGoogle" :disabled="isGoogleLoading">
              <svg v-if="isGoogleLoading" class="spinner" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10">
                  <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-31.4" repeatCount="indefinite"/>
                </circle>
              </svg>
              <svg v-else class="google-icon" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {{ isGoogleLoading ? 'Signing in...' : 'Continue with Google' }}
            </button>

            <!-- Switch Mode -->
            <div class="switch-mode">
              <span>{{ isRegister ? 'Already have an account?' : 'New to Website ?' }}</span>
              <button type="button" class="link-btn" @click="toggleMode">
                {{ isRegister ? 'Sign In' : 'Create account' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #1a1b3d;
  display: flex;
  flex-direction: column;
}

.top-header {
  background: white;
  padding: 16px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.header-logo {
  height: 40px;
  width: auto;
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 48px 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.card-logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-image {
  height: 70px;
  width: auto;
  display: block;
  margin: 0 auto;
}

.auth-title {
  text-align: center;
  margin-bottom: 32px;
}


.auth-title h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.auth-title p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-label svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.password-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
}

.toggle-password:hover {
  color: #374151;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

.error-message {
  padding: 12px 16px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}

.google-btn {
  width: 100%;
  padding: 12px 24px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.google-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.google-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.switch-mode {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}

.link-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
}

.link-btn:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 20px;
  }

  .auth-card {
    padding: 32px 24px;
  }

  .auth-main {
    padding: 40px 16px;
  }
}
</style>