<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCoursesStore, type Course, type Lesson } from '../../stores/courses';
import { useAuthStore } from '../../stores/auth';
import GistdaHeader from '../../components/GistdaHeader.vue';
import { extractYouTubeId, formatDuration } from '../../utils/youtube';

const route = useRoute();
const router = useRouter();
const coursesStore = useCoursesStore();
const auth = useAuthStore();

const courseId = computed(() => String(route.params.id));
const course = computed(() => coursesStore.getCourseById(courseId.value));

const showAddLessonModal = ref(false);
const showEditLessonModal = ref(false);
const newLessonTitle = ref('');
const newLessonContent = ref('');
const newLessonVideo = ref('');
const newLessonInstructor = ref('');
const newLessonDuration = ref('');

const editingLesson = ref<Lesson | null>(null);
const editLessonTitle = ref('');
const editLessonContent = ref('');
const editLessonVideo = ref('');
const editLessonInstructor = ref('');
const editLessonDuration = ref('');
const fetchingDuration = ref(false);

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
        videoUrl: newLessonVideo.value,
        instructor: newLessonInstructor.value,
        duration: newLessonDuration.value,
    });
    showAddLessonModal.value = false;
    newLessonTitle.value = '';
    newLessonContent.value = '';
    newLessonVideo.value = '';
    newLessonInstructor.value = '';
    newLessonDuration.value = '';
}

function openEditModal(lesson: Lesson) {
    editingLesson.value = lesson;
    editLessonTitle.value = lesson.title;
    editLessonContent.value = lesson.content;
    editLessonVideo.value = lesson.videoUrl || '';
    editLessonInstructor.value = lesson.instructor || '';
    editLessonDuration.value = lesson.duration || '';
    showEditLessonModal.value = true;
}

async function saveEditLesson() {
    if (!editingLesson.value || !editLessonTitle.value) return;
    
    await coursesStore.updateLesson(courseId.value, editingLesson.value.id, {
        title: editLessonTitle.value,
        content: editLessonContent.value,
        videoUrl: editLessonVideo.value,
        instructor: editLessonInstructor.value,
        duration: editLessonDuration.value,
    });
    
    showEditLessonModal.value = false;
    editingLesson.value = null;
}

async function detectVideoDuration(isEditMode: boolean = false) {
    const videoUrl = isEditMode ? editLessonVideo.value : newLessonVideo.value;
    const videoId = extractYouTubeId(videoUrl);
    
    if (!videoId) {
        alert('กรุณาใส่ URL วิดีโอ YouTube ที่ถูกต้อง');
        return;
    }
    
    fetchingDuration.value = true;
    
    try {
        // Load YouTube IFrame API
        await loadYouTubeAPI();
        
        // Get duration using YouTube IFrame API
        const duration = await getVideoDuration(videoId);
        
        if (duration) {
            if (isEditMode) {
                editLessonDuration.value = duration;
            } else {
                newLessonDuration.value = duration;
            }
        } else {
            alert('ไม่สามารถตรวจจับความยาววิดีโอได้ กรุณากรอกด้วยตนเอง');
        }
    } catch (error) {
        console.error('Error detecting duration:', error);
        alert('เกิดข้อผิดพลาดในการตรวจจับความยาววิดีโอ');
    } finally {
        fetchingDuration.value = false;
    }
}

function loadYouTubeAPI(): Promise<void> {
    return new Promise((resolve) => {
        if ((window as any).YT && (window as any).YT.Player) {
            resolve();
            return;
        }
        
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        (window as any).onYouTubeIframeAPIReady = () => {
            resolve();
        };
    });
}

function getVideoDuration(videoId: string): Promise<string | null> {
    return new Promise((resolve) => {
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        
        const player = new (window as any).YT.Player(tempDiv, {
            videoId: videoId,
            events: {
                onReady: (event: any) => {
                    const duration = event.target.getDuration();
                    const formatted = formatDuration(Math.floor(duration));
                    player.destroy();
                    document.body.removeChild(tempDiv);
                    resolve(formatted);
                },
                onError: () => {
                    player.destroy();
                    document.body.removeChild(tempDiv);
                    resolve(null);
                }
            }
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            try {
                player.destroy();
                if (document.body.contains(tempDiv)) {
                    document.body.removeChild(tempDiv);
                }
                resolve(null);
            } catch (e) {
                resolve(null);
            }
        }, 10000);
    });
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
                            <div class="lesson-meta">
                                <span v-if="lesson.videoUrl" class="lesson-type">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    {{ lesson.duration || 'วิดีโอ' }}
                                </span>
                                <span v-if="lesson.instructor" class="lesson-instructor">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    {{ lesson.instructor }}
                                </span>
                            </div>
                        </div>
                        <div class="lesson-actions">
                            <button v-if="auth.currentUser?.role === 'admin'" @click.stop="openEditModal(lesson)" class="edit-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
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
                        <label>ชื่อผู้สอน (ถ้ามี)</label>
                        <input v-model="newLessonInstructor" placeholder="เช่น ระนิพนธ์ วะชินี" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>ความยาววิดีโอ (ถ้ามี)</label>
                        <div class="duration-input-group">
                            <input v-model="newLessonDuration" placeholder="เช่น 1:22:48 hrs หรือ 45 mins" class="form-input" />
                            <button @click="detectVideoDuration(false)" :disabled="!newLessonVideo || fetchingDuration" class="detect-btn" type="button">
                                <svg v-if="!fetchingDuration" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span v-if="fetchingDuration">กำลังตรวจจับ...</span>
                                <span v-else>ตรวจจับอัตโนมัติ</span>
                            </button>
                        </div>
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

        <!-- Edit Lesson Modal -->
        <div v-if="showEditLessonModal" class="modal-overlay" @click="showEditLessonModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>แก้ไขบทเรียน</h3>
                    <button @click="showEditLessonModal = false" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>ชื่อบทเรียน</label>
                        <input v-model="editLessonTitle" placeholder="เช่น ทำความเข้าใจวงโคจร" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>URL วิดีโอ (ถ้ามี)</label>
                        <input v-model="editLessonVideo" placeholder="YouTube Embed URL" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>ชื่อผู้สอน (ถ้ามี)</label>
                        <input v-model="editLessonInstructor" placeholder="เช่น ระนิพนธ์ วะชินี" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>ความยาววิดีโอ (ถ้ามี)</label>
                        <div class="duration-input-group">
                            <input v-model="editLessonDuration" placeholder="เช่น 1:22:48 hrs หรือ 45 mins" class="form-input" />
                            <button @click="detectVideoDuration(true)" :disabled="!editLessonVideo || fetchingDuration" class="detect-btn" type="button">
                                <svg v-if="!fetchingDuration" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span v-if="fetchingDuration">กำลังตรวจจับ...</span>
                                <span v-else>ตรวจจับอัตโนมัติ</span>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>เนื้อหา</label>
                        <textarea v-model="editLessonContent" placeholder="เนื้อหาบทเรียน..." class="form-textarea"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="showEditLessonModal = false" class="cancel-btn">ยกเลิก</button>
                    <button @click="saveEditLesson" :disabled="!editLessonTitle" class="submit-btn">บันทึก</button>
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
  color: #003d82;
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
  background: #003d82;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #002855;
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
  background: linear-gradient(135deg, #003d82, #002855);
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

.lesson-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.lesson-type,
.lesson-instructor {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.lesson-type svg,
.lesson-instructor svg {
  width: 16px;
  height: 16px;
}

.lesson-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  border-radius: 6px;
}

.edit-btn:hover {
  background: #dbeafe;
  color: #2563eb;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.edit-btn svg,
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
  border-color: #003d82;
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
  background: #003d82;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #002855;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.duration-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.duration-input-group .form-input {
  flex: 1;
}

.detect-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.detect-btn:hover:not(:disabled) {
  background: #059669;
}

.detect-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.detect-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
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
