"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { useRoleStore } from "@/store/use-role";
import { FORM_DEFINITIONS, FORM_CATEGORIES, getCategoryLabel } from "@/lib/forms/definitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Loader2 } from "lucide-react";

type FormStatus = { formId: string; status: string; updatedAt: string } | null;

export default function FormsPage() {
  const { language } = useLanguageStore();
  const { role } = useRoleStore();
  const [search, setSearch] = useState("");
  const [statusMap, setStatusMap] = useState<Record<string, { status: string; updatedAt: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { setLoading(false); return; }
      const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
      if (!profile?.org_id) { setLoading(false); return; }
      const { data: filled } = await supabase
        .from("filled_forms")
        .select("form_id, status, updated_at")
        .eq("org_id", profile.org_id)
        .order("updated_at", { ascending: false });
      if (filled) {
        const map: Record<string, { status: string; updatedAt: string }> = {};
        for (const f of filled) {
          if (!map[f.form_id]) map[f.form_id] = { status: f.status, updatedAt: f.updated_at };
        }
        setStatusMap(map);
      }
      setLoading(false);
    })();
  }, []);

  const visibleForms = role === "admin" ? FORM_DEFINITIONS : FORM_DEFINITIONS.filter((f) => !f.adminOnly);
  const filtered = visibleForms.filter(
    (f) =>
      f.titleBn.toLowerCase().includes(search.toLowerCase()) ||
      f.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search)
  );

  const grouped = FORM_CATEGORIES.map((cat) => ({
    ...cat,
    forms: filtered.filter((f) => f.category === cat.key),
  })).filter((g) => g.forms.length > 0);

  return (
    <div className="max-w-[1440px] mx-auto space-y-[32px] px-6 py-8">
      <div className="flex flex-col items-start">
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">
          {language === "bn" ? "মুসক ফরম লাইব্রেরি" : "Mushak Forms Library"}
        </h1>
        <p className="text-[17px] text-[var(--ink-muted-48)] tracking-[-0.374px] mt-1">
          {language === "bn" ? "সমস্ত ভ্যাট ফরম ব্রাউজ ও অ্যাক্সেস করুন" : "Browse and access all VAT forms"}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-muted-48)]" />
        <Input
          placeholder={language === "bn" ? "ফরম খুঁজুন..." : "Search forms..."}
          className="rounded-[9999px] border border-[rgba(0,0,0,0.08)] h-[44px] pl-12 bg-[var(--canvas)]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[var(--ink-muted-48)]" /></div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-16 text-[var(--ink-muted-48)]">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-30" />
          {language === "bn" ? "কোনো ফরম পাওয়া যায়নি" : "No forms found"}
        </div>
      ) : (
        grouped.map((group) => (
          <div key={group.key}>
            <h2 className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)] mb-4">
              {language === "bn" ? group.labelBn : group.labelEn}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
              {group.forms.map((form) => {
                const status = statusMap[form.id];
                return (
                  <Link key={form.id} href={`/dashboard/forms/${form.id}`}>
                    <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] p-[24px] transition-all duration-200 hover:border-[var(--action-blue)]/30 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[17px] font-[600] tracking-[-0.374px] flex-1">
                          {language === "bn" ? form.titleBn : form.titleEn}
                        </span>
                        {status && (
                          <Badge className="rounded-[9999px] ml-3 shrink-0" variant={status.status === "submitted" ? "success" : status.status === "archived" ? "secondary" : "warning"}>
                            {status.status === "draft" ? (language === "bn" ? "খসড়া" : "Draft") : status.status === "submitted" ? (language === "bn" ? "জমা" : "Submitted") : (language === "bn" ? "আর্কাইভ" : "Archived")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[14px] text-[var(--ink-muted-48)] tracking-[-0.224px] mt-1 flex-1">
                        {form.description}
                      </p>
                      <p className="text-[11px] font-mono text-[var(--ink-muted-48)] opacity-60 mt-3">
                        {form.id}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
