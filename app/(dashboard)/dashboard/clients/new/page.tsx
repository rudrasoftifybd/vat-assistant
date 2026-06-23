"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    bin: "",
    tin: "",
    phone: "",
    email: "",
    business_type: "",
    address: "",
    annual_turnover: "",
    registration_date: "",
    vat_registered: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("নাম আবশ্যক");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", userData.user.id)
      .single();

    if (!profile?.org_id) return;

    const { error: saveError } = await supabase.from("clients").insert({
      org_id: profile.org_id,
      name: form.name,
      bin: form.bin || null,
      tin: form.tin || null,
      phone: form.phone || null,
      email: form.email || null,
      business_type: form.business_type || null,
      address: form.address || null,
      annual_turnover: form.annual_turnover ? parseFloat(form.annual_turnover) : null,
      registration_date: form.registration_date || null,
      vat_registered: form.vat_registered,
    });

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    router.push("/dashboard/clients");
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">{t("clients.add_client", language)}</h1>
      </div>

      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px]">
        <CardHeader className="p-[24px] pb-0">
          <CardTitle className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)]">{t("clients.add_client", language)}</CardTitle>
        </CardHeader>
        <CardContent className="p-[24px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">
                  {t("clients.name", language)} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bin" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("clients.bin", language)}</Label>
                <Input
                  id="bin"
                  value={form.bin}
                  onChange={(e) => setForm({ ...form, bin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tin" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("clients.tin", language)}</Label>
                <Input
                  id="tin"
                  value={form.tin}
                  onChange={(e) => setForm({ ...form, tin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("clients.phone", language)}</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("clients.email", language)}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_type" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("clients.business_type", language)}</Label>
                <Select
                  id="business_type"
                  value={form.business_type}
                  onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                  placeholder={t("clients.business_type", language)}
                  options={[
                    { value: "manufacturer", label: t("clients.manufacturer", language) },
                    { value: "trader", label: t("clients.trader", language) },
                    { value: "service", label: t("clients.service", language) },
                  ]}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("clients.address", language)}</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annual_turnover" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("clients.annual_turnover", language)}</Label>
                <Input
                  id="annual_turnover"
                  type="number"
                  value={form.annual_turnover}
                  onChange={(e) => setForm({ ...form, annual_turnover: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_date" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("clients.registration_date", language)}</Label>
                <Input
                  id="registration_date"
                  type="date"
                  value={form.registration_date}
                  onChange={(e) => setForm({ ...form, registration_date: e.target.value })}
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-[var(--destructive)]">{error}</p>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? t("common.saving", language) : t("common.save", language)}
              </Button>
              <Link href="/dashboard/clients">
                <Button type="button" variant="outline">
                  {t("common.cancel", language)}
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
