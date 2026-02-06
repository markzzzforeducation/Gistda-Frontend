<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGalleryStore, type Submission } from '../../stores/gallery';
import GistdaHeader from '../../components/GistdaHeader.vue';

const galleryStore = useGalleryStore();

const activeTab = ref<'pending' | 'mentor_approved' | 'published' | 'all'>('pending');

// Confirmation Modal State
const showConfirmModal = ref(false);
const confirmModalType = ref<'publish' | 'reject' | 'unpublish' | 'delete' | 'warning'>('publish');
const confirmSubmissionId = ref<string>('');

const modalConfig = computed(() => {
    switch (confirmModalType.value) {
        case 'publish':
            return {
                title: 'ยืนยันการเผยแพร่',
                message: 'คุณต้องการอนุมัติและเผยแพร่โปสเตอร์นี้หรือไม่? โปสเตอร์จะแสดงใน Public Gallery',
                confirmText: 'อนุมัติ & เผยแพร่',
                confirmClass: 'btn-confirm-publish',
                iconClass: 'icon-publish'
            };
        case 'reject':
            return {
                title: 'ยืนยันการปฏิเสธ',
                message: 'คุณต้องการปฏิเสธโปสเตอร์นี้หรือไม่? นิสิตจะได้รับแจ้งว่าโปสเตอร์ถูกปฏิเสธ',
                confirmText: 'ปฏิเสธ',
                confirmClass: 'btn-confirm-reject',
                iconClass: 'icon-reject'
            };
        case 'unpublish':
            return {
                title: 'ยกเลิกการเผยแพร่',
                message: 'คุณต้องการยกเลิกการเผยแพร่โปสเตอร์นี้หรือไม่? โปสเตอร์จะถูกย้ายกลับไปสถานะรอตรวจสอบ',
                confirmText: 'ยกเลิกเผยแพร่',
                confirmClass: 'btn-confirm-unpublish',
                iconClass: 'icon-unpublish'
            };

        case 'warning':
            return {
                title: 'ไม่สามารถเผยแพร่ได้',
                message: 'โปสเตอร์นี้ยังไม่ได้รับการอนุมัติจาก Mentor กรุณารอ Mentor อนุมัติก่อนทำการเผยแพร่',
                confirmText: 'ตกลง',
                confirmClass: 'btn-confirm-warning',
                iconClass: 'icon-warning',
                hideCancel: true
            };
        default:
            return {
                title: 'ยืนยันการลบ',
                message: 'คุณต้องการลบโปสเตอร์นี้หรือไม่? การดำเนินการนี้ไม่สามารถเลิกทำได้',
                confirmText: 'ลบ',
                confirmClass: 'btn-confirm-delete',
                iconClass: 'icon-delete'
            };
    }
});

const filteredSubmissions = computed(() => {
    if (activeTab.value === 'pending') return galleryStore.pendingSubmissions;
    if (activeTab.value === 'mentor_approved') return galleryStore.mentorApprovedSubmissions;
    if (activeTab.value === 'published') return galleryStore.publishedSubmissions;
    return galleryStore.submissions;
});

onMounted(async () => {
    await galleryStore.fetchSubmissions();
});

function openConfirmModal(type: 'publish' | 'reject' | 'unpublish' | 'delete' | 'warning', id: string) {
    // Immediate check for Publish action on unapproved posters
    if (type === 'publish') {
        const submission = galleryStore.getSubmissionById(id);
        if (submission && submission.status !== 'mentor_approved') {
            type = 'warning';
        }
    }

    confirmModalType.value = type;
    confirmSubmissionId.value = id;
    showConfirmModal.value = true;
}

function closeConfirmModal() {
    showConfirmModal.value = false;
    confirmSubmissionId.value = '';
}

async function handleConfirm() {
    const id = confirmSubmissionId.value;
    const type = confirmModalType.value;
    
    closeConfirmModal();
    
    if (type === 'publish') {
        try {
            await galleryStore.updateSubmissionStatus(id, 'published');
        } catch (error: any) {
            // Check if it's the specific approval error
            if (error.response && error.response.status === 400 && error.response.data.error.includes('Mentor')) {
                // Show Warning Modal
                // We'll reuse the confirm modal but with warning config
                confirmModalType.value = 'warning';
                showConfirmModal.value = true;
                return;
            }
            console.error('Failed to publish', error);
        }
    } else if (type === 'reject') {
        await galleryStore.updateSubmissionStatus(id, 'rejected');
    } else if (type === 'unpublish') {
        await galleryStore.updateSubmissionStatus(id, 'pending');
    } else if (type === 'delete') {
        await galleryStore.deleteSubmission(id);
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'published': return 'bg-green-100 text-green-800';
        case 'mentor_approved': return 'bg-blue-100 text-blue-800';
        case 'approved': return 'bg-blue-100 text-blue-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'mentor_approved': return 'Mentor Approved';
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
                <button class="back-btn" @click="$router.push('/admin')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับไปหน้า Admin Dashboard
                </button>

                <!-- Page Header -->
                <div class="page-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 class="page-title">อนุมัติโปสเตอร์ขั้นสุดท้าย</h1>
                            <p class="page-subtitle">ตรวจสอบและอนุมัติโปสเตอร์ที่ผ่านการตรวจจาก Mentor แล้ว</p>
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
                            <span class="stat-label">รอ Mentor ตรวจ</span>
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
                            <span class="stat-label">รอ Admin อนุมัติ</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">{{ galleryStore.publishedSubmissions.length }}</span>
                            <span class="stat-label">เผยแพร่แล้ว</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">{{ galleryStore.submissions.length }}</span>
                            <span class="stat-label">ทั้งหมด</span>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tabs-container">
                    <div class="tabs">
                        <button 
                            v-for="tab in [
                                { key: 'pending', label: 'รอ Mentor ตรวจ' },
                                { key: 'mentor_approved', label: 'รอ Admin อนุมัติ' },
                                { key: 'published', label: 'เผยแพร่แล้ว' },
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
                            
                            <div class="card-actions">
                                <div v-if="sub.status === 'mentor_approved'" class="pending-actions">
                                    <button @click="openConfirmModal('publish', sub.id)" class="btn-action approve">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        อนุมัติ & เผยแพร่
                                    </button>
                                    <button @click="openConfirmModal('reject', sub.id)" class="btn-action reject">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        ปฏิเสธ
                                    </button>
                                </div>
                                <div v-else class="other-actions">
                                    <button v-if="sub.status !== 'published'" @click="openConfirmModal('publish', sub.id)" class="btn-text publish">
                                        เผยแพร่
                                    </button>
                                    <button v-if="sub.status === 'published'" @click="openConfirmModal('unpublish', sub.id)" class="btn-text">
                                        ยกเลิกเผยแพร่
                                    </button>
                                    <button @click="openConfirmModal('delete', sub.id)" class="btn-text danger">
                                        ลบ
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

        <!-- Custom Confirmation Modal -->
        <Teleport to="body">
            <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
                <div class="confirm-modal" @click.stop>
                    <div class="modal-icon" :class="modalConfig.iconClass">
                        <svg v-if="confirmModalType === 'publish'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <svg v-else-if="confirmModalType === 'reject'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <svg v-else-if="confirmModalType === 'unpublish'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <svg v-else-if="confirmModalType === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 class="modal-title">{{ modalConfig.title }}</h3>
                    <p class="modal-message">{{ modalConfig.message }}</p>
                    <div class="modal-actions">
                        <button v-if="!modalConfig.hideCancel" class="btn-cancel" @click="closeConfirmModal">ยกเลิก</button>
                        <button :class="['btn-confirm', modalConfig.confirmClass]" @click="confirmModalType === 'warning' ? closeConfirmModal() : handleConfirm()">
                            {{ modalConfig.confirmText }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
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

.stat-icon.blue {
    background: rgba(59, 130, 246, 0.15);
    color: #2563eb;
}

.stat-icon.yellow {
    background: rgba(234, 179, 8, 0.15);
    color: #b45309;
}

.stat-icon.green {
    background: rgba(34, 197, 94, 0.15);
    color: #16a34a;
}

.stat-icon.purple {
    background: rgba(0, 61, 130, 0.15);
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
    margin: 0 0 20px 0;
    flex: 1;
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
    gap: 12px;
}

.btn-text {
    background: rgba(107, 114, 128, 0.1);
    border: none;
    font-weight: 600;
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
    padding: 10px 18px;
    border-radius: 10px;
    transition: all 0.3s;
}

.btn-text:hover {
    background: rgba(107, 114, 128, 0.15);
}

.btn-text.publish {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
}

.btn-text.publish:hover {
    background: rgba(34, 197, 94, 0.15);
}

.btn-text.danger {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.btn-text.danger:hover {
    background: rgba(239, 68, 68, 0.15);
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

/* Confirmation Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.confirm-modal {
    background: white;
    border-radius: 24px;
    padding: 40px;
    max-width: 420px;
    width: 90%;
    text-align: center;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to { 
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.modal-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
}

.modal-icon svg {
    width: 36px;
    height: 36px;
}

.modal-icon.icon-publish {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15));
    color: #16a34a;
}

.modal-icon.icon-reject {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15));
    color: #dc2626;
}

.modal-icon.icon-unpublish {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(202, 138, 4, 0.15));
    color: #ca8a04;
}

.modal-icon.icon-delete {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15));
    color: #dc2626;
}

.modal-icon.icon-warning {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(202, 138, 4, 0.15));
    color: #ca8a04;
}

.btn-confirm-warning {
    background: linear-gradient(135deg, #eab308, #ca8a04);
    color: white;
}

.modal-title {
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 12px;
}

.modal-message {
    font-size: 15px;
    color: #6b7280;
    line-height: 1.6;
    margin: 0 0 32px;
}

.modal-actions {
    display: flex;
    gap: 12px;
}

.btn-cancel {
    flex: 1;
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
    background: #f3f4f6;
    border: none;
    color: #4b5563;
}

.btn-cancel:hover {
    background: #e5e7eb;
}

.btn-confirm {
    flex: 1;
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
    color: white;
}

.btn-confirm-publish {
    background: linear-gradient(135deg, #22c55e, #16a34a);
}

.btn-confirm-publish:hover {
    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
    transform: translateY(-2px);
}

.btn-confirm-reject {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.btn-confirm-reject:hover {
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
    transform: translateY(-2px);
}

.btn-confirm-unpublish {
    background: linear-gradient(135deg, #eab308, #ca8a04);
}

.btn-confirm-unpublish:hover {
    box-shadow: 0 8px 20px rgba(234, 179, 8, 0.4);
    transform: translateY(-2px);
}

.btn-confirm-delete {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.btn-confirm-delete:hover {
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
    transform: translateY(-2px);
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

    .confirm-modal {
        padding: 32px 24px;
    }

    .modal-actions {
        flex-direction: column;
    }
}
</style>
