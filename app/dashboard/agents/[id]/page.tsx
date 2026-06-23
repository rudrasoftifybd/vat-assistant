"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { VatAgent } from "@/types/database";

export default function EditAgentPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", agent_number: "", license_valid_until: "", status: "active" });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("vat_agents").select("*").eq("id", id).single();
      if (data) setForm({ name: data.name, agent_number: data.agent_number || "", license_valid_until: data.license_valid_until || "", status: data.status });
      setLoading(false);
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await createClient().from("vat_agents").update(form).eq("id", id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("এজেন্ট আপডেট হয়েছে");
    router.push("/dashboard/agents");
  };

  if (loading) return <div className="animate-spin h-8 w-8 mx-auto mt-32 border-4 border-[var(--primary)] border-t-transparent rounded-full" />;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center gap-4"><Link href="/dashboard/agents"><Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button></Link><h1 className="text-[34px] font-[600] tracking-[-0.374px]">এজেন্ট সম্পাদনা</h1></div>
      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none max-w-2xl"><CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">নাম</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">এজেন্ট নম্বর</Label><Input value={form.agent_number} onChange={(e) => setForm({ ...form, agent_number: e.target.value })} /></div>
            <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">লাইসেন্স বৈধতা</Label><Input type="date" value={form.license_valid_until} onChange={(e) => setForm({ ...form, license_valid_until: e.target.value })} /></div>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
