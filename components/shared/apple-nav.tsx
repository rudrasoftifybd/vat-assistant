"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/store/use-language";
import { useAuthStore } from "@/store/use-auth";
import { Button } from "@/components/ui/button";
import { Globe, User, Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Language } from "@/lib/translations";

const languages: { value: Language; labelBn: string; labelEn: string }[] = [
  { value: "bn", labelBn: "বাংলা", labelEn: "Bengali" },
  { value: "en", labelBn: "ইংরেজি", labelEn: "English" },
];

export function AppleNav() {
  const { language, setLanguage } = useLanguageStore();
  const { profile, organization } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const pageTitle = pathname === "/dashboard"
    ? (language === "bn" ? "ড্যাশবোর্ড" : "Dashboard")
    : pathname.includes("/clients") ? (language === "bn" ? "ক্লায়েন্ট" : "Clients")
    : pathname.includes("/forms") ? (language === "bn" ? "মুসক ফরম" : "Forms")
    : pathname.includes("/vat/returns") || pathname.includes("/vat/invoices") ? (language === "bn" ? "ভ্যাট" : "VAT")
    : pathname.includes("/purchases") ? (language === "bn" ? "ক্রয়" : "Purchases")
    : pathname.includes("/sales") ? (language === "bn" ? "বিক্রয়" : "Sales")
    : pathname.includes("/turnover-tax") ? (language === "bn" ? "টার্নওভার ট্যাক্স" : "Turnover Tax")
    : pathname.includes("/refunds") ? (language === "bn" ? "রিফান্ড" : "Refunds")
    : pathname.includes("/agents") ? (language === "bn" ? "এজেন্ট" : "Agents")
    : pathname.includes("/adr") ? (language === "bn" ? "ADR" : "ADR")
    : pathname.includes("/compliance") ? (language === "bn" ? "কমপ্লায়েন্স" : "Compliance")
    : pathname.includes("/documents") ? (language === "bn" ? "ডকুমেন্টস" : "Documents")
    : pathname.includes("/reports") ? (language === "bn" ? "রিপোর্ট" : "Reports")
    : pathname.includes("/audit") ? (language === "bn" ? "অডিট" : "Audit")
    : pathname.includes("/real-time") ? (language === "bn" ? "রিয়েল-টাইম" : "Real-Time")
    : pathname.includes("/settings") ? (language === "bn" ? "সেটিংস" : "Settings")
    : "";

  return (
    <>
      <nav className="h-[44px] bg-[var(--surface-black)] text-white flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link href="/dashboard" className="text-[12px] font-[400] tracking-[-0.12px] text-white/90 hover:text-white transition-colors">
            {language === "bn" ? "ট্যাক্সফ্লো" : "TaxFlow"}
          </Link>
          {organization && (
            <span className="hidden md:inline text-[12px] text-white/50 tracking-[-0.12px]">
              {organization.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 h-[28px] rounded-[8px] bg-[var(--ink)] text-white/80 hover:text-white px-2.5 text-[12px] tracking-[-0.12px] transition-colors"
            >
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">{language === "bn" ? "বাংলা" : "English"}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 w-[130px] bg-[var(--canvas)] rounded-[12px] border border-[var(--hairline)] shadow-lg z-50 overflow-hidden">
                {languages.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => { setLanguage(l.value); setLangOpen(false); }}
                    className="flex w-full items-center px-3 py-2 text-[13px] text-[var(--ink)] hover:bg-[var(--canvas-parchment)] transition-colors"
                  >
                    {language === "bn" ? l.labelBn : l.labelEn}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1 h-[28px] rounded-[8px] bg-[var(--ink)] text-white/80 hover:text-white px-2.5 text-[12px] tracking-[-0.12px] transition-colors"
            >
              <User className="h-3 w-3" />
              <span className="hidden sm:inline max-w-[80px] truncate">{profile?.full_name || (language === "bn" ? "প্রোফাইল" : "Profile")}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-1 w-[160px] bg-[var(--canvas)] rounded-[12px] border border-[var(--hairline)] shadow-lg z-50 overflow-hidden">
                <div className="px-3 py-2 text-[12px] text-[var(--ink-muted-48)] border-b border-[var(--divider-soft)]">
                  {profile?.full_name || ""}<br />
                  <span className="capitalize">{profile?.role || ""}</span>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); router.push("/dashboard/settings"); }}
                  className="flex w-full items-center px-3 py-2 text-[13px] text-[var(--ink)] hover:bg-[var(--canvas-parchment)] transition-colors"
                >
                  {language === "bn" ? "সেটিংস" : "Settings"}
                </button>
                <button
                  onClick={() => { setProfileOpen(false); handleLogout(); }}
                  className="flex w-full items-center px-3 py-2 text-[13px] text-red-600 hover:bg-[var(--canvas-parchment)] transition-colors"
                >
                  {language === "bn" ? "লগআউট" : "Log Out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="h-[52px] bg-[var(--canvas-parchment)]/80 backdrop-blur-[20px] flex items-center justify-between px-4 md:px-6 border-b border-[var(--divider-soft)] shrink-0">
        <span className="text-[21px] font-[600] tracking-[-0.374px] text-[var(--ink)]">
          {pageTitle}
        </span>
        <div className="flex items-center gap-2">
          {profile?.role === "admin" && (
            <span className="hidden sm:inline text-[12px] text-[var(--ink-muted-48)] bg-[var(--canvas)] rounded-[9999px] px-2.5 py-1">
              {language === "bn" ? "এডমিন" : "Admin"}
            </span>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <MobileMenu onClose={() => setMobileMenuOpen(false)} language={language} />
      )}
    </>
  );
}

function MobileMenu({ onClose, language }: { onClose: () => void; language: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { name: language === "bn" ? "ড্যাশবোর্ড" : "Dashboard", href: "/dashboard" },
    { name: language === "bn" ? "ক্লায়েন্ট" : "Clients", href: "/dashboard/clients" },
    { name: language === "bn" ? "মুসক ফরম" : "Forms", href: "/dashboard/forms" },
    { name: language === "bn" ? "ভ্যাট রিটার্ন" : "VAT Returns", href: "/dashboard/vat/returns" },
    { name: language === "bn" ? "চালানপত্র" : "Invoices", href: "/dashboard/vat/invoices" },
    { name: language === "bn" ? "ক্রয়" : "Purchases", href: "/dashboard/purchases" },
    { name: language === "bn" ? "বিক্রয়" : "Sales", href: "/dashboard/sales" },
    { name: language === "bn" ? "টার্নওভার ট্যাক্স" : "Turnover Tax", href: "/dashboard/turnover-tax" },
    { name: language === "bn" ? "রিফান্ড" : "Refunds", href: "/dashboard/refunds" },
    { name: language === "bn" ? "এজেন্ট" : "Agents", href: "/dashboard/agents" },
    { name: language === "bn" ? "ADR" : "ADR", href: "/dashboard/adr" },
    { name: language === "bn" ? "কমপ্লায়েন্স" : "Compliance", href: "/dashboard/compliance" },
    { name: language === "bn" ? "ডকুমেন্টস" : "Documents", href: "/dashboard/documents" },
    { name: language === "bn" ? "রিপোর্ট" : "Reports", href: "/dashboard/reports" },
    { name: language === "bn" ? "অডিট" : "Audit", href: "/dashboard/audit" },
    { name: language === "bn" ? "রিয়েল-টাইম" : "Real-Time", href: "/dashboard/real-time" },
    { name: language === "bn" ? "সেটিংস" : "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="fixed inset-0 top-[44px] z-40 bg-[var(--canvas)] md:hidden overflow-y-auto animate-in slide-in-from-top-2 duration-200">
      <div className="p-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => { router.push(item.href); onClose(); }}
              className={`w-full text-left px-4 py-3 rounded-[12px] text-[15px] transition-colors ${
                isActive
                  ? "bg-[var(--action-blue)] text-white font-[600]"
                  : "text-[var(--ink)] hover:bg-[var(--canvas-parchment)]"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
