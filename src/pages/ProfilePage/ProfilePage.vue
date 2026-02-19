<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { mockBackend } from '../../services/mockBackend';
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';

const auth = useAuthStore();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('');
const avatar = ref<string | null>(null);
const isEditing = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const isUploadingAvatar = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Computed property to get avatar URL with backend base
const avatarUrl = computed(() => {
    if (avatar.value) {
        if (avatar.value.startsWith('/')) {
            return avatar.value;
        }
        return avatar.value;
    }
    return null;
});

onMounted(async () => {
    if (!auth.currentUser) {
        await auth.init();
    }
    if (auth.currentUser) {
        name.value = auth.currentUser.name;
        email.value = auth.currentUser.email;
        role.value = auth.currentUser.role;
        avatar.value = auth.currentUser.avatar || null;
    } else {
        router.push('/auth');
    }
});

async function saveProfile() {
    if (!auth.currentUser) return;
    try {
        const updates: any = { name: name.value };
        if (password.value) {
            updates.password = password.value;
        }
        
        const updatedUser = mockBackend.updateUser(auth.currentUser.id, updates);
        
        auth.currentUser = updatedUser;
        localStorage.setItem('kb-user', JSON.stringify(updatedUser));
        
        message.value = 'Profile updated successfully!';
        messageType.value = 'success';
        isEditing.value = false;
        password.value = '';
        
        setTimeout(() => message.value = '', 3000);
    } catch (e: any) {
        message.value = 'Error: ' + e.message;
        messageType.value = 'error';
    }
}

function triggerFileInput() {
    fileInput.value?.click();
}

async function handleAvatarUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !auth.currentUser) return;

    if (!file.type.startsWith('image/')) {
        message.value = 'Error: Please select an image file';
        messageType.value = 'error';
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        message.value = 'Error: Image size must be less than 5MB';
        messageType.value = 'error';
        return;
    }

    isUploadingAvatar.value = true;
    message.value = '';

    try {
        const base64 = await fileToBase64(file);
        const token = sessionStorage.getItem('kb-token');
        
        const response = await fetch(`/api/users/${auth.currentUser.id}/avatar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ avatar: base64 })
        });

        if (!response.ok) {
            throw new Error('Failed to upload avatar');
        }

        const data = await response.json();
        avatar.value = data.avatarUrl;
        
        if (auth.currentUser) {
            auth.currentUser.avatar = data.avatarUrl;
        }
        
        message.value = 'Avatar updated successfully!';
        messageType.value = 'success';
        setTimeout(() => message.value = '', 3000);
    } catch (e: any) {
        message.value = 'Error: ' + e.message;
        messageType.value = 'error';
    } finally {
        isUploadingAvatar.value = false;
        if (fileInput.value) {
            fileInput.value.value = '';
        }
    }
}

async function deleteAvatar() {
    if (!auth.currentUser || !avatar.value) return;

    isUploadingAvatar.value = true;
    message.value = '';

    try {
        const token = sessionStorage.getItem('kb-token');
        
        const response = await fetch(`/api/users/${auth.currentUser.id}/avatar`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete avatar');
        }

        avatar.value = null;
        if (auth.currentUser) {
            auth.currentUser.avatar = undefined;
        }
        
        message.value = 'Avatar removed successfully!';
        messageType.value = 'success';
        setTimeout(() => message.value = '', 3000);
    } catch (e: any) {
        message.value = 'Error: ' + e.message;
        messageType.value = 'error';
    } finally {
        isUploadingAvatar.value = false;
    }
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}
</script>

<template>
    <div class="app-container">
        <GistdaHeader />
        <div class="space-background"></div>
        
        <div class="main-content">
            <div class="content-wrapper">
                <!-- Back Button -->
                <button class="back-button" @click="router.back()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>

                <!-- Page Header Card -->
                <div class="page-header-card">
                    <div class="header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 class="page-title">My Profile</h1>
                        <p class="page-subtitle">จัดการข้อมูลส่วนตัวและบัญชีผู้ใช้</p>
                    </div>
                </div>

                <!-- Profile Content Card -->
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="avatar-section">
                            <div class="avatar-wrapper">
                                <div class="avatar-large" @click="triggerFileInput" :class="{ 'has-image': avatarUrl, 'uploading': isUploadingAvatar }">
                                    <img v-if="avatarUrl" :src="avatarUrl" alt="Profile picture" class="avatar-image" />
                                    <span v-else class="avatar-initial">{{ name.slice(0, 1).toUpperCase() }}</span>
                                    <div v-if="isUploadingAvatar" class="upload-spinner"></div>
                                </div>
                                <button class="avatar-edit-btn" @click.stop="triggerFileInput" title="Change Profile Picture">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>
                            
                            <input 
                                ref="fileInput" 
                                type="file" 
                                accept="image/*" 
                                @change="handleAvatarUpload" 
                                class="hidden-input" 
                            />
                            
                            <div class="avatar-info-group">
                                <h2 class="profile-name">{{ name }}</h2>
                                <div class="badges-row">
                                    <span class="role-badge" :class="role">{{ role }}</span>
                                    <button v-if="avatarUrl && !isUploadingAvatar" @click="deleteAvatar" class="btn-text-danger">Remove Photo</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="profile-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email</label>
                                <div class="input-wrapper">
                                    <input v-model="email" disabled class="input-field disabled" />
                                    <span class="help-text">Email cannot be changed</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Full Name</label>
                                <input v-model="name" :disabled="!isEditing" class="input-field" :class="{ 'is-editing': isEditing }" />
                            </div>
                        </div>

                        <div class="form-group" v-if="isEditing">
                            <label>New Password (leave blank to keep current)</label>
                            <input v-model="password" type="password" placeholder="Enter new password" class="input-field is-editing" />
                        </div>

                        <div class="form-actions">
                            <div v-if="!isEditing">
                                <button @click="isEditing = true" class="btn-primary">Edit Profile</button>
                            </div>
                            <div v-else class="edit-actions">
                                <button @click="isEditing = false" class="btn-secondary">Cancel</button>
                                <button @click="saveProfile" class="btn-primary">Save Changes</button>
                            </div>
                        </div>

                        <div v-if="message" class="message-box" :class="messageType">
                            {{ message }}
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
    width: 100%;
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
    display: flex;
    flex-direction: column;
    padding-top: 40px;
    box-sizing: border-box;
}

.content-wrapper {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 40px 60px;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

/* Back Button */
.back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    cursor: pointer;
    color: white;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s;
    width: fit-content;
    margin-bottom: 24px;
}

.back-button:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-4px);
}

.back-button svg {
    width: 18px;
    height: 18px;
}

/* Page Header Card */
.page-header-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 24px 32px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
    flex-shrink: 0;
}

.header-icon svg {
    width: 28px;
    height: 28px;
}

.page-title {
    font-size: 28px;
    font-weight: 800;
    color: #1f2937;
    margin: 0 0 4px 0;
}

.page-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
}

/* Profile Content Card */
.profile-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 32px;
    width: 100%;
    box-sizing: border-box;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.profile-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid #e5e7eb;
}

.avatar-section {
    display: flex;
    align-items: center;
    gap: 32px;
    width: 100%;
}

.avatar-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    flex-shrink: 0;
}

.avatar-large {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 48px;
    font-weight: 700;
    box-shadow: 0 10px 30px rgba(0, 61, 130, 0.3);
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
}

.avatar-large:hover {
    transform: scale(1.02);
    box-shadow: 0 15px 40px rgba(0, 61, 130, 0.4);
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-edit-btn {
    position: absolute;
    bottom: -8px;
    right: -8px;
    width: 40px;
    height: 40px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    transition: all 0.2s;
    z-index: 10;
}

.avatar-edit-btn:hover {
    background: #2563eb;
    transform: scale(1.1);
}

.avatar-edit-btn svg {
    width: 20px;
    height: 20px;
}

.avatar-info-group {
    flex: 1;
}

.profile-name {
    font-size: 32px;
    font-weight: 800;
    color: #1f2937;
    margin: 0 0 12px 0;
}

.badges-row {
    display: flex;
    align-items: center;
    gap: 16px;
}

.role-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.role-badge.admin { background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.2); }
.role-badge.mentor { background: rgba(99, 102, 241, 0.1); color: #4f46e5; border: 1px solid rgba(99, 102, 241, 0.2); }
.role-badge.intern { background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.2); }

.btn-text-danger {
    background: none;
    border: none;
    color: #ef4444;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
}

.btn-text-danger:hover {
    color: #dc2626;
    text-decoration: underline;
}

/* Form Styles */
.profile-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
}

.input-field {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 16px;
    border: 2px solid #e5e7eb;
    background: white;
    color: #1f2937;
    transition: all 0.2s;
    width: 100%;
    box-sizing: border-box;
}

.input-field:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-field.disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
    border-color: #f3f4f6;
}

.input-field.is-editing {
    background: white;
    border-color: #d1d5db;
}

.input-field.is-editing:focus {
    border-color: #3b82f6;
}

.help-text {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
    display: block;
}

.form-actions {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
}

.edit-actions {
    display: flex;
    gap: 12px;
}

.btn-primary {
    padding: 12px 28px;
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0, 61, 130, 0.2);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 61, 130, 0.3);
}

.btn-secondary {
    padding: 12px 24px;
    background: white;
    border: 2px solid #e5e7eb;
    color: #4b5563;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    color: #1f2937;
}

.message-box {
    padding: 14px;
    border-radius: 12px;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
}

.message-box.success {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.2);
}

.message-box.error {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.upload-spinner {
    position: absolute;
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.hidden-input {
    display: none;
}

@media (max-width: 768px) {
    .content-wrapper {
        padding: 0 16px 40px;
    }
    
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .profile-header {
        align-items: center;
        text-align: center;
    }
    
    .avatar-section {
        flex-direction: column;
        gap: 16px;
    }
    
    .badges-row {
        justify-content: center;
    }
    
    .form-actions {
        justify-content: stretch;
    }
    
    .btn-primary, .btn-secondary {
        width: 100%;
    }
    
    .page-header-card {
        flex-direction: column;
        text-align: center;
    }

    .profile-card {
        padding: 20px;
    }

    .page-title {
        font-size: 22px;
    }

    .profile-name {
        font-size: 24px;
    }
}

@media (max-width: 480px) {
    .content-wrapper {
        padding: 0 12px 32px;
    }

    .profile-card {
        padding: 16px;
        border-radius: 16px;
    }

    .avatar-wrapper {
        width: 90px;
        height: 90px;
    }

    .profile-name {
        font-size: 20px;
    }

    .page-title {
        font-size: 20px;
    }
}
</style>
