import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { showToast } from './toast';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const WARNING_BEFORE_MS = 60 * 1000;     // Show warning 1 minute before logout

export function useIdleTimeout() {
    const auth = useAuthStore();
    const router = useRouter();
    const showWarning = ref(false);
    const remainingSeconds = ref(60);

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let warningTimer: ReturnType<typeof setTimeout> | null = null;
    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    function resetTimers() {
        // Clear existing timers
        if (idleTimer) clearTimeout(idleTimer);
        if (warningTimer) clearTimeout(warningTimer);
        if (countdownInterval) clearInterval(countdownInterval);

        showWarning.value = false;
        remainingSeconds.value = 60;

        // Only set timers if user is logged in
        if (!auth.currentUser) return;

        // Set warning timer (fires 1 min before logout)
        warningTimer = setTimeout(() => {
            showWarning.value = true;
            remainingSeconds.value = Math.floor(WARNING_BEFORE_MS / 1000);

            // Start countdown
            countdownInterval = setInterval(() => {
                remainingSeconds.value--;
                if (remainingSeconds.value <= 0) {
                    if (countdownInterval) clearInterval(countdownInterval);
                }
            }, 1000);

            showToast('คุณไม่ได้ใช้งานมาสักพัก ระบบจะออกจากระบบอัตโนมัติใน 1 นาที', 'warning', 10000);
        }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

        // Set logout timer
        idleTimer = setTimeout(() => {
            performLogout();
        }, IDLE_TIMEOUT_MS);
    }

    function performLogout() {
        cleanup();
        auth.logout();
        showToast('ออกจากระบบอัตโนมัติเนื่องจากไม่มีการใช้งานเกิน 10 นาที', 'info', 5000);
        router.push('/auth');
    }

    function stayLoggedIn() {
        showWarning.value = false;
        resetTimers();
    }

    // Events that count as "activity"
    const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    function onActivity() {
        // Don't reset if warning is showing (user must click "stay")
        if (!showWarning.value) {
            resetTimers();
        }
    }

    function setup() {
        ACTIVITY_EVENTS.forEach(event => {
            document.addEventListener(event, onActivity, { passive: true });
        });
        resetTimers();
    }

    function cleanup() {
        ACTIVITY_EVENTS.forEach(event => {
            document.removeEventListener(event, onActivity);
        });
        if (idleTimer) clearTimeout(idleTimer);
        if (warningTimer) clearTimeout(warningTimer);
        if (countdownInterval) clearInterval(countdownInterval);
        showWarning.value = false;
    }

    onMounted(() => {
        if (auth.currentUser) {
            setup();
        }
    });

    onBeforeUnmount(() => {
        cleanup();
    });

    // Watch for login/logout to start/stop timers
    watch(() => auth.currentUser, (newUser) => {
        if (newUser) {
            setup();
        } else {
            cleanup();
        }
    });

    return {
        showWarning,
        remainingSeconds,
        stayLoggedIn,
        performLogout,
    };
}
