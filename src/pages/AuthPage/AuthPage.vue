<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { googleTokenLogin } from 'vue3-google-login';

const router = useRouter();
const auth = useAuthStore();

const isRegister = ref(false);
const step = ref(1);
const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);
const showPassword = ref(false);
const isGoogleLoading = ref(false);

const profileData = ref({
  firstName: '', // Will sync with name
  lastName: '',
  university: '',
  faculty: '',
  major: '',
  studentId: '',
  startDate: '',
  endDate: '',
  mobile: '',
  advisorName: '',
  advisorEmail: '',
});

function nextStep() {
    if (!name.value || !email.value || !password.value) {
        error.value = 'Please fill in all fields';
        return;
    }
    // Auto-split name for convenience (simple split)
    const nameParts = name.value.trim().split(' ');
    profileData.value.firstName = nameParts[0] || '';
    profileData.value.lastName = nameParts.slice(1).join(' ') || '';
    
    error.value = '';
    step.value = 2;
}


async function submit() {
  if (isLoading.value) return;

  error.value = '';
  isLoading.value = true;

  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isRegister.value) {
      if (!name.value.trim()) {
        error.value = 'Name is required';
        isLoading.value = false;
        return;
      }
      
      // Pass the profile data!
      const res = await auth.register(
        name.value.trim(), 
        email.value, 
        password.value, 
        'intern', 
        { ...profileData.value } // Pass profile
      );
      
      if (!res.ok) {
        error.value = res.message || 'Registration failed';
        isLoading.value = false;
        return;
      }
    } else {
      const res = await auth.login(email.value, password.value);
      if (!res.ok) {
        error.value = res.message || 'Invalid email or password';
        isLoading.value = false;
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
  step.value = 1;
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
            <!-- Step 1: Account Info -->
            <div v-if="!isRegister || (isRegister && step === 1)">
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
            </div>

            <!-- Step 2: Intern Profile (Register Only) -->
            <div v-if="isRegister && step === 2" class="profile-step">
              <div class="step-header">
                <h3>Internship Details</h3>
                <p>Please complete your profile information</p>
              </div>

              <div class="row">
                <input v-model="profileData.university" placeholder="University" class="form-input" required />
                <input v-model="profileData.faculty" placeholder="Faculty" class="form-input" required />
              </div>
              <div class="row">
                <input v-model="profileData.major" placeholder="Major" class="form-input" required />
                <input v-model="profileData.studentId" placeholder="Student ID" class="form-input" required />
              </div>
              <div class="form-group">
                 <label class="form-label-sm">Project Duration</label>
                 <div class="row">
                  <input v-model="profileData.startDate" type="date" class="form-input" required />
                  <input v-model="profileData.endDate" type="date" class="form-input" required />
                 </div>
              </div>
              <div class="form-group">
                <input v-model="profileData.mobile" placeholder="Mobile Number" class="form-input" required />
              </div>
              <div class="form-group">
                <input v-model="profileData.advisorName" placeholder="Advisor Name" class="form-input" required />
                <input v-model="profileData.advisorEmail" placeholder="Advisor Email" class="form-input" required type="email" />
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <!-- Buttons -->
             <div class="button-group">
                <button v-if="isRegister && step === 2" type="button" class="back-btn" @click="step = 1">Back</button>
                
                <button v-if="isRegister && step === 1" type="button" class="submit-btn" @click="nextStep">
                  Continue
                </button>

                <button v-else type="submit" class="submit-btn" :disabled="isLoading">
                  <svg v-if="isLoading" class="spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10">
                      <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-31.4" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  {{ isLoading ? (isRegister ? 'Creating Account...' : 'Signing In...') : (isRegister ? 'Create Account' : 'Sign In') }}
                </button>
             </div>

            <!-- Divider (Only on Step 1 or Login) -->
            <div v-if="!isRegister || step === 1">
              <div class="divider">
                <div class="divider-line"></div>
                <span class="divider-text">or</span>
                <div class="divider-line"></div>
              </div>

              <button type="button" class="google-btn" @click="loginWithGoogle" :disabled="isGoogleLoading">
                <!-- (Google Icon SVG omitted for brevity, keeping same logic) -->
                <span>{{ isGoogleLoading ? 'Signing in...' : 'Continue with Google' }}</span>
              </button>
            </div>

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

.button-group {
    display: flex;
    gap: 12px;
    margin-top: 16px;
}

.back-btn {
    padding: 14px 20px;
    background: #f3f4f6;
    color: #4b5563;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.back-btn:hover {
    background: #e5e7eb;
}

.row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.step-header {
    text-align: center;
    margin-bottom: 20px;
}

.step-header h3 {
    margin: 0;
    color: #1f2937;
    font-size: 18px;
}

.step-header p {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 14px;
}

.profile-step {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-label-sm {
    font-size: 12px;
    color: #6b7280;
    font-weight: 600;
    margin-bottom: 4px;
    display: block;
}
</style>