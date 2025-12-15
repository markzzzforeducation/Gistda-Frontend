<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCoursesStore, type Course } from '../../stores/courses';
import { useAuthStore } from '../../stores/auth';
import GistdaHeader from '../../components/GistdaHeader.vue';

const route = useRoute();
const router = useRouter();
const coursesStore = useCoursesStore();
const auth = useAuthStore();

const courseId = computed(() => String(route.params.id));
const course = computed(() => coursesStore.getCourseById(courseId.value));

const showAddLessonModal = ref(false);
const newLessonTitle = ref('');
const newLessonContent = ref('');
const newLessonVideo = ref('');

onMounted(async () => {
    if (!coursesStore.courses.length) {
        await coursesStore.fetchCourses();
    }
});

async function addLesson() {
    if (!newLessonTitle.value) return;
    await coursesStore.addLesson(courseId.value, {
        title: newLessonTitle.value,
        content: newLessonContent.value,
        videoUrl: newLessonVideo.value
    });
    showAddLessonModal.value = false;
    newLessonTitle.value = '';
    newLessonContent.value = '';
    newLessonVideo.value = '';
}

function openLesson(lessonId: string) {
    router.push(`/courses/${courseId.value}/lessons/${lessonId}`);
}

function deleteLesson(lessonId: string) {
    if (confirm('ลบบทเรียนนี้?')) {
        coursesStore.deleteLesson(courseId.value, lessonId);
    }
}
</script>

<template>
    <div class="app-container">
        <GistdaHeader />
        <div class="space-background"></div>
        
        <div v-if="course" class="main-content">
            <div class="content-wrapper">
                <!-- Back Button -->
                <button class="back-button" @click="router.push('/courses')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับไปรายการคอร์ส
                </button>

                <!-- Course Header -->
                <div class="course-header">
                    <h1 class="course-title">{{ course.title }}</h1>
                    <p class="course-desc">{{ course.description }}</p>
                    <div class="course-meta">
                        <span>{{ course.lessons.length }} บทเรียน</span>
                    </div>
                </div>

                <!-- Lessons Section -->
                <div class="section-header">
                    <h2>เนื้อหาคอร์ส</h2>
                    <button v-if="auth.currentUser?.role === 'admin'" @click="showAddLessonModal = true" class="add-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        เพิ่มบทเรียน
                    </button>
                </div>

                <div class="lessons-list">
                    <div v-for="(lesson, index) in course.lessons" :key="lesson.id" class="lesson-card" @click="openLesson(lesson.id)">
                        <div class="lesson-number">{{ index + 1 }}</div>
                        <div class="lesson-info">
                            <h3 class="lesson-title">{{ lesson.title }}</h3>
                            <span class="lesson-type">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path v-if="lesson.videoUrl" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                    <path v-if="lesson.videoUrl" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                </svg>
                                {{ lesson.videoUrl ? 'วิดีโอ' : 'อ่าน' }}
                            </span>
                        </div>
                        <div class="lesson-actions">
                            <button v-if="auth.currentUser?.role === 'admin'" @click.stop="deleteLesson(lesson.id)" class="delete-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Lesson Modal -->
        <div v-if="showAddLessonModal" class="modal-overlay" @click="showAddLessonModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>เพิ่มบทเรียนใหม่</h3>
                    <button @click="showAddLessonModal = false" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>ชื่อบทเรียน</label>
                        <input v-model="newLessonTitle" placeholder="เช่น ทำความเข้าใจวงโคจร" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>URL วิดีโอ (ถ้ามี)</label>
                        <input v-model="newLessonVideo" placeholder="YouTube Embed URL" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>เนื้อหา</label>
                        <textarea v-model="newLessonContent" placeholder="เนื้อหาบทเรียน..." class="form-textarea"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="showAddLessonModal = false" class="cancel-btn">ยกเลิก</button>
                    <button @click="addLesson" :disabled="!newLessonTitle" class="submit-btn">เพิ่มบทเรียน</button>
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
  max-width: 1000px;
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

.course-header {
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.course-title {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.course-desc {
  font-size: 18px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.course-meta {
  font-weight: 600;
  color: #0a5f35;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #0a5f35;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #064e2b;
}

.add-btn svg {
  width: 18px;
  height: 18px;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lesson-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.lesson-card:hover {
  transform: translateX(8px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.lesson-number {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0a5f35, #064e2b);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.lesson-info {
  flex: 1;
}

.lesson-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.lesson-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.lesson-type svg {
  width: 16px;
  height: 16px;
}

.lesson-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delete-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  border-radius: 6px;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.delete-btn svg {
  width: 20px;
  height: 20px;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  color: #9ca3af;
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
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0a5f35;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f3f4f6;
}

.submit-btn {
  padding: 10px 24px;
  background: #0a5f35;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #064e2b;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 20px 40px;
  }

  .lesson-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
