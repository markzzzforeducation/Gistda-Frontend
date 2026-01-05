import { defineStore } from 'pinia';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

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
            try {
                this.submissions = await apiGet<Submission[]>('/api/submissions');
            } catch (error) {
                console.error('Failed to fetch submissions:', error);
                throw error;
            }
        },

        async createSubmission(submission: Omit<Submission, 'id' | 'status' | 'submittedAt'>) {
            try {
                const newSubmission = await apiPost<Submission>('/api/submissions', submission);
                this.submissions.push(newSubmission);
                return newSubmission.id;
            } catch (error) {
                console.error('Failed to create submission:', error);
                throw error;
            }
        },

        async updateSubmissionStatus(id: string, status: Submission['status']) {
            try {
                const updated = await apiPut<Submission>(`/api/submissions/${id}`, { status });
                const idx = this.submissions.findIndex(s => s.id === id);
                if (idx !== -1) {
                    this.submissions[idx] = updated;
                }
            } catch (error) {
                console.error('Failed to update submission:', error);
                throw error;
            }
        },

        async deleteSubmission(id: string) {
            try {
                await apiDelete(`/api/submissions/${id}`);
                this.submissions = this.submissions.filter(s => s.id !== id);
            } catch (error) {
                console.error('Failed to delete submission:', error);
                throw error;
            }
        }
    }
});
