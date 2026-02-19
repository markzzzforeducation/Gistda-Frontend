<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GistdaHeader from '../../components/GistdaHeader.vue';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();

const mentorFeatures = computed(() => [
  {
    title: t('mentorDashboard.myInterns'),
    description: t('mentorDashboard.myInternsDesc'),
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    path: '/my-interns',
    color: 'green'
  },
  {
    title: t('mentorDashboard.reviewSubmissions'),
    description: t('mentorDashboard.reviewSubmissionsDesc'),
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    path: '/mentor/reviews',
    color: 'green'
  },
  {
    title: t('mentorDashboard.projectPlans'),
    description: t('mentorDashboard.projectPlansDesc'),
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    path: '/project-plans',
    color: 'green'
  },
  {
    title: t('mentorDashboard.evaluateInterns'),
    description: t('mentorDashboard.evaluateInternsDesc'),
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    path: '/evaluations',
    color: 'green'
  }
]);
</script>

<template>
  <div class="app-container">
    <GistdaHeader />
    <div class="space-background"></div>
    
    <div class="main-content">
      <div class="content-wrapper">
        <!-- Page Header -->
        <div class="page-header">
          <h1 class="page-title">{{ t('mentorDashboard.greeting', { name: auth.currentUser?.name || 'Mentor' }) }}</h1>
          <p class="page-subtitle">{{ t('mentorDashboard.subtitle') }}</p>
        </div>

        <!-- Features Grid -->
        <div class="features-grid">
          <div 
            v-for="feature in mentorFeatures" 
            :key="feature.path + feature.title"
            @click="router.push(feature.path)"
            class="feature-card"
            :class="`color-${feature.color}`"
          >
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="feature.icon"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ feature.title }}</h3>
              <p class="card-description">{{ feature.description }}</p>
            </div>
            <div class="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
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
  background-image: url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=90');
  background-size: cover;
  background-position: center;
  opacity: 0.4;
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
  background: linear-gradient(135deg, #0f172a 0%, #003d82 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 48px;
  box-shadow: 0 4px 20px rgba(0, 61, 130, 0.3);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  transition: width 0.3s;
}

.feature-card.color-blue::before { background: #003d82; }
.feature-card.color-green::before { background: #003d82; }
.feature-card.color-teal::before { background: #003d82; }
.feature-card.color-slate::before { background: #003d82; }

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.feature-card:hover::before {
  width: 100%;
  opacity: 0.05;
}

.card-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.color-blue .card-icon { background: linear-gradient(135deg, #0f172a, #003d82); }
.color-green .card-icon { background: linear-gradient(135deg, #0f172a, #003d82); }
.color-teal .card-icon { background: linear-gradient(135deg, #0f172a, #003d82); }
.color-slate .card-icon { background: linear-gradient(135deg, #0f172a, #003d82); }

.card-icon svg { width: 28px; height: 28px; }
.card-content { flex: 1; }
.card-title { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; }
.card-description { font-size: 14px; color: #6b7280; margin: 0; line-height: 1.5; }
.card-arrow { flex-shrink: 0; color: #9ca3af; transition: all 0.3s; }
.feature-card:hover .card-arrow { transform: translateX(4px); color: #6b7280; }
.card-arrow svg { width: 20px; height: 20px; }

@media (max-width: 768px) {
  .content-wrapper { padding: 0 16px 40px; }
  .features-grid { grid-template-columns: 1fr; }
  .page-header { padding: 20px; margin-bottom: 28px; }
  .page-title { font-size: 24px; }
  .page-subtitle { font-size: 14px; }
}

@media (max-width: 480px) {
  .content-wrapper { padding: 0 12px 32px; }
  .page-header { padding: 16px; }
  .page-title { font-size: 20px; }
  .feature-card { padding: 16px; gap: 14px; }
  .card-icon { width: 44px; height: 44px; }
  .card-title { font-size: 15px; }
}
</style>
