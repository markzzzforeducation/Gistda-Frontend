<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCoursesStore } from '../../stores/courses';
import GistdaHeader from '../../components/GistdaHeader.vue';

const route = useRoute();
const router = useRouter();
const coursesStore = useCoursesStore();

const courseId = computed(() => String(route.params.courseId));
const lessonId = computed(() => String(route.params.lessonId));
const course = computed(() => coursesStore.getCourseById(courseId.value));
const lesson = computed(() => course.value?.lessons.find(l => l.id === lessonId.value));

const currentIndex = computed(() => course.value?.lessons.findIndex(l => l.id === lessonId.value) ?? -1);
const prevLesson = computed(() => currentIndex.value > 0 ? course.value?.lessons[currentIndex.value - 1] : null);
const nextLesson = computed(() => course.value && currentIndex.value < course.value.lessons.length - 1 ? course.value.lessons[currentIndex.value + 1] : null);

onMounted(async () => {
    if (!coursesStore.courses.length) {
        await coursesStore.fetchCourses();
    }
});

function goToLesson(id: string) {
    router.push(`/courses/${courseId.value}/lessons/${id}`);
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
                        
                        <div class="video-container" v-if="lesson.videoUrl">
                            <iframe 
                                :src="lesson.videoUrl" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>

                        <div class="text-content">
                            {{ lesson.content }}
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
                                :class="{ active: l.id === lesson.id }"
                                @click="goToLesson(l.id)"
                            >
                                <span class="lesson-num">{{ idx + 1 }}</span>
                                <span class="lesson-name">{{ l.title }}</span>
                                <svg v-if="l.id === lesson.id" viewBox="0 0 24 24" fill="currentColor" class="play-icon">
                                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
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

.text-content {
  font-size: 18px;
  line-height: 1.8;
  color: #374151;
  margin-bottom: 40px;
  white-space: pre-wrap;
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
}
</style>
