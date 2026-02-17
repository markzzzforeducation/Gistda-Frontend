<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useEvaluationStore } from '../../stores/evaluation';
import GistdaHeader from '../../components/GistdaHeader.vue';
import { showToast } from '../../utils/toast';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const evaluationStore = useEvaluationStore();
const internId = route.params.internId as string;
const intern = ref<any>(null);
const submitting = ref(false);
const submitted = ref(false);

// 16 criteria definitions with labels, english names, max scores, and icons
const criteria = [
  { key: 'quantityOfWork', label: 'ปริมาณงาน', english: 'Quantity of Work', max: 20, icon: '📊' },
  { key: 'qualityOfWork', label: 'คุณภาพงาน', english: 'Quality of Work', max: 20, icon: '⭐' },
  { key: 'academicAbility', label: 'ความรู้ความสามารถทางวิชาการ', english: 'Academic Ability', max: 15, icon: '📚' },
  { key: 'abilityToLearn', label: 'ความสามารถในการเรียนรู้และประยุกต์', english: 'Ability to Learn', max: 15, icon: '🧠' },
  { key: 'judgmentAndDecision', label: 'วิจารณญาณและการตัดสินใจ', english: 'Judgment & Decision Making', max: 15, icon: '⚖️' },
  { key: 'organizationAndPlanning', label: 'การจัดการและวางแผน', english: 'Organization & Planning', max: 10, icon: '📋' },
  { key: 'communicationSkills', label: 'ทักษะการสื่อสาร', english: 'Communication Skills', max: 15, icon: '💬' },
  { key: 'suitabilityForJob', label: 'ความเหมาะสมต่องาน', english: 'Suitability for Job', max: 10, icon: '🎯' },
  { key: 'responsibility', label: 'ความรับผิดชอบ', english: 'Responsibility & Dependability', max: 10, icon: '🛡️' },
  { key: 'interestInWork', label: 'ความสนใจอุตสาหะในการทำงาน', english: 'Interest in Work', max: 10, icon: '🔥' },
  { key: 'initiative', label: 'ความสามารถเริ่มต้นทำงานด้วยตนเอง', english: 'Initiative / Self-motivated', max: 10, icon: '🚀' },
  { key: 'responseToSupervision', label: 'การตอบสนองต่อการสั่งการ', english: 'Response to Supervision', max: 10, icon: '👂' },
  { key: 'personality', label: 'บุคลิกภาพและการวางตัว', english: 'Personality', max: 10, icon: '👤' },
  { key: 'interpersonalSkills', label: 'มนุษยสัมพันธ์', english: 'Interpersonal Skills', max: 10, icon: '🤝' },
  { key: 'discipline', label: 'ความมีระเบียบวินัย', english: 'Discipline & Adaptability', max: 10, icon: '📏' },
  { key: 'ethicsAndMorality', label: 'คุณธรรมและจริยธรรม', english: 'Ethics & Morality', max: 10, icon: '💎' },
];

// Form data with default scores at midpoint
const scores = ref<Record<string, number>>({});
criteria.forEach(c => {
  scores.value[c.key] = Math.ceil(c.max / 2);
});

const comment = ref('');
const strengths = ref('');
const improvements = ref('');

// Computed totals
const totalScore = computed(() => {
  return Object.values(scores.value).reduce((sum, val) => sum + val, 0);
});

const maxScore = 200;

const percentage = computed(() => {
  return Math.round((totalScore.value / maxScore) * 100);
});

const scoreStatus = computed(() => {
  const pct = percentage.value;
  if (pct >= 80) return { text: 'ดีมาก', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
  if (pct >= 60) return { text: 'ดี', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
  if (pct >= 40) return { text: 'ปานกลาง', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
  if (pct >= 20) return { text: 'พอใช้', color: '#f97316', bg: 'rgba(249,115,22,0.1)' };
  return { text: 'ไม่น่าพอใจ', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
});

function getScoreLevel(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 80) return { text: 'ดีมาก', class: 'level-excellent' };
  if (pct >= 60) return { text: 'ดี', class: 'level-good' };
  if (pct >= 40) return { text: 'ปานกลาง', class: 'level-fair' };
  if (pct >= 20) return { text: 'พอใช้', class: 'level-poor' };
  return { text: 'ไม่น่าพอใจ', class: 'level-bad' };
}

onMounted(async () => {
  if (auth.allUsers.length === 0) {
    await auth.fetchAllUsers();
  }
  intern.value = auth.allUsers.find(u => u.id === internId);
  if (!intern.value) {
    showToast('ไม่พบนิสิตที่ต้องการประเมิน', 'error');
    router.push('/evaluations');
  }
});

async function submitEvaluation() {
  if (submitting.value) return;
  submitting.value = true;
  try {
    const payload = {
      internId,
      mentorId: auth.currentUser?.id || '',
      mentorName: auth.currentUser?.name || '',
      ...scores.value,
      comment: comment.value,
      strengths: strengths.value,
      improvements: improvements.value,
    };
    console.log('[EVAL] Submitting evaluation:', JSON.stringify(payload, null, 2));
    
    await evaluationStore.createEvaluation(payload as any);
    submitted.value = true;
    showToast('บันทึกการประเมินเรียบร้อยแล้ว!', 'success', 3000);
    setTimeout(() => {
      router.push('/evaluations');
    }, 2000);
  } catch (error: any) {
    console.error('[EVAL] Submission error:', error);
    const msg = error?.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
    showToast(msg, 'error', 5000);
  } finally {
    submitting.value = false;
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
        <button class="back-btn" @click="router.push('/evaluations')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          กลับไปหน้ารายชื่อ
        </button>

        <!-- Success State -->
        <div v-if="submitted" class="success-card">
          <div class="success-icon">✅</div>
          <h2>บันทึกการประเมินเรียบร้อย!</h2>
          <p>กำลังกลับไปหน้ารายชื่อ...</p>
        </div>

        <!-- Evaluation Form -->
        <div v-if="!submitted && intern" class="evaluation-container">
          <!-- Header Card -->
          <div class="header-card">
            <div class="header-content">
              <div class="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
              </div>
              <div>
                <h1 class="header-title">แบบประเมินการปฏิบัติงานนักศึกษา</h1>
                <p class="header-subtitle">{{ intern.name }} — {{ intern.email }}</p>
              </div>
            </div>
            <!-- Live Score -->
            <div class="live-score-box">
              <div class="score-numbers">
                <span class="score-big" :style="{ color: scoreStatus.color }">{{ totalScore }}</span>
                <span class="score-slash">/</span>
                <span class="score-max-num">{{ maxScore }}</span>
                <span class="score-pct" :style="{ color: scoreStatus.color }">({{ percentage }}%)</span>
              </div>
              <span class="score-badge-pill" :style="{ background: scoreStatus.color }">{{ scoreStatus.text }}</span>
            </div>
          </div>

          <form @submit.prevent="submitEvaluation">
            <!-- Section Title -->
            <div class="section-title-bar">
              <h2>ตอนที่ 1: คะแนนประเมิน (16 ข้อ)</h2>
            </div>

            <!-- Criteria Cards -->
            <div class="criteria-list">
              <div v-for="(c, index) in criteria" :key="c.key" class="criteria-card">
                <div class="criteria-top">
                  <div class="criteria-left">
                    <span class="criteria-num">{{ index + 1 }}</span>
                    <span class="criteria-icon">{{ c.icon }}</span>
                    <div class="criteria-text">
                      <h3>{{ c.label }}</h3>
                      <span class="criteria-eng">{{ c.english }}</span>
                    </div>
                  </div>
                  <div class="criteria-score-pill" :class="getScoreLevel(scores[c.key], c.max).class">
                    <span class="pill-val">{{ scores[c.key] }}</span>
                    <span class="pill-max">/{{ c.max }}</span>
                  </div>
                </div>

                <div class="slider-wrap">
                  <input
                    type="range"
                    :min="1"
                    :max="c.max"
                    v-model.number="scores[c.key]"
                    class="gistda-slider"
                    :style="{ '--pct': ((scores[c.key] - 1) / (c.max - 1) * 100) + '%' }"
                  />
                  <div class="slider-meta">
                    <span class="slider-min">1</span>
                    <span class="level-tag" :class="getScoreLevel(scores[c.key], c.max).class">
                      {{ getScoreLevel(scores[c.key], c.max).text }}
                    </span>
                    <span class="slider-max">{{ c.max }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Text Section -->
            <div class="section-title-bar">
              <h2>ตอนที่ 2: ข้อเสนอแนะ</h2>
            </div>

            <div class="text-cards">
              <div class="text-card">
                <label>💬 ข้อเสนอเพิ่มเติมต่อนักศึกษา</label>
                <textarea v-model="comment" rows="3" placeholder="ข้อเสนอแนะทั่วไป..."></textarea>
              </div>
              <div class="text-card">
                <label>🌟 จุดเด่นของนักศึกษา</label>
                <textarea v-model="strengths" rows="3" placeholder="สิ่งที่นักศึกษาทำได้ดี..."></textarea>
              </div>
              <div class="text-card">
                <label>📝 ข้อควรปรับปรุงของนักศึกษา</label>
                <textarea v-model="improvements" rows="3" placeholder="สิ่งที่ควรพัฒนาเพิ่มเติม..."></textarea>
              </div>
            </div>

            <!-- Submit -->
            <button type="submit" class="submit-btn" :disabled="submitting">
              <svg v-if="!submitting" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span v-if="submitting">กำลังบันทึก...</span>
              <span v-else>บันทึกการประเมิน ({{ totalScore }}/{{ maxScore }})</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-container {
  min-height: 100vh;
  position: relative;
  background: #0a0e27;
}

.space-background {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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
  padding: 0 24px 60px;
}

/* Back Button - same as InternsListPage */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(0, 61, 130, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  color: white;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
  margin-bottom: 24px;
}
.back-btn:hover {
  background: rgba(0, 61, 130, 1);
  transform: translateX(-4px);
}
.back-btn svg {
  width: 18px;
  height: 18px;
}

/* Success Card */
.success-card {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.success-icon { font-size: 60px; margin-bottom: 16px; }
.success-card h2 { color: #10b981; margin: 0 0 8px; font-size: 24px; }
.success-card p { color: #6b7280; margin: 0; }

/* ===== Header Card ===== */
.header-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
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
  flex-shrink: 0;
}
.header-icon svg { width: 28px; height: 28px; }

.header-title {
  font-size: 22px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 4px;
}

.header-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Live Score Box */
.live-score-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  padding: 12px 20px;
  border-radius: 16px;
}

.score-numbers {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.score-big { font-size: 28px; font-weight: 800; }
.score-slash { color: #cbd5e1; font-size: 20px; font-weight: 600; }
.score-max-num { color: #94a3b8; font-size: 18px; font-weight: 600; }
.score-pct { font-size: 14px; font-weight: 700; margin-left: 4px; }

.score-badge-pill {
  color: white;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

/* ===== Section Title Bar ===== */
.section-title-bar {
  background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
  border-radius: 14px;
  padding: 14px 24px;
  margin-bottom: 16px;
}
.section-title-bar h2 {
  margin: 0;
  color: white;
  font-size: 16px;
  font-weight: 700;
}

/* ===== Criteria Cards ===== */
.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.criteria-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s;
}
.criteria-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 61, 130, 0.12);
}

.criteria-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.criteria-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.criteria-num {
  width: 30px; height: 30px;
  background: linear-gradient(135deg, #003d82, #0066cc);
  color: white;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
  flex-shrink: 0;
}

.criteria-icon { font-size: 22px; flex-shrink: 0; }

.criteria-text {
  min-width: 0;
}
.criteria-text h3 {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}
.criteria-eng {
  font-size: 12px;
  color: #9ca3af;
}

/* Score Pill */
.criteria-score-pill {
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 6px 14px;
  border-radius: 12px;
  flex-shrink: 0;
  border: 2px solid;
}
.pill-val { font-size: 22px; font-weight: 800; }
.pill-max { font-size: 13px; font-weight: 600; opacity: 0.7; }

.level-excellent { background: rgba(16,185,129,0.08); color: #059669; border-color: rgba(16,185,129,0.3); }
.level-good { background: rgba(34,197,94,0.08); color: #16a34a; border-color: rgba(34,197,94,0.3); }
.level-fair { background: rgba(245,158,11,0.08); color: #d97706; border-color: rgba(245,158,11,0.3); }
.level-poor { background: rgba(249,115,22,0.08); color: #ea580c; border-color: rgba(249,115,22,0.3); }
.level-bad { background: rgba(239,68,68,0.08); color: #dc2626; border-color: rgba(239,68,68,0.3); }

/* Slider */
.slider-wrap { padding: 0 4px; }

.gistda-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #003d82 var(--pct), #e5e7eb var(--pct));
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}
.gistda-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px; height: 22px;
  background: linear-gradient(135deg, #003d82, #0066cc);
  border-radius: 50%;
  border: 3px solid white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 61, 130, 0.35);
}
.gistda-slider::-moz-range-thumb {
  width: 22px; height: 22px;
  background: linear-gradient(135deg, #003d82, #0066cc);
  border-radius: 50%;
  border: 3px solid white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 61, 130, 0.35);
}

.slider-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.level-tag {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  border: none;
}

/* ===== Text Cards ===== */
.text-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.text-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.text-card label {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 10px;
}

.text-card textarea {
  width: 100%;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  color: #1f2937;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.text-card textarea:focus {
  outline: none;
  border-color: #003d82;
}
.text-card textarea::placeholder { color: #9ca3af; }

/* ===== Submit Button ===== */
.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px;
  background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
  color: white;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 61, 130, 0.3);
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 61, 130, 0.4);
}
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.submit-btn svg {
  width: 20px;
  height: 20px;
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .header-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }
  .live-score-box { width: 100%; justify-content: center; }
  .header-title { font-size: 18px; }
  .criteria-top { flex-wrap: wrap; gap: 10px; }
  .criteria-text h3 { font-size: 13px; }
  .content-wrapper { padding: 0 16px 40px; }
}
</style>
