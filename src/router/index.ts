import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '../pages/AuthPage/AuthPage.vue';
import BoardsListPage from '../pages/BoardsListPage/BoardsListPage.vue';
import GoogleCallbackPage from '../pages/GoogleCallbackPage/GoogleCallbackPage.vue';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
    { path: '/auth', component: AuthPage },
    { path: '/auth/google/callback', component: GoogleCallbackPage },
    { path: '/', component: () => import('../pages/PublicGalleryPage/PublicGalleryPage.vue') }, // Public Homepage
    { path: '/dashboard', component: BoardsListPage, meta: { requiresAuth: true, roles: ['admin', 'mentor', 'intern'] } },
    { path: '/courses', component: () => import('../pages/CourseListPage/CourseListPage.vue'), meta: { requiresAuth: true, roles: ['admin', 'mentor', 'intern'] } },
    { path: '/courses/:id', component: () => import('../pages/CoursePage/CoursePage.vue'), meta: { requiresAuth: true, roles: ['admin', 'mentor', 'intern'] } },
    { path: '/courses/:courseId/lessons/:lessonId', component: () => import('../pages/LessonPage/LessonPage.vue'), meta: { requiresAuth: true, roles: ['admin', 'mentor', 'intern'] } },
    // { path: '/gallery', component: ... } - Removed, merged into /
    { path: '/submit-project', component: () => import('../pages/SubmissionPage/SubmissionPage.vue'), meta: { requiresAuth: true, role: 'intern' } },
    { path: '/board/:id', component: () => import('../pages/BoardPage/BoardPage.vue'), meta: { requiresAuth: true } },
    { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, role: 'admin' } },
    { path: '/admin/users', component: () => import('../pages/UserManagement/UserManagement.vue'), meta: { requiresAuth: true, role: 'admin' } },
    { path: '/admin/reviews', component: () => import('../pages/AdminReviewsPage/AdminReviewsPage.vue'), meta: { requiresAuth: true, role: 'admin' } },
    { path: '/admin/news', component: () => import('../pages/NewsManagement/NewsManagement.vue'), meta: { requiresAuth: true, role: 'admin' } },

    // Mentor routes
    { path: '/mentor', component: () => import('../pages/MentorDashboard/MentorDashboard.vue'), meta: { requiresAuth: true, role: 'mentor' } },
    { path: '/mentor/reviews', component: () => import('../pages/MentorReviewsPage/MentorReviewsPage.vue'), meta: { requiresAuth: true, role: 'mentor' } },
    { path: '/my-interns', component: () => import('../pages/MyInternsPage/MyInternsPage.vue'), meta: { requiresAuth: true, role: 'mentor' } },
    { path: '/profile', component: () => import('../pages/ProfilePage/ProfilePage.vue'), meta: { requiresAuth: true } },
    { path: '/onboarding', component: () => import('../pages/OnboardingPage/OnboardingPage.vue'), meta: { requiresAuth: true } },
    { path: '/evaluations', component: () => import('../pages/InternsListPage/InternsListPage.vue'), meta: { requiresAuth: true, roles: ['mentor', 'admin'] } },
    { path: '/evaluations/new/:internId', component: () => import('../pages/EvaluationPage/EvaluationPage.vue'), meta: { requiresAuth: true, roles: ['mentor', 'admin'] } },
    { path: '/project-plans', component: () => import('../pages/ProjectPlanPage/ProjectPlanPage.vue'), meta: { requiresAuth: true, roles: ['admin', 'mentor', 'intern'] } },

    // Intern routes
    { path: '/intern', component: () => import('../pages/InternDashboard/InternDashboard.vue'), meta: { requiresAuth: true, role: 'intern' } },
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

    // If user is at root path (Gallery), allow access
    if (to.path === '/') {
        next();
        return;
    }

    if (to.meta.requiresAuth && (!auth.currentUser || !hasToken)) {
        if (!hasToken && auth.currentUser) {
            auth.logout();
        }
        next('/auth');
        return;
    }

    // 1. Intern Onboarding Guard
    // If user is intern, logged in, but has NO profile -> Force /auth (to complete profile)
    // We allow them to stay on /auth
    if (auth.currentUser?.role === 'intern' && !auth.currentUser.profile && to.path !== '/auth') {
        next('/auth');
        return;
    }

    // 2. Prevent accessing /onboarding if already completed
    if (to.path === '/onboarding') {
        next('/dashboard');
        return;
    }

    // Check for single role requirement
    if (to.meta.role && auth.currentUser?.role !== to.meta.role) {
        next('/dashboard');
        return;
    }

    // Check for multiple allowed roles
    if (to.meta.roles && Array.isArray(to.meta.roles) && !to.meta.roles.includes(auth.currentUser?.role)) {
        if (auth.currentUser?.role === 'external') {
            next('/');
        } else {
            next('/dashboard');
        }
        return;
    }

    if (to.path === '/auth' && auth.currentUser && hasToken) {
        // If profile is missing, staying on /auth is allowed (handled above/below)
        if (auth.currentUser.role === 'intern' && !auth.currentUser.profile) {
            next(); // Proceed to auth page to complete profile
            return;
        }

        if (auth.currentUser.role === 'admin') {
            next('/admin');
        } else if (auth.currentUser.role === 'mentor') {
            next('/mentor');
        } else if (auth.currentUser.role === 'external') {
            next('/');
        } else if (auth.currentUser.role === 'intern') {
            next('/intern');
        } else {
            next('/dashboard');
        }
        return;
    }
    next();
});

export default router;
