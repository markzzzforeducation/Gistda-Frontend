<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useProjectPlanStore, type ProjectPlan } from '../../stores/projectPlans';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';

const planStore = useProjectPlanStore();
const auth = useAuthStore();
const router = useRouter();

// State
const isLoading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const planToDelete = ref<ProjectPlan | null>(null);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

// Form data
const formData = ref({
    id: '',
    projectTitle: '',
    objectives: '',
    description: '',
    mentorId: '',
    startDate: '',
    endDate: '',
    status: 'draft' as 'draft' | 'active' | 'completed'
});

const statusOptions = [
    { value: 'draft', label: 'ฉบับร่าง', color: 'gray' },
    { value: 'active', label: 'กำลังดำเนินการ', color: 'blue' },
    { value: 'completed', label: 'เสร็จสิ้น', color: 'green' }
];

const isIntern = computed(() => auth.currentUser?.role === 'intern');
const isMentor = computed(() => auth.currentUser?.role === 'mentor');
const isAdmin = computed(() => auth.currentUser?.role === 'admin');

// Computed for role-based dashboard path
const dashboardPath = computed(() => {
    const role = auth.currentUser?.role;
    if (role === 'admin') return '/admin';
    if (role === 'mentor') return '/mentor';
    if (role === 'intern') return '/intern';
    return '/dashboard';
});

onMounted(async () => {
    isLoading.value = true;
    try {
        await Promise.all([
            planStore.fetchPlans(),
            planStore.fetchMentors()
        ]);
    } catch (error) {
        console.error('Failed to load data:', error);
    } finally {
        isLoading.value = false;
    }
});

function openCreateModal() {
    formData.value = {
        id: '',
        projectTitle: '',
        objectives: '',
        description: '',
        mentorId: '',
        startDate: '',
        endDate: '',
        status: 'draft'
    };
    isEditing.value = false;
    showModal.value = true;
}

function openEditModal(plan: ProjectPlan) {
    formData.value = {
        id: plan.id,
        projectTitle: plan.projectTitle,
        objectives: plan.objectives,
        description: plan.description || '',
        mentorId: plan.mentorId || '',
        startDate: plan.startDate ? plan.startDate.slice(0, 10) : '',
        endDate: plan.endDate ? plan.endDate.slice(0, 10) : '',
        status: plan.status
    };
    isEditing.value = true;
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
}

async function handleSubmit() {
    if (!formData.value.projectTitle || !formData.value.objectives) {
        showMessage('กรุณากรอกหัวข้อและวัตถุประสงค์', 'error');
        return;
    }

    isLoading.value = true;
    try {
        const payload = {
            projectTitle: formData.value.projectTitle,
            objectives: formData.value.objectives,
            description: formData.value.description || undefined,
            mentorId: formData.value.mentorId || undefined,
            startDate: formData.value.startDate || undefined,
            endDate: formData.value.endDate || undefined,
            status: formData.value.status
        };

        if (isEditing.value) {
            await planStore.updatePlan(formData.value.id, payload);
            showMessage('แก้ไขแผนงานสำเร็จ!', 'success');
        } else {
            await planStore.createPlan(payload);
            showMessage('สร้างแผนงานสำเร็จ!', 'success');
        }
        closeModal();
    } catch (error: any) {
        showMessage(error.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
        isLoading.value = false;
    }
}

function confirmDelete(plan: ProjectPlan) {
    planToDelete.value = plan;
    showDeleteConfirm.value = true;
}

async function deletePlan() {
    if (!planToDelete.value) return;
    
    isLoading.value = true;
    try {
        await planStore.deletePlan(planToDelete.value.id);
        showMessage('ลบแผนงานสำเร็จ!', 'success');
    } catch (error: any) {
        showMessage(error.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
        isLoading.value = false;
        showDeleteConfirm.value = false;
        planToDelete.value = null;
    }
}

function showMessage(msg: string, type: 'success' | 'error') {
    message.value = msg;
    messageType.value = type;
    setTimeout(() => message.value = '', 3000);
}

function formatDate(dateStr?: string) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getStatusLabel(status: string) {
    return statusOptions.find(s => s.value === status)?.label || status;
}

function canEdit(plan: ProjectPlan): boolean {
    if (isAdmin.value) return true;
    if (isIntern.value && plan.internId === auth.currentUser?.id) return true;
    return false;
}
</script>

<template>
    <div class="app-container">
        <GistdaHeader />
        <div class="space-background"></div>
        
        <div class="main-content">
            <div class="content-wrapper">
                <!-- Page Header -->
                <div class="page-header">
                    <div class="header-left">
                        <button class="back-button" @click="router.push(dashboardPath)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            กลับ
                        </button>
                        <div>
                            <h1 class="page-title">แผนงานโปรเจค</h1>
                            <p class="page-subtitle">{{ isIntern ? 'แผนงานของฉัน' : 'แผนงานนิสิตฝึกงาน' }}</p>
                        </div>
                    </div>
                    <button v-if="isIntern || isAdmin" class="btn-primary" @click="openCreateModal">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        สร้างแผนงานใหม่
                    </button>
                </div>

                <!-- Message -->
                <div v-if="message" class="message-box" :class="messageType">
                    {{ message }}
                </div>

                <!-- Loading -->
                <div v-if="isLoading" class="loading-overlay">
                    <div class="spinner"></div>
                </div>

                <!-- Plans Grid -->
                <div v-if="planStore.plans.length === 0 && !isLoading" class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3>ยังไม่มีแผนงาน</h3>
                    <p v-if="isIntern">คลิก "สร้างแผนงานใหม่" เพื่อเริ่มต้น</p>
                    <p v-else>นิสิตยังไม่ได้สร้างแผนงาน</p>
                </div>

                <div v-else class="plans-grid">
                    <div v-for="plan in planStore.plans" :key="plan.id" class="plan-card">
                        <div class="plan-header">
                            <span class="status-badge" :class="`status-${plan.status}`">
                                {{ getStatusLabel(plan.status) }}
                            </span>
                            <div v-if="canEdit(plan)" class="plan-actions">
                                <button @click="openEditModal(plan)" class="btn-icon" title="แก้ไข">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button @click="confirmDelete(plan)" class="btn-icon delete" title="ลบ">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <h3 class="plan-title">{{ plan.projectTitle }}</h3>
                        
                        <div class="plan-section">
                            <label>วัตถุประสงค์</label>
                            <p>{{ plan.objectives }}</p>
                        </div>
                        
                        <div v-if="plan.description" class="plan-section">
                            <label>รายละเอียด</label>
                            <p>{{ plan.description }}</p>
                        </div>
                        
                        <div class="plan-meta">
                            <div class="meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{{ plan.Intern?.name || 'ไม่ระบุ' }}</span>
                            </div>
                            <div v-if="plan.Mentor" class="meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>พี่เลี้ยง: {{ plan.Mentor.name }}</span>
                            </div>
                            <div v-if="plan.startDate || plan.endDate" class="meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{{ formatDate(plan.startDate) }} - {{ formatDate(plan.endDate) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Create/Edit Modal -->
                <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
                    <div class="modal">
                        <div class="modal-header">
                            <h2>{{ isEditing ? 'แก้ไขแผนงาน' : 'สร้างแผนงานใหม่' }}</h2>
                            <button @click="closeModal" class="close-btn">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>หัวข้อโปรเจค *</label>
                                <input v-model="formData.projectTitle" type="text" placeholder="กรอกหัวข้อโปรเจค" />
                            </div>
                            <div class="form-group">
                                <label>วัตถุประสงค์ *</label>
                                <textarea v-model="formData.objectives" placeholder="กรอกวัตถุประสงค์ของโปรเจค" rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label>รายละเอียดเพิ่มเติม</label>
                                <textarea v-model="formData.description" placeholder="รายละเอียดอื่นๆ (ถ้ามี)" rows="2"></textarea>
                            </div>
                            <div class="form-group">
                                <label>พี่เลี้ยง</label>
                                <select v-model="formData.mentorId">
                                    <option value="">-- ไม่ระบุ --</option>
                                    <option v-for="mentor in planStore.mentors" :key="mentor.id" :value="mentor.id">
                                        {{ mentor.name }} ({{ mentor.email }})
                                    </option>
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>วันเริ่มต้น</label>
                                    <input v-model="formData.startDate" type="date" />
                                </div>
                                <div class="form-group">
                                    <label>วันสิ้นสุด</label>
                                    <input v-model="formData.endDate" type="date" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label>สถานะ</label>
                                <select v-model="formData.status">
                                    <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                                        {{ status.label }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button @click="closeModal" class="btn-secondary">ยกเลิก</button>
                            <button @click="handleSubmit" class="btn-primary" :disabled="isLoading">
                                {{ isLoading ? 'กำลังบันทึก...' : (isEditing ? 'บันทึก' : 'สร้างแผนงาน') }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Delete Confirmation Modal -->
                <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
                    <div class="modal confirm-modal">
                        <div class="modal-header">
                            <h2>ยืนยันการลบ</h2>
                        </div>
                        <div class="modal-body">
                            <p>คุณต้องการลบแผนงาน "{{ planToDelete?.projectTitle }}" ใช่หรือไม่?</p>
                            <p class="warning-text">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                        </div>
                        <div class="modal-footer">
                            <button @click="showDeleteConfirm = false" class="btn-secondary">ยกเลิก</button>
                            <button @click="deletePlan" class="btn-danger" :disabled="isLoading">
                                {{ isLoading ? 'กำลังลบ...' : 'ยืนยันลบ' }}
                            </button>
                        </div>
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
    margin-bottom: 30px;
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
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    cursor: pointer;
    color: white;
    font-weight: 500;
    transition: all 0.3s;
}

.back-button:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-4px);
}

.back-button svg {
    width: 20px;
    height: 20px;
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

.btn-primary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 61, 130, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn-primary svg {
    width: 18px;
    height: 18px;
}

.message-box {
    padding: 14px 20px;
    border-radius: 12px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 20px;
}

.message-box.success {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.message-box.error {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-state svg {
    width: 64px;
    height: 64px;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 16px;
}

.empty-state h3 {
    color: white;
    margin: 0 0 8px;
}

.empty-state p {
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
}

.plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
}

.plan-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 24px;
    transition: all 0.3s;
}

.plan-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.2);
}

.plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.status-draft { background: rgba(107, 114, 128, 0.3); color: #d1d5db; }
.status-active { background: rgba(59, 130, 246, 0.3); color: #93c5fd; }
.status-completed { background: rgba(34, 197, 94, 0.3); color: #86efac; }

.plan-actions {
    display: flex;
    gap: 8px;
}

.btn-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.btn-icon.delete:hover {
    background: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
}

.btn-icon svg {
    width: 16px;
    height: 16px;
}

.plan-title {
    font-size: 18px;
    font-weight: 700;
    color: white;
    margin: 0 0 16px;
}

.plan-section {
    margin-bottom: 12px;
}

.plan-section label {
    display: block;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.plan-section p {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
}

.plan-meta {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
}

.meta-item svg {
    width: 16px;
    height: 16px;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
    padding: 20px;
}

.modal {
    background: #1a1f3a;
    border-radius: 20px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.confirm-modal {
    max-width: 400px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
    color: white;
}

.close-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 28px;
    cursor: pointer;
    line-height: 1;
}

.close-btn:hover {
    color: white;
}

.modal-body {
    padding: 24px;
}

.modal-body p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 12px;
}

.warning-text {
    color: #fca5a5 !important;
    font-size: 13px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    margin-bottom: 8px;
    font-size: 14px;
}

.form-group input, .form-group textarea, .form-group select {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: white;
    font-size: 14px;
    transition: all 0.2s;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
    outline: none;
    border-color: #003d82;
    box-shadow: 0 0 0 3px rgba(0, 61, 130, 0.2);
}

.form-group select option {
    background: #1a1f3a;
    color: white;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary {
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
    padding: 12px 24px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-danger:hover {
    background: #dc2626;
}

.btn-danger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .content-wrapper {
        padding: 0 20px 40px;
    }

    .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .header-left {
        flex-direction: column;
        align-items: flex-start;
    }

    .plans-grid {
        grid-template-columns: 1fr;
    }

    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>
