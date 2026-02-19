<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from '../../stores/language';
import { setAuthToken } from '../../lib/api';

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();
const langStore = useLanguageStore();

const isRegister = ref(false);
const step = ref(1); // 1=login/register, 2=profile, 3=OTP verification
const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);
const showPassword = ref(false);
const isGoogleLoading = ref(false);
const isGoogleRegister = ref(false);

// OTP verification state
const verifyEmail = ref('');
const otpDigits = ref(['', '', '', '', '', '']);
const otpError = ref('');
const isVerifying = ref(false);
const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

// Mentor list for dropdown
interface Mentor {
  id: string;
  name: string;
  email: string;
}
const mentors = ref<Mentor[]>([]);
const selectedMentorId = ref('');
const showSuccessModal = ref(false);
const successMessage = ref('');

const profileData = ref({
  firstName: '',
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

// Fetch mentors when step 2 is shown
async function fetchMentors() {
  try {
    const res = await fetch('/api/auth/mentors');
    if (res.ok) {
      mentors.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch mentors:', err);
  }
}

// Watch for mentor selection and auto-fill advisorName/Email
watch(selectedMentorId, (newId) => {
  const mentor = mentors.value.find(m => m.id === newId);
  if (mentor) {
    profileData.value.advisorName = mentor.name;
    profileData.value.advisorEmail = mentor.email;
  }
});

function nextStep() {
    if (!name.value || !email.value || !password.value) {
        error.value = 'Please fill in all fields';
        return;
    }
    const nameParts = name.value.trim().split(' ');
    profileData.value.firstName = nameParts[0] || '';
    profileData.value.lastName = nameParts.slice(1).join(' ') || '';
    
    error.value = '';
    step.value = 2;
    fetchMentors();
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const isGoogleOnboarding = urlParams.get('googleOnboarding') === 'true';

  if (isGoogleOnboarding) {
    // New Google user — restore state from sessionStorage and show registration form
    const savedUser = sessionStorage.getItem('google-onboarding-user');
    const savedToken = sessionStorage.getItem('google-onboarding-token');
    
    if (savedUser && savedToken) {
      const googleUser = JSON.parse(savedUser);
      
      // Pre-fill data
      name.value = googleUser.name || '';
      email.value = googleUser.email || '';
      
      // Setup name parts for profile
      if (googleUser.name) {
        const nameParts = googleUser.name.trim().split(' ');
        profileData.value.firstName = nameParts[0] || '';
        profileData.value.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      isRegister.value = true;
      step.value = 1; // Start at Step 1 to allow setting password
      isGoogleRegister.value = true; // Flag to disable email and use special submit action
      return;
    }
  }

  // Standard: existing intern user without profile (e.g. refreshed after Google login)
  if (auth.currentUser && auth.currentUser.role === 'intern' && !auth.currentUser.profile) {
    isRegister.value = true;
    step.value = 2;
    name.value = auth.currentUser.name;
    email.value = auth.currentUser.email;
    
    const nameParts = auth.currentUser.name.trim().split(' ');
    profileData.value.firstName = nameParts[0] || '';
    profileData.value.lastName = nameParts.slice(1).join(' ') || '';
    
    fetchMentors();
  }
});

function showOtpStep(emailAddr: string) {
  verifyEmail.value = emailAddr;
  otpDigits.value = ['', '', '', '', '', ''];
  otpError.value = '';
  step.value = 3;
  startResendCooldown();
}

function startResendCooldown() {
  resendCooldown.value = 60;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer!);
      cooldownTimer = null;
    }
  }, 1000);
}

function handleOtpInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, '');
  otpDigits.value[index] = value.slice(-1);
  
  // Auto-focus next input
  if (value && index < 5) {
    const nextInput = document.querySelector(`#otp-${index + 1}`) as HTMLInputElement;
    nextInput?.focus();
  }
}

function handleOtpKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    const prevInput = document.querySelector(`#otp-${index - 1}`) as HTMLInputElement;
    prevInput?.focus();
  }
}

function handleOtpPaste(event: ClipboardEvent) {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) || '';
  for (let i = 0; i < 6; i++) {
    otpDigits.value[i] = pastedData[i] || '';
  }
  // Focus last filled or last input
  const lastIndex = Math.min(pastedData.length, 5);
  const lastInput = document.querySelector(`#otp-${lastIndex}`) as HTMLInputElement;
  lastInput?.focus();
}

async function submitOtp() {
  const otpCode = otpDigits.value.join('');
  if (otpCode.length !== 6) {
    otpError.value = 'กรุณากรอก OTP 6 หลัก';
    return;
  }
  
  isVerifying.value = true;
  otpError.value = '';
  
  try {
    const res = await auth.verifyEmail(verifyEmail.value, otpCode);
    if (!res.ok) {
      otpError.value = res.message || 'รหัส OTP ไม่ถูกต้อง';
      return;
    }
    
    successMessage.value = 'ยืนยันอีเมลสำเร็จ!';
    showSuccessModal.value = true;
    setTimeout(() => {
      showSuccessModal.value = false;
      router.push('/');
    }, 2000);
  } catch (err) {
    otpError.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่';
  } finally {
    isVerifying.value = false;
  }
}

async function handleResendOtp() {
  if (resendCooldown.value > 0) return;
  const res = await auth.resendOtp(verifyEmail.value);
  if (res.ok) {
    startResendCooldown();
  }
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

      // Validate mobile number (must be exactly 10 digits) when on step 2
      if (step.value === 2 && profileData.value.mobile) {
        const cleanMobile = profileData.value.mobile.replace(/\D/g, '');
        if (cleanMobile.length !== 10) {
          error.value = 'กรุณากรอกเบอร์โทร 10 หลัก';
          isLoading.value = false;
          return;
        }
      }

      if (auth.currentUser && auth.currentUser.role === 'intern' && !auth.currentUser.profile) {
        // ... (existing profile update logic for logged in users) ...
        const res = await auth.updateProfile({ ...profileData.value, mentorId: selectedMentorId.value || undefined });
        if (!res.ok) {
          error.value = res.message || 'Profile update failed';
          isLoading.value = false;
          return;
        }
        successMessage.value = 'อัปเดตข้อมูลสำเร็จ!';
        showSuccessModal.value = true;
        setTimeout(() => {
          showSuccessModal.value = false;
          router.push('/');
        }, 2000);
        isLoading.value = false;
        return;
      } else if (isGoogleRegister.value) {
        // Google Registration Completion (New User)
        const tempToken = sessionStorage.getItem('google-onboarding-token');
        if (!tempToken) {
           error.value = 'Session expired. Please try again.';
           isLoading.value = false;
           return;
        }

        const res = await auth.registerGoogleUser(
          tempToken,
          name.value.trim(),
          password.value,
          { ...profileData.value },
          selectedMentorId.value || undefined
        );

        if (!res.ok) {
          error.value = res.message || 'Registration failed';
          isLoading.value = false;
          return;
        }

        // Clear Google onboarding temp data
        sessionStorage.removeItem('google-onboarding-token');
        sessionStorage.removeItem('google-onboarding-user');
        
        successMessage.value = 'ลงทะเบียนสำเร็จ!';
        showSuccessModal.value = true;
        setTimeout(() => {
          showSuccessModal.value = false;
          router.push('/');
        }, 2000);
        isLoading.value = false;
        return;
      } else {
        // Normal email/password registration
        const res = await auth.register(
          name.value.trim(),
          email.value,
          password.value,
          'intern',
          { ...profileData.value },
          selectedMentorId.value || undefined
        );
        if (!res.ok) {
          error.value = res.message || 'Registration failed';
          isLoading.value = false;
          return;
        }
        // Show OTP verification step
        showOtpStep(email.value);
        isLoading.value = false;
        return;
      }
    } else {
      const res = await auth.login(email.value, password.value);
      if (!res.ok) {
        if (res.message === 'needsVerification') {
          showOtpStep(email.value);
          isLoading.value = false;
          return;
        }
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
    const res = await auth.loginWithGoogle();
    if (!res.ok) {
      error.value = res.message || 'Google login failed';
    }
    // If ok, the page will redirect to Google OAuth
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
        <img src="/gistda-logo.png" alt="GISTDA" class="header-logo" @click="router.push('/')" />
      </div>
    </div>

    <!-- Main Content -->
    <div  class="auth-main">
      <div class="auth-container" :class="{ 'wide': step === 3 }">
        <!-- Auth Card -->
        <div class="auth-card">
          <!-- Logo -->
          <div class="card-logo">
            <img src="/gistda-logo.png" alt="GISTDA" class="logo-image" />
          </div>

          <!-- Step 3: OTP Verification -->
          <div v-if="step === 3" class="otp-step">
            <div class="otp-header">
              <div class="otp-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h2>ยืนยันอีเมลของคุณ</h2>
              <p>เราได้ส่งรหัส OTP 6 หลักไปที่</p>
              <p class="otp-email">{{ verifyEmail }}</p>
            </div>

            <div class="otp-inputs" @paste="handleOtpPaste">
              <input
                v-for="(digit, index) in otpDigits"
                :key="index"
                :id="'otp-' + index"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="otp-input"
                :value="digit"
                @input="handleOtpInput(index, $event)"
                @keydown="handleOtpKeydown(index, $event)"
              />
            </div>

            <div v-if="otpError" class="error-message">{{ otpError }}</div>

            <button class="submit-btn" @click="submitOtp" :disabled="isVerifying">
              <svg v-if="isVerifying" class="spinner" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10">
                  <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-31.4" repeatCount="indefinite"/>
                </circle>
              </svg>
              {{ isVerifying ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส OTP' }}
            </button>

            <div class="resend-section">
              <span>ไม่ได้รับรหัส?</span>
              <button 
                type="button" 
                class="link-btn" 
                @click="handleResendOtp"
                :disabled="resendCooldown > 0"
              >
                {{ resendCooldown > 0 ? `ส่งอีกครั้งใน ${resendCooldown}s` : 'ส่ง OTP อีกครั้ง' }}
              </button>
            </div>

            <div class="switch-mode" style="margin-top: 16px;">
              <button type="button" class="link-btn" @click="step = 1; error = ''; otpError = '';">
                ← กลับหน้าเข้าสู่ระบบ
              </button>
            </div>
          </div>

          <!-- Normal Login/Register Steps -->
          <div v-else>
            <!-- Title -->
            <div class="auth-title">
              <h1>{{ isRegister ? (step === 2 && auth.currentUser ? `Welcome, ${auth.currentUser.name}!` : 'Create Account') : 'Welcome Back' }}</h1>
              <p>{{ isRegister ? (step === 2 && auth.currentUser ? 'Please complete your information' : 'Sign up to continue') : 'Sign in to continue' }}</p>
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
                  <input v-model="email" type="email" class="form-input" placeholder="Alice@example.com" required :disabled="isGoogleRegister" :class="{'bg-gray-100 cursor-not-allowed': isGoogleRegister}" />
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
                  <input 
                    v-model="profileData.mobile" 
                    placeholder="Mobile Number (10 digits)" 
                    class="form-input" 
                    type="tel"
                    maxlength="10"
                    pattern="[0-9]{10}"
                    inputmode="numeric"
                    @input="profileData.mobile = profileData.mobile.replace(/\D/g, '').slice(0, 10)"
                    required 
                  />
                  <small v-if="profileData.mobile && profileData.mobile.length !== 10" class="field-error">
                    กรุณากรอกเบอร์โทร 10 หลัก (ตอนนี้ {{ profileData.mobile.length }} หลัก)
                  </small>
                  <small v-else-if="profileData.mobile && profileData.mobile.length === 10" class="field-success">
                    ✓ เบอร์โทรถูกต้อง
                  </small>
                </div>
                <div class="form-group">
                  <label class="form-label-sm">เลือก Mentor ที่ปรึกษา</label>
                  <select v-model="selectedMentorId" class="form-input mentor-select" required>
                    <option value="" disabled>-- เลือก Mentor --</option>
                    <option v-for="mentor in mentors" :key="mentor.id" :value="mentor.id">
                      {{ mentor.name }} ({{ mentor.email }})
                    </option>
                  </select>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="error-message">
                {{ error }}
              </div>

              <!-- Buttons -->
               <div class="button-group">
                  <button v-if="isRegister && step === 2 && !auth.currentUser" type="button" class="back-btn" @click="step = 1">Back</button>
                  
                  <button v-if="isRegister && step === 1" type="button" class="submit-btn" @click="nextStep">
                    Continue
                  </button>

                  <button v-else type="submit" class="submit-btn" :disabled="isLoading">
                    <svg v-if="isLoading" class="spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10">
                        <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-31.4" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    {{ isLoading ? (isRegister ? 'Processing...' : 'Signing In...') : (isRegister ? (step === 2 && auth.currentUser ? 'Complete Registration' : 'Create Account') : 'Sign In') }}
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
                  <svg class="google-icon" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
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

    <!-- Success Modal -->
    <Transition name="modal">
      <div v-if="showSuccessModal" class="success-overlay">
        <div class="success-modal">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#10b981"/>
              <path d="M8 12l2.5 2.5L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>{{ successMessage }}</h2>
          <p>กำลังนำท่านไปยังหน้าหลัก...</p>
          <div class="loading-bar">
            <div class="loading-progress"></div>
          </div>
        </div>
      </div>
    </Transition>
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
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.header-logo {
  height: 50px;
  width: auto;
  cursor: pointer;
  transition: opacity 0.2s;
}

.header-logo:hover {
  opacity: 0.8;
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

.field-error {
    color: #dc2626;
    font-size: 12px;
    margin-top: 4px;
    display: block;
}

.field-success {
    color: #10b981;
    font-size: 12px;
    margin-top: 4px;
    display: block;
}

.mentor-select {
    cursor: pointer;
    background: white;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 12px center;
    background-repeat: no-repeat;
    background-size: 16px;
    padding-right: 40px;
}

.mentor-select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Success Modal */
.success-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.success-modal {
    background: white;
    border-radius: 20px;
    padding: 48px;
    text-align: center;
    max-width: 400px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
    from {
        transform: scale(0.9);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.success-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
}

.success-icon svg {
    width: 100%;
    height: 100%;
}

.success-modal h2 {
    margin: 0 0 12px;
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
}

.success-modal p {
    margin: 0 0 24px;
    font-size: 14px;
    color: #6b7280;
}

.loading-bar {
    width: 100%;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.loading-progress {
    height: 100%;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 2px;
    animation: loadProgress 2.5s ease-out forwards;
}

@keyframes loadProgress {
    from { width: 0%; }
    to { width: 100%; }
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

/* OTP Verification Step */
.otp-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}

.otp-header {
    text-align: center;
}

.otp-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    background: #eef2ff;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
}

.otp-icon svg {
    width: 100%;
    height: 100%;
}

.otp-header h2 {
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px;
}

.otp-header p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
}

.otp-email {
    font-weight: 700;
    color: #6366f1 !important;
    font-size: 15px !important;
    margin-top: 4px !important;
}

.otp-inputs {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.otp-input {
    width: 48px;
    height: 56px;
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    font-family: monospace;
    border: 2px solid #d1d5db;
    border-radius: 12px;
    background: #f9fafb;
    color: #1f2937;
    transition: all 0.2s;
    outline: none;
}

.otp-input:focus {
    border-color: #6366f1;
    background: white;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.resend-section {
    text-align: center;
    font-size: 14px;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 6px;
}

.resend-section .link-btn:disabled {
    color: #9ca3af;
    cursor: not-allowed;
}

.auth-container.wide {
    max-width: 480px;
}

@media (max-width: 400px) {
    .otp-input {
        width: 40px;
        height: 48px;
        font-size: 20px;
    }
    .otp-inputs {
        gap: 6px;
    }
}
</style>