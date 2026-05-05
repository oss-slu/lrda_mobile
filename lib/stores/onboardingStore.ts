import { create } from "zustand";
import { getItem, setItem } from "../utils/async_storage";

interface OnboardingStore {
  isOnboarded: boolean;
  isReady: boolean;
  initialize: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingStore>()((set) => ({
  isOnboarded: false,
  isReady: false,
  initialize: async () => {
    const value = await getItem("onboarded");
    set({ isOnboarded: value === "1", isReady: true });
  },
  completeOnboarding: async () => {
    await setItem("onboarded", "1");
    set({ isOnboarded: true });
  },
}));
