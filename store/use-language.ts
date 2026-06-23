import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "@/lib/translations";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "bn",
      setLanguage: (language) => set({ language }),
    }),
    { name: "vat-language" }
  )
);
