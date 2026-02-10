<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNewsStore, type News } from '../../stores/news';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';

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
    <div class="app-container">
        <GistdaHeader />
        <div class="space-background"></div>
        
        <div class="main-content">
            <div class="content-wrapper">
                <!-- Back Button -->
                <button class="back-btn" @click="router.push('/admin')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับไปหน้า Admin Dashboard
                </button>

                <!-- Page Header -->
                <div class="page-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <div>
                            <h1 class="page-title">จัดการข่าวสาร</h1>
                            <p class="page-subtitle">จัดการข่าวประชาสัมพันธ์และกิจกรรมต่างๆ</p>
                        </div>
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

                <!-- News Table Card -->
                <div class="table-card">
                    <table class="news-table">
                        <thead>
                            <tr>
                                <th>รูปภาพ</th>
                                <th>หัวข้อ</th>
                                <th>หมวดหมู่</th>
                                <th>วันที่เผยแพร่</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="newsStore.news.length === 0">
                                <td colspan="5" class="empty-cell">
                                    <div class="empty-state-content">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                        <p>ยังไม่มีข่าวสาร</p>
                                    </div>
                                </td>
                            </tr>
                            <tr v-for="news in newsStore.news" :key="news.id" class="table-row">
                                <td>
                                    <div class="thumbnail-wrapper">
                                        <img :src="news.imageUrl" :alt="news.title" class="news-thumbnail" />
                                    </div>
                                </td>
                                <td>
                                    <div class="news-info">
                                        <span class="news-title">{{ news.title }}</span>
                                        <span class="news-desc">{{ news.description.slice(0, 60) }}...</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="category-badge" :class="`cat-${news.category}`">
                                        {{ getCategoryLabel(news.category) }}
                                    </span>
                                </td>
                                <td class="date-col">{{ formatDate(news.publishDate) }}</td>
                                <td class="text-right">
                                    <div class="action-buttons">
                                        <button @click="openEditModal(news)" class="action-btn edit-btn">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>
                                        <button @click="confirmDelete(news)" class="action-btn delete-btn">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
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
                                {{ isLoading ? 'กำลังบันทึก...' : (isEditing ? 'บันทึก' : 'สร้างข่าว') }}
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
    min-height: 100vh;
}

.content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px 60px;
}

/* Back Button */
.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 20px;
}

.back-btn svg {
    width: 18px;
    height: 18px;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-4px);
}

/* Page Header */
.page-header {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 28px 32px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 20px;
}

.header-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 61, 130, 0.3);
}

.header-icon svg {
    width: 28px;
    height: 28px;
}

.page-title {
    font-size: 28px;
    font-weight: 800;
    color: #1f2937;
    margin: 0 0 6px 0;
}

.page-subtitle {
    font-size: 14px;
    color: #6b7280;
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
    box-shadow: 0 4px 12px rgba(0, 61, 130, 0.2);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 61, 130, 0.4);
}

.btn-primary svg {
    width: 18px;
    height: 18px;
}

/* Table Card */
.table-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.news-table {
    width: 100%;
    border-collapse: collapse;
}

.news-table th {
    padding: 18px 24px;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
}

.news-table td {
    padding: 24px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    vertical-align: middle;
}

.table-row:hover {
    background: #f8fafc;
}

/* Thumbnail */
.thumbnail-wrapper {
    width: 100px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.news-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* News Info */
.news-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.news-title {
    font-weight: 600;
    color: #1e293b;
    font-size: 15px;
}

.news-desc {
    font-size: 13px;
    color: #64748b;
}

.date-col {
    color: #64748b;
    font-size: 14px;
}

/* Category Badges */
.category-badge {
    display: inline-flex;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.cat-general { background: #f3f4f6; color: #4b5563; }
.cat-event { background: #eff6ff; color: #2563eb; }
.cat-announcement { background: #fef2f2; color: #dc2626; }
.cat-training { background: #f0fdf4; color: #16a34a; }
.cat-technology { background: #faf5ff; color: #9333ea; }

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.action-btn svg {
    width: 14px;
    height: 14px;
}

.edit-btn {
    background: #eff6ff;
    color: #2563eb;
}

.edit-btn:hover {
    background: #dbeafe;
    color: #1d4ed8;
}

.delete-btn {
    background: #fef2f2;
    color: #ef4444;
}

.delete-btn:hover {
    background: #fee2e2;
    color: #dc2626;
}

.text-right {
    text-align: right;
}

/* Empty State */
.empty-cell {
    padding: 60px 0;
    text-align: center;
}

.empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #94a3b8;
}

.empty-state-content svg {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
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
    backdrop-filter: blur(4px);
}

.modal {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
    color: #1e293b;
    font-weight: 700;
}

.close-btn {
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 28px;
    cursor: pointer;
    line-height: 1;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #64748b;
}

.modal-body {
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: #475569;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
}

.form-group input, .form-group textarea, .form-group select {
    width: 100%;
    padding: 12px 16px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    color: #1e293b;
    font-size: 14px;
    transition: all 0.2s;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
    outline: none;
    border-color: #003d82;
    box-shadow: 0 0 0 3px rgba(0, 61, 130, 0.1);
}

.form-group select option {
    background: white;
    color: #1e293b;
}

.image-upload-area {
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: #f8fafc;
}

.image-upload-area:hover {
    border-color: #003d82;
    background: #f1f5f9;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #64748b;
}

.upload-placeholder svg {
    width: 40px;
    height: 40px;
}

.preview-image {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
}

.btn-secondary {
    padding: 12px 24px;
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    border-color: #cbd5e1;
    color: #475569;
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

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(4px);
}

.spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #e2e8f0;
    border-top-color: #003d82;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
    .content-wrapper {
        padding: 0 20px 40px;
    }

    .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
        padding: 24px;
    }

    .header-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .table-card {
        overflow-x: auto;
    }
}
</style>
