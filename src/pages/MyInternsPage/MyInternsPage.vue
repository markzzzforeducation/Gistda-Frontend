<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { getAuthToken } from '../../lib/api';
import GistdaHeader from '../../components/GistdaHeader.vue';

const router = useRouter();
const auth = useAuthStore();

interface Intern {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    Profile?: {
        university?: string;
        faculty?: string;
        major?: string;
        startDate?: string;
        endDate?: string;
        mobile?: string;
    };
}

const interns = ref<Intern[]>([]);
const loading = ref(true);
const error = ref('');

async function fetchMyInterns() {
    try {
        loading.value = true;
        error.value = '';
        const token = getAuthToken();
        const res = await fetch('/api/interns/my-interns', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error('Failed to fetch interns');
        }
        interns.value = await res.json();
    } catch (err) {
        console.error('Fetch interns error:', err);
        error.value = 'ไม่สามารถโหลดข้อมูลนิสิตได้';
    } finally {
        loading.value = false;
    }
}

function formatDate(dateStr?: string) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

onMounted(() => {
    fetchMyInterns();
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับไปหน้า Mentor Dashboard
                </button>

                <!-- Page Header -->
                <div class="page-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 class="page-title">รายชื่อนิสิตในความดูแล</h1>
                            <p class="page-subtitle">ข้อมูลนิสิตฝึกงานที่อยู่ภายใต้การดูแลของคุณ</p>
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">{{ interns.length }}</span>
                            <span class="stat-label">นิสิตในความดูแล</span>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <p>กำลังโหลดข้อมูล...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="error-state">
                    <p>{{ error }}</p>
                    <button @click="fetchMyInterns" class="retry-btn">ลองใหม่</button>
                </div>

                <!-- Interns Grid -->
                <div v-else-if="interns.length > 0" class="interns-grid">
                    <div v-for="intern in interns" :key="intern.id" class="intern-card">
                        <div class="card-top">
                            <!-- Avatar -->
                            <div class="avatar"
                                :style="{ background: intern.avatar ? `url(${intern.avatar}) center/cover` : '' }">
                                <span v-if="!intern.avatar">{{ intern.name.charAt(0).toUpperCase() }}</span>
                            </div>

                            <!-- Info -->
                            <div class="intern-info">
                                <h3>{{ intern.name }}</h3>
                                <p class="email">{{ intern.email }}</p>
                                <div class="tags">
                                    <span class="tag" v-if="intern.Profile?.university">{{ intern.Profile.university
                                        }}</span>
                                    <span class="tag" v-if="intern.Profile?.major">{{ intern.Profile.major }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Details -->
                        <div class="intern-details">
                            <div class="detail-row" v-if="intern.Profile?.faculty">
                                <span class="detail-label">คณะ:</span>
                                <span class="detail-value">{{ intern.Profile.faculty }}</span>
                            </div>
                            <div class="detail-row" v-if="intern.Profile?.startDate || intern.Profile?.endDate">
                                <span class="detail-label">ระยะเวลาฝึกงาน:</span>
                                <span class="detail-value">
                                    {{ formatDate(intern.Profile?.startDate) }} - {{
                                        formatDate(intern.Profile?.endDate) }}
                                </span>
                            </div>
                            <div class="detail-row" v-if="intern.Profile?.mobile">
                                <span class="detail-label">เบอร์โทร:</span>
                                <span class="detail-value">{{ intern.Profile.mobile }}</span>
                            </div>
                        </div>

                        <!-- Actions -->

                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3>ยังไม่มีนิสิตในความดูแล</h3>
                    <p>นิสิตจะปรากฏที่นี่หลังจากได้รับการมอบหมายจาก Admin</p>
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

/* Page Header */
.page-header {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 28px 32px;
    margin-bottom: 24px;
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
    flex-shrink: 0;
}

.intern-info {
    flex: 1;
    min-width: 0;
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
    word-break: break-all;
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

.intern-details {
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 6px 0;
}

.detail-label {
    color: #6b7280;
}

.detail-value {
    color: #1f2937;
    font-weight: 500;
}



/* Loading State */
.loading-state {
    text-align: center;
    padding: 80px 40px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    color: #6b7280;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #003d82;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Error State */
.error-state {
    text-align: center;
    padding: 80px 40px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    color: #ef4444;
}

.retry-btn {
    margin-top: 16px;
    padding: 12px 24px;
    background: #003d82;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
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

@media (max-width: 768px) {
    .content-wrapper {
        padding: 0 20px 40px;
    }

    .interns-grid {
        grid-template-columns: 1fr;
    }
}
</style>
