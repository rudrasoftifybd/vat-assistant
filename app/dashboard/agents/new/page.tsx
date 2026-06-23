"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewAgentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", agent_number: "", license_valid_until: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
    if (!profile?.org_id) return;
    const { error } = await supabase.from("vat_agents").insert({
      org_id: profile.org_id, name: form.name, agent_number: form.agent_number || null,
      license_valid_until: form.license_valid_until || null, status: "active",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("এজেন্ট নিবন্ধিত হয়েছে");
    router.push("/dashboard/agents");
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center gap-4"><Link href="/dashboard/agents"><Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button></Link><h1 className="text-[34px] font-[600] tracking-[-0.374px]">নতুন ভ্যাট এজেন্ট (মুসক ৩.১)</h1></div>
      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none max-w-2xl"><CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">নাম</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">এজেন্ট নম্বর (NBR)</Label><Input value={form.agent_number} onChange={(e) => setForm({ ...form, agent_number: e.target.value })} /></div>
            <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">লাইসেন্স বৈধতা</Label><Input type="date" value={form.license_valid_until} onChange={(e) => setForm({ ...form, license_valid_until: e.target.value })} /></div>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
