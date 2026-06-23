"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Calculator } from "lucide-react";
import { formatCurrency, calculateVAT } from "@/lib/utils";
import { calculateTurnoverTax } from "@/lib/vat-calculations";
import type { Client } from "@/types/database";

export default function NewTurnoverTaxPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    client_id: "",
    period_month: (new Date().getMonth() + 1).toString(),
    period_year: new Date().getFullYear().toString(),
    total_sales: "0",
  });

  const sales = parseFloat(form.total_sales) || 0;
  const tax = calculateTurnoverTax(sales);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
      if (!profile?.org_id) return;
      const { data } = await supabase.from("clients").select("*").eq("org_id", profile.org_id);
      if (data) setClients(data.filter((c) => (c.annual_turnover || 0) < 5_000_000 || c.is_turnover_tax_eligible));
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) { setError("ক্লায়েন্ট নির্বাচন করুন"); return; }
    setSaving(true);
    const supabase = createClient();

    const { error: saveError } = await supabase.from("vat_returns").insert({
      client_id: form.client_id,
      period_month: parseInt(form.period_month),
      period_year: parseInt(form.period_year),
      status: "draft",
      total_sales: sales,
      output_tax: tax.turnoverTax,
      net_vat: tax.turnoverTax,
      amount_due: tax.turnoverTax,
      due_date: new Date(parseInt(form.period_year), parseInt(form.period_month), 15).toISOString().split("T")[0],
    });

    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    router.push("/dashboard/turnover-tax");
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/turnover-tax"><Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">নতুন টার্নওভার ট্যাক্স (মুসক ৯.২)</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none"><CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">ক্লায়েন্ট</Label>
              <Select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                placeholder="ক্লায়েন্ট নির্বাচন করুন"
                options={clients.map((c) => ({ value: c.id, label: `${c.name} (টার্নওভার: ${formatCurrency(c.annual_turnover || 0, language)})` }))} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">মাস</Label>
                <Select value={form.period_month} onChange={(e) => setForm({ ...form, period_month: e.target.value })}
                  options={Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: t(`months.${i + 1}` as any, language) }))} />
              </div>
              <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">বছর</Label>
                <Select value={form.period_year} onChange={(e) => setForm({ ...form, period_year: e.target.value })}
                  options={Array.from({ length: 5 }, (_, i) => ({ value: (new Date().getFullYear() - i).toString(), label: (new Date().getFullYear() - i).toString() }))} />
              </div>
            </div>
            <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">মোট বিক্রয় (টার্নওভার)</Label>
              <Input type="number" value={form.total_sales} onChange={(e) => setForm({ ...form, total_sales: e.target.value })} />
            </div>
            {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
            <Button type="submit" disabled={saving} className="w-full">{saving ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}</Button>
          </form>
        </CardContent></Card>

        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none"><CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6"><Calculator className="h-5 w-5 text-[var(--primary)]" /><CardTitle className="text-[17px] font-[600]">গণনা</CardTitle></div>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-[var(--hairline)]"><span className="text-[15px] text-[var(--ink-muted-80)]">মোট বিক্রয়</span><span className="font-[500]">{formatCurrency(sales, language)}</span></div>
            <div className="flex justify-between py-3 border-b border-[var(--hairline)]"><span className="text-[15px] text-[var(--ink-muted-80)]">প্রযোজ্য হার</span><span className="font-[500]">{tax.applicableRate * 100}%</span></div>
            <div className="flex justify-between py-3 border-b border-[var(--hairline)]"><span className="text-[15px] text-[var(--ink-muted-80)]">বার্ষিক টার্নওভার সীমা</span><span className="font-[500]">{tax.isEligible ? "যোগ্য" : "অযোগ্য"}</span></div>
            <div className="flex justify-between py-3 text-[20px] font-[600] text-[var(--primary)]">
              <span>টার্নওভার ট্যাক্স</span><span>{formatCurrency(tax.turnoverTax, language)}</span>
            </div>
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}
