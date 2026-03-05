import { create } from 'zustand';
import {
  type User,
  loadTokens,
  parseIdToken,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
} from './auth';

type AuthState = {
  user: User | null;
  loading: boolean;
  init: () => void;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init: () => {
    const tokens = loadTokens();
    if (tokens) {
      const user = parseIdToken(tokens.id_token);
      set({ user, loading: false });
    } else {
      set({ user: null, loading: false });
    }
  },

  login: async (username: string, password: string) => {
    const { user } = await authLogin(username, password);
    set({ user });
  },

  register: async (email: string, username: string, password: string) => {
    const { user } = await authRegister(email, username, password);
    set({ user });
  },

  logout: () => {
    authLogout();
    set({ user: null });
  },
}));
