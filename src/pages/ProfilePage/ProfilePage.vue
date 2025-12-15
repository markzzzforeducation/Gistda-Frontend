<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { mockBackend } from '../../services/mockBackend';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('');
const isEditing = ref(false);
const message = ref('');

onMounted(async () => {
    if (!auth.currentUser) {
        await auth.init();
    }
    if (auth.currentUser) {
        name.value = auth.currentUser.name;
        email.value = auth.currentUser.email;
        role.value = auth.currentUser.role;
        // Password is not shown for security, but can be reset
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
        
        // Update local store
        auth.currentUser = updatedUser;
        localStorage.setItem('kb-user', JSON.stringify(updatedUser)); // Update if stored fully, though we store ID usually
        
        message.value = 'Profile updated successfully!';
        isEditing.value = false;
        password.value = '';
        
        setTimeout(() => message.value = '', 3000);
    } catch (e: any) {
        message.value = 'Error: ' + e.message;
    }
}
</script>

<template>
    <div class="profile-page">
        <div class="page-container">
            <div class="page-header">
                <button class="back-button" @click="router.back()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
                <h1 class="page-title">My Profile</h1>
            </div>

            <div class="profile-card">
                <div class="profile-header">
                    <div class="avatar-large">
                        {{ name.slice(0, 1).toUpperCase() }}
                    </div>
                    <div class="profile-info-header">
                        <h2 class="profile-name">{{ name }}</h2>
                        <span class="role-badge" :class="role">{{ role }}</span>
                    </div>
                </div>

                <div class="profile-form">
                    <div class="form-group">
                        <label>Email</label>
                        <input v-model="email" disabled class="input-disabled" />
                        <span class="help-text">Email cannot be changed</span>
                    </div>

                    <div class="form-group">
                        <label>Full Name</label>
                        <input v-model="name" :disabled="!isEditing" class="input-field" :class="{ 'is-editing': isEditing }" />
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

                    <div v-if="message" class="message-box" :class="{ error: message.includes('Error') }">
                        {{ message }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 40px 20px;
}

.page-container {
    max-width: 800px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    color: #64748b;
    font-weight: 500;
    transition: all 0.2s;
}

.back-button:hover {
    background: #f1f5f9;
    color: #334155;
}

.back-button svg {
    width: 20px;
    height: 20px;
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

.profile-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.5);
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid #e2e8f0;
}

.avatar-large {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 40px;
    font-weight: 700;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.profile-info-header {
    flex: 1;
}

.profile-name {
    font-size: 32px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
}

.role-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.role-badge.admin { background: #fee2e2; color: #991b1b; }
.role-badge.mentor { background: #e0e7ff; color: #3730a3; }
.role-badge.intern { background: #dcfce7; color: #166534; }

.profile-form {
    display: flex;
    flex-direction: column;
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
    color: #64748b;
}

.input-field, .input-disabled {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 16px;
    border: 2px solid #e2e8f0;
    background: #f8fafc;
    color: #334155;
    transition: all 0.2s;
}

.input-disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
}

.input-field.is-editing {
    background: white;
    border-color: #cbd5e1;
}

.input-field.is-editing:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.help-text {
    font-size: 12px;
    color: #94a3b8;
}

.form-actions {
    margin-top: 16px;
}

.edit-actions {
    display: flex;
    gap: 16px;
}

.btn-primary, .btn-secondary {
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
    background: white;
    border: 2px solid #e2e8f0;
    color: #64748b;
}

.btn-secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
}

.message-box {
    padding: 12px;
    border-radius: 8px;
    background: #dcfce7;
    color: #166534;
    font-weight: 500;
    text-align: center;
}

.message-box.error {
    background: #fee2e2;
    color: #991b1b;
}
</style>
