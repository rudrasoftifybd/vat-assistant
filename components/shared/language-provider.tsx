"use client";

import { useLanguageStore } from "@/store/use-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguageStore();

  return (
    <div dir={language === "bn" ? "ltr" : "ltr"} lang={language}>
      {children}
    </div>
  );
}
