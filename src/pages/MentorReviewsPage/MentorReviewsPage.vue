<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGalleryStore, type Submission } from '../../stores/gallery';
import GistdaHeader from '../../components/GistdaHeader.vue';

const galleryStore = useGalleryStore();

const activeTab = ref<'pending' | 'approved' | 'rejected' | 'all'>('pending');

const filteredSubmissions = computed(() => {
    if (activeTab.value === 'pending') return galleryStore.pendingSubmissions;
    if (activeTab.value === 'approved') return galleryStore.mentorApprovedSubmissions;
    if (activeTab.value === 'rejected') return galleryStore.submissions.filter(s => s.status === 'rejected');
    return galleryStore.submissions;
});

onMounted(async () => {
    await galleryStore.fetchSubmissions();
});

async function approveSubmission(id: string) {
    if (confirm('Approve this submission? It will be sent to Admin for final approval.')) {
        await galleryStore.updateSubmissionStatus(id, 'mentor_approved');
    }
}

async function rejectSubmission(id: string) {
    if (confirm('Are you sure you want to reject this submission?')) {
        await galleryStore.updateSubmissionStatus(id, 'rejected');
    }
}

async function returnToPending(id: string) {
    if (confirm('Return this submission to pending status?')) {
        await galleryStore.updateSubmissionStatus(id, 'pending');
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'published': return 'bg-green-100 text-green-800';
        case 'mentor_approved': return 'bg-blue-100 text-blue-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'mentor_approved': return 'Approved (Awaiting Admin)';
        case 'published': return 'Published';
        case 'rejected': return 'Rejected';
        default: return 'Pending';
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
                <button class="back-btn" @click="$router.push('/mentor')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับไปหน้า Mentor Dashboard
                </button>

                <!-- Page Header -->
                <div class="page-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 class="page-title">ตรวจสอบโปสเตอร์</h1>
                            <p class="page-subtitle">อนุมัติโปสเตอร์โครงการของนิสิต</p>
                        </div>
                    </div>
                </div>

                <!-- Stats Row -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon yellow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">{{ galleryStore.pendingSubmissions.length }}</span>
                            <span class="stat-label">รอตรวจสอบ</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">{{ galleryStore.mentorApprovedSubmissions.length }}</span>
                            <span class="stat-label">อนุมัติแล้ว</span>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tabs-container">
                    <div class="tabs">
                        <button 
                            v-for="tab in [
                                { key: 'pending', label: 'รอตรวจสอบ' },
                                { key: 'approved', label: 'อนุมัติแล้ว' },
                                { key: 'rejected', label: 'ปฏิเสธ' },
                                { key: 'all', label: 'ทั้งหมด' }
                            ]" 
                            :key="tab.key"
                            @click="activeTab = tab.key as any"
                            class="tab-btn"
                            :class="{ active: activeTab === tab.key }"
                        >
                            {{ tab.label }}
                        </button>
                    </div>
                </div>

                <!-- Submissions Grid -->
                <div class="submissions-grid" v-if="filteredSubmissions.length">
                    <div v-for="sub in filteredSubmissions" :key="sub.id" class="review-card">
                        <div class="card-image">
                            <img :src="sub.imageUrl" :alt="sub.title" />
                            <div class="status-overlay">
                                <span class="status-badge" :class="getStatusColor(sub.status)">
                                    {{ getStatusLabel(sub.status) }}
                                </span>
                            </div>
                        </div>
                        <div class="card-content">
                            <h3 class="card-title">{{ sub.title }}</h3>
                            <p class="student-name">โดย {{ sub.studentName }}</p>
                            <p class="card-abstract">{{ sub.abstract }}</p>
                            
                            <div v-if="sub.projectLink" class="project-link">
                                <a :href="sub.projectLink" target="_blank" rel="noopener noreferrer">
                                    🔗 ดูโปรเจค
                                </a>
                            </div>
                            
                            <div class="card-actions">
                                <div v-if="sub.status === 'pending'" class="pending-actions">
                                    <button @click="approveSubmission(sub.id)" class="btn-action approve">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        อนุมัติ
                                    </button>
                                    <button @click="rejectSubmission(sub.id)" class="btn-action reject">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        ปฏิเสธ
                                    </button>
                                </div>
                                <div v-else class="other-actions">
                                    <button v-if="sub.status !== 'pending'" @click="returnToPending(sub.id)" class="btn-text">
                                        ย้ายกลับไปรอตรวจสอบ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3>ไม่พบโปสเตอร์</h3>
                    <p>ยังไม่มีโปสเตอร์ในหมวดหมู่นี้</p>
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

/* Back Button - Glassmorphism Style */
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

/* Page Header - Match MyInternsPage */
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
    flex-wrap: wrap;
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

.stat-icon.yellow {
    background: rgba(234, 179, 8, 0.15);
    color: #b45309;
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

/* Tabs Container */
.tabs-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 8px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tabs {
    display: flex;
    gap: 8px;
}

.tab-btn {
    flex: 1;
    padding: 14px 20px;
    background: transparent;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.3s;
}

.tab-btn:hover {
    background: rgba(0, 61, 130, 0.05);
    color: #003d82;
}

.tab-btn.active {
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 61, 130, 0.3);
}

/* Submissions Grid */
.submissions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
}

.review-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.review-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 61, 130, 0.2);
}

.card-image {
    height: 200px;
    position: relative;
    background: linear-gradient(135deg, #e2e8f0, #f1f5f9);
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.status-overlay {
    position: absolute;
    top: 12px;
    right: 12px;
}

.status-badge {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.card-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
}

.card-title {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 6px 0;
    line-height: 1.4;
}

.student-name {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 12px 0;
}

.card-abstract {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
    margin: 0 0 16px 0;
    flex: 1;
}

.project-link {
    margin-bottom: 20px;
}

.project-link a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #003d82;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 16px;
    background: rgba(0, 61, 130, 0.1);
    border-radius: 8px;
    transition: all 0.3s;
}

.project-link a:hover {
    background: rgba(0, 61, 130, 0.15);
}

.card-actions {
    border-top: 1px solid #e5e7eb;
    padding-top: 20px;
}

.pending-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.btn-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: all 0.3s;
}

.btn-action svg {
    width: 18px;
    height: 18px;
}

.btn-action.approve {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
}

.btn-action.approve:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.35);
}

.btn-action.reject {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
}

.btn-action.reject:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
}

.other-actions {
    display: flex;
    justify-content: flex-end;
}

.btn-text {
    background: rgba(0, 61, 130, 0.1);
    border: none;
    font-weight: 600;
    font-size: 14px;
    color: #003d82;
    cursor: pointer;
    padding: 10px 18px;
    border-radius: 10px;
    transition: all 0.3s;
}

.btn-text:hover {
    background: rgba(0, 61, 130, 0.15);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 80px 40px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    color: #6b7280;
}

.empty-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    background: rgba(0, 61, 130, 0.1);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #003d82;
}

.empty-icon svg {
    width: 32px;
    height: 32px;
}

.empty-state h3 {
    font-size: 20px;
    color: #374151;
    margin: 0 0 8px;
    font-weight: 700;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
    .content-wrapper {
        padding: 0 20px 40px;
    }
    
    .stats-row {
        flex-direction: column;
    }
    
    .tabs {
        flex-wrap: wrap;
    }
    
    .tab-btn {
        flex: none;
        width: calc(50% - 4px);
    }

    .submissions-grid {
        grid-template-columns: 1fr;
    }
}
</style>
