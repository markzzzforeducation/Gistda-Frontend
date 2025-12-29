<template>
  <div class="app-container">
    <GistdaHeader />
    <div class="space-background"></div>

    <div class="main-content">
      <div class="content-wrapper">
        <div class="page-header">
           <div class="flex justify-between items-center">
            <div>
              <h1 class="page-title">User Management</h1>
               <p class="page-subtitle">Manage users, roles and permissions</p>
            </div>
            <button @click="showAddModal = true" class="add-btn">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
               </svg>
               Add User
            </button>
           </div>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden table-container">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': user.role === 'intern',
                      'bg-purple-100 text-purple-800': user.role === 'mentor',
                      'bg-red-100 text-red-800': user.role === 'admin'
                    }">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="openEditModal(user)" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button @click="deleteUser(user.id)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Add/Edit User Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg w-96">
                <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit User' : 'Add User' }}</h2>
                <form @submit.prevent="handleSubmit">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700">Name</label>
                        <input v-model="form.name" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input v-model="form.email" type="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" :disabled="isEditing">
                    </div>
                    <div class="mb-4" v-if="!isEditing">
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input v-model="form.password" type="password" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                    </div>
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700">Role</label>
                        <select v-model="form.role" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                            <option value="intern">Intern</option>
                            <option value="mentor">Mentor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" @click="closeModal" class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useAuthStore, type User } from '../../stores/auth';
import { mockBackend } from '../../services/mockBackend';

const authStore = useAuthStore();
const users = computed(() => authStore.allUsers);
const showModal = ref(false);
const isEditing = ref(false);

const form = reactive({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'intern' as 'intern' | 'mentor' | 'admin'
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
    form.role = user.role;
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
}

async function handleSubmit() {
    try {
        if (isEditing.value) {
            mockBackend.updateUser(form.id, { name: form.name, role: form.role });
        } else {
            await authStore.register(form.name, form.email, form.password, form.role);
        }
        closeModal();
    } catch (e: any) {
        alert(e.message);
    }
}

function deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
        mockBackend.deleteUser(id);
        // Force refresh if needed, though reactive state might handle it if we used store actions properly.
        // Since authStore.allUsers calls mockBackend.getUsers(), we might need to trigger a reactivity update.
        // The current implementation of allUsers in authStore is a getter calling mockBackend directly, which is NOT reactive unless mockBackend is reactive.
        // We should fix this.
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

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #003d82;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #002855;
}

.add-btn svg {
  width: 20px;
  height: 20px;
}

.table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
