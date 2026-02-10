<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';
import { useEvaluationStore, type EvaluationSummary } from '../../stores/evaluation';

const router = useRouter();
const evaluationStore = useEvaluationStore();
const loading = ref(true);
const summary = ref<EvaluationSummary | null>(null);

onMounted(async () => {
    try {
        summary.value = await evaluationStore.fetchMyEvaluationSummary();
    } catch (e) {
        console.error('Failed to load evaluation summary:', e);
    } finally {
        loading.value = false;
    }
});

const scoreColor = computed(() => {
    if (!summary.value?.hasEvaluations) return '#6b7280';
    const score = summary.value.averageScore;
    if (score >= 4.5) return '#10b981';
    if (score >= 3.5) return '#22c55e';
    if (score >= 2.5) return '#eab308';
    if (score >= 1.5) return '#f97316';
    return '#ef4444';
});

const scoreGradient = computed(() => {
    if (!summary.value?.hasEvaluations) return 'linear-gradient(135deg, #6b7280, #4b5563)';
    const score = summary.value.averageScore;
    if (score >= 4.5) return 'linear-gradient(135deg, #10b981, #059669)';
    if (score >= 3.5) return 'linear-gradient(135deg, #22c55e, #16a34a)';
    if (score >= 2.5) return 'linear-gradient(135deg, #eab308, #ca8a04)';
    if (score >= 1.5) return 'linear-gradient(135deg, #f97316, #ea580c)';
    return 'linear-gradient(135deg, #ef4444, #dc2626)';
});

const formattedDate = computed(() => {
    if (!summary.value?.lastEvaluationDate) return '-';
    return new Date(summary.value.lastEvaluationDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});
</script>

<template>
    <div class="app-container">
        <GistdaHeader />
        <div class="space-background"></div>
        
        <div class="main-content">
            <div class="content-wrapper">
                <!-- Page Header -->
                <div class="page-header">
                    <button class="back-button" @click="router.push('/intern')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับ
                    </button>
                    <div class="header-text">
                        <h1 class="page-title">คะแนนประเมินของฉัน</h1>
                        <p class="page-subtitle">สรุปผลการประเมินจาก Mentor</p>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="loading-overlay">
                    <div class="spinner"></div>
                </div>

                <!-- No Evaluations -->
                <div v-else-if="!summary?.hasEvaluations" class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3>ยังไม่มีการประเมิน</h3>
                    <p>คุณยังไม่ได้รับการประเมินจาก Mentor</p>
                </div>

                <!-- Main Dashboard -->
                <div v-if="summary?.hasEvaluations" class="dashboard-container">
                    <div class="dashboard-glass-card">
                        <!-- Big Score Circle -->
                        <div class="score-dashboard">
                            <div class="score-status-badge" :style="{ background: scoreGradient }">
                                {{ summary.scoreStatus }}
                            </div>
                            
                            <div class="score-circle-large" :style="{ borderColor: scoreColor }">
                                <div class="score-content">
                                    <span class="score-number" :style="{ color: scoreColor }">{{ summary.averageScore }}</span>
                                    <span class="score-divider">/</span>
                                    <span class="score-total">5</span>
                                </div>
                            </div>
                            
                            <h2 class="score-label">คะแนนเฉลี่ยจาก Mentor</h2>
                            
                            <div class="score-meta">
                                <div class="meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>ประเมินแล้ว <strong>{{ summary.evaluationCount }}</strong> ครั้ง</span>
                                </div>
                                <div class="meta-divider">•</div>
                                <div class="meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>ล่าสุด: <strong>{{ formattedDate }}</strong></span>
                                </div>
                            </div>
                        </div>

                        <!-- Score Criteria Legend (below dashboard) -->
                        <div class="criteria-legend">
                            <span class="criteria-title">เกณฑ์คะแนน:</span>
                            <div class="criteria-items">
                                <span class="criteria-item excellent">
                                    <span class="criteria-dot"></span>
                                    4.5-5.0 ดีเยี่ยม
                                </span>
                                <span class="criteria-item good">
                                    <span class="criteria-dot"></span>
                                    3.5-4.4 ดีมาก
                                </span>
                                <span class="criteria-item fair">
                                    <span class="criteria-dot"></span>
                                    2.5-3.4 ดี
                                </span>
                                <span class="criteria-item average">
                                    <span class="criteria-dot"></span>
                                    1.5-2.4 พอใช้
                                </span>
                                <span class="criteria-item improve">
                                    <span class="criteria-dot"></span>
                                    0.0-1.4 ต้องปรับปรุง
                                </span>
                            </div>
                        </div>

                        <!-- Info Note -->
                        <p class="info-note">
                            หากต้องการรายละเอียดเพิ่มเติมเกี่ยวกับคะแนน สามารถสอบถาม Mentor ของคุณได้
                        </p>
                    </div>
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
    height: 100vh;
    width: 100vw;
    position: relative;
    background: #0a0e27;
    overflow: hidden; /* Force no scroll on body */
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
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-top: 40px;
    box-sizing: border-box; /* Ensure padding doesn't add to height */
}

.content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent internal scroll */
}

/* Header */
.page-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 30px; /* Minimal gap */
    flex-shrink: 0;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    cursor: pointer;
    color: white;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s;
}

.back-button:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-4px);
}

.back-button svg {
    width: 18px;
    height: 18px;
}

.page-title {
    font-size: 28px;
    font-weight: 800;
    color: white;
    margin: 0;
}

.page-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 4px 0 0;
}

/* Loading */
.loading-overlay {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 80px 40px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    margin: auto;
}

.empty-state svg {
    width: 72px;
    height: 72px;
    color: rgba(255, 255, 255, 0.25);
    margin-bottom: 20px;
}

.empty-state h3 {
    color: white;
    font-size: 22px;
    margin: 0 0 10px;
}

.empty-state p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
    margin: 0;
}

/* Dashboard Container */
.dashboard-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start; /* Ensure content starts from top */
    padding-bottom: 20px; /* Slight bottom padding */
    min-height: 0; /* Crucial for flex child scroll/overflow */
}

.dashboard-glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 32px 40px; /* Reduced vertical padding */
    width: 100%;
    max-width: 800px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* Score Dashboard - Big & Centered */
.score-dashboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}

.score-status-badge {
    padding: 6px 20px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 700;
    color: white;
    margin-bottom: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.5px;
}

.score-circle-large {
    width: 180px; /* Reduced size */
    height: 180px;
    border-radius: 50%;
    border: 8px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    box-shadow: 
        0 0 60px rgba(255, 255, 255, 0.1),
        inset 0 0 60px rgba(255, 255, 255, 0.02);
    margin-bottom: 24px;
}

.score-content {
    display: flex;
    align-items: baseline;
    justify-content: center;
    line-height: 1;
    gap: 0; /* Tight spacing */
}

.score-number {
    font-size: 72px; /* Adjusted size */
    font-weight: 800;
    line-height: 1;
    letter-spacing: -2px;
}

.score-divider {
    font-size: 36px;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 600;
    margin: 0 2px; /* Slight margin for balance */
}

.score-total {
    font-size: 36px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
}

.score-label {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 20px;
}

.score-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
}

.meta-item svg {
    width: 16px;
    height: 16px;
    opacity: 0.6;
}

.meta-item strong {
    color: white;
    font-weight: 600;
}

.meta-divider {
    color: rgba(255, 255, 255, 0.3);
    font-size: 14px;
}

/* Criteria Legend - Below Dashboard */
.criteria-legend {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.criteria-title {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 1px;
    display: block;
    margin-bottom: 12px;
    text-align: center;
}

.criteria-items {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
}

.criteria-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px; /* Smaller font */
    color: rgba(255, 255, 255, 0.7);
}

.criteria-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.criteria-item.excellent .criteria-dot { background: #10b981; }
.criteria-item.good .criteria-dot { background: #22c55e; }
.criteria-item.fair .criteria-dot { background: #eab308; }
.criteria-item.average .criteria-dot { background: #f97316; }
.criteria-item.improve .criteria-dot { background: #ef4444; }

.criteria-item.excellent { color: #6ee7b7; }
.criteria-item.good { color: #86efac; }
.criteria-item.fair { color: #fde047; }
.criteria-item.average { color: #fdba74; }
.criteria-item.improve { color: #fca5a5; }

/* Info Note */
.info-note {
    margin-top: 20px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
    .content-wrapper {
        padding: 0 20px 20px;
    }
    
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 20px;
    }
    
    .page-title {
        font-size: 24px;
    }
    
    .dashboard-glass-card {
        padding: 24px;
    }
    
    .score-circle-large {
        width: 160px;
        height: 160px;
    }
    
    .score-number {
        font-size: 56px;
    }
    
    .score-divider,
    .score-total {
        font-size: 28px;
    }
    
    .score-meta {
        flex-direction: column;
        gap: 8px;
    }
    
    .meta-divider {
        display: none;
    }
    
    .criteria-items {
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
}
</style>
