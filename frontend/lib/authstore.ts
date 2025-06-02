import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  company_id?: string;
  company_email?: string;
  email: string;
  role: "jobseeker" | "employer";
  token?: string;
  profile_picture?: string;
  user_id?: string | number;
}

interface AuthStore {
  user: User | null;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: "auth-store",
    }
  )
);
