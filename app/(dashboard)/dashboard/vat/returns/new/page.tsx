"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Calculator } from "lucide-react";
import Link from "next/link";
import { formatCurrency, calculateVAT, calculateNetVAT } from "@/lib/utils";
import type { Client } from "@/types/database";

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString(),
  label: t(`months.${i + 1}` as any, "bn"),
}));

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));

export default function NewVatReturnPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    client_id: "",
    period_month: (new Date().getMonth() + 1).toString(),
    period_year: currentYear.toString(),
    total_sales: "0",
    total_purchases: "0",
    adjustments: "0",
  });

  const sales = parseFloat(form.total_sales) || 0;
  const purchases = parseFloat(form.total_purchases) || 0;
  const adj = parseFloat(form.adjustments) || 0;
  const outputTax = calculateVAT(sales, 15);
  const inputTax = calculateVAT(purchases, 15);
  const netVat = calculateNetVAT(outputTax, inputTax);
  const amountDue = netVat + adj;

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.user.id)
      .single();

    if (!profile?.org_id) return;

    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("org_id", profile.org_id);

    if (data) setClients(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) {
      setError("ক্লায়েন্ট নির্বাচন করুন");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const dueDate = new Date(parseInt(form.period_year), parseInt(form.period_month), 15);
    dueDate.setDate(dueDate.getDate() + 15);

    const { error: saveError } = await supabase.from("vat_returns").insert({
      client_id: form.client_id,
      period_month: parseInt(form.period_month),
      period_year: parseInt(form.period_year),
      status: "draft",
      total_sales: sales,
      total_purchases: purchases,
      output_tax: outputTax,
      input_tax: inputTax,
      net_vat: netVat,
      adjustments: adj,
      amount_due: amountDue,
      due_date: dueDate.toISOString().split("T")[0],
    });

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    router.push("/dashboard/vat/returns");
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vat/returns">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">{t("vat.return_title", language)}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardContent className="p-[24px]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client_id" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">
                  {t("clients.name", language)} <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="client_id"
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  placeholder={t("common.search", language) + "..."}
                  options={clients.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period_month" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("vat.month", language)}</Label>
                  <Select
                    id="period_month"
                    value={form.period_month}
                    onChange={(e) => setForm({ ...form, period_month: e.target.value })}
                    options={monthOptions}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_year" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("vat.year", language)}</Label>
                  <Select
                    id="period_year"
                    value={form.period_year}
                    onChange={(e) => setForm({ ...form, period_year: e.target.value })}
                    options={yearOptions}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_sales" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("vat.total_sales", language)}</Label>
                <Input
                  id="total_sales"
                  type="number"
                  value={form.total_sales}
                  onChange={(e) => setForm({ ...form, total_sales: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_purchases" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("vat.total_purchases", language)}</Label>
                <Input
                  id="total_purchases"
                  type="number"
                  value={form.total_purchases}
                  onChange={(e) => setForm({ ...form, total_purchases: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjustments" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("vat.adjustments", language)}</Label>
                <Input
                  id="adjustments"
                  type="number"
                  value={form.adjustments}
                  onChange={(e) => setForm({ ...form, adjustments: e.target.value })}
                />
              </div>
              {error && (
                <p className="text-sm text-[var(--destructive)]">{error}</p>
              )}
              <Button type="submit" variant="primary" disabled={saving} className="w-full">
                {saving ? t("common.saving", language) : t("common.save", language)}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardContent className="p-[24px]">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="font-semibold">{t("vat.return_title", language)}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-[var(--hairline)]">
                <span>{t("vat.total_sales", language)} (A)</span>
                <span className="font-medium">{formatCurrency(sales, language)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--hairline)]">
                <span>{t("vat.total_purchases", language)} (B)</span>
                <span className="font-medium">{formatCurrency(purchases, language)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--hairline)]">
                <span>{t("vat.output_tax", language)} (C = A × 15%)</span>
                <span className="font-medium">{formatCurrency(outputTax, language)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--hairline)]">
                <span>{t("vat.input_tax", language)} (D = B × 15%)</span>
                <span className="font-medium">{formatCurrency(inputTax, language)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--hairline)] font-semibold">
                <span>{t("vat.net_vat", language)} (E = C - D)</span>
                <span>{formatCurrency(netVat, language)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--hairline)]">
                <span>{t("vat.adjustments", language)} (F)</span>
                <span>{formatCurrency(adj, language)}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold text-[var(--primary)]">
                <span>{t("vat.amount_due", language)} (G = E + F)</span>
                <span>{formatCurrency(amountDue, language)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
