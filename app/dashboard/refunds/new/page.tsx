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

export default function NewRefundPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ client_id: "", type: "diplomatic", amount: "", supporting_docs: "[]" });

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
    const { error } = await supabase.from("refund_requests").insert({
      client_id: form.client_id, type: form.type, amount: parseFloat(form.amount) || 0,
      status: "draft", supporting_docs: JSON.parse(form.supporting_docs || "[]"),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("রিফান্ড অনুরোধ তৈরি হয়েছে");
    router.push("/dashboard/refunds");
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center gap-4"><Link href="/dashboard/refunds"><Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button></Link><h1 className="text-[34px] font-[600] tracking-[-0.374px]">নতুন রিফান্ড অনুরোধ</h1></div>
      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none max-w-2xl"><CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">ক্লায়েন্ট</Label><Select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} placeholder="নির্বাচন করুন" options={clients.map((c) => ({ value: c.id, label: c.name }))} required /></div>
          <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">ধরন</Label><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: "diplomatic", label: "কূটনৈতিক (মুসক ১০.১)" }, { value: "tourist", label: "পর্যটক (মুসক ১০.২)" }, { value: "export", label: "রপ্তানি" }]} /></div>
          <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">পরিমাণ (টাকা)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
          <Button type="submit" disabled={saving}>{saving ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
