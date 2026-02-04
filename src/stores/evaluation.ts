import { defineStore } from 'pinia';
import { apiGet, apiPost } from '../lib/api';

export interface Evaluation {
    id: string;
    internId: string;
    mentorId: string;
    mentorName: string;
    punctuality: number;
    qualityOfWork: number;
    teamwork: number;
    problemSolving: number;
    comment: string;
    createdAt: string;
}

export interface EvaluationSummary {
    hasEvaluations: boolean;
    averageScore: number;
    evaluationCount: number;
    lastEvaluationDate: string | null;
    scoreStatus: string;
}

interface EvaluationState {
    evaluations: Evaluation[];
    mySummary: EvaluationSummary | null;
    loading: boolean;
    error: string | null;
}

export const useEvaluationStore = defineStore('evaluation', {
    state: (): EvaluationState => ({
        evaluations: [],
        mySummary: null,
        loading: false,
        error: null,
    }),
    actions: {
        async fetchEvaluations() {
            this.loading = true;
            try {
                this.evaluations = await apiGet<Evaluation[]>('/api/evaluations');
            } catch (e: any) {
                this.error = e.message;
                console.error('Failed to fetch evaluations:', e);
            } finally {
                this.loading = false;
            }
        },
        async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt'>) {
            this.loading = true;
            try {
                const newEvaluation = await apiPost<Evaluation>('/api/evaluations', evaluation);
                this.evaluations.push(newEvaluation);
                return newEvaluation;
            } catch (e: any) {
                this.error = e.message;
                console.error('Failed to create evaluation:', e);
                throw e;
            } finally {
                this.loading = false;
            }
        },
        async fetchMyEvaluationSummary() {
            this.loading = true;
            try {
                this.mySummary = await apiGet<EvaluationSummary>('/api/evaluations/my-summary');
                return this.mySummary;
            } catch (e: any) {
                this.error = e.message;
                console.error('Failed to fetch my evaluation summary:', e);
                throw e;
            } finally {
                this.loading = false;
            }
        }
    }
});
