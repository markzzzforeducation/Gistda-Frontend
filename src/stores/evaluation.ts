import { defineStore } from 'pinia';
import { mockBackend, type Evaluation } from '../services/mockBackend';

interface EvaluationState {
    evaluations: Evaluation[];
    loading: boolean;
    error: string | null;
}

export const useEvaluationStore = defineStore('evaluation', {
    state: (): EvaluationState => ({
        evaluations: [],
        loading: false,
        error: null,
    }),
    actions: {
        async fetchEvaluations() {
            this.loading = true;
            try {
                this.evaluations = mockBackend.getEvaluations();
            } catch (e: any) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },
        async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt'>) {
            this.loading = true;
            try {
                const newEvaluation = mockBackend.createEvaluation(evaluation);
                this.evaluations.push(newEvaluation);
                return newEvaluation;
            } catch (e: any) {
                this.error = e.message;
                throw e;
            } finally {
                this.loading = false;
            }
        }
    }
});
