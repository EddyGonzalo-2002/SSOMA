import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  theme: 'light' | 'dark';
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  dni?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      theme: 'light',

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post<LoginResponse>('/auth/login', { email, password });
          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await api.post<LoginResponse>('/auth/register', data);
          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          if (get().token) {
            await api.post('/auth/logout');
          }
        } catch {
          // Ignore errors on logout
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      fetchMe: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.user });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
    }),
    {
      name: 'ssoma-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
      }),
    }
  )
);
