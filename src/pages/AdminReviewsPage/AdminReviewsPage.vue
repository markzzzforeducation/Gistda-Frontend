<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGalleryStore, type Submission } from '../../stores/gallery';

const galleryStore = useGalleryStore();

const activeTab = ref<'pending' | 'published' | 'all'>('pending');

const filteredSubmissions = computed(() => {
    if (activeTab.value === 'pending') return galleryStore.pendingSubmissions;
    if (activeTab.value === 'published') return galleryStore.publishedSubmissions;
    return galleryStore.submissions;
});

onMounted(async () => {
    await galleryStore.fetchSubmissions();
});

async function updateStatus(id: string, status: Submission['status']) {
    if (confirm(`Are you sure you want to mark this as ${status}?`)) {
        await galleryStore.updateSubmissionStatus(id, status);
    }
}

function deleteSubmission(id: string) {
    if (confirm('Are you sure you want to delete this submission?')) {
        galleryStore.deleteSubmission(id);
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'published': return 'bg-green-100 text-green-800';
        case 'approved': return 'bg-blue-100 text-blue-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
}
</script>

<template>
    <div class="reviews-page">
        <div class="page-container">
            <div class="page-header">
                <h1 class="page-title">Submission Reviews</h1>
                <p class="page-subtitle">Review and publish intern project posters.</p>
            </div>

            <div class="tabs">
                <button 
                    v-for="tab in ['pending', 'published', 'all']" 
                    :key="tab"
                    @click="activeTab = tab as any"
                    class="tab-btn"
                    :class="{ active: activeTab === tab }"
                >
                    {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                </button>
            </div>

            <div class="submissions-grid" v-if="filteredSubmissions.length">
                <div v-for="sub in filteredSubmissions" :key="sub.id" class="review-card">
                    <div class="card-image">
                        <img :src="sub.imageUrl" :alt="sub.title" />
                        <div class="status-overlay">
                            <span class="status-badge" :class="getStatusColor(sub.status)">
                                {{ sub.status }}
                            </span>
                        </div>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">{{ sub.title }}</h3>
                        <p class="student-name">by {{ sub.studentName }}</p>
                        <p class="card-abstract">{{ sub.abstract }}</p>
                        
                        <div class="card-actions">
                            <div v-if="sub.status === 'pending'" class="pending-actions">
                                <button @click="updateStatus(sub.id, 'published')" class="btn-action approve">
                                    Approve & Publish
                                </button>
                                <button @click="updateStatus(sub.id, 'rejected')" class="btn-action reject">
                                    Reject
                                </button>
                            </div>
                            <div v-else class="other-actions">
                                <button v-if="sub.status !== 'published'" @click="updateStatus(sub.id, 'published')" class="btn-text">
                                    Publish
                                </button>
                                <button v-if="sub.status === 'published'" @click="updateStatus(sub.id, 'pending')" class="btn-text">
                                    Unpublish
                                </button>
                                <button @click="deleteSubmission(sub.id)" class="btn-text danger">
                                    Delete
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
</template>

<style scoped>
.reviews-page {
    min-height: 100vh;
    background: #f8fafc;
    padding: 40px 20px;
}

.page-container {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 30px;
}

.page-title {
    font-size: 32px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 8px 0;
}

.page-subtitle {
    color: #64748b;
    font-size: 16px;
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
}

.tab-btn:hover {
    color: #334155;
}

.tab-btn.active {
    color: #667eea;
    border-bottom-color: #667eea;
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
    margin: 0 0 20px 0;
    flex: 1;
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

.btn-text.danger {
    color: #ef4444;
}

.btn-text.danger:hover {
    color: #dc2626;
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
