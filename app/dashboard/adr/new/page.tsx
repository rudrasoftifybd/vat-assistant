"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewAdrPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ client_id: "", type: "appeal", description: "", disputed_amount: "" });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
      if (!profile?.org_id) return;
      const { data } = await supabase.from("clients").select("id, name").eq("org_id", profile.org_id);
      if (data) setClients(data);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
    if (!profile?.org_id) return;
    const caseNumber = `ADR-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("adr_cases").insert({
      org_id: profile.org_id, client_id: form.client_id, case_number: caseNumber,
      type: form.type, status: "filed", description: form.description,
      disputed_amount: parseFloat(form.disputed_amount) || 0,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("মামলা দায়ের হয়েছে");
    router.push("/dashboard/adr");
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center gap-4"><Link href="/dashboard/adr"><Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button></Link><h1 className="text-[34px] font-[600] tracking-[-0.374px]">নতুন ADR মামলা</h1></div>
      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none max-w-2xl"><CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">ক্লায়েন্ট</Label><Select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} placeholder="নির্বাচন করুন" options={clients.map((c) => ({ value: c.id, label: c.name }))} required /></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">ধরন</Label><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: "appeal", label: "আপিল" }, { value: "mediation", label: "মধ্যস্থতা" }, { value: "arbitration", label: "সালিশ" }]} /></div>
            <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">বিবাদিত পরিমাণ (টাকা)</Label><Input type="number" value={form.disputed_amount} onChange={(e) => setForm({ ...form, disputed_amount: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">বিবরণ</Label><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--ink-muted-48)]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <Button type="submit" disabled={saving}>{saving ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
