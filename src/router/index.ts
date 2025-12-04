import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '../pages/AuthPage.vue';
import BoardsListPage from '../pages/BoardsListPage.vue';
import GoogleCallbackPage from '../pages/GoogleCallbackPage.vue';
import AdminDashboard from '../pages/AdminDashboard.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
    { path: '/auth', component: AuthPage },
    { path: '/auth/google/callback', component: GoogleCallbackPage },
    { path: '/', component: BoardsListPage, meta: { requiresAuth: true } },
    { path: '/courses', component: () => import('../pages/CourseListPage.vue'), meta: { requiresAuth: true } },
    { path: '/courses/:id', component: () => import('../pages/CoursePage.vue'), meta: { requiresAuth: true } },
    { path: '/courses/:courseId/lessons/:lessonId', component: () => import('../pages/LessonPage.vue'), meta: { requiresAuth: true } },
    { path: '/gallery', component: () => import('../pages/PublicGalleryPage.vue') }, // Public
    { path: '/submit-project', component: () => import('../pages/SubmissionPage.vue'), meta: { requiresAuth: true, role: 'intern' } },
    { path: '/board/:id', component: () => import('../pages/BoardPage.vue'), meta: { requiresAuth: true } },
    { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, role: 'admin' } },
    { path: '/admin/users', component: () => import('../pages/UserManagement.vue'), meta: { requiresAuth: true, role: 'admin' } },
    { path: '/admin/reviews', component: () => import('../pages/AdminReviewsPage.vue'), meta: { requiresAuth: true, role: 'admin' } },
    { path: '/profile', component: () => import('../pages/ProfilePage.vue'), meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, _from, next) => {
    const auth = useAuthStore();
    const hasToken = !!sessionStorage.getItem('kb-token');

    // Ensure user is loaded if token exists
    if (hasToken && !auth.currentUser) {
        await auth.init();
    }

    // If user is at root path and not authenticated, redirect to auth
    if (to.path === '/' && (!auth.currentUser || !hasToken)) {
        next('/auth');
        return;
    }

    if (to.meta.requiresAuth && (!auth.currentUser || !hasToken)) {
        if (!hasToken && auth.currentUser) {
            auth.logout();
        }
        next('/auth');
        return;
    }

    if (to.meta.role && auth.currentUser?.role !== to.meta.role) {
        // Redirect to home if unauthorized for specific role
        next('/');
        return;
    }

    if (to.path === '/auth' && auth.currentUser && hasToken) {
        if (auth.currentUser.role === 'admin') {
            next('/admin');
        } else {
            next('/');
        }
        return;
    }
    next();
});

export default router;
