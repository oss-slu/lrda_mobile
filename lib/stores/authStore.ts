import { create } from "zustand";
import { authClient } from "../auth/client";
import type { UserData } from "../../types";

interface AuthStore {
  user: UserData | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isReady: boolean;

  initialize: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  sessionToken: null,
  isAuthenticated: false,
  isReady: false,

  initialize: async () => {
    try {
      const { data: session, error } = await authClient.getSession();

      if (error || !session?.user) {
        set({ user: null, sessionToken: null, isAuthenticated: false, isReady: true });
        return false;
      }

      set({
        user: session.user as unknown as UserData,
        sessionToken: (session.session as any)?.token ?? null,
        isAuthenticated: true,
        isReady: true,
      });
      return true;
    } catch (error) {
      console.error("Error initializing session:", error);
      set({ user: null, sessionToken: null, isAuthenticated: false, isReady: true });
      return false;
    }
  },

  login: async (email, password) => {
    const { data, error } = await authClient.signIn.email({ email, password });

    if (error) {
      throw new Error(error.message || "Failed to sign in");
    }
    if (!data?.user) {
      throw new Error("Missing user in sign-in response");
    }

    const token = (data as any)?.token ?? (data as any)?.session?.token ?? null;
    set({
      user: data.user as unknown as UserData,
      sessionToken: token,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      set({ user: null, sessionToken: null, isAuthenticated: false });
    }
  },
}));
