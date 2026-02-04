<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useEvaluationStore } from '../../stores/evaluation';
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';

const auth = useAuthStore();
const evaluationStore = useEvaluationStore();
const router = useRouter();

const searchQuery = ref('');
const showHistoryModal = ref(false);
const selectedInternId = ref<string | null>(null);
const selectedInternName = ref('');

// Filter only interns
const interns = computed(() => {
  let list = auth.allUsers.filter(u => u.role === 'intern');
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q)
    );
  }
  return list;
});

// Get evaluations for a specific intern
function getEvaluationsForIntern(internId: string) {
  return evaluationStore.evaluations.filter(e => e.internId === internId);
}

// Get average score for an intern
function getAverageScore(internId: string) {
  const evals = getEvaluationsForIntern(internId);
  if (evals.length === 0) return null;
  
  let total = 0;
  evals.forEach(e => {
    total += (e.punctuality + e.qualityOfWork + e.teamwork + e.problemSolving) / 4;
  });
  return (total / evals.length).toFixed(1);
}

// Get score color
function getScoreColor(score: number | null) {
  if (score === null) return 'gray';
  const s = Number(score);
  if (s >= 4) return '#10b981'; // Green
  if (s >= 3) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
}

function goToEvaluation(internId: string) {
  router.push(`/evaluations/new/${internId}`);
}

function openHistory(internId: string, internName: string) {
  selectedInternId.value = internId;
  selectedInternName.value = internName;
  showHistoryModal.value = true;
}

function closeHistory() {
  showHistoryModal.value = false;
  selectedInternId.value = null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

onMounted(async () => {
  // Load all users first to populate interns list
  if (auth.allUsers.length === 0) {
    await auth.fetchAllUsers();
  }
  await evaluationStore.fetchEvaluations();
});
</script>

<template>
  <div class="app-container">
    <GistdaHeader />
    <div class="space-background"></div>

    <div class="main-content">
      <div class="content-wrapper">
        <!-- Back Button -->
        <button class="back-btn" @click="router.push('/mentor')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          กลับไปหน้า Mentor Dashboard
        </button>

        <!-- Page Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <div>
              <h1 class="page-title">ประเมินนิสิตฝึกงาน</h1>
              <p class="page-subtitle">เลือกนิสิตที่ต้องการประเมินผลการปฏิบัติงาน</p>
            </div>
          </div>
          
          <!-- Search -->
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="searchQuery" placeholder="ค้นหานิสิต..." />
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ interns.length }}</span>
              <span class="stat-label">นิสิตทั้งหมด</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ evaluationStore.evaluations.length }}</span>
              <span class="stat-label">การประเมินทั้งหมด</span>
            </div>
          </div>
        </div>

        <!-- Interns Grid -->
        <div class="interns-grid">
          <div v-for="intern in interns" :key="intern.id" class="intern-card">
            <div class="card-top">
              <!-- Avatar -->
              <div class="avatar-section">
                <div class="avatar" :style="{ background: intern.avatar ? `url(${intern.avatar}) center/cover` : '' }">
                  <span v-if="!intern.avatar">{{ intern.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div v-if="getAverageScore(intern.id)" class="score-badge" :style="{ background: getScoreColor(Number(getAverageScore(intern.id))) }">
                  {{ getAverageScore(intern.id) }}
                </div>
              </div>
              
              <!-- Info -->
              <div class="intern-info">
                <h3>{{ intern.name }}</h3>
                <p class="email">{{ intern.email }}</p>
                <div class="tags">
                  <span class="tag" v-if="intern.profile?.university">{{ intern.profile.university }}</span>
                  <span class="tag" v-if="intern.profile?.major">{{ intern.profile.major }}</span>
                </div>
              </div>
            </div>

            <!-- Evaluation Count -->
            <div class="eval-count">
              <span class="count-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                {{ getEvaluationsForIntern(intern.id).length }} การประเมิน
              </span>
              <button v-if="getEvaluationsForIntern(intern.id).length > 0" 
                      @click.stop="openHistory(intern.id, intern.name)" 
                      class="history-btn">
                ดูประวัติ
              </button>
            </div>

            <!-- Actions -->
            <div class="card-actions">
              <button @click="goToEvaluation(intern.id)" class="evaluate-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                ประเมินใหม่
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="interns.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <h3>ไม่พบนิสิต</h3>
          <p>ลองค้นหาด้วยชื่อหรืออีเมลอื่น</p>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal && selectedInternId" class="modal-overlay" @click.self="closeHistory">
      <div class="modal history-modal">
        <div class="modal-header">
          <h2>📊 ประวัติการประเมิน</h2>
          <span class="modal-subtitle">{{ selectedInternName }}</span>
          <button @click="closeHistory" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="getEvaluationsForIntern(selectedInternId).length > 0" class="evaluations-list">
            <div v-for="evaluation in getEvaluationsForIntern(selectedInternId)" :key="evaluation.id" class="evaluation-item">
              <div class="eval-header">
                <div class="mentor-info">
                  <span class="mentor-name">{{ evaluation.mentorName }}</span>
                  <span class="eval-date">{{ formatDate(evaluation.createdAt) }}</span>
                </div>
                <div class="avg-score" :style="{ color: getScoreColor((evaluation.punctuality + evaluation.qualityOfWork + evaluation.teamwork + evaluation.problemSolving) / 4) }">
                  {{ ((evaluation.punctuality + evaluation.qualityOfWork + evaluation.teamwork + evaluation.problemSolving) / 4).toFixed(1) }}
                </div>
              </div>
              <div class="scores-grid">
                <div class="score-item">
                  <span class="score-label">ความตรงต่อเวลา</span>
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: `${evaluation.punctuality * 20}%` }"></div>
                  </div>
                  <span class="score-value">{{ evaluation.punctuality }}/5</span>
                </div>
                <div class="score-item">
                  <span class="score-label">คุณภาพงาน</span>
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: `${evaluation.qualityOfWork * 20}%` }"></div>
                  </div>
                  <span class="score-value">{{ evaluation.qualityOfWork }}/5</span>
                </div>
                <div class="score-item">
                  <span class="score-label">การทำงานเป็นทีม</span>
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: `${evaluation.teamwork * 20}%` }"></div>
                  </div>
                  <span class="score-value">{{ evaluation.teamwork }}/5</span>
                </div>
                <div class="score-item">
                  <span class="score-label">การแก้ปัญหา</span>
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: `${evaluation.problemSolving * 20}%` }"></div>
                  </div>
                  <span class="score-value">{{ evaluation.problemSolving }}/5</span>
                </div>
              </div>
              <div v-if="evaluation.comment" class="eval-comment">
                <strong>ความเห็น:</strong> {{ evaluation.comment }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeHistory" class="btn-secondary">ปิด</button>
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
  min-height: 100vh;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px 60px;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-icon svg {
  width: 28px;
  height: 28px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 18px;
  min-width: 280px;
}

.search-box svg {
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 100%;
}

/* Stats Row */
.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.blue {
  background: rgba(0, 61, 130, 0.1);
  color: #003d82;
}

.stat-icon.green {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Interns Grid */
.interns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.intern-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.intern-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 61, 130, 0.2);
}

.card-top {
  display: flex;
  gap: 18px;
  margin-bottom: 20px;
}

.avatar-section {
  position: relative;
}

.avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.score-badge {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.intern-info {
  flex: 1;
}

.intern-info h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.email {
  margin: 0 0 10px;
  font-size: 13px;
  color: #6b7280;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: rgba(0, 61, 130, 0.1);
  color: #003d82;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.eval-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.count-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.count-text svg {
  width: 18px;
  height: 18px;
}

.history-btn {
  background: none;
  border: none;
  color: #003d82;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.history-btn:hover {
  background: rgba(0, 61, 130, 0.1);
}

.card-actions {
  display: flex;
  gap: 12px;
}

.evaluate-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.evaluate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 61, 130, 0.35);
}

.evaluate-btn svg {
  width: 18px;
  height: 18px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  color: #6b7280;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 20px;
  color: #374151;
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Modal */
.modal-overlay {
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

.modal {
  background: #1a1f3a;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.history-modal {
  width: 90%;
  max-width: 600px;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: white;
  font-size: 20px;
}

.modal-subtitle {
  margin-left: 12px;
  color: #93c5fd;
  font-size: 16px;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: white;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.evaluations-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.evaluation-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
}

.eval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mentor-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mentor-name {
  font-weight: 600;
  color: white;
  font-size: 15px;
}

.eval-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.avg-score {
  font-size: 32px;
  font-weight: 800;
}

.scores-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-label {
  width: 120px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.score-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #003d82, #0066cc);
  border-radius: 4px;
  transition: width 0.3s;
}

.score-value {
  width: 40px;
  font-size: 13px;
  color: white;
  font-weight: 600;
  text-align: right;
}

.eval-comment {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 12px 28px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Back Button */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-4px);
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 20px 40px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .search-box {
    width: 100%;
    min-width: auto;
  }
  
  .stats-row {
    flex-direction: column;
  }
  
  .interns-grid {
    grid-template-columns: 1fr;
  }
}
</style>
