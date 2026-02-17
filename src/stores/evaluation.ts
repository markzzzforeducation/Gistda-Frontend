import { defineStore } from 'pinia';
import { apiGet, apiPost } from '../lib/api';

export interface Evaluation {
    id: string;
    internId: string;
    mentorId: string;
    mentorName: string;
    quantityOfWork: number;       // max 20
    qualityOfWork: number;        // max 20
    academicAbility: number;      // max 15
    abilityToLearn: number;       // max 15
    judgmentAndDecision: number;   // max 15
    organizationAndPlanning: number; // max 10
    communicationSkills: number;  // max 15
    suitabilityForJob: number;    // max 10
    responsibility: number;       // max 10
    interestInWork: number;       // max 10
    initiative: number;           // max 10
    responseToSupervision: number; // max 10
    personality: number;          // max 10
    interpersonalSkills: number;  // max 10
    discipline: number;           // max 10
    ethicsAndMorality: number;    // max 10
    comment: string;
    strengths: string;
    improvements: string;
    createdAt: string;
}

export interface EvaluationSummary {
    hasEvaluations: boolean;
    averageScore: number;
    totalScore: number;
    maxScore: number;
    percentage: number;
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
