import { defineStore } from 'pinia';
import { mockBackend } from '../services/mockBackend';

export interface Submission {
    id: string;
    title: string;
    abstract: string;
    studentName: string;
    studentId: string;
    imageUrl: string;
    status: 'pending' | 'approved' | 'rejected' | 'published';
    submittedAt: string;
    links?: { label: string; url: string }[];
}

export const useGalleryStore = defineStore('gallery', {
    state: () => ({
        submissions: [] as Submission[],
    }),

    getters: {
        getSubmissionById: (state) => (id: string) => state.submissions.find(s => s.id === id),
        publishedSubmissions: (state) => state.submissions.filter(s => s.status === 'published'),
        pendingSubmissions: (state) => state.submissions.filter(s => s.status === 'pending'),
        mySubmissions: (state) => (userId: string) => state.submissions.filter(s => s.studentId === userId),
    },

    actions: {
        async fetchSubmissions() {
            await new Promise(resolve => setTimeout(resolve, 300));
            this.submissions = mockBackend.getSubmissions();
        },

        async createSubmission(submission: Omit<Submission, 'id' | 'status' | 'submittedAt'>) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const newSubmission = mockBackend.createSubmission(submission);
            this.submissions.push(newSubmission);
            return newSubmission.id;
        },

        async updateSubmissionStatus(id: string, status: Submission['status']) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const updated = mockBackend.updateSubmission(id, { status });
            const idx = this.submissions.findIndex(s => s.id === id);
            if (idx !== -1) {
                this.submissions[idx] = updated;
            }
        },

        async deleteSubmission(id: string) {
            await new Promise(resolve => setTimeout(resolve, 300));
            mockBackend.deleteSubmission(id);
            this.submissions = this.submissions.filter(s => s.id !== id);
        }
    }
});
