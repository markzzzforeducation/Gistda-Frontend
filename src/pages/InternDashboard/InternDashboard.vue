<script setup lang="ts">
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const internFeatures = [
  {
    title: 'แผนงานของฉัน',
    description: 'สร้างและจัดการแผนงานโปรเจคของคุณ',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    path: '/project-plans',
    color: 'green'
  },
  {
    title: 'ดูแผนงานเพื่อน',
    description: 'ดูแผนงานโปรเจคของเพื่อนนิสิตคนอื่น',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    path: '/project-plans?mode=friends',
    color: 'green'
  },
  {
    title: 'คะแนนประเมินของฉัน',
    description: 'ดูคะแนนประเมินจาก Mentor แบบสรุป',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    path: '/my-evaluations',
    color: 'teal'
  },
  {
    title: 'ส่งโปสเตอร์',
    description: 'อัปโหลดโปสเตอร์โครงการของคุณ',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    path: '/submit-project',
    color: 'blue'
  }
];
</script>

<template>
  <div class="app-container">
    <GistdaHeader />
    <div class="space-background"></div>
    
    <div class="main-content">
      <div class="content-wrapper">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-content">
            <div>
              <h1 class="page-title">สวัสดี, {{ auth.currentUser?.name || 'นิสิต' }} 👋</h1>
              <p class="page-subtitle">Intern Dashboard - จัดการการฝึกงานของคุณ</p>
            </div>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="features-grid">
          <div 
            v-for="feature in internFeatures" 
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

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  .content-wrapper { padding: 0 20px 40px; }
  .features-grid { grid-template-columns: 1fr; }
}
</style>
