<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useCoursesStore } from '../../stores/courses';
import { useAuthStore } from '../../stores/auth';
import { useRouter }from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';
import GistdaFooter from '../../components/GistdaFooter.vue';

const coursesStore = useCoursesStore();
const auth = useAuthStore();
const router = useRouter();

const searchQuery = ref('');
const showCreateModal = ref(false);
const newCourseTitle = ref('');
const newCourseDescription = ref('');
const showPermissionDenied = ref(false);

const filteredCourses = computed(() => {
  if (!searchQuery.value) return coursesStore.courses;
  const query = searchQuery.value.toLowerCase();
  return coursesStore.courses.filter(c => 
    c.title.toLowerCase().includes(query) || 
    c.description.toLowerCase().includes(query)
  );
});

// Calculate progress stats
const allProgress = ref<Set<string>>(new Set());

const progressStats = computed(() => {
  const totalCourses = coursesStore.courses.length;
  const totalLessons = coursesStore.courses.reduce((sum, c) => sum + c.lessons.length, 0);
  
  // Completed lessons count
  const completedLessonsCount = allProgress.value.size;
  
  // Calculate percentage based on total lessons
  const percentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;
  
  // Calculate completed courses
  let completedCoursesCount = 0;
  coursesStore.courses.forEach(course => {
    if (course.lessons.length > 0) {
      const isCourseComplete = course.lessons.every(l => allProgress.value.has(l.id));
      if (isCourseComplete) completedCoursesCount++;
    }
  });
  
  return {
    total: totalCourses,
    completed: completedCoursesCount,
    percentage,
    totalLessons
  };
});

// Helper function to fetch progress
const fetchProgressData = async () => {
    if (auth.currentUser) {
        console.log('Fetching all progress for user:', auth.currentUser.id);
        const progress = await coursesStore.fetchAllProgress();
        console.log('Got progress:', progress);
        allProgress.value = new Set(progress.filter(p => p.completed).map(p => p.lessonId));
    }
};

// Watch for auth changes
watch(() => auth.currentUser, async (newUser) => {
    if (newUser) {
        await fetchProgressData();
    }
});

onMounted(async () => {
  if (auth.currentUser?.role === 'intern' && auth.currentUser?.approvalStatus !== 'approved') {
    showPermissionDenied.value = true;
    setTimeout(() => {
        router.back();
    }, 3000);
    return;
  }
  
  await coursesStore.fetchCourses();
  await fetchProgressData();
});

async function createCourse() {
  if (!newCourseTitle.value.trim()) return;
  
  try {
    await coursesStore.createCourse({
      title: newCourseTitle.value,
      description: newCourseDescription.value,
    });
    newCourseTitle.value = '';
    newCourseDescription.value = '';
    showCreateModal.value = false;
  } catch (error) {
    console.error('Failed to create course:', error);
    alert('Failed to create course. Please try again.');
  }
}

async function deleteCourse(id: string) {
  if (confirm('Delete this course?')) {
    try {
      await coursesStore.deleteCourse(id);
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course. Please try again.');
    }
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
          <div class="header-content">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div>
              <h1 class="page-title">E-Learning Center</h1>
              <p class="page-subtitle">เรียนรู้และพัฒนาทักษะของคุณ</p>
            </div>
          </div>
        </div>

        <!-- Progress Dashboard -->
        <div v-if="auth.currentUser?.role === 'intern' || auth.currentUser?.role === 'mentor'" class="progress-dashboard">
          <div class="dashboard-header">
            <h2>📊 Progress Dashboard</h2>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-circle" :style="{ '--progress': progressStats.percentage }">
                <span class="stat-value">{{ progressStats.percentage }}%</span>
              </div>
              <div class="stat-info">
                <span class="stat-label">เรียนจบแล้ว</span>
              </div>
            </div>
            
            <div class="stat-card simple">
              <div class="stat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{ progressStats.total }}</span>
                <span class="stat-label">คอร์สทั้งหมด</span>
              </div>
            </div>
            
            <div class="stat-card simple">
              <div class="stat-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{ progressStats.completed }}</span>
                <span class="stat-label">เรียนจบแล้ว</span>
              </div>
            </div>
            
            <div class="stat-card simple">
              <div class="stat-icon orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{ progressStats.totalLessons }}</span>
                <span class="stat-label">บทเรียนทั้งหมด</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Search & Actions Bar -->
        <div class="actions-bar">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="searchQuery" placeholder="ค้นหาคอร์ส..." />
          </div>
          <button v-if="auth.currentUser?.role === 'admin'" @click="showCreateModal = true" class="create-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            สร้างคอร์ส
          </button>
        </div>

        <!-- Courses Section -->
        <div class="courses-section">
          <h2 class="section-title">คอร์สทั้งหมด</h2>
          
          <div v-if="filteredCourses.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <h3>ไม่พบคอร์ส</h3>
            <p>ลองค้นหาด้วยคำค้นอื่น</p>
          </div>

          <div v-else class="courses-grid">
            <div 
              v-for="(course, index) in filteredCourses" 
              :key="course.id" 
              class="course-card"
              :style="{ animationDelay: `${index * 0.1}s` }"
              @click="router.push(`/courses/${course.id}`)"
            >
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ course.title }}</h3>
                <p class="card-description">{{ course.description }}</p>
                <div class="card-footer">
                  <div class="lesson-count">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span>{{ course.lessons.length }} บทเรียน</span>
                  </div>
                  <button v-if="auth.currentUser?.role === 'admin'" @click.stop="deleteCourse(course.id)" class="delete-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>📝 สร้างคอร์สใหม่</h2>
          <button @click="showCreateModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>ชื่อคอร์ส</label>
            <input v-model="newCourseTitle" placeholder="ระบุชื่อคอร์ส" />
          </div>
          <div class="form-group">
            <label>คำอธิบาย</label>
            <textarea v-model="newCourseDescription" placeholder="ระบุคำอธิบายคอร์ส..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCreateModal = false" class="btn-cancel">ยกเลิก</button>
          <button @click="createCourse" :disabled="!newCourseTitle.trim()" class="btn-submit">สร้างคอร์ส</button>
        </div>
      </div>
    </div>

    <!-- Permission Denied Modal -->
    <div v-if="showPermissionDenied" class="modal-overlay permission-overlay">
      <div class="modal-content permission-modal">
        <div class="permission-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h2>ไม่มีสิทธิ์เข้าถึง</h2>
        <p>บัญชีของคุณอยู่ระหว่างการตรวจสอบ <br>กรุณารอการอนุมัติจากผู้ดูแลระบบ</p>
        <p class="redirect-hint">กำลังกลับไปหน้าก่อนหน้า...</p>
        <div class="modal-footer justify-center">
            <button @click="router.back()" class="btn-submit">กลับทันที</button>
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
  flex: 1;
  min-height: 100vh;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px 60px;
}

/* Page Header - Dashboard Style */
.page-header {
  background: linear-gradient(135deg, #0f172a 0%, #003d82 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 48px;
  box-shadow: 0 4px 20px rgba(0, 61, 130, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: #022e63ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: white;
  margin: 0 0 6px;
}

.page-subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Progress Dashboard - White Theme */
.progress-dashboard {
  background: white;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.dashboard-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-card.simple {
  flex-direction: row;
  gap: 16px;
  text-align: left;
}

.stat-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(
    #003d82 calc(var(--progress) * 1%),
    #e5e7eb calc(var(--progress) * 1%)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stat-circle::before {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
}

.stat-value {
  position: relative;
  font-size: 24px;
  font-weight: 800;
  color: #003d82;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon.blue { background: #dbeafe; color: #2563eb; }
.stat-icon.green { background: #d1fae5; color: #059669; }
.stat-icon.orange { background: #fed7aa; color: #ea580c; }

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
}

.stat-info {
  margin-top: 12px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.search-bar {
  flex: 1;
  position: relative;
}

.search-bar svg {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

.search-bar input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  color: #1f2937;
  transition: all 0.3s;
}

.search-bar input::placeholder {
  color: #9ca3af;
}

.search-bar input:focus {
  outline: none;
  border-color: #003d82;
  box-shadow: 0 0 0 3px rgba(0, 61, 130, 0.1);
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 61, 130, 0.4);
}

.create-btn svg {
  width: 20px;
  height: 20px;
}

/* Courses Section */
.section-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 24px;
}

.empty-state {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 80px 40px;
  text-align: center;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: #9ca3af;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

/* Course Cards */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.course-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 20px;
  animation: fadeInUp 0.6s ease-out backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.course-card:hover {
  transform: translateY(-4px);
  border-color: #003d82;
  box-shadow: 0 12px 40px rgba(0, 61, 130, 0.15);
}

.card-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #003d82, #0066cc);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-icon svg {
  width: 28px;
  height: 28px;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.card-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px;
  flex: 1;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
}

.lesson-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.lesson-count svg {
  width: 16px;
  height: 16px;
}

.delete-btn {
  background: #fef2f2;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #ef4444;
  transition: all 0.2s;
  border-radius: 8px;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn svg {
  width: 18px;
  height: 18px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-content {
  background: #1a1f3a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: white;
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
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 15px;
  color: white;
  transition: all 0.2s;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #003d82;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-submit {
  padding: 12px 24px;
  background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 61, 130, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Permission Modal */
.permission-modal {
  text-align: center;
  padding: 40px;
  max-width: 400px;
}

.permission-icon {
  width: 80px;
  height: 80px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fca5a5;
}

.permission-icon svg {
  width: 40px;
  height: 40px;
}

.permission-modal h2 {
  color: #fca5a5;
  margin-bottom: 12px;
}

.permission-modal p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  line-height: 1.6;
}

.redirect-hint {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 16px;
  font-style: italic;
}

.justify-center {
  justify-content: center;
  border-top: none;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 20px 40px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-bar {
    flex-direction: column;
  }
}
</style>
