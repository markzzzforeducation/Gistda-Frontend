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
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 class="page-title">จัดการผู้ใช้</h1>
              <p class="page-subtitle">จัดการผู้ใช้ บทบาท และสิทธิ์การใช้งาน</p>
            </div>
          </div>
          <button @click="openAddModal" class="add-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            เพิ่มผู้ใช้
          </button>
        </div>

        <div class="table-card">
          <table class="users-table">
            <thead>
              <tr>
                <th>
                  <div class="th-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Name
                  </div>
                </th>
                <th>
                  <div class="th-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Email
                  </div>
                </th>
                <th>
                  <div class="th-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Role
                  </div>
                </th>
                <th>
                  <div class="th-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke-width="2" stroke-linecap="round"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke-width="2" stroke-linecap="round"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"/>
                    </svg>
                    ระยะเวลาฝึกงาน
                  </div>
                </th>
                <th class="text-right">
                  <div class="th-content justify-end">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="1" stroke-width="2"/>
                      <circle cx="19" cy="12" r="1" stroke-width="2"/>
                      <circle cx="5" cy="12" r="1" stroke-width="2"/>
                    </svg>
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="table-row">
                <td>
                  <div class="user-name">{{ user.name }}</div>
                </td>
                <td>
                  <div class="user-email">{{ user.email }}</div>
                </td>
                <td>
                  <span class="role-badge" :class="`role-${user.role}`">
                    <svg v-if="user.role === 'admin'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else-if="user.role === 'mentor'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <div v-if="user.role === 'intern' && user.profile" class="duration-info">
                    <span v-if="user.profile.startDate || user.profile.endDate">
                      {{ formatDate(user.profile.startDate) }} - {{ formatDate(user.profile.endDate) }}
                    </span>
                    <span v-else class="no-data">ไม่ระบุ</span>
                  </div>
                  <span v-else class="no-data">-</span>
                </td>
                <td class="text-right">
                  <div class="action-buttons">
                    <!-- For interns: Show Activate or Deactivate based on isActive status -->
                    <template v-if="user.role === 'intern'">
                      <!-- For inactive interns: show Inactive badge + Activate button -->
                      <template v-if="user.isActive === false">
                        <span class="status-badge status-inactive">✗ Inactive</span>
                        <button @click="activateUser(user.id)" class="action-btn activate-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="10" stroke-width="2"/>
                          </svg>
                          Activate
                        </button>
                      </template>
                      <!-- For active interns: show Deactivate button + Active badge -->
                      <template v-else-if="user.isActive === true">
                        <button @click="deactivateUser(user.id)" class="action-btn deactivate-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18.36 6.64a9 9 0 11-12.73 0" stroke-width="2" stroke-linecap="round"/>
                            <line x1="12" y1="2" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                          Deactivate
                        </button>
                        <span class="status-badge status-active">✓ Active</span>
                      </template>
                      <!-- For legacy data: show Activate button -->
                      <template v-else>
                        <button @click="activateUser(user.id)" class="action-btn activate-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="10" stroke-width="2"/>
                          </svg>
                          Activate
                        </button>
                      </template>
                    </template>
                    
                    <button @click="openEditModal(user)" class="action-btn edit-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Edit
                    </button>
                    <button @click="deleteUser(user.id)" class="action-btn delete-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6H5H21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Add/Edit User Modal -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2 class="modal-title">{{ isEditing ? 'Edit User' : 'Add New User' }}</h2>
              <button @click="closeModal" class="modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6L18 18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="handleSubmit" class="modal-form">
              <div class="form-group">
                <label class="form-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Name
                </label>
                <input v-model="form.name" type="text" required class="form-input" placeholder="Enter full name">
              </div>
              
              <div class="form-group">
                <label class="form-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="22,6 12,13 2,6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Email
                </label>
                <input v-model="form.email" type="email" required class="form-input" placeholder="user@example.com" :disabled="isEditing">
              </div>
              
              <div class="form-group" v-if="!isEditing">
                <label class="form-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Password
                </label>
                <input v-model="form.password" type="password" required class="form-input" placeholder="Enter password">
              </div>
              
              <div class="form-group">
                <label class="form-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Role
                </label>
                <select v-model="form.role" class="form-input">
                  <option value="intern">Intern</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div class="modal-actions">
                <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
                <button type="submit" class="btn-submit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 2.58579C3.96086 2.21071 4.46957 2 5 2H16L21 7V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M17 21V13H7V21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 3V8H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ isEditing ? 'Update User' : 'Create User' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>


    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay success-overlay" @click="showSuccessModal = false">
      <div class="modal-content success-box" @click.stop>
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3>ดำเนินการสำเร็จ</h3>
        <p>{{ successMessage }}</p>
      </div>
    </div>
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay delete-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content delete-box" @click.stop>
        <div class="delete-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <h3>ยืนยันการลบ</h3>
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? <br>การกระทำนี้ไม่สามารถเรียกคืนได้</p>
        <div class="modal-actions delete-actions">
          <button @click="showDeleteConfirm = false" class="btn-cancel">ยกเลิก</button>
          <button @click="confirmDelete" class="btn-delete-confirm">ลบผู้ใช้</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useAuthStore, type User } from '../../stores/auth';
import { getAuthToken } from '../../lib/api';
import { useRouter } from 'vue-router';
import GistdaHeader from '../../components/GistdaHeader.vue';

const authStore = useAuthStore();
const router = useRouter();
const users = computed(() => authStore.allUsers);
const showModal = ref(false);
const showSuccessModal = ref(false);
const successMessage = ref('');
const isEditing = ref(false);
const isLoading = ref(false);
const showDeleteConfirm = ref(false);
const deleteId = ref('');

const form = reactive({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'intern' as 'intern' | 'mentor' | 'admin'
});

onMounted(async () => {
    isLoading.value = true;
    await authStore.fetchAllUsers();
    isLoading.value = false;
});

function openAddModal() {
    isEditing.value = false;
    form.name = '';
    form.email = '';
    form.password = '';
    form.role = 'intern';
    showModal.value = true;
}

function openEditModal(user: User) {
    isEditing.value = true;
    form.id = user.id;
    form.name = user.name;
    form.email = user.email;
    form.role = user.role as 'intern' | 'mentor' | 'admin';
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
}

async function handleSubmit() {
    try {
        if (isEditing.value) {
            const result = await authStore.updateUserById(form.id, { name: form.name, role: form.role });
            if (!result.ok) {
                alert(result.message || 'Failed to update user');
                return;
            }
        } else {
            const result = await authStore.register(form.name, form.email, form.password, form.role);
            if (!result.ok) {
                alert(result.message || 'Failed to create user');
                return;
            }
        }
        closeModal();
    } catch (e: any) {
        alert(e.message);
    }
}

function deleteUser(id: string) {
    deleteId.value = id;
    showDeleteConfirm.value = true;
}

async function confirmDelete() {
    try {
        const result = await authStore.deleteUserById(deleteId.value);
        if (result.ok) {
             showDeleteConfirm.value = false;
             successMessage.value = 'ลบผู้ใช้เรียบร้อยแล้ว';
             showSuccessModal.value = true;
             setTimeout(() => {
                 showSuccessModal.value = false;
             }, 2000);
        } else {
             alert(result.message || 'ไม่สามารถลบผู้ใช้ได้');
        }
    } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
    }
}

async function activateUser(id: string) {
    try {
        const token = getAuthToken();
        const res = await fetch(`/api/interns/${id}/activate`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (res.ok) {
            successMessage.value = 'เปิดใช้งานนิสิตเรียบร้อยแล้ว!';
            showSuccessModal.value = true;
            await authStore.fetchAllUsers();
            setTimeout(() => {
                showSuccessModal.value = false;
            }, 2000);
        } else {
            const data = await res.json();
            alert(data.error || 'ไม่สามารถเปิดใช้งานได้');
        }
    } catch (error) {
        console.error('Activate error:', error);
        alert('เกิดข้อผิดพลาดในการเปิดใช้งาน');
    }
}

async function deactivateUser(id: string) {
    try {
        const token = getAuthToken();
        const res = await fetch(`/api/interns/${id}/deactivate`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (res.ok) {
            successMessage.value = 'ปิดใช้งานนิสิตเรียบร้อยแล้ว!';
            showSuccessModal.value = true;
            await authStore.fetchAllUsers();
            setTimeout(() => {
                showSuccessModal.value = false;
            }, 2000);
        } else {
            const data = await res.json();
            alert(data.error || 'ไม่สามารถปิดใช้งานได้');
        }
    } catch (error) {
        console.error('Deactivate error:', error);
        alert('เกิดข้อผิดพลาดในการปิดใช้งาน');
    }
}

function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return 'ไม่ระบุ';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}
</script>

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
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px 60px;
}

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

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-4px);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
}

.header-icon svg {
  width: 28px;
  height: 28px;
  color: white;
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

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #003d82, #002855);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 61, 130, 0.3);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 61, 130, 0.4);
  background: linear-gradient(135deg, #002855, #001a3a);
}

.add-btn:active {
  transform: translateY(0);
}

.add-btn svg {
  width: 20px;
  height: 20px;
}

/* Table Styles */
.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #e2e8f0;
}

.users-table th {
  padding: 18px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.th-content svg {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.users-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.table-row:hover {
  background: linear-gradient(to right, #f8fafc, #ffffff);
  transform: scale(1.001);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.users-table td {
  padding: 20px 24px;
  font-size: 15px;
  color: #334155;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
}

.user-email {
  color: #64748b;
  font-size: 14px;
}

.duration-info {
  font-size: 13px;
  color: #475569;
  white-space: nowrap;
}

.no-data {
  color: #94a3b8;
  font-style: italic;
  font-size: 13px;
}

.text-right {
  text-align: right;
}

/* Role Badges */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
  transition: all 0.2s;
}

.role-badge svg {
  width: 16px;
  height: 16px;
}

.role-intern {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border: 1.5px solid #6ee7b7;
}

.role-mentor {
  background: linear-gradient(135deg, #e9d5ff, #d8b4fe);
  color: #6b21a8;
  border: 1.5px solid #c084fc;
}

.role-admin {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  color: #991b1b;
  border: 1.5px solid #f87171;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.edit-btn {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border: 1.5px solid #93c5fd;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #bfdbfe, #93c5fd);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  border: 1.5px solid #fca5a5;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.activate-btn {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border: 1.5px solid #6ee7b7;
}

.activate-btn:hover {
  background: linear-gradient(135deg, #a7f3d0, #6ee7b7);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.deactivate-btn {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border: 1.5px solid #fcd34d;
}

.deactivate-btn:hover {
  background: linear-gradient(135deg, #fde68a, #fcd34d);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.status-active {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.status-badge.status-inactive {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.action-btn:active {
  transform: translateY(0);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  border-bottom: 2px solid #f1f5f9;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e2e8f0;
  transform: rotate(90deg);
}

.modal-close svg {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.success-overlay {
    z-index: 1100;
}

.success-box {
    max-width: 380px;
    text-align: center;
    padding: 32px;
}

.success-icon {
    width: 64px;
    height: 64px;
    background: #d1fae5;
    color: #059669;
    border-radius: 50%;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.success-icon svg {
    width: 32px;
    height: 32px;
}

.success-box h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    color: #111827;
}

.success-box p {
    color: #4b5563;
    margin: 0;
}

.delete-overlay {
    z-index: 1200;
}

.delete-box {
    max-width: 400px;
    text-align: center;
    padding: 32px;
}

.delete-icon {
    width: 64px;
    height: 64px;
    background: #fee2e2;
    color: #ef4444;
    border-radius: 50%;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.delete-icon svg {
    width: 32px;
    height: 32px;
}

.delete-actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: center;
    border-top: none;
    padding: 0;
}

.btn-delete-confirm {
    padding: 10px 24px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-delete-confirm:hover {
    background: #dc2626;
}

.modal-form {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.form-label svg {
  width: 18px;
  height: 18px;
  color: #64748b;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.2s;
  background: white;
}

.form-input:hover {
  border-color: #cbd5e1;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #94a3b8;
}

select.form-input {
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-cancel {
  flex: 1;
  padding: 13px 24px;
  background: #f1f5f9;
  color: #475569;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.btn-submit {
  flex: 1;
  padding: 13px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.btn-submit:active {
  transform: translateY(0);
}

.btn-submit svg {
  width: 18px;
  height: 18px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 20px 40px;
  }

  .page-header {
    padding: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .users-table th,
  .users-table td {
    padding: 12px 16px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 6px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-content {
    margin: 20px;
    max-width: calc(100% - 40px);
  }

  .modal-header,
  .modal-form {
    padding: 24px;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
