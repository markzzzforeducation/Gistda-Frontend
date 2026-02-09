import { defineStore } from 'pinia';
import { setAuthToken, getAuthToken } from '../lib/api';
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
  mentorId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // mock only for FE assignment
  role: 'admin' | 'intern' | 'mentor' | 'guest' | 'external';
  avatar?: string;
  profile?: InternProfile;
  approvalStatus?: string; // 'pending' | 'approved' | 'rejected'
  isActive?: boolean;
}

interface AuthState {
  currentUser: User | null;
  users: User[];
}

const STORAGE_KEY_CURRENT = 'kb-currentUserId';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
    users: [],
  }),
  getters: {
    // Helper to get all users directly from backend for admin views
    allUsers(): User[] {
      return this.users;
    },
    currentUserId(state): string | null {
      return state.currentUser?.id || null;
    }
  },
  actions: {
    async init() {
      const id = sessionStorage.getItem(STORAGE_KEY_CURRENT);
      const token = sessionStorage.getItem('kb-token');
      if (id && token) {
        try {
          // Fetch user data from backend API
          const response = await fetch(`/api/users/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const user = await response.json();
            this.currentUser = {
              id: user.id,
              name: user.name,
              email: user.email,
              password: '',
              role: user.role,
              avatar: user.avatar,
              profile: user.Profile || user.profile,
              approvalStatus: user.approvalStatus,
              isActive: user.isActive
            };
            setAuthToken(token);
          } else {
            // Token invalid, clear session
            sessionStorage.removeItem(STORAGE_KEY_CURRENT);
            sessionStorage.removeItem('kb-token');
          }
        } catch (error) {
          console.error('[AUTH] Init failed:', error);
          // Fallback to mockBackend for development
          const users = mockBackend.getUsers();
          const user = users.find(u => u.id === id);
          if (user) {
            this.currentUser = user;
            setAuthToken('mock-token-' + user.id);
          }
        }
      }
    },
    async login(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
      try {
        // Call real backend API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const error = await response.json();
          return { ok: false, message: error.error || 'Invalid credentials' };
        }

        const data = await response.json();

        // Set user and token
        this.currentUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          password: '', // Don't store password
          role: data.user.role,
          avatar: data.user.avatar,
          profile: data.user.profile,
          approvalStatus: data.user.approvalStatus,
          isActive: data.user.isActive
        };

        sessionStorage.setItem(STORAGE_KEY_CURRENT, data.user.id);
        setAuthToken(data.token); // Set real JWT token

        console.log('[AUTH] Login successful, token set');

        // Try to sync with backend if available, but don't block
        try {
          const boards = useBoardsStore();
          await boards.fetchBoards();
        } catch { }

        return { ok: true };
      } catch (error) {
        console.error('[AUTH] Login failed:', error);
        return { ok: false, message: 'Login failed. Please try again.' };
      }
    },
    async register(name: string, email: string, password: string, role: 'intern' | 'mentor' = 'intern', profile?: InternProfile, mentorId?: string): Promise<{ ok: boolean; message?: string }> {
      try {
        // Call real backend API for registration
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role, mentorId, ...profile })
        });

        if (!response.ok) {
          const error = await response.json();
          return { ok: false, message: error.error || 'Registration failed' };
        }

        // Refresh users list after registration
        await this.fetchAllUsers();
        return { ok: true };
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

        const token = getAuthToken();
        const response = await fetch(`/api/users/${this.currentUser.id}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profile)
        });

        if (!response.ok) {
          const error = await response.json();
          return { ok: false, message: error.error || 'Failed to update profile' };
        }

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

    // ============ User Management Actions ============

    async fetchAllUsers(): Promise<void> {
      try {
        const token = getAuthToken();
        console.log('[AUTH] Fetching users, token exists:', !!token);

        if (!token) {
          console.error('[AUTH] No auth token available');
          return;
        }

        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('[AUTH] Fetch users response status:', response.status);

        if (response.ok) {
          const usersData = await response.json();
          console.log('[AUTH] Fetched users count:', usersData.length);
          this.users = usersData.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            password: '',
            role: u.role,
            avatar: u.avatar,
            profile: u.profile || u.Profile,
            approvalStatus: u.approvalStatus,
            isActive: u.isActive
          }));
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('[AUTH] Failed to fetch users:', response.status, errorData);
        }
      } catch (error) {
        console.error('[AUTH] Fetch users error:', error);
      }
    },

    async deleteUserById(id: string): Promise<{ ok: boolean; message?: string }> {
      try {
        const token = getAuthToken();
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Remove from local state
          this.users = this.users.filter(u => u.id !== id);
          return { ok: true };
        } else {
          const error = await response.json();
          return { ok: false, message: error.error || 'Failed to delete user' };
        }
      } catch (error: any) {
        console.error('[AUTH] Delete user error:', error);
        return { ok: false, message: error.message || 'Failed to delete user' };
      }
    },

    async updateUserById(id: string, data: { name?: string; role?: string }): Promise<{ ok: boolean; message?: string }> {
      try {
        const token = getAuthToken();
        const response = await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const updatedUser = await response.json();
          // Update local state
          const index = this.users.findIndex(u => u.id === id);
          if (index !== -1) {
            const user = this.users[index]!;
            user.name = updatedUser.name;
            user.role = updatedUser.role;
          }
          return { ok: true };
        } else {
          const error = await response.json();
          return { ok: false, message: error.error || 'Failed to update user' };
        }
      } catch (error: any) {
        console.error('[AUTH] Update user error:', error);
        return { ok: false, message: error.message || 'Failed to update user' };
      }
    },
  },
});
