"use client";

import { useLanguageStore } from "@/store/use-language";
import { useAuthStore } from "@/store/use-auth";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import {
  Globe,
  User,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Language } from "@/lib/translations";

export function Header() {
  const { language, setLanguage } = useLanguageStore();
  const { profile } = useAuthStore();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: { value: Language; labelBn: string; labelEn: string }[] = [
    { value: "bn", labelBn: "বাংলা", labelEn: "Bengali" },
    { value: "en", labelBn: "ইংরেজি", labelEn: "English" },
  ];

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">
          {t("common.app_name", language)}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div ref={langRef} className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLangOpen(!langOpen)}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === "bn" ? "বাংলা" : "English"}
            <ChevronDown className="h-3 w-3" />
          </Button>
          {langOpen && (
            <div className="absolute right-0 mt-1 w-36 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-lg z-50">
              {languages.map((l) => (
                <button
                  key={l.value}
                  onClick={() => {
                    setLanguage(l.value);
                    setLangOpen(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm hover:bg-[var(--accent)] text-left"
                >
                  {language === "bn" ? l.labelBn : l.labelEn}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileOpen(!profileOpen)}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            <span className="max-w-[120px] truncate">
              {profile?.full_name || t("common.profile", language)}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
