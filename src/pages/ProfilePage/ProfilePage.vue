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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.profile-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a1628 100%);
    padding: 40px 20px;
    position: relative;
}

.profile-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        radial-gradient(circle at 20% 50%, rgba(0, 61, 130, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(0, 40, 85, 0.1) 0%, transparent 50%);
    pointer-events: none;
}

.page-container {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
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
    font-size: 32px;
    font-weight: 800;
    color: white;
    margin: 0;
    letter-spacing: -1px;
}

.profile-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-large {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 40px;
    font-weight: 700;
    box-shadow: 0 10px 30px rgba(0, 61, 130, 0.4);
}

.profile-info-header {
    flex: 1;
}

.profile-name {
    font-size: 32px;
    font-weight: 800;
    color: white;
    margin: 0 0 8px 0;
    letter-spacing: -1px;
}

.role-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.role-badge.admin { 
    background: rgba(239, 68, 68, 0.2); 
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.3);
}

.role-badge.mentor { 
    background: rgba(99, 102, 241, 0.2); 
    color: #c7d2fe;
    border-color: rgba(99, 102, 241, 0.3);
}

.role-badge.intern { 
    background: rgba(34, 197, 94, 0.2); 
    color: #86efac;
    border-color: rgba(34, 197, 94, 0.3);
}

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
    color: rgba(255, 255, 255, 0.8);
}

.input-field, .input-disabled {
    padding: 14px 18px;
    border-radius: 12px;
    font-size: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    transition: all 0.3s;
}

.input-field::placeholder {
    color: rgba(255, 255, 255, 0.3);
}

.input-disabled {
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.4);
    cursor: not-allowed;
    border-color: rgba(255, 255, 255, 0.05);
}

.input-field.is-editing {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
}

.input-field.is-editing:focus {
    border-color: #003d82;
    outline: none;
    box-shadow: 0 0 0 4px rgba(0, 61, 130, 0.2);
    background: rgba(255, 255, 255, 0.1);
}

.help-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
}

.form-actions {
    margin-top: 16px;
}

.edit-actions {
    display: flex;
    gap: 16px;
}

.btn-primary, .btn-secondary {
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary {
    background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
    color: white;
    border: none;
    box-shadow: 0 8px 20px rgba(0, 61, 130, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 61, 130, 0.4);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: white;
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
}

.message-box {
    padding: 14px 20px;
    border-radius: 12px;
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
    font-weight: 500;
    text-align: center;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.message-box.error {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
    .profile-page {
        padding: 30px 16px;
    }

    .page-title {
        font-size: 24px;
    }

    .profile-card {
        padding: 30px 24px;
    }

    .profile-header {
        flex-direction: column;
        text-align: center;
        align-items: center;
    }

    .profile-name {
        font-size: 26px;
    }

    .avatar-large {
        width: 80px;
        height: 80px;
        font-size: 32px;
    }

    .edit-actions {
        flex-direction: column;
    }

    .btn-primary, .btn-secondary {
        width: 100%;
    }
}
</style>
