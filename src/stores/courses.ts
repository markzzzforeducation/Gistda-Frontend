import { defineStore } from 'pinia';
import { mockBackend } from '../services/mockBackend';

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
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            this.courses = mockBackend.getCourses();
        },

        async createCourse(course: Omit<Course, 'id' | 'lessons'>) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const newCourse = mockBackend.createCourse({ ...course, lessons: [] });
            this.courses.push(newCourse);
            return newCourse.id;
        },

        async updateCourse(id: string, updates: Partial<Course>) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const updated = mockBackend.updateCourse(id, updates);
            const idx = this.courses.findIndex(c => c.id === id);
            if (idx !== -1) {
                this.courses[idx] = updated;
            }
        },

        async deleteCourse(id: string) {
            await new Promise(resolve => setTimeout(resolve, 300));
            mockBackend.deleteCourse(id);
            this.courses = this.courses.filter(c => c.id !== id);
        },

        async addLesson(courseId: string, lesson: Omit<Lesson, 'id'>) {
            const course = this.getCourseById(courseId);
            if (!course) return;
            const newLesson = { ...lesson, id: 'l' + Date.now() };
            const updatedLessons = [...course.lessons, newLesson];
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
