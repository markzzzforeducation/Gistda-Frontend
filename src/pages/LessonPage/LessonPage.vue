<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCoursesStore } from '../../stores/courses';
import { useAuthStore } from '../../stores/auth';
import GistdaHeader from '../../components/GistdaHeader.vue';
import GistdaFooter from '../../components/GistdaFooter.vue';
import { extractYouTubeId } from '../../utils/youtube';

const route = useRoute();
const router = useRouter();
const coursesStore = useCoursesStore();
const auth = useAuthStore();

const courseId = computed(() => String(route.params.courseId));
const lessonId = computed(() => String(route.params.lessonId));
const course = computed(() => coursesStore.getCourseById(courseId.value));
const lesson = computed(() => course.value?.lessons.find(l => l.id === lessonId.value));
const isComplete = computed(() => coursesStore.isLessonComplete(lessonId.value));

// Check if videoUrl is a valid YouTube URL
const hasValidVideo = computed(() => {
    if (!lesson.value?.videoUrl) return false;
    const videoId = extractYouTubeId(lesson.value.videoUrl);
    return videoId !== null;
});

const hasValidPdf = computed(() => {
    return lesson.value?.pdfUrl && lesson.value.pdfUrl.trim() !== '';
});

const currentIndex = computed(() => course.value?.lessons.findIndex(l => l.id === lessonId.value) ?? -1);
const prevLesson = computed(() => currentIndex.value > 0 ? course.value?.lessons[currentIndex.value - 1] : null);
const nextLesson = computed(() => course.value && currentIndex.value < course.value.lessons.length - 1 ? course.value.lessons[currentIndex.value + 1] : null);

onMounted(async () => {
    if (!coursesStore.courses.length) {
        await coursesStore.fetchCourses();
    }
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Fetch progress for current course
    if (auth.currentUser) {
        await coursesStore.fetchProgress(courseId.value);
    }
});

// Watch for lesson changes and scroll to top
watch(lessonId, async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Refresh progress when lesson changes
    if (auth.currentUser) {
        await coursesStore.fetchProgress(courseId.value);
    }
});

function goToLesson(id: string) {
    router.push(`/courses/${courseId.value}/lessons/${id}`);
}

async function toggleComplete() {
    if (!auth.currentUser) {
        alert('กรุณาเข้าสู่ระบบเพื่อบันทึกความคืบหน้า');
        return;
    }
    await coursesStore.toggleLessonComplete(courseId.value, lessonId.value);
}
</script>

<template>
    <div class="app-container">
        <GistdaHeader />
        <div class="space-background"></div>
        
        <div v-if="lesson && course" class="main-content">
            <div class="content-wrapper">
                <!-- Back Button -->
                <button class="back-button" @click="router.push(`/courses/${courseId}`)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    กลับไปหน้าคอร์ส
                </button>

                <div class="lesson-wrapper">
                    <!-- Main Content -->
                    <div class="lesson-main">
                        <h1 class="lesson-title">{{ lesson.title }}</h1>
                        
                        <div class="video-container" v-if="hasValidVideo">
                            <iframe 
                                :src="lesson.videoUrl" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                        
                        <div v-else-if="lesson.videoUrl" class="no-video-message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p>URL วิดีโอไม่ถูกต้อง กรุณาใส่ YouTube URL ที่ถูกต้อง</p>
                        </div>

                        <!-- PDF Document Section -->
                        <div v-if="hasValidPdf" class="pdf-section">
                            <div class="pdf-header">
                                <h3>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    เอกสารประกอบการเรียน
                                </h3>
                            </div>
                            <div class="pdf-viewer">
                                <iframe :src="lesson.pdfUrl" frameborder="0" allowfullscreen></iframe>
                            </div>
                        </div>

                        <div class="text-content">
                            {{ lesson.content }}
                        </div>

                        <!-- Completion Button -->
                        <div v-if="auth.currentUser" class="completion-section">
                            <button @click="toggleComplete" class="complete-btn" :class="{ 'completed': isComplete }">
                                <svg v-if="isComplete" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <span v-if="isComplete">เรียนจบแล้ว</span>
                                <span v-else>ทำเครื่องหมายว่าเรียนจบแล้ว</span>
                            </button>
                        </div>

                        <div class="lesson-nav">
                            <button v-if="prevLesson" @click="goToLesson(prevLesson.id)" class="nav-btn prev">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>
                                    <small>ก่อนหน้า</small>
                                    {{ prevLesson.title }}
                                </span>
                            </button>
                            <div v-else></div>

                            <button v-if="nextLesson" @click="goToLesson(nextLesson.id)" class="nav-btn next">
                                <span>
                                    <small>ถัดไป</small>
                                    {{ nextLesson.title }}
                                </span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="sidebar">
                        <h3>บทเรียนในคอร์ส</h3>
                        <div class="lessons-list">
                            <div 
                                v-for="(l, idx) in course.lessons" 
                                :key="l.id" 
                                class="lesson-item" 
                                :class="{ active: l.id === lesson.id, completed: coursesStore.isLessonComplete(l.id) }"
                                @click="goToLesson(l.id)"
                            >
                                <span class="lesson-num">{{ idx + 1 }}</span>
                                <span class="lesson-name">{{ l.title }}</span>
                                <!-- Check icon for completed lessons -->
                                <svg v-if="coursesStore.isLessonComplete(l.id) && l.id !== lesson.id" viewBox="0 0 24 24" fill="currentColor" class="check-icon">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <!-- Play icon for current lesson -->
                                <svg v-else-if="l.id === lesson.id" viewBox="0 0 24 24" fill="currentColor" class="play-icon">
                                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <GistdaFooter />
    </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
  background: #0a0e27;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 60px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: none;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  transition: all 0.2s;
}

.back-button:hover {
  background: #f3f4f6;
}

.back-button svg {
  width: 20px;
  height: 20px;
}

.lesson-wrapper {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
}

.lesson-main {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.lesson-title {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.no-video-message {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #92400e;
}

.no-video-message svg {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: #f59e0b;
}

.no-video-message p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.text-content {
  font-size: 18px;
  line-height: 1.8;
  color: #374151;
  margin-bottom: 40px;
  white-space: pre-wrap;
}

/* PDF Section */
.pdf-section {
  margin-bottom: 32px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
}

.pdf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 2px solid #e5e7eb;
}

.pdf-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.pdf-header h3 svg {
  width: 22px;
  height: 22px;
  color: #ef4444;
}

.open-pdf-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #003d82, #002855);
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.open-pdf-btn:hover {
  background: linear-gradient(135deg, #002855, #001a3d);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 61, 130, 0.3);
}

.open-pdf-btn svg {
  width: 18px;
  height: 18px;
}

.pdf-viewer {
  width: 100%;
  height: 600px;
  background: #525252;
}

.pdf-viewer iframe {
  width: 100%;
  height: 100%;
}

.lesson-nav {
  display: flex;
  justify-content: space-between;
  padding-top: 32px;
  border-top: 2px solid #e5e7eb;
  gap: 16px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 2px solid #e5e7eb;
  padding: 16px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 48%;
  font-weight: 600;
  color: #1f2937;
}

.nav-btn:hover {
  border-color: #003d82;
  background: #f9fafb;
}

.nav-btn span {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-btn.next span {
  align-items: flex-end;
}

.nav-btn small {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 500;
}

.nav-btn svg {
  width: 20px;
  height: 20px;
  color: #003d82;
}

.completion-section {
  margin: 32px 0;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

.complete-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border: 2px solid #003d82;
  border-radius: 12px;
  color: #003d82;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.complete-btn:hover {
  background: #003d82;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 61, 130, 0.3);
}

.complete-btn.completed {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  color: white;
}

.complete-btn.completed:hover {
  background: linear-gradient(135deg, #059669, #047857);
  border-color: #059669;
}

.complete-btn svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.sidebar {
  background: white;
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sidebar h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  position: relative;
}

.lesson-item:hover {
  background: #f9fafb;
  color: #1f2937;
}

.lesson-item.active {
  background: linear-gradient(135deg, #003d82, #002855);
  color: white;
  font-weight: 600;
}

.lesson-item.completed:not(.active) {
  color: #059669;
}

.lesson-item.completed:not(.active):hover {
  background: #f0fdf4;
}

.lesson-num {
  width: 28px;
  height: 28px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.lesson-item.active .lesson-num {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.lesson-item.completed:not(.active) .lesson-num {
  background: #d1fae5;
  color: #059669;
}

.lesson-name {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.play-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.check-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #10b981;
}

@media (max-width: 1024px) {
  .lesson-wrapper {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: 2;
  }

  .lesson-nav {
    flex-direction: column;
  }

  .nav-btn {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 20px 40px;
  }

  .lesson-main {
    padding: 24px;
  }

  .pdf-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .pdf-viewer {
    height: 400px;
  }

  .download-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
