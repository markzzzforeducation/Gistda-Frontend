<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNewsStore } from '../../stores/news';
import GistdaHeader from '../../components/GistdaHeader.vue';
import GistdaFooter from '../../components/GistdaFooter.vue';

const route = useRoute();
const router = useRouter();
const newsStore = useNewsStore();

const newsId = computed(() => String(route.params.id));
const newsItem = computed(() => newsStore.getNewsById(newsId.value));
const otherNews = computed(() =>
    newsStore.news.filter(n => n.id !== newsId.value)
);

const categoryLabel = computed(() => {
    if (!newsItem.value) return '';
    switch (newsItem.value.category) {
        case 'announcement': return 'ประชาสัมพันธ์';
        case 'event': return 'กิจกรรม';
        default: return newsItem.value.category;
    }
});

onMounted(async () => {
    if (!newsStore.news.length) {
        await newsStore.fetchNews();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function goToNews(id: string) {
    router.push(`/news/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getCategoryLabel(category: string) {
    switch (category) {
        case 'announcement': return 'ประชาสัมพันธ์';
        case 'event': return 'กิจกรรม';
        default: return category;
    }
}
</script>

<template>
    <div class="app-container">
        <GistdaHeader />
        <div class="space-background"></div>

        <div v-if="newsItem" class="main-content">
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
                        <!-- Category Badge -->
                        <div class="category-row">
                            <span class="category-badge" :class="`category-${newsItem.category}`">{{ categoryLabel }}</span>
                        </div>

                        <h1 class="detail-title">{{ newsItem.title }}</h1>

                        <!-- Meta -->
                        <div class="meta-row">
                            <div class="meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                {{ new Date(newsItem.publishDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                            </div>
                        </div>

                        <!-- Image -->
                        <div class="news-image-container" v-if="newsItem.imageUrl">
                            <img :src="newsItem.imageUrl" :alt="newsItem.title" class="news-image" />
                        </div>

                        <!-- Description -->
                        <div class="news-body">
                            <p>{{ newsItem.description }}</p>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="sidebar" v-if="otherNews.length > 0">
                        <h3>ข่าวสารอื่นๆ</h3>
                        <div class="news-list">
                            <div
                                v-for="n in otherNews"
                                :key="n.id"
                                class="news-item"
                                @click="goToNews(n.id)"
                            >
                                <div class="news-thumb">
                                    <img :src="n.imageUrl" :alt="n.title" />
                                    <span class="thumb-badge" :class="`category-${n.category}`">{{ getCategoryLabel(n.category) }}</span>
                                </div>
                                <div class="news-item-info">
                                    <span class="news-item-title">{{ n.title }}</span>
                                    <span class="news-item-date">
                                        {{ new Date(n.publishDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }) }}
                                    </span>
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                    </svg>
                    <h2>ไม่พบข่าวสาร</h2>
                    <p>ข่าวสารที่คุณกำลังค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
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

.category-row {
    margin-bottom: 16px;
}

.category-badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
}

.category-badge.category-announcement {
    background: #eff6ff;
    color: #1d4ed8;
}

.category-badge.category-event {
    background: #fef3c7;
    color: #b45309;
}

.detail-title {
    font-size: 28px;
    font-weight: 800;
    color: #1f2937;
    margin: 0 0 16px 0;
    line-height: 1.3;
}

/* Meta */
.meta-row {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
}

.meta-item svg {
    width: 18px;
    height: 18px;
}

/* News Image */
.news-image-container {
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 32px;
    border: 1px solid #e5e7eb;
}

.news-image {
    width: 100%;
    display: block;
    object-fit: contain;
    max-height: 800px;
    margin: 0 auto;
}

/* News Body */
.news-body {
    font-size: 16px;
    line-height: 1.9;
    color: #374151;
}

.news-body p {
    margin: 0;
    white-space: pre-wrap;
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

.news-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 60vh;
    overflow-y: auto;
}

.news-list::-webkit-scrollbar { width: 6px; }
.news-list::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 3px; }
.news-list::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }

.news-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.news-item:hover {
    background: #f3f4f6;
}

.news-thumb {
    position: relative;
    width: 80px;
    height: 56px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid #e5e7eb;
}

.news-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.thumb-badge {
    position: absolute;
    bottom: 4px;
    left: 4px;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
}

.thumb-badge.category-announcement {
    background: rgba(29, 78, 216, 0.9);
    color: white;
}

.thumb-badge.category-event {
    background: rgba(180, 83, 9, 0.9);
    color: white;
}

.news-item-info {
    flex: 1;
    min-width: 0;
}

.news-item-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.news-item-date {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
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
}
</style>
