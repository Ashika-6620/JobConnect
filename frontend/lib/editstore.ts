import { create } from "zustand";

const useEditStore = create((set) => ({
  job: null,
  setJob: (job: any) => set({ job }),
}));

export { useEditStore };
