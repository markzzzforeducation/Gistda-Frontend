import { defineStore } from 'pinia';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

export interface News {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    publishDate: string;
    createdAt: string;
    updatedAt: string;
}

export const useNewsStore = defineStore('news', {
    state: () => ({
        news: [] as News[],
    }),

    getters: {
        getNewsById: (state) => (id: string) => state.news.find(n => n.id === id),
        featuredNews: (state) => state.news.slice(0, 3),
    },

    actions: {
        async fetchNews() {
            try {
                this.news = await apiGet<News[]>('/api/news');
            } catch (error) {
                console.error('Failed to fetch news:', error);
                throw error;
            }
        },

        async createNews(news: Omit<News, 'id' | 'publishDate' | 'createdAt' | 'updatedAt'>) {
            try {
                const newNews = await apiPost<News>('/api/news', news);
                this.news.unshift(newNews);
                return newNews.id;
            } catch (error) {
                console.error('Failed to create news:', error);
                throw error;
            }
        },

        async updateNews(id: string, updates: Partial<News>) {
            try {
                const updated = await apiPut<News>(`/api/news/${id}`, updates);
                const idx = this.news.findIndex(n => n.id === id);
                if (idx !== -1) {
                    this.news[idx] = updated;
                }
            } catch (error) {
                console.error('Failed to update news:', error);
                throw error;
            }
        },

        async deleteNews(id: string) {
            try {
                await apiDelete(`/api/news/${id}`);
                this.news = this.news.filter(n => n.id !== id);
            } catch (error) {
                console.error('Failed to delete news:', error);
                throw error;
            }
        },
    }
});
