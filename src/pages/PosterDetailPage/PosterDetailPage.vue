<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGalleryStore } from '../../stores/gallery';
import GistdaHeader from '../../components/GistdaHeader.vue';
import GistdaFooter from '../../components/GistdaFooter.vue';

const route = useRoute();
const router = useRouter();
const galleryStore = useGalleryStore();

const posterId = computed(() => String(route.params.id));
const poster = computed(() => galleryStore.getSubmissionById(posterId.value));
const otherPosters = computed(() =>
    galleryStore.publishedSubmissions.filter(p => p.id !== posterId.value)
);

onMounted(async () => {
    if (!galleryStore.submissions.length) {
        await galleryStore.fetchSubmissions();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function goToPoster(id: string) {
    router.push(`/poster/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
    <div class="app-container">
        <GistdaHeader />
        <div class="space-background"></div>

        <div v-if="poster" class="main-content">
            <div class="content-wrapper">
                <!-- Back Button -->
                <button class="back-button" @click="router.push('/')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    กลับไปหน้าหลัก
                </button>

                <div class="detail-wrapper">
                    <!-- Main Content -->
                    <div class="detail-main">
                        <h1 class="detail-title">{{ poster.title }}</h1>

                        <!-- Poster Image -->
                        <div class="poster-image-container">
                            <img :src="poster.imageUrl" :alt="poster.title" class="poster-image" />
                        </div>

                        <!-- Student Info -->
                        <div class="student-section">
                            <div class="student-info">
                                <div class="student-avatar">
                                    {{ poster.studentName.charAt(0).toUpperCase() }}
                                </div>
                                <div>
                                    <div class="student-label">โดย</div>
                                    <div class="student-name">{{ poster.studentName }}</div>
                                </div>
                            </div>
                            <div class="submit-date">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                {{ new Date(poster.submittedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                            </div>
                        </div>

                        <!-- Abstract -->
                        <div v-if="poster.abstract" class="info-block">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                บทคัดย่อ
                            </h3>
                            <p class="abstract-text">{{ poster.abstract }}</p>
                        </div>

                        <!-- Project Link -->
                        <div v-if="poster.projectLink" class="info-block">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                </svg>
                                ลิงก์โปรเจกต์
                            </h3>
                            <a :href="poster.projectLink" target="_blank" rel="noopener noreferrer" class="project-link">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                </svg>
                                {{ poster.projectLink }}
                            </a>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="sidebar" v-if="otherPosters.length > 0">
                        <h3>โปสเตอร์อื่นๆ</h3>
                        <div class="posters-list">
                            <div
                                v-for="p in otherPosters"
                                :key="p.id"
                                class="poster-item"
                                :class="{ active: p.id === poster.id }"
                                @click="goToPoster(p.id)"
                            >
                                <div class="poster-thumb">
                                    <img :src="p.imageUrl" :alt="p.title" />
                                </div>
                                <div class="poster-item-info">
                                    <span class="poster-item-title">{{ p.title }}</span>
                                    <span class="poster-item-author">{{ p.studentName }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Not Found -->
        <div v-else class="main-content">
            <div class="content-wrapper">
                <div class="not-found">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
                    </svg>
                    <h2>ไม่พบโปสเตอร์</h2>
                    <p>โปสเตอร์ที่คุณกำลังค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
                    <button class="back-home-btn" @click="router.push('/')">กลับไปหน้าหลัก</button>
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
    position: relative;
    background: #0a0e27;
    display: flex;
    flex-direction: column;
}

.space-background {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
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
    flex: 1;
    min-height: 100vh;
}

.content-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px 60px;
}

/* Back Button */
.back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #1f2937;
    border: none;
    color: white;
    font-weight: 600;
    cursor: pointer;
    padding: 12px 20px;
    border-radius: 12px;
    margin-bottom: 24px;
    transition: all 0.3s;
    font-size: 14px;
}

.back-button:hover {
    background: #374151;
    transform: translateX(-4px);
}

.back-button svg {
    width: 18px;
    height: 18px;
}

/* Layout */
.detail-wrapper {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 24px;
}

/* Main Content Card */
.detail-main {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.detail-title {
    font-size: 28px;
    font-weight: 800;
    color: #1f2937;
    margin: 0 0 28px 0;
    line-height: 1.3;
}

/* Poster Image */
.poster-image-container {
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 32px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
}

.poster-image {
    width: 100%;
    display: block;
    object-fit: contain;
    max-height: 800px;
    margin: 0 auto;
}

/* Student Section */
.student-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    margin-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
}

.student-info {
    display: flex;
    align-items: center;
    gap: 14px;
}

.student-avatar {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #003d82, #0066cc);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 20px;
}

.student-label {
    font-size: 12px;
    color: #9ca3af;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.student-name {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
}

.submit-date {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
}

.submit-date svg {
    width: 18px;
    height: 18px;
}

/* Info Blocks */
.info-block {
    margin-bottom: 28px;
}

.info-block h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 12px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;
}

.info-block h3 svg {
    width: 20px;
    height: 20px;
    color: #003d82;
}

.abstract-text {
    font-size: 16px;
    line-height: 1.8;
    color: #4b5563;
    margin: 0;
    white-space: pre-wrap;
}

.project-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #003d82;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
    padding: 12px 20px;
    background: #eff6ff;
    border-radius: 12px;
    transition: all 0.2s;
    word-break: break-all;
}

.project-link:hover {
    background: #dbeafe;
    transform: translateY(-1px);
}

.project-link svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

/* Sidebar */
.sidebar {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 24px;
    height: fit-content;
    position: sticky;
    top: 100px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.sidebar h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 20px 0;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
}

.posters-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 60vh;
    overflow-y: auto;
}

.posters-list::-webkit-scrollbar { width: 6px; }
.posters-list::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 3px; }
.posters-list::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }

.poster-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.poster-item:hover {
    background: #f3f4f6;
}

.poster-item.active {
    background: linear-gradient(135deg, #003d82, #0066cc);
    color: white;
}

.poster-thumb {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid #e5e7eb;
}

.poster-item.active .poster-thumb {
    border-color: rgba(255,255,255,0.3);
}

.poster-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.poster-item-info {
    flex: 1;
    min-width: 0;
}

.poster-item-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.poster-item.active .poster-item-title {
    color: white;
}

.poster-item-author {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
}

.poster-item.active .poster-item-author {
    color: rgba(255,255,255,0.7);
}

/* Not Found */
.not-found {
    text-align: center;
    padding: 80px 40px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.not-found svg {
    width: 64px;
    height: 64px;
    color: #d1d5db;
    margin-bottom: 20px;
}

.not-found h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px;
}

.not-found p {
    color: #6b7280;
    margin: 0 0 24px;
}

.back-home-btn {
    padding: 12px 28px;
    background: linear-gradient(135deg, #003d82, #0066cc);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.back-home-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,61,130,0.3);
}

/* Responsive */
@media (max-width: 1024px) {
    .detail-wrapper {
        grid-template-columns: 1fr;
    }
    .sidebar {
        position: static;
        order: 2;
    }
}

@media (max-width: 768px) {
    .content-wrapper {
        padding: 0 16px 40px;
    }
    .detail-main {
        padding: 24px;
    }
    .detail-title {
        font-size: 22px;
    }
    .student-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
}
</style>
