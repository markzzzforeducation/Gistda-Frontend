<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGalleryStore } from '../../stores/gallery';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';

const galleryStore = useGalleryStore();
const auth = useAuthStore();
const router = useRouter();

const title = ref('');
const abstract = ref('');
const imageUrl = ref('');
const projectLink = ref('');
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const isSubmitting = ref(false);

// File upload state
const posterFile = ref<File | null>(null);
const imagePreview = ref('');

// Computed for role-based dashboard path
const dashboardPath = computed(() => {
    const role = auth.currentUser?.role;
    if (role === 'admin') return '/admin';
    if (role === 'mentor') return '/mentor';
    if (role === 'intern') return '/intern';
    return '/dashboard';
});

const mySubmissions = computed(() => {
    return auth.currentUser ? galleryStore.mySubmissions(auth.currentUser.id) : [];
});

onMounted(async () => {
    await galleryStore.fetchSubmissions();
});

function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) {
            showMessage('ไฟล์ต้องมีขนาดไม่เกิน 10MB', 'error');
            return;
        }
        posterFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target?.result as string;
            imageUrl.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    posterFile.value = null;
    imagePreview.value = '';
    imageUrl.value = '';
}

async function submitProject() {
    if (!title.value || !abstract.value || !imageUrl.value || !auth.currentUser) return;
    
    isSubmitting.value = true;
    try {
        await galleryStore.createSubmission({
            title: title.value,
            abstract: abstract.value,
            imageUrl: imageUrl.value,
            projectLink: projectLink.value || undefined,
            studentName: auth.currentUser.name,
            studentId: auth.currentUser.id,
        });
        showMessage('ส่งโปสเตอร์ให้ Mentor พิจารณาแล้ว! รอการอนุมัติ', 'success');
        title.value = '';
        abstract.value = '';
        imageUrl.value = '';
        projectLink.value = '';
        posterFile.value = null;
        imagePreview.value = '';
    } catch (e: any) {
        showMessage('เกิดข้อผิดพลาด: ' + e.message, 'error');
    } finally {
        isSubmitting.value = false;
    }
}

function showMessage(msg: string, type: 'success' | 'error') {
    message.value = msg;
    messageType.value = type;
    setTimeout(() => message.value = '', 5000);
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'published': return 'เผยแพร่แล้ว';
        case 'approved': return 'อนุมัติแล้ว';
        case 'rejected': return 'ถูกปฏิเสธ';
        default: return 'รอตรวจสอบ';
    }
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
                            <h1 class="page-title">ส่งโปสเตอร์โครงการ</h1>
                            <p class="page-subtitle">อัปโหลดโปสเตอร์เพื่อแสดงในแกลเลอรี</p>
                        </div>
                    </div>
                </div>

                <!-- Message -->
                <div v-if="message" class="message-box" :class="messageType">
                    {{ message }}
                </div>

                <div class="content-grid">
                    <!-- Submission Form -->
                    <div class="form-card">
                        <h2 class="card-title">สร้างโปสเตอร์ใหม่</h2>
                        
                        <div class="form-layout">
                            <div class="form-left">
                                <div class="form-group">
                                    <label>ชื่อโปรเจค *</label>
                                    <input v-model="title" placeholder="กรอกชื่อโปรเจค" />
                                </div>
                                
                                <div class="form-group">
                                    <label>บทคัดย่อ *</label>
                                    <textarea v-model="abstract" placeholder="สรุปโปรเจคของคุณโดยย่อ รวมถึงผู้วิจัย ที่ปรึกษา ฯลฯ" rows="5"></textarea>
                                </div>

                                <div class="form-group">
                                    <label>ลิงก์โปรเจค (ไม่บังคับ)</label>
                                    <input v-model="projectLink" type="url" placeholder="https://github.com/username/project" />
                                </div>
                            </div>

                            <div class="form-right">
                                <div class="form-group">
                                    <label>รูปภาพโปสเตอร์ *</label>
                                    <div class="upload-area">
                                        <input 
                                            type="file" 
                                            @change="handleFileUpload" 
                                            accept="image/*" 
                                            class="file-input" 
                                            id="poster-upload"
                                        />
                                        <label for="poster-upload" class="upload-placeholder" v-if="!imagePreview">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                            </svg>
                                            <p>คลิกเพื่ออัปโหลดโปสเตอร์</p>
                                            <span>PNG, JPG ไม่เกิน 10MB</span>
                                        </label>
                                        <div v-else class="image-preview-container">
                                            <img :src="imagePreview" alt="Preview" class="preview-img" />
                                            <button type="button" @click="removeImage" class="remove-image-btn">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button @click="submitProject" :disabled="isSubmitting || !title || !abstract || !imageUrl" class="btn-primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {{ isSubmitting ? 'กำลังส่ง...' : 'ส่งโปสเตอร์' }}
                        </button>
                    </div>

                    <!-- My Submissions -->
                    <div class="submissions-section">
                        <h2 class="section-title">โปสเตอร์ของฉัน</h2>
                        <div v-if="mySubmissions.length === 0" class="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>ยังไม่มีโปสเตอร์</p>
                            <span>ส่งโปสเตอร์แรกของคุณเลย!</span>
                        </div>
                        <div v-else class="submission-cards">
                            <div v-for="sub in mySubmissions" :key="sub.id" class="submission-card">
                                <div class="card-header">
                                    <span class="status-badge" :class="`status-${sub.status}`">
                                        {{ getStatusLabel(sub.status) }}
                                    </span>
                                    <span class="date">{{ new Date(sub.submittedAt).toLocaleDateString('th-TH') }}</span>
                                </div>
                                <h3 class="sub-title">{{ sub.title }}</h3>
                                <p class="sub-abstract">{{ sub.abstract }}</p>
                            </div>
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

.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
}

@media (max-width: 900px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}

.form-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    padding: 30px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin: 0 0 24px 0;
}

.form-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
}

@media (max-width: 700px) {
    .form-layout {
        grid-template-columns: 1fr;
    }
}

.form-left, .form-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
}

.form-group input, .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: white;
    font-size: 14px;
    transition: all 0.2s;
}

.form-group input:focus, .form-group textarea:focus {
    outline: none;
    border-color: #003d82;
    box-shadow: 0 0 0 3px rgba(0, 61, 130, 0.2);
}

.form-group input::placeholder, .form-group textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

/* Upload Area */
.upload-area {
    position: relative;
    min-height: 280px;
}

.file-input {
    display: none;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 280px;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
    padding: 20px;
}

.upload-placeholder:hover {
    border-color: #003d82;
    background: rgba(0, 61, 130, 0.1);
}

.upload-placeholder svg {
    width: 48px;
    height: 48px;
    color: rgba(255, 255, 255, 0.4);
}

.upload-placeholder p {
    font-size: 15px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
}

.upload-placeholder span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
}

.image-preview-container {
    position: relative;
    width: 100%;
    min-height: 280px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-img {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
}

.remove-image-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    background: rgba(239, 68, 68, 0.9);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.remove-image-btn:hover {
    background: #ef4444;
    transform: scale(1.1);
}

.remove-image-btn svg {
    width: 18px;
    height: 18px;
    color: white;
}

.btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 61, 130, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary svg {
    width: 20px;
    height: 20px;
}

.submissions-section {
    /* align-self: flex-start; */
}

.section-title {
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin: 0 0 24px 0;
}

.empty-state {
    text-align: center;
    padding: 50px 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    border: 1px dashed rgba(255, 255, 255, 0.2);
}

.empty-state svg {
    width: 64px;
    height: 64px;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 16px;
}

.empty-state p {
    color: white;
    font-weight: 600;
    margin: 0 0 8px;
}

.empty-state span {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
}

.submission-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.submission-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s;
}

.submission-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.2);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.status-pending { background: rgba(234, 179, 8, 0.3); color: #fde047; }
.status-approved { background: rgba(59, 130, 246, 0.3); color: #93c5fd; }
.status-published { background: rgba(34, 197, 94, 0.3); color: #86efac; }
.status-rejected { background: rgba(239, 68, 68, 0.3); color: #fca5a5; }

.date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
}

.sub-title {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin: 0 0 8px 0;
}

.sub-abstract {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
}

@media (max-width: 768px) {
    .content-wrapper {
        padding: 0 20px 40px;
    }

    .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
}
</style>
