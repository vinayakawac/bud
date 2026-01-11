import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  admin: {
    id: string;
    email: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
  setAuth: (token: string, admin: AuthState['admin']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      setAuth: (token, admin) =>
        set({ token, admin, isAuthenticated: true }),
      logout: () =>
        set({ token: null, admin: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
