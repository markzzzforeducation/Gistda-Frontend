import { defineStore } from 'pinia';
import { setAuthToken } from '../lib/api';
import { useBoardsStore } from './boards';
import { useNotificationsStore } from './notifications';
import { mockBackend } from '../services/mockBackend';

export interface InternProfile {
  firstName: string;
  lastName: string;
  university: string;
  faculty: string;
  major: string;
  studentId: string;
  startDate: string;
  endDate: string;
  mobile: string;
  advisorName: string;
  advisorEmail: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // mock only for FE assignment
  role: 'admin' | 'intern' | 'mentor' | 'guest';
  profile?: InternProfile;
}

interface AuthState {
  currentUser: User | null;
}

const STORAGE_KEY_CURRENT = 'kb-currentUserId';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
  }),
  getters: {
    // Helper to get all users directly from backend for admin views
    allUsers(): User[] {
      return mockBackend.getUsers();
    },
    currentUserId(state): string | null {
      return state.currentUser?.id || null;
    }
  },
  actions: {
    async init() {
      const id = sessionStorage.getItem(STORAGE_KEY_CURRENT);
      if (id) {
        const users = mockBackend.getUsers();
        const user = users.find(u => u.id === id);
        if (user) {
          this.currentUser = user;
          setAuthToken('mock-token-' + user.id);
        }
      }
    },
    async login(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
      const res = mockBackend.login(email, password);
      if (res.ok && res.user) {
        this.currentUser = res.user;
        sessionStorage.setItem(STORAGE_KEY_CURRENT, res.user.id);
        setAuthToken(res.token);

        // Try to sync with backend if available, but don't block
        try {
          const boards = useBoardsStore();
          await boards.fetchBoards();
        } catch { }

        return { ok: true };
      }
      return { ok: false, message: res.message || 'Invalid credentials' };
    },
    async register(name: string, email: string, password: string, role: 'intern' | 'mentor' = 'intern', profile?: InternProfile): Promise<{ ok: boolean; message?: string }> {
      try {
        mockBackend.createUser({ name, email, password, role, profile });
        return this.login(email, password);
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
    async loginWithGoogle(googleUser: { name: string; email: string }): Promise<{ ok: boolean; message?: string }> {
      try {
        const users = mockBackend.getUsers();
        let user = users.find(u => u.email === googleUser.email);

        if (!user) {
          // Auto-register new Google user
          user = mockBackend.createUser({
            name: googleUser.name,
            email: googleUser.email,
            password: 'google-oauth-user', // Placeholder
            role: 'intern' // Default role
          });
        }

        // Perform login
        return this.login(user.email, user.password);
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
    async updateProfile(profile: InternProfile): Promise<{ ok: boolean; message?: string }> {
      try {
        if (!this.currentUser) throw new Error('Not logged in');

        mockBackend.updateUser(this.currentUser.id, { profile });
        this.currentUser.profile = profile;
        return { ok: true };
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
    logout() {
      this.currentUser = null;
      sessionStorage.removeItem(STORAGE_KEY_CURRENT);
      setAuthToken(null);
      try {
        const noti = useNotificationsStore();
        noti.stopAutoRefresh();
      } catch { }
      try {
        const boards = useBoardsStore();
        boards.stopAutoRefresh();
      } catch { }
    },
  },
});


