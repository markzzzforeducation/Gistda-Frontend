<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useEvaluationStore } from '../../stores/evaluation';
import GistdaHeader from '../../components/GistdaHeader.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const evaluationStore = useEvaluationStore();

const internId = route.params.internId as string;
const intern = ref<any>(null);
const isSubmitting = ref(false);
const showSuccess = ref(false);

const form = ref({
  punctuality: 3,
  qualityOfWork: 3,
  teamwork: 3,
  problemSolving: 3,
  comment: ''
});

// Calculate average score
const averageScore = computed(() => {
  const total = form.value.punctuality + form.value.qualityOfWork + form.value.teamwork + form.value.problemSolving;
  return (total / 4).toFixed(1);
});

// Get score color
function getScoreColor(score: number) {
  if (score >= 4) return '#10b981';
  if (score >= 3) return '#f59e0b';
  return '#ef4444';
}

// Get score label
function getScoreLabel(score: number) {
  if (score >= 5) return 'ดีเยี่ยม';
  if (score >= 4) return 'ดีมาก';
  if (score >= 3) return 'ดี';
  if (score >= 2) return 'พอใช้';
  return 'ต้องปรับปรุง';
}

onMounted(async () => {
  // Ensure we have users loaded
  if (auth.allUsers.length === 0) {
    await auth.fetchAllUsers();
  }
  intern.value = auth.allUsers.find(u => u.id === internId);
  
  if (!intern.value) {
    alert('ไม่พบนิสิต');
    router.push('/evaluations');
  }
});

async function submitEvaluation() {
  if (!auth.currentUser || !intern.value) return;
  
  isSubmitting.value = true;
  try {
    await evaluationStore.createEvaluation({
      internId: intern.value.id,
      mentorId: auth.currentUser.id,
      mentorName: auth.currentUser.name,
      punctuality: form.value.punctuality,
      qualityOfWork: form.value.qualityOfWork,
      teamwork: form.value.teamwork,
      problemSolving: form.value.problemSolving,
      comment: form.value.comment
    });
    
    showSuccess.value = true;
    setTimeout(() => {
      router.push('/evaluations');
    }, 2000);
  } catch (e) {
    alert('ไม่สามารถบันทึกการประเมินได้');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="app-container">
    <GistdaHeader />
    <div class="space-background"></div>

    <div class="main-content">
      <div class="content-wrapper">
        <!-- Back Button -->
        <button class="back-button" @click="router.push('/evaluations')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          กลับ
        </button>

        <div class="evaluation-card" v-if="intern">
          <!-- Header -->
          <div class="card-header">
            <div class="header-content">
              <div class="avatar">
                {{ intern.name.charAt(0).toUpperCase() }}
              </div>
              <div class="header-info">
                <span class="label">กำลังประเมิน</span>
                <h1>{{ intern.name }}</h1>
                <p>{{ intern.email }}</p>
              </div>
            </div>
            
            <!-- Average Score Preview -->
            <div class="score-preview" :style="{ background: getScoreColor(Number(averageScore)) }">
              <span class="score-value">{{ averageScore }}</span>
              <span class="score-label">{{ getScoreLabel(Number(averageScore)) }}</span>
            </div>
          </div>

          <form @submit.prevent="submitEvaluation" class="eval-form">
            <!-- Score Items -->
            <div class="scores-section">
              <h2>คะแนนประเมิน</h2>
              
              <div class="score-grid">
                <!-- Punctuality -->
                <div class="score-card">
                  <div class="score-header">
                    <div class="score-icon">⏰</div>
                    <div class="score-title">
                      <h3>ความตรงต่อเวลา</h3>
                      <p>การเข้างานตรงเวลา และส่งงานตามกำหนด</p>
                    </div>
                    <div class="score-display" :style="{ color: getScoreColor(form.punctuality) }">
                      {{ form.punctuality }}/5
                    </div>
                  </div>
                  <div class="slider-container">
                    <input 
                      type="range" 
                      v-model.number="form.punctuality" 
                      min="1" 
                      max="5" 
                      step="1"
                      class="score-slider"
                    />
                    <div class="slider-marks">
                      <span v-for="n in 5" :key="n" :class="{ active: n <= form.punctuality }">{{ n }}</span>
                    </div>
                  </div>
                </div>

                <!-- Quality of Work -->
                <div class="score-card">
                  <div class="score-header">
                    <div class="score-icon">⭐</div>
                    <div class="score-title">
                      <h3>คุณภาพของงาน</h3>
                      <p>ความถูกต้อง ความละเอียด และความสมบูรณ์</p>
                    </div>
                    <div class="score-display" :style="{ color: getScoreColor(form.qualityOfWork) }">
                      {{ form.qualityOfWork }}/5
                    </div>
                  </div>
                  <div class="slider-container">
                    <input 
                      type="range" 
                      v-model.number="form.qualityOfWork" 
                      min="1" 
                      max="5" 
                      step="1"
                      class="score-slider"
                    />
                    <div class="slider-marks">
                      <span v-for="n in 5" :key="n" :class="{ active: n <= form.qualityOfWork }">{{ n }}</span>
                    </div>
                  </div>
                </div>

                <!-- Teamwork -->
                <div class="score-card">
                  <div class="score-header">
                    <div class="score-icon">🤝</div>
                    <div class="score-title">
                      <h3>การทำงานเป็นทีม</h3>
                      <p>ความร่วมมือ การสื่อสาร และมนุษยสัมพันธ์</p>
                    </div>
                    <div class="score-display" :style="{ color: getScoreColor(form.teamwork) }">
                      {{ form.teamwork }}/5
                    </div>
                  </div>
                  <div class="slider-container">
                    <input 
                      type="range" 
                      v-model.number="form.teamwork" 
                      min="1" 
                      max="5" 
                      step="1"
                      class="score-slider"
                    />
                    <div class="slider-marks">
                      <span v-for="n in 5" :key="n" :class="{ active: n <= form.teamwork }">{{ n }}</span>
                    </div>
                  </div>
                </div>

                <!-- Problem Solving -->
                <div class="score-card">
                  <div class="score-header">
                    <div class="score-icon">💡</div>
                    <div class="score-title">
                      <h3>การแก้ปัญหา</h3>
                      <p>ความคิดสร้างสรรค์ และการวิเคราะห์ปัญหา</p>
                    </div>
                    <div class="score-display" :style="{ color: getScoreColor(form.problemSolving) }">
                      {{ form.problemSolving }}/5
                    </div>
                  </div>
                  <div class="slider-container">
                    <input 
                      type="range" 
                      v-model.number="form.problemSolving" 
                      min="1" 
                      max="5" 
                      step="1"
                      class="score-slider"
                    />
                    <div class="slider-marks">
                      <span v-for="n in 5" :key="n" :class="{ active: n <= form.problemSolving }">{{ n }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comment Section -->
            <div class="comment-section">
              <h2>ความคิดเห็นเพิ่มเติม</h2>
              <textarea 
                v-model="form.comment" 
                placeholder="เขียนความคิดเห็น ข้อเสนอแนะ หรือสิ่งที่ควรปรับปรุง..."
                rows="5"
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="actions">
              <button type="button" @click="router.back()" class="cancel-btn">
                ยกเลิก
              </button>
              <button type="submit" :disabled="isSubmitting || !form.comment.trim()" class="submit-btn">
                <svg v-if="!isSubmitting" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการประเมิน' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccess" class="success-overlay">
      <div class="success-modal">
        <div class="success-icon">✅</div>
        <h2>บันทึกสำเร็จ!</h2>
        <p>กำลังกลับไปหน้ารายชื่อนิสิต...</p>
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
  max-width: 900px;
  margin: 0 auto;
  padding: 0 40px 60px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-4px);
}

.back-button svg {
  width: 20px;
  height: 20px;
}

.evaluation-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(10px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.card-header {
  background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.header-info .label {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: white;
  margin-bottom: 8px;
}

.header-info h1 {
  margin: 0 0 4px;
  color: white;
  font-size: 26px;
  font-weight: 700;
}

.header-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.score-preview {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.score-preview .score-value {
  font-size: 36px;
  font-weight: 800;
}

.score-preview .score-label {
  font-size: 12px;
  opacity: 0.9;
}

.eval-form {
  padding: 32px;
}

.scores-section h2,
.comment-section h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 40px;
}

.score-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s;
}

.score-card:hover {
  border-color: #003d82;
  box-shadow: 0 4px 12px rgba(0, 61, 130, 0.1);
}

.score-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.score-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.score-title {
  flex: 1;
}

.score-title h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.score-title p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.score-display {
  font-size: 28px;
  font-weight: 800;
}

.slider-container {
  position: relative;
}

.score-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 4px;
  outline: none;
}

.score-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 61, 130, 0.3);
  transition: transform 0.2s;
}

.score-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 4px;
}

.slider-marks span {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
  border-radius: 50%;
  transition: all 0.2s;
}

.slider-marks span.active {
  color: #003d82;
  background: rgba(0, 61, 130, 0.1);
}

.comment-section {
  margin-bottom: 32px;
}

.comment-section textarea {
  width: 100%;
  padding: 18px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 15px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition: border-color 0.2s;
}

.comment-section textarea:focus {
  outline: none;
  border-color: #003d82;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  padding: 14px 28px;
  background: none;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 61, 130, 0.35);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn svg {
  width: 20px;
  height: 20px;
}

/* Success Modal */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.success-modal {
  background: white;
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  animation: popIn 0.4s ease;
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.success-modal h2 {
  margin: 0 0 8px;
  color: #1f2937;
  font-size: 24px;
}

.success-modal p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 20px 40px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .header-content {
    flex-direction: column;
  }
  
  .score-preview {
    width: 80px;
    height: 80px;
  }
  
  .score-preview .score-value {
    font-size: 28px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .cancel-btn, .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
