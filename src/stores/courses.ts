import { defineStore } from 'pinia';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

export interface Lesson {
    id: string;
    title: string;
    content: string;
    videoUrl?: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

export const useCoursesStore = defineStore('courses', {
    state: () => ({
        courses: [] as Course[],
        currentCourse: null as Course | null,
    }),

    getters: {
        getCourseById: (state) => (id: string) => state.courses.find(c => c.id === id),
    },

    actions: {
        async fetchCourses() {
            try {
                this.courses = await apiGet<Course[]>('/api/courses');
            } catch (error) {
                console.error('Failed to fetch courses:', error);
                throw error;
            }
        },

        async createCourse(course: Omit<Course, 'id' | 'lessons'>) {
            try {
                const newCourse = await apiPost<Course>('/api/courses', { ...course, lessons: [] });
                this.courses.push(newCourse);
                return newCourse.id;
            } catch (error) {
                console.error('Failed to create course:', error);
                throw error;
            }
        },

        async updateCourse(id: string, updates: Partial<Course>) {
            try {
                const updated = await apiPut<Course>(`/api/courses/${id}`, updates);
                const idx = this.courses.findIndex(c => c.id === id);
                if (idx !== -1) {
                    this.courses[idx] = updated;
                }
            } catch (error) {
                console.error('Failed to update course:', error);
                throw error;
            }
        },

        async deleteCourse(id: string) {
            try {
                await apiDelete(`/api/courses/${id}`);
                this.courses = this.courses.filter(c => c.id !== id);
            } catch (error) {
                console.error('Failed to delete course:', error);
                throw error;
            }
        },

        async addLesson(courseId: string, lesson: Omit<Lesson, 'id'>) {
            const course = this.getCourseById(courseId);
            if (!course) return;
            const updatedLessons = [...course.lessons, { ...lesson, id: 'l' + Date.now() }];
            await this.updateCourse(courseId, { lessons: updatedLessons });
        },

        async updateLesson(courseId: string, lessonId: string, updates: Partial<Lesson>) {
            const course = this.getCourseById(courseId);
            if (!course) return;
            const lessons = course.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l);
            await this.updateCourse(courseId, { lessons });
        },

        async deleteLesson(courseId: string, lessonId: string) {
            const course = this.getCourseById(courseId);
            if (!course) return;
            const lessons = course.lessons.filter(l => l.id !== lessonId);
            await this.updateCourse(courseId, { lessons });
        }
    }
});
