<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useBoardsStore } from '../stores/boards';
import GistdaHeader from '../components/GistdaHeader.vue';

const auth = useAuthStore();
const boards = useBoardsStore();
const router = useRouter();

const myBoards = computed(() => auth.currentUserId ? boards.boardsForUser(auth.currentUserId) : []);
const newBoardName = ref('');

async function createBoard() {
  if (!auth.currentUserId || !newBoardName.value.trim()) return;
  const id = await boards.createBoard(newBoardName.value.trim(), auth.currentUserId);
  newBoardName.value = '';
  router.push(`/board/${id}`);
}

function openBoard(boardId: string): void {
  router.push(`/board/${boardId}`);
}

function deleteBoard(boardId: string) {
  if (confirm('Delete this project?')) {
    boards.deleteBoard(boardId);
  }
}

onMounted(async () => {
  try { await boards.fetchBoards(); } catch { }
});
</script>

<template>
  <div class="app-container">
    <GistdaHeader />
    <div class="space-background"></div>
    
    <div class="main-content">
      <div class="content-wrapper">
        <!-- Page Header -->
        <div class="page-header">
          <h1 class="page-title">Your Projects</h1>
          <p class="page-subtitle">จัดการโครงการและงานของคุณ</p>
        </div>

        <!-- Stats Card -->
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-number">{{ myBoards.length }}</div>
            <div class="stat-label">โครงการทั้งหมด</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ auth.currentUser?.role === 'admin' ? 'Admin' : 'Intern' }}</div>
            <div class="stat-label">สถานะ</div>
          </div>
        </div>

        <!-- Create Board Section (Admin/Mentor only) -->
        <div v-if="auth.currentUser?.role !== 'intern'" class="create-section">
          <h2 class="section-title">สร้างโครงการใหม่</h2>
          <div class="create-card">
            <input 
              v-model="newBoardName" 
              @keyup.enter="createBoard"
              placeholder="ชื่อโครงการ..."
              class="project-input"
            />
            <button @click="createBoard" :disabled="!newBoardName.trim()" class="create-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              สร้างโครงการ
            </button>
          </div>
        </div>

        <!-- Projects Grid -->
        <div class="projects-section">
          <h2 class="section-title">โครงการของคุณ</h2>
          
          <div v-if="myBoards.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <h3>ยังไม่มีโครงการ</h3>
            <p v-if="auth.currentUser?.role === 'intern'">รอการมอบหมายโครงการจาก Admin</p>
            <p v-else>สร้างโครงการแรกของคุณเพื่อเริ่มต้น</p>
          </div>

          <div v-else class="projects-grid">
            <div v-for="board in myBoards" :key="board.id" class="project-card" @click="openBoard(board.id)">
              <div class="card-header">
                <h3 class="card-title">{{ board.name }}</h3>
                <div class="card-actions" @click.stop>
                  <button v-if="auth.currentUser?.role === 'admin'" @click="deleteBoard(board.id)" class="action-btn delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="card-info">
                <div class="info-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <span>{{ board.memberIds.length }} สมาชิก</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="view-link">เปิดโครงการ →</span>
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

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #0a5f35;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
}

.create-section {
  margin-bottom: 48px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 20px 0;
}

.create-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.project-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
}

.project-input:focus {
  outline: none;
  border-color: #0a5f35;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #0a5f35;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover:not(:disabled) {
  background: #064e2b;
}

.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-btn svg {
  width: 20px;
  height: 20px;
}

.projects-section {
  margin-top: 48px;
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 60px;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: #cbd5e1;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
  border-radius: 4px;
}

.action-btn:hover {
  background: #f3f4f6;
}

.action-btn.delete:hover {
  color: #ef4444;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.card-info {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.info-item svg {
  width: 16px;
  height: 16px;
}

.card-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.view-link {
  font-size: 14px;
  font-weight: 600;
  color: #0a5f35;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 20px 40px;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .stats-card {
    flex-direction: column;
    gap: 24px;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
  }

  .create-card {
    flex-direction: column;
  }
}
</style>
