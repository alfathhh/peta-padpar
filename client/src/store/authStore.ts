import { create } from 'zustand';
import { ADMIN_TOKEN_KEY } from '../constants';
import { AdminUser } from '../types';

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Inisialisasi dari localStorage jika ada
  token: localStorage.getItem(ADMIN_TOKEN_KEY),
  user: null,
  isAuthenticated: !!localStorage.getItem(ADMIN_TOKEN_KEY),

  login: (token, user) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
