import { defineStore } from 'pinia';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

export interface ProjectPlan {
    id: string;
    internId: string;
    mentorId?: string;
    projectTitle: string;
    objectives: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: 'draft' | 'active' | 'completed';
    createdAt: string;
    updatedAt: string;
    Intern?: { id: string; name: string; email: string };
    Mentor?: { id: string; name: string; email: string };
}

export interface Mentor {
    id: string;
    name: string;
    email: string;
}

export const useProjectPlanStore = defineStore('projectPlans', {
    state: () => ({
        plans: [] as ProjectPlan[],
        mentors: [] as Mentor[],
    }),

    getters: {
        getPlanById: (state) => (id: string) => state.plans.find(p => p.id === id),
    },

    actions: {
        async fetchPlans() {
            try {
                this.plans = await apiGet<ProjectPlan[]>('/api/project-plans');
            } catch (error) {
                console.error('Failed to fetch project plans:', error);
                throw error;
            }
        },

        async fetchFriendPlans() {
            try {
                this.plans = await apiGet<ProjectPlan[]>('/api/project-plans/friends');
            } catch (error) {
                console.error('Failed to fetch friend project plans:', error);
                throw error;
            }
        },

        async fetchMentors() {
            try {
                this.mentors = await apiGet<Mentor[]>('/api/project-plans/mentors/list');
            } catch (error) {
                console.error('Failed to fetch mentors:', error);
                throw error;
            }
        },

        async createPlan(plan: Omit<ProjectPlan, 'id' | 'internId' | 'createdAt' | 'updatedAt' | 'Intern' | 'Mentor'>) {
            try {
                const newPlan = await apiPost<ProjectPlan>('/api/project-plans', plan);
                this.plans.unshift(newPlan);
                return newPlan.id;
            } catch (error) {
                console.error('Failed to create project plan:', error);
                throw error;
            }
        },

        async updatePlan(id: string, updates: Partial<ProjectPlan>) {
            try {
                const updated = await apiPut<ProjectPlan>(`/api/project-plans/${id}`, updates);
                const idx = this.plans.findIndex(p => p.id === id);
                if (idx !== -1) {
                    this.plans[idx] = updated;
                }
                return updated;
            } catch (error) {
                console.error('Failed to update project plan:', error);
                throw error;
            }
        },

        async deletePlan(id: string) {
            try {
                await apiDelete(`/api/project-plans/${id}`);
                this.plans = this.plans.filter(p => p.id !== id);
            } catch (error) {
                console.error('Failed to delete project plan:', error);
                throw error;
            }
        },
    }
});
