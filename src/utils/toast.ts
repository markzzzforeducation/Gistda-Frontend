// Global toast notification utility
// Usage: import { showToast } from '../utils/toast';
//        showToast('Hello!', 'success');

export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) {
    window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message, type, duration }
    }));
}
