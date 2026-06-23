"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { getFormSchema } from "@/lib/forms/schema";
import { getFormDefinition } from "@/lib/forms/definitions";
import { FormBuilder, validateForm } from "@/components/forms/FormBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Download, Save, Send, Loader2, Database } from "lucide-react";
import { toast } from "sonner";

export default function FormFillPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguageStore();
  const formId = typeof params.formId === "string" ? params.formId : "";

  const schema = getFormSchema(formId);
  const definition = getFormDefinition(formId);

  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingId, setExistingId] = useState<string | null>(null);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [fillMonth, setFillMonth] = useState(new Date().getMonth() + 1);
  const [fillYear, setFillYear] = useState(new Date().getFullYear());
  const [registerFilling, setRegisterFilling] = useState(false);

  useEffect(() => {
    if (!schema || !definition) { setLoading(false); return; }
    (async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { setLoading(false); return; }
      const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
      if (!profile?.org_id) { setLoading(false); return; }
      setOrgId(profile.org_id);

      const { data: clientData } = await supabase.from("clients").select("id, name, bin").eq("org_id", profile.org_id);
      if (clientData) setClients(clientData);

      const { data: existing } = await supabase
        .from("filled_forms")
        .select("id, form_data, status")
        .eq("form_id", formId)
        .eq("org_id", profile.org_id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (existing) {
        setExistingId(existing.id);
        setExistingStatus(existing.status);
        setFormData(existing.form_data as Record<string, unknown>);
        if (existing.form_data && typeof existing.form_data === "object" && "client_id" in (existing.form_data as any)) {
          setSelectedClientId((existing.form_data as any).client_id || "");
        }
      } else {
        const defaults: Record<string, unknown> = {};
        for (const sec of schema.sections) {
          for (const f of sec.fields) {
            if (f.defaultValue != null) defaults[f.id] = f.defaultValue;
          }
        }
        setFormData(defaults);
      }
      setLoading(false);
    })();
  }, [formId, schema, definition]);

  const handleAutoFill = useCallback(async () => {
    if (!selectedClientId || !schema) return;
    const supabase = createClient();
    const { data: client } = await supabase.from("clients").select("*").eq("id", selectedClientId).single();
    if (!client) { toast.error("ক্লায়েন্ট পাওয়া যায়নি"); return; }

    const updated: Record<string, unknown> = { ...formData, client_id: selectedClientId };
    for (const sec of schema.sections) {
      for (const f of sec.fields) {
        if (f.autoFill === "currentDate") {
          updated[f.id] = new Date().toISOString().split("T")[0];
        } else if (f.autoFill === "client.name") {
          updated[f.id] = client.name;
        } else if (f.autoFill === "client.bin") {
          updated[f.id] = client.bin || "";
        } else if (f.autoFill === "client.tin") {
          updated[f.id] = client.tin || "";
        } else if (f.autoFill === "client.phone") {
          updated[f.id] = client.phone || "";
        } else if (f.autoFill === "client.email") {
          updated[f.id] = client.email || "";
        } else if (f.autoFill === "client.address") {
          updated[f.id] = client.address || "";
        } else if (f.autoFill === "client.annual_turnover") {
          updated[f.id] = client.annual_turnover || 0;
        } else if (f.autoFill === "client.business_type") {
          updated[f.id] = client.business_type || "";
        } else if (f.autoFill === "generatedInvoice") {
          updated[f.id] = `INV-${Date.now().toString(36).toUpperCase()}`;
        }
      }
    }
    setFormData(updated);
    toast.success("স্বয়ং-পূরণ সম্পন্ন");
  }, [selectedClientId, formData, schema]);

  const handleRegisterFill = useCallback(async () => {
    if (!selectedClientId || !orgId) { toast.error(language === "bn" ? "প্রথমে ক্লায়েন্ট নির্বাচন করুন" : "Select a client first"); return; }
    setRegisterFilling(true);
    try {
      const { autoFillFromRegisters } = await import("@/lib/forms/auto-fill");
      const aggregated = await autoFillFromRegisters(selectedClientId, orgId, fillMonth, fillYear);
      const net_vat = aggregated.output_tax - aggregated.input_tax;
      setFormData((prev) => ({
        ...prev,
        total_sales: aggregated.total_sales,
        vatable_sales: aggregated.vatable_sales,
        vat_free_sales: aggregated.vat_free_sales,
        output_tax: aggregated.output_tax,
        total_purchases: aggregated.total_purchases,
        vatable_purchases: aggregated.vatable_purchases,
        input_tax: aggregated.input_tax,
        net_vat,
        amount_due: net_vat + (Number((prev as any).adjustments) || 0) + (Number((prev as any).surcharge) || 0) + (Number((prev as any).late_fee) || 0),
        return_period: `${fillMonth}/${fillYear}`,
      }));
      toast.success(language === "bn" ? "রেজিস্টার থেকে তথ্য পূরণ করা হয়েছে" : "Filled from register data");
    } catch (e) {
      toast.error(language === "bn" ? "তথ্য পূরণ ব্যর্থ" : "Failed to auto-fill");
    }
    setRegisterFilling(false);
  }, [selectedClientId, orgId, fillMonth, fillYear, language]);

  const handleSave = async (status: "draft" | "submitted") => {
    setSaving(true);
    if (status === "submitted") {
      const errs = validateForm(schema!, formData);
      setErrors(errs);
      if (Object.keys(errs).length > 0) {
        toast.error("দয়া করে প্রয়োজনীয় ফিল্ডগুলো পূরণ করুন");
        setSaving(false);
        return;
      }
    }
    const supabase = createClient();
    const payload = { form_id: formId, form_data: formData, org_id: orgId, client_id: selectedClientId || null, status };

    if (existingId) {
      const { error } = await supabase.from("filled_forms").update({ form_data: formData, status, client_id: selectedClientId || null }).eq("id", existingId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("filled_forms").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    setExistingStatus(status);
    toast.success(status === "draft" ? "খসড়া সংরক্ষিত" : "ফরম জমা দেওয়া হয়েছে");
    setSaving(false);
  };

  if (!schema || !definition) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2">{language === "bn" ? "ফরম পাওয়া যায়নি" : "Form not found"}</h2>
        <Link href="/dashboard/forms"><Button variant="ghost"><ChevronLeft className="h-4 w-4 mr-1" /> {language === "bn" ? "ফিরে যান" : "Go back"}</Button></Link>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/forms"><Button variant="ghost"><ChevronLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-[34px] font-[600] tracking-[-0.374px]">{language === "bn" ? definition.titleBn : definition.titleEn}</h1>
            <p className="text-[17px] text-[var(--ink-muted-48)]">{definition.description} {existingStatus && <Badge variant="warning" className="ml-2">{existingStatus}</Badge>}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="pearl-capsule" className="gap-1" onClick={() => handleSave("draft")} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {language === "bn" ? "খসড়া" : "Draft"}
          </Button>
          <Button variant="primary" className="gap-1" onClick={() => handleSave("submitted")} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {language === "bn" ? "জমা দিন" : "Submit"}
          </Button>
          {existingId && (
            <Button variant="secondary-pill" className="gap-1" onClick={() => router.push(`/dashboard/forms/${formId}/download?filledFormId=${existingId}`)}>
              <Download className="h-4 w-4" /> {language === "bn" ? "ডাউনলোড" : "Download"}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[17px] font-[600] tracking-[-0.374px]">{language === "bn" ? "ক্লায়েন্ট নির্বাচন" : "Select Client"}</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="flex h-[44px] w-full max-w-xs rounded-[9999px] border border-[var(--hairline)] bg-[var(--canvas)] px-[16px] py-2 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-blue)]"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">{language === "bn" ? "ক্লায়েন্ট নির্বাচন করুন" : "Select a client"}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} {c.bin ? `(${c.bin})` : ""}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {formId === "mushak-9.1" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[17px] font-[600] tracking-[-0.374px]">{language === "bn" ? "রেজিস্টার থেকে পূরণ" : "Fill from Registers"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-[13px] font-[500] text-[var(--ink-muted-48)]">{language === "bn" ? "মাস" : "Month"}</label>
              <select
                className="flex h-[44px] rounded-[9999px] border border-[var(--hairline)] bg-[var(--canvas)] px-[16px] py-2 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-blue)]"
                value={fillMonth}
                onChange={(e) => setFillMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-[500] text-[var(--ink-muted-48)]">{language === "bn" ? "বছর" : "Year"}</label>
              <select
                className="flex h-[44px] rounded-[9999px] border border-[var(--hairline)] bg-[var(--canvas)] px-[16px] py-2 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-blue)]"
                value={fillYear}
                onChange={(e) => setFillYear(Number(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Button variant="secondary-pill" className="gap-1" onClick={handleRegisterFill} disabled={registerFilling || !selectedClientId}>
              {registerFilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              {language === "bn" ? "রেজিস্টার থেকে পূরণ" : "From Registers"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <FormBuilder
            schema={schema}
            formData={formData}
            onChange={setFormData}
            errors={errors}
            onAutoFill={handleAutoFill}
          />
        </CardContent>
      </Card>
    </div>
  );
}
