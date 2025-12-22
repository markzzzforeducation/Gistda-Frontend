<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGalleryStore } from '../../stores/gallery';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';

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
        
        <!-- Hero Section -->
        <div class="hero-section">
            <div class="hero-background"></div>
            <div class="hero-content">
                <div class="hero-frame">
                <h1 class="hero-title">
                    GISTDA INTERNSHIP<br/>
                    <span class="gradient-text">GALLERY</span>
                </h1>
                <img src="/pdimg-1.png" alt="Satellite" class="satellite-model" />
            </div>
            <p class="hero-subtitle">
                รวมผลงานและไอเดียสร้างสรรค์<br/>
                <span class="highlight-text">จากนักศึกษาฝึกงาน GISTDA</span>
            </p>
                
                <div v-if="auth.currentUser" class="hero-cta">
                    <button @click="showUploadModal = true" class="cta-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Upload Your Project
                    </button>
                </div>
                
                <div class="scroll-indicator">
                    <span>Scroll to explore</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                    </svg>
                </div>
            </div>
        </div>

        <!-- Gallery Section -->
        <div class="gallery-section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">Featured Projects</h2>
                    <p class="section-subtitle">{{ allSubmissions.length }} innovative projects by our talented interns</p>
                </div>
            </div>

            <div v-if="allSubmissions.length === 0" class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <h3>No projects yet</h3>
                <p>Be the first to showcase your amazing work!</p>
            </div>

            <div v-else class="gallery-grid">
                <div v-for="(poster, index) in allSubmissions" :key="poster.id" 
                     class="poster-card"
                     :style="{ animationDelay: `${index * 0.1}s` }">
                    <div class="poster-image-wrapper">
                        <img :src="poster.imageUrl" :alt="poster.title" class="poster-image" />
                        <div class="poster-overlay">
                            <div class="overlay-actions">
                                <button v-if="auth.currentUser?.role === 'admin'" 
                                        @click="deleteSubmission(poster.id)" 
                                        class="overlay-btn delete">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                                <button class="overlay-btn view">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="poster-info">
                        <h3 class="poster-title">{{ poster.title }}</h3>
                        <div class="poster-author">
                            <div class="author-avatar">
                                {{ poster.studentName.charAt(0).toUpperCase() }}
                            </div>
                            <span>{{ poster.studentName }}</span>
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
                                <p>Paste Image URL</p>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-container {
    min-height: 100vh;
    background: #0a0e27;
}

/* Hero Section */
.hero-section {
    position: relative;
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a1628 100%);
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=90');
    background-size: cover;
    background-position: center;
    opacity: 0.4;
    animation: backgroundFloat 20s ease-in-out infinite;
}

.hero-background::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        135deg,
        rgba(10, 14, 39, 0.85) 0%,
        rgba(26, 31, 58, 0.75) 50%,
        rgba(10, 22, 40, 0.85) 100%
    );
}

@keyframes backgroundFloat {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.05) translateY(-10px); }
}

.hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 900px;
    padding: 0 40px;
    animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.hero-frame {
    position: relative;
    border: 12px solid white;
    padding: 80px 160px;
    display: inline-block;
    margin-bottom: 40px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
}

.satellite-model {
    position: absolute;
    top: 50%;
    right: -250px;
    transform: translateY(-50%) rotate(-15deg);
    width: 450px;
    height: auto;
    z-index: 1;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
    animation: satelliteFloat 4s ease-in-out infinite;
}

@keyframes satelliteFloat {
    0%, 100% { 
        transform: translateY(-50%) rotate(-15deg);
    }
    50% { 
        transform: translateY(-55%) rotate(-12deg);
    }
}

.hero-title {
    font-size: 72px;
    font-weight: 900;
    color: white;
    margin: 0;
    line-height: 1.1;
    letter-spacing: 2px;
    text-transform: uppercase;
    position: relative;
    z-index: 10;
    text-align: center;
}

.gradient-text {
    color: white;
    display: block;
}

.hero-subtitle {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin: 0 0 48px 0;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    font-weight: 500;
}

.highlight-text {
    color: #FFD700;
    font-weight: 700;
    text-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(255, 215, 0, 0.4);
}

.hero-cta {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-bottom: 80px;
}

.cta-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 32px;
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 10px 30px rgba(0, 61, 130, 0.3);
}

.cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(0, 61, 130, 0.4);
}

.cta-primary svg {
    width: 20px;
    height: 20px;
}

.scroll-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    animation: bounce 2s ease-in-out infinite;
}

.scroll-indicator svg {
    width: 20px;
    height: 20px;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(10px); }
}

/* Gallery Section */
.gallery-section {
    position: relative;
    z-index: 1;
    padding: 80px 40px 120px;
    max-width: 1400px;
    margin: 0 auto;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 48px;
}

.section-title {
    font-size: 42px;
    font-weight: 800;
    color: white;
    margin: 0 0 8px 0;
    letter-spacing: -1px;
}

.section-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
}

.empty-state {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 80px 40px;
    text-align: center;
}

.empty-state svg {
    width: 64px;
    height: 64px;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 20px;
}

.empty-state h3 {
    font-size: 24px;
    font-weight: 700;
    color: white;
    margin: 0 0 8px 0;
}

.empty-state p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 32px;
}

.poster-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fadeIn 0.6s ease-out backwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.poster-card:hover {
    transform: translateY(-8px);
    border-color: rgba(0, 61, 130, 0.5);
    box-shadow: 0 20px 60px rgba(0, 61, 130, 0.3);
}

.poster-image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 3/4;
    overflow: hidden;
    background: linear-gradient(135deg, #1a1f3a 0%, #0a1628 100%);
}

.poster-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.poster-card:hover .poster-image {
    transform: scale(1.05);
}

.poster-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.poster-card:hover .poster-overlay {
    opacity: 1;
}

.overlay-actions {
    display: flex;
    gap: 12px;
}

.overlay-btn {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    color: #1f2937;
}

.overlay-btn:hover {
    transform: scale(1.1);
    background: white;
}

.overlay-btn.delete {
    background: rgba(239, 68, 68, 0.9);
    color: white;
}

.overlay-btn.delete:hover {
    background: #ef4444;
}

.overlay-btn svg {
    width: 20px;
    height: 20px;
}

.poster-info {
    padding: 24px;
}

.poster-title {
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin: 0 0 16px 0;
    line-height: 1.3;
}

.poster-author {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
}

.author-avatar {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 14px;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s;
}

.modal-content {
    background: white;
    border-radius: 24px;
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    overflow: auto;
    animation: slideUp 0.3s;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    font-size: 28px;
    font-weight: 800;
    color: #1f2937;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 32px;
    color: #6b7280;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #f3f4f6;
    color: #1f2937;
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
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 15px;
    transition: all 0.2s;
}

.form-group input:focus {
    outline: none;
    border-color: #003d82;
    box-shadow: 0 0 0 4px rgba(0, 61, 130, 0.1);
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
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 15px;
    margin-bottom: 16px;
}

.upload-placeholder {
    border: 2px dashed #d1d5db;
    border-radius: 16px;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
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
    padding: 14px 32px;
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 61, 130, 0.3);
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
    font-weight: 500;
}

@media (max-width: 1200px) {
    .hero-frame {
        padding: 60px 120px;
        border: 10px solid white;
    }

    .hero-title {
        font-size: 56px;
        letter-spacing: 1px;
    }

    .satellite-model {
        width: 350px;
        right: -180px;
    }

    .hero-subtitle {
        font-size: 18px;
    }
}

@media (max-width: 968px) {
    .hero-frame {
        padding: 50px 80px;
        border: 8px solid white;
    }

    .hero-title {
        font-size: 42px;
        letter-spacing: 0px;
    }

    .satellite-model {
        width: 280px;
        right: -140px;
    }

    .section-title {
        font-size: 36px;
    }

    .gallery-section {
        padding: 60px 30px 100px;
    }
}

@media (max-width: 768px) {
    .hero-section {
        min-height: 70vh;
    }

    .hero-frame {
        padding: 40px 60px;
        border: 6px solid white;
    }

    .hero-title {
        font-size: 32px;
    }

    .satellite-model {
        width: 200px;
        right: -100px;
    }

    .hero-subtitle {
        font-size: 16px;
    }

    .hero-cta {
        margin-bottom: 60px;
    }

    .cta-primary {
        padding: 14px 28px;
        font-size: 15px;
    }

    .section-title {
        font-size: 32px;
    }

    .gallery-grid {
        grid-template-columns: 1fr;
        gap: 24px;
    }

    .gallery-section {
        padding: 50px 20px 80px;
    }
}

@media (max-width: 480px) {
    .hero-frame {
        padding: 30px 40px;
        border: 5px solid white;
    }

    .hero-title {
        font-size: 24px;
        letter-spacing: 0px;
    }

    .satellite-model {
        width: 150px;
        right: -80px;
    }

    .hero-subtitle {
        font-size: 14px;
        padding: 0 20px;
    }

    .section-title {
        font-size: 28px;
    }

    .section-subtitle {
        font-size: 16px;
    }

    .cta-primary {
        padding: 12px 24px;
        font-size: 14px;
    }

    .modal-body {
        grid-template-columns: 1fr;
    }
}
</style>
