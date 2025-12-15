<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGalleryStore } from '../../stores/gallery';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const galleryStore = useGalleryStore();
const auth = useAuthStore();
const router = useRouter();

const title = ref('');
const abstract = ref('');
const imageUrl = ref('');
const message = ref('');
const isSubmitting = ref(false);

const mySubmissions = computed(() => {
    return auth.currentUser ? galleryStore.mySubmissions(auth.currentUser.id) : [];
});

onMounted(async () => {
    await galleryStore.fetchSubmissions();
});

async function submitProject() {
    if (!title.value || !abstract.value || !imageUrl.value || !auth.currentUser) return;
    
    isSubmitting.value = true;
    try {
        await galleryStore.createSubmission({
            title: title.value,
            abstract: abstract.value,
            imageUrl: imageUrl.value,
            studentName: auth.currentUser.name,
            studentId: auth.currentUser.id,
        });
        message.value = 'Project submitted successfully! Pending approval.';
        title.value = '';
        abstract.value = '';
        imageUrl.value = '';
    } catch (e: any) {
        message.value = 'Error: ' + e.message;
    } finally {
        isSubmitting.value = false;
        setTimeout(() => message.value = '', 5000);
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'published': return 'bg-green-100 text-green-800';
        case 'approved': return 'bg-blue-100 text-blue-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
}
</script>

<template>
    <div class="submission-page">
        <div class="page-container">
            <div class="page-header">
                <h1 class="page-title">Project Submission</h1>
                <p class="page-subtitle">Submit your internship project for the gallery.</p>
            </div>

            <div class="content-grid">
                <!-- Submission Form -->
                <div class="form-card">
                    <h2 class="card-title">New Submission</h2>
                    <div class="form-group">
                        <label>Project Title</label>
                        <input v-model="title" placeholder="Enter project title" class="form-input" />
                    </div>
                    
                    <div class="form-group">
                        <label>Abstract</label>
                        <textarea v-model="abstract" placeholder="Brief summary of your project..." class="form-textarea"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Poster Image URL</label>
                        <input v-model="imageUrl" placeholder="https://..." class="form-input" />
                        <p class="help-text">For demo, paste a direct image link (e.g. from Unsplash).</p>
                    </div>

                    <div v-if="imageUrl" class="image-preview">
                        <img :src="imageUrl" alt="Poster preview" @error="imageUrl = ''" />
                    </div>

                    <button @click="submitProject" :disabled="isSubmitting || !title || !imageUrl" class="btn-primary full-width">
                        {{ isSubmitting ? 'Submitting...' : 'Submit Project' }}
                    </button>

                    <div v-if="message" class="message-box" :class="{ error: message.includes('Error') }">
                        {{ message }}
                    </div>
                </div>

                <!-- My Submissions -->
                <div class="submissions-list">
                    <h2 class="section-title">My Submissions</h2>
                    <div v-if="mySubmissions.length === 0" class="empty-state">
                        <p>No submissions yet.</p>
                    </div>
                    <div v-else class="submission-cards">
                        <div v-for="sub in mySubmissions" :key="sub.id" class="submission-card">
                            <div class="card-status">
                                <span class="status-badge" :class="getStatusColor(sub.status)">
                                    {{ sub.status }}
                                </span>
                                <span class="date">{{ new Date(sub.submittedAt).toLocaleDateString() }}</span>
                            </div>
                            <h3 class="sub-title">{{ sub.title }}</h3>
                            <p class="sub-abstract">{{ sub.abstract }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.submission-page {
    min-height: 100vh;
    background: #f8fafc;
    padding: 40px 20px;
}

.page-container {
    max-width: 1000px;
    margin: 0 auto;
}

.page-header {
    text-align: center;
    margin-bottom: 40px;
}

.page-title {
    font-size: 32px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 8px 0;
}

.page-subtitle {
    color: #64748b;
    font-size: 18px;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
}

@media (max-width: 768px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}

.form-card {
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-title {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 24px 0;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #475569;
}

.form-input, .form-textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
    box-sizing: border-box;
}

.form-textarea {
    height: 120px;
    resize: vertical;
}

.form-input:focus, .form-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.help-text {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
}

.image-preview {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

.image-preview img {
    width: 100%;
    height: auto;
    display: block;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.full-width {
    width: 100%;
}

.message-box {
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
    background: #dcfce7;
    color: #166534;
    text-align: center;
    font-size: 14px;
}

.message-box.error {
    background: #fee2e2;
    color: #991b1b;
}

.section-title {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 24px 0;
}

.submission-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.submission-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.card-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.date {
    font-size: 12px;
    color: #94a3b8;
}

.sub-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 8px 0;
}

.sub-abstract {
    font-size: 14px;
    color: #64748b;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.empty-state {
    text-align: center;
    color: #94a3b8;
    padding: 40px;
    background: white;
    border-radius: 12px;
    border: 1px dashed #e2e8f0;
}
</style>
