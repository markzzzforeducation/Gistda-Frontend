<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGalleryStore } from '../../stores/gallery';
import { useNewsStore } from '../../stores/news';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';
import GistdaFooter from '../../components/GistdaFooter.vue';

const galleryStore = useGalleryStore();
const newsStore = useNewsStore();
const auth = useAuthStore();
const router = useRouter();

const activeTab = ref('gallery'); // 'news' or 'gallery'

const showUploadModal = ref(false);
const showDetailModal = ref(false);
const selectedPoster = ref<any>(null);
const title = ref('');
const studentName = ref('');
const abstract = ref('');
const projectLink = ref('');
const imageUrl = ref('');
const posterFile = ref<File | null>(null);
const imagePreview = ref('');
const message = ref('');
const isSubmitting = ref(false);

const allSubmissions = computed(() => {
  return auth.currentUser?.role === 'admin' 
    ? galleryStore.submissions 
    : galleryStore.publishedSubmissions;
});

onMounted(async () => {
    await Promise.all([
        galleryStore.fetchSubmissions(),
        newsStore.fetchNews()
    ]);
    if (auth.currentUser) {
        studentName.value = auth.currentUser.name;
    }
});

function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && file.type.startsWith('image/')) {
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
    if (!title.value || !imageUrl.value || !auth.currentUser) return;
    
    isSubmitting.value = true;
    try {
        await galleryStore.createSubmission({
            title: title.value,
            abstract: abstract.value,
            imageUrl: imageUrl.value,
            projectLink: projectLink.value || undefined,
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
    abstract.value = '';
    projectLink.value = '';
    imageUrl.value = '';
    posterFile.value = null;
    imagePreview.value = '';
}

function viewPosterDetail(poster: any) {
    selectedPoster.value = poster;
    showDetailModal.value = true;
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

        <!-- Tab Navigation -->
        <div class="tabs-container">
            <div class="tabs-wrapper">
                <button 
                    @click="activeTab = 'news'" 
                    :class="['tab-button', { active: activeTab === 'news' }]"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                    </svg>
                    ข่าวสาร
                </button>
                <button 
                    @click="activeTab = 'gallery'" 
                    :class="['tab-button', { active: activeTab === 'gallery' }]"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Public Gallery
                </button>
            </div>
        </div>

        <!-- News Section -->
        <div v-if="activeTab === 'news'" class="news-section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">ข่าวสารและกิจกรรม</h2>
                    <p class="section-subtitle">{{ newsStore.news.length }} ข่าวประชาสัมพันธ์</p>
                </div>
            </div>

            <div v-if="newsStore.news.length === 0" class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
                <h3>ยังไม่มีข่าวสาร</h3>
                <p>กรุณารอติดตามข่าวสารใหม่ๆ</p>
            </div>

            <div v-else class="news-grid">
                <div v-for="(item, index) in newsStore.news" :key="item.id" 
                     class="news-card"
                     :style="{ animationDelay: `${index * 0.1}s` }">
                    <div class="news-image-wrapper">
                        <img :src="item.imageUrl" :alt="item.title" class="news-image" />
                        <div class="news-category-badge" :class="`category-${item.category}`">
                            {{ item.category === 'announcement' ? 'ประชาสัมพันธ์' : item.category === 'event' ? 'กิจกรรม' : item.category }}
                        </div>
                    </div>
                    <div class="news-content">
                        <h3 class="news-title">{{ item.title }}</h3>
                        <p class="news-description">{{ item.description }}</p>
                        <div class="news-meta">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <span>{{ new Date(item.publishDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Gallery Section -->
        <div v-if="activeTab === 'gallery'" class="gallery-section">
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
                                <button @click="viewPosterDetail(poster)" class="overlay-btn view">
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
                            <label>Project Title *</label>
                            <input v-model="title" type="text" placeholder="Enter project title" />
                        </div>
                        <div class="form-group">
                            <label>Student Name *</label>
                            <input v-model="studentName" type="text" placeholder="Enter your name" />
                        </div>
                        <div class="form-group">
                            <label>Abstract *</label>
                            <textarea 
                                v-model="abstract" 
                                placeholder="Enter project abstract, description, researchers, advisor, etc."
                                rows="6"
                            ></textarea>
                        </div>
                        <div class="form-group">
                            <label>Project Link (Optional)</label>
                            <input v-model="projectLink" type="url" placeholder="https://github.com/username/project" />
                        </div>
                    </div>
                    <div class="form-right">
                        <div class="upload-area">
                            <label class="upload-label">Poster Image *</label>
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
                                <p>Click to upload poster</p>
                                <span>PNG, JPG up to 10MB</span>
                            </label>
                            <div v-else class="image-preview-container">
                                <img :src="imagePreview" alt="Preview" class="image-preview" />
                                <button type="button" @click="removeImage" class="remove-image-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
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

        <!-- Detail Modal -->
        <div v-if="showDetailModal && selectedPoster" class="modal-overlay" @click="showDetailModal = false">
            <div class="modal-content detail-modal" @click.stop>
                <div class="modal-header">
                    <h2>{{ selectedPoster.title }}</h2>
                    <button class="close-btn" @click="showDetailModal = false">×</button>
                </div>
                <div class="detail-body">
                    <div class="detail-image">
                        <img :src="selectedPoster.imageUrl" :alt="selectedPoster.title" />
                    </div>
                    <div class="detail-info">
                        <div class="info-section">
                            <h3>Student</h3>
                            <div class="poster-author">
                                <div class="author-avatar">
                                    {{ selectedPoster.studentName.charAt(0).toUpperCase() }}
                                </div>
                                <span>{{ selectedPoster.studentName }}</span>
                            </div>
                        </div>
                        <div class="info-section" v-if="selectedPoster.abstract">
                            <h3>Abstract</h3>
                            <p class="abstract-text">{{ selectedPoster.abstract }}</p>
                        </div>
                        <div class="info-section" v-if="selectedPoster.projectLink">
                            <h3>Project Link</h3>
                            <a :href="selectedPoster.projectLink" target="_blank" rel="noopener noreferrer" class="project-link">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                </svg>
                                {{ selectedPoster.projectLink }}
                            </a>
                        </div>
                        <div class="info-section">
                            <h3>Submitted</h3>
                            <p class="date-text">{{ new Date(selectedPoster.submittedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <GistdaFooter />
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
    display: flex;
    flex-direction: column;
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
    /* Push footer below the fold - requires scroll to see */
    min-height: 100vh;
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

.form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 15px;
    font-family: inherit;
    resize: vertical;
    min-height: 120px;
    transition: all 0.2s;
}

.form-group textarea:focus {
    outline: none;
    border-color: #003d82;
    box-shadow: 0 0 0 4px rgba(0, 61, 130, 0.1);
}

.form-right {
    display: flex;
    flex-direction: column;
}

.upload-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.upload-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
}

.file-input {
    display: none;
}

.upload-placeholder {
    flex: 1;
    border: 2px dashed #d1d5db;
    border-radius: 16px;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.3s;
    min-height: 300px;
}

.upload-placeholder:hover {
    border-color: #003d82;
    background: rgba(0, 61, 130, 0.02);
}

.upload-placeholder svg {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
}

.upload-placeholder p {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
}

.upload-placeholder span {
    font-size: 13px;
    color: #6b7280;
}

.image-preview-container {
    position: relative;
    flex: 1;
    border-radius: 16px;
    overflow: hidden;
    background: #f3f4f6;
    min-height: 300px;
}

.image-preview {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.remove-image-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    background: rgba(239, 68, 68, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    color: white;
}

.remove-image-btn:hover {
    background: #ef4444;
    transform: scale(1.1);
}

.remove-image-btn svg {
    width: 20px;
    height: 20px;
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

/* Detail Modal */
.detail-modal {
    max-width: 1200px;
    max-height: 90vh;
}

.detail-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding: 32px;
    overflow-y: auto;
    max-height: calc(90vh - 100px);
}

.detail-image {
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
}

.detail-image img {
    width: 100%;
    height: auto;
    object-fit: contain;
}

.detail-info {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.info-section {
    padding-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
}

.info-section:last-child {
    border-bottom: none;
}

.info-section h3 {
    font-size: 14px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 12px 0;
}

.abstract-text {
    font-size: 15px;
    line-height: 1.7;
    color: #374151;
    margin: 0;
    white-space: pre-wrap;
}

.project-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #003d82;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    padding: 8px 16px;
    background: rgba(0, 61, 130, 0.05);
    border-radius: 8px;
    transition: all 0.2s;
    word-break: break-all;
}

.project-link:hover {
    background: rgba(0, 61, 130, 0.1);
    transform: translateX(2px);
}

.project-link svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

.date-text {
    font-size: 15px;
    color: #374151;
    margin: 0;
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

/* Tabs */
.tabs-container {
    position: relative;
    z-index: 10;
    background: rgba(10, 14, 39, 0.6);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: -40px;
}

.tabs-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    gap: 8px;
    padding: 0 40px;
}

.tab-button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 32px;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tab-button svg {
    width: 20px;
    height: 20px;
}

.tab-button:hover {
    color: rgba(255, 255, 255, 0.9);
}

.tab-button.active {
    color: white;
    border-bottom-color: #FFD700;
    background: rgba(255, 215, 0, 0.1);
}

/* News Section */
.news-section {
    position: relative;
    z-index: 1;
    padding: 80px 40px 120px;
    max-width: 1400px;
    margin: 0 auto;
    /* Push footer below the fold - requires scroll to see */
    min-height: 100vh;
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 32px;
}

.news-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fadeIn 0.6s ease-out backwards;
}

.news-card:hover {
    transform: translateY(-8px);
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 20px 60px rgba(255, 215, 0, 0.2);
}

.news-image-wrapper {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
}

.news-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s;
}

.news-card:hover .news-image {
    transform: scale(1.08);
}

.news-category-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    font-size: 12px;
    font-weight: 700;
}

.category-announcement {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.category-event {
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
}

.news-content {
    padding: 24px;
}

.news-title {
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin: 0 0 12px 0;
}

.news-description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 16px 0;
}

.news-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 215, 0, 0.8);
    font-size: 13px;
}

.news-meta svg {
    width: 16px;
    height: 16px;
}

</style>
