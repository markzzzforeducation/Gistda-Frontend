<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGalleryStore } from '../stores/gallery';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import GistdaHeader from '../components/GistdaHeader.vue';

const galleryStore = useGalleryStore();
const auth = useAuthStore();
const router = useRouter();

const showUploadModal = ref(false);
const title = ref('');
const studentName = ref('');
const researchers = ref('');
const advisor = ref('');
const article = ref('');
const imageUrl = ref('');
const message = ref('');
const isSubmitting = ref(false);

const allSubmissions = computed(() => {
  return auth.currentUser?.role === 'admin' 
    ? galleryStore.submissions 
    : galleryStore.publishedSubmissions;
});

onMounted(async () => {
    await galleryStore.fetchSubmissions();
    if (auth.currentUser) {
        studentName.value = auth.currentUser.name;
    }
});

async function submitProject() {
    if (!title.value || !imageUrl.value || !auth.currentUser) return;
    
    isSubmitting.value = true;
    try {
        await galleryStore.createSubmission({
            title: title.value,
            abstract: `Researchers: ${researchers.value}\nAdvisor: ${advisor.value}\n${article.value}`,
            imageUrl: imageUrl.value,
            studentName: studentName.value,
            studentId: auth.currentUser.id,
        });
        message.value = 'Project submitted successfully!';
        resetForm();
        showUploadModal.value = false;
    } catch (e: any) {
        message.value = 'Error: ' + e.message;
    } finally {
        isSubmitting.value = false;
        setTimeout(() => message.value = '', 5000);
    }
}

function resetForm() {
    title.value = '';
    researchers.value = '';
    advisor.value = '';
    article.value = '';
    imageUrl.value = '';
}

function deleteSubmission(id: string) {
    if (confirm('Delete this poster?')) {
        galleryStore.deleteSubmission(id);
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
                    <h1 class="page-title">Your Poster</h1>
                    <p class="page-subtitle">อัปโหลดและจัดการโปสเตอร์ของคุณ</p>
                </div>

                <!-- Upload Card (for logged-in users only) -->
                <div v-if="auth.currentUser" class="upload-section">
                    <div class="upload-card" @click="showUploadModal = true">
                        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7l9 6 9-6"/>
                        </svg>
                        <div class="upload-text">
                            <h3>อัปโหลดโปสเตอร์</h3>
                            <p>เริ่มจัดการโปสเตอร์โครงการของคุณ</p>
                        </div>
                    </div>
                    <button class="upload-button" @click="showUploadModal = true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        อัปโหลด
                    </button>
                </div>

                <!-- Posters Section -->
                <div class="posters-section">
                    <h2 class="section-title">โปสเตอร์ทั้งหมด</h2>
                    <div class="posters-grid">
                        <div v-for="poster in allSubmissions" :key="poster.id" class="poster-card">
                            <div class="poster-card-header">
                                <h3 class="poster-card-title">{{ poster.title }}</h3>
                                <div class="poster-actions">
                                    <button class="action-btn" v-if="auth.currentUser?.role === 'admin'" @click="deleteSubmission(poster.id)">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                    <button class="action-btn">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                        </svg>
                                    </button>
                                    <button class="action-btn">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <p class="poster-author">{{ poster.studentName }}</p>
                            <div class="poster-image">
                                <img :src="poster.imageUrl" :alt="poster.title" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Upload Modal -->
        <div v-if="showUploadModal" class="modal-overlay" @click="showUploadModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2>Upload Project Poster</h2>
                    <button class="close-btn" @click="showUploadModal = false">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-left">
                        <div class="form-group">
                            <label>Project Title</label>
                            <input v-model="title" type="text" placeholder="Enter title" />
                        </div>
                        <div class="form-group">
                            <label>Student Name</label>
                            <input v-model="studentName" type="text" placeholder="Enter name" />
                        </div>
                        <div class="form-group">
                            <label>Researchers</label>
                            <input v-model="researchers" type="text" placeholder="Enter researchers" />
                        </div>
                        <div class="form-group">
                            <label>Advisor</label>
                            <input v-model="advisor" type="text" placeholder="Enter advisor" />
                        </div>
                        <div class="form-group">
                            <label>Article</label>
                            <input v-model="article" type="text" placeholder="Enter description" />
                        </div>
                    </div>
                    <div class="form-right">
                        <div class="upload-area">
                            <input v-model="imageUrl" type="text" placeholder="Paste image URL" class="url-input" />
                            <div class="upload-placeholder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12"/>
                                </svg>
                                <p>HERE</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="submitProject" :disabled="isSubmitting || !title || !imageUrl" class="submit-btn">
                        {{ isSubmitting ? 'Uploading...' : 'Upload' }}
                    </button>
                </div>
                <div v-if="message" class="message">{{ message }}</div>
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
  background-image: url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  z-index: 0;
}

.main-content {
  position: relative;
  z-index: 1;
  padding-top: 40px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 60px;
}

.page-header {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Upload Section */
.upload-section {
    background: white;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.upload-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.2s;
}

.upload-card:hover {
    border-color: #6366f1;
    background: #f9fafb;
}

.upload-icon {
    width: 48px;
    height: 48px;
    color: #6b7280;
}

.upload-text h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
}

.upload-text p {
    font-size: 14px;
    color: #6b7280;
}

.upload-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.upload-button:hover {
    background: #4f46e5;
}

.upload-button svg {
    width: 20px;
    height: 20px;
}

/* Posters Section */
.posters-section {
    margin-top: 32px;
}

.section-title {
    font-size: 24px;
    font-weight: 700;
    color: white;
    margin-bottom: 24px;
}

.posters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
}

.poster-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
}

.poster-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.poster-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.poster-card-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    flex: 1;
}

.poster-actions {
    display: flex;
    gap: 4px;
}

.action-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #6b7280;
    transition: color 0.2s;
}

.action-btn:hover {
    color: #1f2937;
}

.action-btn svg {
    width: 18px;
    height: 18px;
}

.poster-author {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 16px;
}

.poster-image {
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 8px;
    overflow: hidden;
    background: #f3f4f6;
}

.poster-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Modal */
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
    z-index: 100;
}

.modal-content {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    overflow: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
}

.close-btn {
    background: none;
    border: none;
    font-size: 32px;
    color: #6b7280;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
}

.modal-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    padding: 32px;
}

.form-left {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.form-group input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-group input:focus {
    outline: none;
    border-color: #6366f1;
}

.form-right {
    display: flex;
    align-items: center;
    justify-content: center;
}

.upload-area {
    width: 100%;
}

.url-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 16px;
}

.upload-placeholder {
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    padding: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #6b7280;
}

.upload-placeholder svg {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
}

.upload-placeholder p {
    font-size: 16px;
    font-weight: 600;
}

.modal-footer {
    padding: 24px 32px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
}

.submit-btn {
    padding: 12px 32px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
    background: #4f46e5;
}

.submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.message {
    padding: 16px 32px;
    background: #dcfce7;
    color: #166534;
    text-align: center;
    font-size: 14px;
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 16px;
        padding: 0 20px;
    }

    .nav-links {
        gap: 16px;
    }

    .main-content {
        padding: 40px 20px;
    }

    .posters-grid {
        grid-template-columns: 1fr;
    }

    .modal-body {
        grid-template-columns: 1fr;
    }
}
</style>
