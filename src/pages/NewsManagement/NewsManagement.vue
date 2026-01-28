<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNewsStore, type News } from '../../stores/news';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const newsStore = useNewsStore();
const auth = useAuthStore();
const router = useRouter();

// State
const isLoading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const newsToDelete = ref<News | null>(null);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

// Form data
const formData = ref({
    id: '',
    title: '',
    description: '',
    imageUrl: '',
    category: 'general'
});

const categories = [
    { value: 'general', label: 'ทั่วไป' },
    { value: 'event', label: 'กิจกรรม' },
    { value: 'announcement', label: 'ประกาศ' },
    { value: 'training', label: 'อบรม' },
    { value: 'technology', label: 'เทคโนโลยี' }
];

const fileInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
    if (!auth.currentUser || auth.currentUser.role !== 'admin') {
        router.push('/admin');
        return;
    }
    isLoading.value = true;
    try {
        await newsStore.fetchNews();
    } catch (error) {
        console.error('Failed to load news:', error);
    } finally {
        isLoading.value = false;
    }
});

function openCreateModal() {
    formData.value = {
        id: '',
        title: '',
        description: '',
        imageUrl: '',
        category: 'general'
    };
    isEditing.value = false;
    showModal.value = true;
}

function openEditModal(news: News) {
    formData.value = {
        id: news.id,
        title: news.title,
        description: news.description,
        imageUrl: news.imageUrl,
        category: news.category
    };
    isEditing.value = true;
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
    formData.value = { id: '', title: '', description: '', imageUrl: '', category: 'general' };
}

async function handleSubmit() {
    if (!formData.value.title || !formData.value.description) {
        showMessage('กรุณากรอกข้อมูลให้ครบ', 'error');
        return;
    }

    isLoading.value = true;
    try {
        if (isEditing.value) {
            await newsStore.updateNews(formData.value.id, {
                title: formData.value.title,
                description: formData.value.description,
                imageUrl: formData.value.imageUrl,
                category: formData.value.category
            });
            showMessage('แก้ไขข่าวสำเร็จ!', 'success');
        } else {
            await newsStore.createNews({
                title: formData.value.title,
                description: formData.value.description,
                imageUrl: formData.value.imageUrl || 'https://via.placeholder.com/400x250',
                category: formData.value.category
            });
            showMessage('สร้างข่าวสำเร็จ!', 'success');
        }
        closeModal();
    } catch (error: any) {
        console.error('Submit error:', error);
        showMessage(error.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
        isLoading.value = false;
    }
}

function confirmDelete(news: News) {
    newsToDelete.value = news;
    showDeleteConfirm.value = true;
}

async function deleteNews() {
    if (!newsToDelete.value) return;
    
    isLoading.value = true;
    try {
        await newsStore.deleteNews(newsToDelete.value.id);
        showMessage('ลบข่าวสำเร็จ!', 'success');
    } catch (error) {
        showMessage('เกิดข้อผิดพลาดในการลบ', 'error');
    } finally {
        isLoading.value = false;
        showDeleteConfirm.value = false;
        newsToDelete.value = null;
    }
}

function triggerFileInput() {
    fileInput.value?.click();
}

async function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showMessage('กรุณาเลือกไฟล์รูปภาพ', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showMessage('ขนาดรูปต้องไม่เกิน 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        formData.value.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
}

function showMessage(msg: string, type: 'success' | 'error') {
    message.value = msg;
    messageType.value = type;
    setTimeout(() => message.value = '', 3000);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getCategoryLabel(value: string) {
    return categories.find(c => c.value === value)?.label || value;
}
</script>

<template>
    <div class="news-management">
        <div class="page-container">
            <!-- Header -->
            <div class="page-header">
                <div class="header-left">
                    <button class="back-button" @click="router.push('/admin')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับ
                    </button>
                    <h1 class="page-title">จัดการข่าวสาร</h1>
                </div>
                <button class="btn-primary" @click="openCreateModal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    เพิ่มข่าวใหม่
                </button>
            </div>

            <!-- Message -->
            <div v-if="message" class="message-box" :class="messageType">
                {{ message }}
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="loading-overlay">
                <div class="spinner"></div>
            </div>

            <!-- News Table -->
            <div class="table-container">
                <table class="news-table">
                    <thead>
                        <tr>
                            <th>รูปภาพ</th>
                            <th>หัวข้อ</th>
                            <th>หมวดหมู่</th>
                            <th>วันที่เผยแพร่</th>
                            <th>การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="newsStore.news.length === 0">
                            <td colspan="5" class="empty-cell">ยังไม่มีข่าวสาร</td>
                        </tr>
                        <tr v-for="news in newsStore.news" :key="news.id">
                            <td>
                                <img :src="news.imageUrl" :alt="news.title" class="news-thumbnail" />
                            </td>
                            <td>
                                <div class="news-title-cell">
                                    <span class="news-title">{{ news.title }}</span>
                                    <span class="news-desc">{{ news.description.slice(0, 60) }}...</span>
                                </div>
                            </td>
                            <td>
                                <span class="category-badge" :class="`cat-${news.category}`">
                                    {{ getCategoryLabel(news.category) }}
                                </span>
                            </td>
                            <td>{{ formatDate(news.publishDate) }}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-edit" @click="openEditModal(news)" title="แก้ไข">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button class="btn-delete" @click="confirmDelete(news)" title="ลบ">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Create/Edit Modal -->
            <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
                <div class="modal">
                    <div class="modal-header">
                        <h2>{{ isEditing ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่' }}</h2>
                        <button @click="closeModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>หัวข้อข่าว *</label>
                            <input v-model="formData.title" type="text" placeholder="กรอกหัวข้อข่าว" />
                        </div>
                        <div class="form-group">
                            <label>เนื้อหา *</label>
                            <textarea v-model="formData.description" placeholder="กรอกเนื้อหาข่าว" rows="4"></textarea>
                        </div>
                        <div class="form-group">
                            <label>หมวดหมู่</label>
                            <select v-model="formData.category">
                                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                                    {{ cat.label }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>รูปภาพ</label>
                            <div class="image-upload-area" @click="triggerFileInput">
                                <img v-if="formData.imageUrl" :src="formData.imageUrl" class="preview-image" />
                                <div v-else class="upload-placeholder">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>คลิกเพื่ออัปโหลดรูป</span>
                                </div>
                            </div>
                            <input ref="fileInput" type="file" accept="image/*" @change="handleImageUpload" style="display:none" />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button @click="closeModal" class="btn-secondary">ยกเลิก</button>
                        <button @click="handleSubmit" class="btn-primary" :disabled="isLoading">
                            {{ isLoading ? 'กำลังบันทึก...' : (isEditing ? 'บันทึกการแก้ไข' : 'สร้างข่าว') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
                <div class="modal confirm-modal">
                    <div class="modal-header">
                        <h2>ยืนยันการลบ</h2>
                    </div>
                    <div class="modal-body">
                        <p>คุณต้องการลบข่าว "{{ newsToDelete?.title }}" ใช่หรือไม่?</p>
                        <p class="warning-text">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                    </div>
                    <div class="modal-footer">
                        <button @click="showDeleteConfirm = false" class="btn-secondary">ยกเลิก</button>
                        <button @click="deleteNews" class="btn-danger" :disabled="isLoading">
                            {{ isLoading ? 'กำลังลบ...' : 'ยืนยันลบ' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.news-management {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a1628 100%);
    padding: 40px 20px;
}

.page-container {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    cursor: pointer;
    color: white;
    font-weight: 500;
    transition: all 0.3s;
}

.back-button:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-4px);
}

.back-button svg {
    width: 20px;
    height: 20px;
}

.page-title {
    font-size: 28px;
    font-weight: 800;
    color: white;
    margin: 0;
}

.btn-primary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 61, 130, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn-primary svg {
    width: 18px;
    height: 18px;
}

.message-box {
    padding: 14px 20px;
    border-radius: 12px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 20px;
}

.message-box.success {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.message-box.error {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.table-container {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
}

.news-table {
    width: 100%;
    border-collapse: collapse;
}

.news-table th {
    background: rgba(255, 255, 255, 0.05);
    padding: 16px;
    text-align: left;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.news-table td {
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    color: white;
    vertical-align: middle;
}

.empty-cell {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    padding: 40px !important;
}

.news-thumbnail {
    width: 80px;
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
}

.news-title-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.news-title {
    font-weight: 600;
    color: white;
}

.news-desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
}

.category-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.cat-general { background: rgba(107, 114, 128, 0.3); color: #d1d5db; }
.cat-event { background: rgba(59, 130, 246, 0.3); color: #93c5fd; }
.cat-announcement { background: rgba(239, 68, 68, 0.3); color: #fca5a5; }
.cat-training { background: rgba(34, 197, 94, 0.3); color: #86efac; }
.cat-technology { background: rgba(168, 85, 247, 0.3); color: #d8b4fe; }

.action-buttons {
    display: flex;
    gap: 8px;
}

.btn-edit, .btn-delete {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-edit {
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
}

.btn-edit:hover {
    background: rgba(59, 130, 246, 0.3);
}

.btn-delete {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
}

.btn-delete:hover {
    background: rgba(239, 68, 68, 0.3);
}

.btn-edit svg, .btn-delete svg {
    width: 18px;
    height: 18px;
}

/* Modal Styles */
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
    z-index: 1001;
    padding: 20px;
}

.modal {
    background: #1a1f3a;
    border-radius: 20px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.confirm-modal {
    max-width: 400px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
    color: white;
}

.close-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 28px;
    cursor: pointer;
    line-height: 1;
}

.close-btn:hover {
    color: white;
}

.modal-body {
    padding: 24px;
}

.modal-body p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 12px;
}

.warning-text {
    color: #fca5a5 !important;
    font-size: 13px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    margin-bottom: 8px;
    font-size: 14px;
}

.form-group input, .form-group textarea, .form-group select {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: white;
    font-size: 14px;
    transition: all 0.2s;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
    outline: none;
    border-color: #003d82;
    box-shadow: 0 0 0 3px rgba(0, 61, 130, 0.2);
}

.form-group select option {
    background: #1a1f3a;
    color: white;
}

.image-upload-area {
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}

.image-upload-area:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.02);
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.5);
}

.upload-placeholder svg {
    width: 40px;
    height: 40px;
}

.preview-image {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary {
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
    padding: 12px 24px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-danger:hover {
    background: #dc2626;
}

.btn-danger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .header-left {
        flex-direction: column;
        align-items: flex-start;
    }

    .news-table {
        display: block;
        overflow-x: auto;
    }
}
</style>
