<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, type InternProfile } from '../../stores/auth';
import { mockBackend } from '../../services/mockBackend';

const router = useRouter();
const auth = useAuthStore();

const formData = ref<InternProfile>({
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

const isSubmitting = ref(false);

async function submitProfile() {
  if (!auth.currentUser) return;
  isSubmitting.value = true;
  
  try {
    // Save to backend
    mockBackend.updateUser(auth.currentUser.id, { 
      profile: formData.value 
    });
    
    // Update local store
    auth.currentUser.profile = formData.value;
    
    // Redirect to home
    router.push('/');
  } catch (error) {
    console.error('Failed to save profile:', error);
    alert('Failed to save profile. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="onboarding-container">
    <div class="space-background"></div>
    <div class="content">
      <div class="card">
        <h1>Welcome, {{ auth.currentUser?.name }}!</h1>
        <p class="subtitle">Please complete your profile to continue.</p>

        <form @submit.prevent="submitProfile" class="form-grid">
          <div class="section">
            <h3>Personal Information</h3>
            <div class="form-group">
              <label>First Name</label>
              <input v-model="formData.firstName" required />
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input v-model="formData.lastName" required />
            </div>
            <div class="form-group">
              <label>Mobile Number</label>
              <input v-model="formData.mobile" required type="tel" />
            </div>
          </div>

          <div class="section">
            <h3>Education</h3>
            <div class="form-group">
              <label>University</label>
              <input v-model="formData.university" required />
            </div>
            <div class="form-group">
              <label>Faculty</label>
              <input v-model="formData.faculty" required />
            </div>
            <div class="form-group">
              <label>Major</label>
              <input v-model="formData.major" required />
            </div>
            <div class="form-group">
              <label>Student ID</label>
              <input v-model="formData.studentId" required />
            </div>
          </div>

          <div class="section">
            <h3>Internship Details</h3>
            <div class="form-group">
              <label>Start Date</label>
              <input v-model="formData.startDate" type="date" required />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input v-model="formData.endDate" type="date" required />
            </div>
            <div class="form-group">
              <label>Advisor Name</label>
              <input v-model="formData.advisorName" required />
            </div>
            <div class="form-group">
              <label>Advisor Email</label>
              <input v-model="formData.advisorEmail" required type="email" />
            </div>
          </div>

          <div class="full-width">
            <button type="submit" :disabled="isSubmitting" class="submit-btn">
              {{ isSubmitting ? 'Saving...' : 'Complete Registration' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-container {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #0a0e27;
}

.space-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80');
  background-size: cover;
  background-position: center;
  opacity: 0.4;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 800px;
}

.card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

h1 {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  text-align: center;
  margin: 0 0 8px;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 40px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
