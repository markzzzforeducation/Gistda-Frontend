<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';

const auth = useAuthStore();
const router = useRouter();

// Filter only interns
const interns = computed(() => {
  return auth.allUsers.filter(u => u.role === 'intern');
});

function goToEvaluation(internId: string) {
  router.push(`/evaluations/new/${internId}`);
}
</script>

<template>
  <div class="app-container">
    <GistdaHeader />
    <div class="space-background"></div>

    <div class="main-content">
      <div class="content-wrapper">
        <div class="page-header">
          <h1 class="page-title">Intern Evaluation</h1>
          <p class="page-subtitle">Select an intern to evaluate their performance</p>
        </div>

        <div class="interns-grid">
          <div v-for="intern in interns" :key="intern.id" class="intern-card">
            <div class="card-header">
              <div class="avatar-placeholder">
                {{ intern.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3>{{ intern.name }}</h3>
                <p class="email">{{ intern.email }}</p>
              </div>
            </div>
            
            <div class="card-body">
              <div class="info-row">
                <span class="label">University:</span>
                <span class="value">{{ intern.profile?.university || 'Not set' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Major:</span>
                <span class="value">{{ intern.profile?.major || 'Not set' }}</span>
              </div>
            </div>

            <button @click="goToEvaluation(intern.id)" class="evaluate-btn">
              Evaluate
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
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
  opacity: 0.3;
  z-index: 0;
}

.main-content {
  position: relative;
  z-index: 1;
  padding-top: 40px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px 60px;
}

.page-header {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.interns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.intern-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.intern-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.card-header h3 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #1f2937;
}

.email {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.label {
  color: #6b7280;
}

.value {
  font-weight: 500;
  color: #374151;
}

.evaluate-btn {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  background: #003d82;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.evaluate-btn:hover {
  background: #002855;
}
</style>
