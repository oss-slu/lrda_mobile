import { create } from "zustand";

interface AddNoteStore {
  isAddNoteOpen: boolean;
  toggleAddNoteState: () => void;
}

export const useAddNoteStore = create<AddNoteStore>()((set) => ({
  isAddNoteOpen: false,
  toggleAddNoteState: () => set((state) => ({ isAddNoteOpen: !state.isAddNoteOpen })),
}));
