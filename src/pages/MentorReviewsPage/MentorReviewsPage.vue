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
            <div class="page-header">
                <div class="header-left">
                    <button class="back-button" @click="$router.push('/mentor')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับ
                    </button>
                    <div>
                        <h1 class="page-title">ตรวจสอบโปสเตอร์</h1>
                        <p class="page-subtitle">อนุมัติโปสเตอร์โครงการของนิสิต</p>
                    </div>
                </div>
            </div>

            <div class="tabs">
                <button 
                    v-for="tab in ['pending', 'approved', 'rejected', 'all']" 
                    :key="tab"
                    @click="activeTab = tab as any"
                    class="tab-btn"
                    :class="{ active: activeTab === tab }"
                >
                    {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                    <span v-if="tab === 'approved'" class="tab-note">(Awaiting Admin)</span>
                </button>
            </div>

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
                        <p class="student-name">by {{ sub.studentName }}</p>
                        <p class="card-abstract">{{ sub.abstract }}</p>
                        
                        <div v-if="sub.projectLink" class="project-link">
                            <a :href="sub.projectLink" target="_blank" rel="noopener noreferrer">
                                🔗 View Project
                            </a>
                        </div>
                        
                        <div class="card-actions">
                            <div v-if="sub.status === 'pending'" class="pending-actions">
                                <button @click="approveSubmission(sub.id)" class="btn-action approve">
                                    Approve
                                </button>
                                <button @click="rejectSubmission(sub.id)" class="btn-action reject">
                                    Reject
                                </button>
                            </div>
                            <div v-else class="other-actions">
                                <button v-if="sub.status !== 'pending'" @click="returnToPending(sub.id)" class="btn-text">
                                    Return to Pending
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="empty-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3>No submissions found</h3>
                <p>There are no submissions in this category.</p>
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border-radius: 16px;
    padding: 24px 32px;
    margin-bottom: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: linear-gradient(135deg, #0f172a, #003d82);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    color: white;
    font-weight: 500;
    transition: all 0.3s;
}

.back-button:hover {
    transform: translateX(-4px);
    box-shadow: 0 4px 12px rgba(0, 61, 130, 0.3);
}

.back-button svg {
    width: 20px;
    height: 20px;
}

.page-title {
    font-size: 28px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 4px 0;
}

.page-subtitle {
    color: #64748b;
    font-size: 14px;
    margin: 0;
}

.tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 30px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 1px;
}

.tab-btn {
    padding: 10px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.tab-btn:hover {
    color: #334155;
}

.tab-btn.active {
    color: #667eea;
    border-bottom-color: #667eea;
}

.tab-note {
    font-size: 12px;
    font-weight: 400;
    opacity: 0.7;
}

.submissions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
}

.review-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
}

.card-image {
    height: 200px;
    position: relative;
    background: #f1f5f9;
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
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-content {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-title {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 4px 0;
    line-height: 1.4;
}

.student-name {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 12px 0;
}

.card-abstract {
    font-size: 14px;
    color: #475569;
    line-height: 1.5;
    margin: 0 0 12px 0;
    flex: 1;
}

.project-link {
    margin-bottom: 16px;
}

.project-link a {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
}

.project-link a:hover {
    text-decoration: underline;
}

.card-actions {
    border-top: 1px solid #e2e8f0;
    padding-top: 16px;
}

.pending-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.btn-action {
    padding: 10px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
}

.btn-action.approve {
    background: #dcfce7;
    color: #166534;
}

.btn-action.approve:hover {
    background: #bbf7d0;
}

.btn-action.reject {
    background: #fee2e2;
    color: #991b1b;
}

.btn-action.reject:hover {
    background: #fecaca;
}

.other-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn-text {
    background: none;
    border: none;
    font-weight: 600;
    font-size: 14px;
    color: #64748b;
    cursor: pointer;
}

.btn-text:hover {
    color: #334155;
    text-decoration: underline;
}

.empty-state {
    text-align: center;
    padding: 60px;
    color: #94a3b8;
}

.empty-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    color: #cbd5e1;
}
</style>
