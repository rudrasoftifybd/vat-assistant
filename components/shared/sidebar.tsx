"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/use-language";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  ShoppingCart,
  Store,
  Calendar,
  FolderOpen,
  Settings,
  Percent,
  ClipboardCheck,
  UserCheck,
  Scale,
  BarChart3,
  Shield,
  Radio,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const mainNav = [
  { nameKey: "ড্যাশবোর্ড", nameEn: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { nameKey: "ক্লায়েন্ট", nameEn: "Clients", href: "/dashboard/clients", icon: Users },
  { nameKey: "মুসক ফরম", nameEn: "Forms", href: "/dashboard/forms", icon: BookOpen },
];

const vatNav = {
  nameBn: "ভ্যাট",
  nameEn: "VAT",
  icon: FileText,
  children: [
    { nameKey: "রিটার্ন (৯.১)", nameEn: "Returns (9.1)", href: "/dashboard/vat/returns" },
    { nameKey: "চালানপত্র (৬.৩)", nameEn: "Invoices (6.3)", href: "/dashboard/vat/invoices" },
    { nameKey: "ক্রয় (৬.১)", nameEn: "Purchases (6.1)", href: "/dashboard/purchases" },
    { nameKey: "বিক্রয় (৬.২)", nameEn: "Sales (6.2)", href: "/dashboard/sales" },
    { nameKey: "টার্নওভার ট্যাক্স (৯.২)", nameEn: "Turnover Tax (9.2)", href: "/dashboard/turnover-tax" },
  ],
};

const mgmtNav = [
  { nameKey: "রিফান্ড", nameEn: "Refunds", href: "/dashboard/refunds", icon: ClipboardCheck },
  { nameKey: "এজেন্ট", nameEn: "Agents", href: "/dashboard/agents", icon: UserCheck },
  { nameKey: "ADR মামলা", nameEn: "ADR", href: "/dashboard/adr", icon: Scale },
];

const otherNav = [
  { nameKey: "কমপ্লায়েন্স", nameEn: "Compliance", href: "/dashboard/compliance", icon: Calendar },
  { nameKey: "ডকুমেন্টস", nameEn: "Documents", href: "/dashboard/documents", icon: FolderOpen },
  { nameKey: "রিপোর্ট", nameEn: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { nameKey: "অডিট লগ", nameEn: "Audit Log", href: "/dashboard/audit", icon: Shield },
  { nameKey: "রিয়েল-টাইম", nameEn: "Real-Time", href: "/dashboard/real-time", icon: Radio },
  { nameKey: "সেটিংস", nameEn: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { language } = useLanguageStore();
  const [vatOpen, setVatOpen] = useState(true);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const NavItem = ({ item }: { item: { nameKey: string; nameEn: string; href: string; icon: any } }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-[10px] text-[14px] tracking-[-0.224px] transition-all duration-200",
          active
            ? "bg-[var(--action-blue)] text-white font-[500]"
            : "text-[var(--ink-muted-48)] hover:text-[var(--ink)] hover:bg-[var(--canvas-parchment)]"
        )}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        <span>{language === "bn" ? item.nameKey : item.nameEn}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-[240px] bg-[var(--canvas)] border-r border-[var(--divider-soft)] shrink-0 overflow-y-auto">
      <div className="flex-1 p-3 space-y-0.5">
        <div className="mb-2 px-3 py-2">
          <span className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)]">
            {language === "bn" ? "প্রধান" : "Main"}
          </span>
        </div>
        {mainNav.map((item) => <NavItem key={item.href} item={item} />)}

        <div className="mt-4 mb-1">
          <button
            onClick={() => setVatOpen(!vatOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)] hover:text-[var(--ink)] transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-[14px] w-[14px]" />
              {language === "bn" ? vatNav.nameBn : vatNav.nameEn}
            </span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", vatOpen && "rotate-180")} />
          </button>
          {vatOpen && (
            <div className="ml-2 mt-0.5 space-y-0.5">
              {vatNav.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-[10px] text-[14px] tracking-[-0.224px] transition-all duration-200",
                    isActive(child.href)
                      ? "bg-[var(--action-blue)] text-white font-[500]"
                      : "text-[var(--ink-muted-48)] hover:text-[var(--ink)] hover:bg-[var(--canvas-parchment)]"
                  )}
                >
                  <span className="w-[18px]" />
                  <span>{language === "bn" ? child.nameKey : child.nameEn}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 mb-2 px-3 py-2">
          <span className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)]">
            {language === "bn" ? "ব্যবস্থাপনা" : "Management"}
          </span>
        </div>
        {mgmtNav.map((item) => <NavItem key={item.href} item={item} />)}

        <div className="mt-4 mb-2 px-3 py-2">
          <span className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)]">
            {language === "bn" ? "অন্যান্য" : "Other"}
          </span>
        </div>
        {otherNav.map((item) => <NavItem key={item.href} item={item} />)}
      </div>
    </aside>
  );
}
