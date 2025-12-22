<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useEvaluationStore } from '../../stores/evaluation';
import GistdaHeader from '../../components/GistdaHeader.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const evaluationStore = useEvaluationStore();

const internId = route.params.internId as string;
const intern = ref<any>(null);
const isSubmitting = ref(false);

const form = ref({
  punctuality: 5,
  qualityOfWork: 5,
  teamwork: 5,
  problemSolving: 5,
  comment: ''
});

onMounted(async () => {
  // Ensure we have users loaded
  if (auth.allUsers.length === 0) {
    await auth.init(); // Basic init, might need more robust fetch in real app
  }
  intern.value = auth.allUsers.find(u => u.id === internId);
  
  if (!intern.value) {
    alert('Intern not found');
    router.push('/evaluations');
  }
});

async function submitEvaluation() {
  if (!auth.currentUser || !intern.value) return;
  
  isSubmitting.value = true;
  try {
    await evaluationStore.createEvaluation({
      internId: intern.value.id,
      mentorId: auth.currentUser.id,
      mentorName: auth.currentUser.name,
      scores: {
        punctuality: form.value.punctuality,
        qualityOfWork: form.value.qualityOfWork,
        teamwork: form.value.teamwork,
        problemSolving: form.value.problemSolving
      },
      comment: form.value.comment
    });
    
    alert('Evaluation submitted successfully');
    router.push('/evaluations');
  } catch (e) {
    alert('Failed to submit evaluation');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="app-container">
    <GistdaHeader />
    <div class="space-background"></div>

    <div class="main-content">
      <div class="content-wrapper">
        <div class="form-card" v-if="intern">
          <div class="header-section">
            <h1 class="title">Evaluate Intern</h1>
            <div class="intern-info">
              <h2>{{ intern.name }}</h2>
              <p>{{ intern.email }}</p>
            </div>
          </div>

          <form @submit.prevent="submitEvaluation" class="eval-form">
            <div class="score-grid">
              <div class="score-item">
                <label>Punctuality & Attendance</label>
                <div class="range-wrapper">
                  <input type="range" v-model.number="form.punctuality" min="1" max="5" step="1" />
                  <span class="score-val">{{ form.punctuality }}/5</span>
                </div>
              </div>

              <div class="score-item">
                <label>Quality of Work</label>
                <div class="range-wrapper">
                  <input type="range" v-model.number="form.qualityOfWork" min="1" max="5" step="1" />
                  <span class="score-val">{{ form.qualityOfWork }}/5</span>
                </div>
              </div>

              <div class="score-item">
                <label>Teamwork & Collaboration</label>
                <div class="range-wrapper">
                  <input type="range" v-model.number="form.teamwork" min="1" max="5" step="1" />
                  <span class="score-val">{{ form.teamwork }}/5</span>
                </div>
              </div>

              <div class="score-item">
                <label>Problem Solving</label>
                <div class="range-wrapper">
                  <input type="range" v-model.number="form.problemSolving" min="1" max="5" step="1" />
                  <span class="score-val">{{ form.problemSolving }}/5</span>
                </div>
              </div>
            </div>

            <div class="comment-section">
              <label>Additional Comments</label>
              <textarea v-model="form.comment" placeholder="Write your feedback here..." required></textarea>
            </div>

            <div class="actions">
              <button type="button" @click="router.back()" class="cancel-btn">Cancel</button>
              <button type="submit" :disabled="isSubmitting" class="submit-btn">
                {{ isSubmitting ? 'Submitting...' : 'Submit Evaluation' }}
              </button>
            </div>
          </form>
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
  background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80');
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
  max-width: 800px;
  margin: 0 auto;
  padding: 0 40px 60px;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.title {
  font-size: 24px;
  color: #6b7280;
  margin-bottom: 8px;
}

.intern-info h2 {
  font-size: 32px;
  color: #1f2937;
  margin: 0;
}

.intern-info p {
  color: #6b7280;
  margin: 4px 0 0;
}

.score-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.score-item label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.range-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

input[type=range] {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
}

.score-val {
  font-weight: 700;
  color: #6366f1;
  font-size: 18px;
  width: 40px;
}

.comment-section {
  margin-bottom: 32px;
}

.comment-section label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

textarea {
  width: 100%;
  height: 120px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: #6366f1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.cancel-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn {
  padding: 12px 32px;
  background: #003d82;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #002855;
}

@media (max-width: 600px) {
  .score-grid {
    grid-template-columns: 1fr;
  }
}
</style>
