import { defineStore } from 'pinia';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

export interface Lesson {
    id: string;
    title: string;
    content: string;
    videoUrl?: string;
    instructor?: string;
    duration?: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

export interface LessonProgress {
    id: string;
    userId: string;
    lessonId: string;
    completed: boolean;
    createdAt: string;
}

export const useCoursesStore = defineStore('courses', {
    state: () => ({
        courses: [] as Course[],
        currentCourse: null as Course | null,
        completedLessons: new Set<string>() as Set<string>,
    }),

    getters: {
        getCourseById: (state) => (id: string) => state.courses.find(c => c.id === id),
        isLessonComplete: (state) => (lessonId: string) => state.completedLessons.has(lessonId),
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

        async fetchProgress(courseId: string) {
            try {
                const progress = await apiGet<LessonProgress[]>(`/api/courses/${courseId}/progress`);
                this.completedLessons = new Set(progress.map(p => p.lessonId));
            } catch (error) {
                console.error('Failed to fetch progress:', error);
                // Don't throw - progress is optional
            }
        },

        async fetchAllProgress() {
            try {
                const progress = await apiGet<LessonProgress[]>('/api/courses/progress');
                // We don't overwrite completedLessons here as that's for the current course view
                // Instead, we return the progress for the dashboard to use
                return progress;
            } catch (error) {
                console.error('Failed to fetch all progress:', error);
                return [];
            }
        },

        async toggleLessonComplete(courseId: string, lessonId: string) {
            try {
                const isComplete = this.completedLessons.has(lessonId);
                console.log('[STORE] Toggle lesson complete:', lessonId, 'currently:', isComplete);

                if (isComplete) {
                    // Unmark as complete
                    await apiDelete(`/api/courses/${courseId}/lessons/${lessonId}/complete`);
                    // Create new Set to trigger reactivity
                    const newSet = new Set(this.completedLessons);
                    newSet.delete(lessonId);
                    this.completedLessons = newSet;
                    console.log('[STORE] Lesson unmarked as complete');
                } else {
                    // Mark as complete
                    await apiPost<LessonProgress>(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {});
                    // Create new Set to trigger reactivity
                    const newSet = new Set(this.completedLessons);
                    newSet.add(lessonId);
                    this.completedLessons = newSet;
                    console.log('[STORE] Lesson marked as complete');
                }
            } catch (error) {
                console.error('Failed to toggle lesson completion:', error);
                throw error;
            }
        },

        async createCourse(course: Omit<Course, 'id' | 'lessons'>) {
            try {
                console.log('[STORE] Creating course:', course);
                const newCourse = await apiPost<Course>('/api/courses', { ...course, lessons: [] });
                console.log('[STORE] Course created:', newCourse);
                this.courses.push(newCourse);
                return newCourse.id;
            } catch (error) {
                console.error('[STORE] Failed to create course:', error);
                throw error;
            }
        },

        async updateCourse(id: string, updates: Partial<Course>) {
            try {
                console.log('[STORE] Updating course:', id, updates);
                const updated = await apiPut<Course>(`/api/courses/${id}`, updates);
                console.log('[STORE] Course updated:', updated);
                const idx = this.courses.findIndex(c => c.id === id);
                if (idx !== -1) {
                    this.courses[idx] = updated;
                }
            } catch (error) {
                console.error('[STORE] Failed to update course:', error);
                throw error;
            }
        },

        async deleteCourse(id: string) {
            try {
                console.log('[STORE] Deleting course:', id);
                await apiDelete(`/api/courses/${id}`);
                console.log('[STORE] Course deleted successfully');
                this.courses = this.courses.filter(c => c.id !== id);
            } catch (error) {
                console.error('[STORE] Failed to delete course:', error);
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
            try {
                const updated = await apiPut<Lesson>(`/api/courses/${courseId}/lessons/${lessonId}`, updates);
                const course = this.getCourseById(courseId);
                if (course) {
                    const idx = course.lessons.findIndex(l => l.id === lessonId);
                    if (idx !== -1) {
                        course.lessons[idx] = updated;
                    }
                }
                await this.fetchCourses(); // Refresh to get latest data
            } catch (error) {
                console.error('Failed to update lesson:', error);
                throw error;
            }
        },

        async deleteLesson(courseId: string, lessonId: string) {
            const course = this.getCourseById(courseId);
            if (!course) return;
            const lessons = course.lessons.filter(l => l.id !== lessonId);
            await this.updateCourse(courseId, { lessons });
        }
    }
});
