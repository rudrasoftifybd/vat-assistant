"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { AdrCase } from "@/types/database";

export default function AdrDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [c, setCase] = useState<AdrCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await createClient().from("adr_cases").select("*").eq("id", id).single();
      if (data) setCase(data);
      setLoading(false);
    })();
  }, [id]);

  const handleResolve = async (status: "resolved" | "dismissed") => {
    setSaving(true);
    const { error } = await createClient().from("adr_cases").update({ status, resolution_notes: resolutionNotes }).eq("id", id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "resolved" ? "মামলা নিষ্পত্তি হয়েছে" : "মামলা খারিজ হয়েছে");
    if (c) setCase({ ...c, status, resolution_notes: resolutionNotes });
  };

  if (loading) return <div className="animate-spin h-8 w-8 mx-auto mt-32" />;
  if (!c) return <p className="text-center mt-20 text-[17px] text-[var(--ink-muted-48)]">মামলা পাওয়া যায়নি</p>;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/adr"><Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">মামলা #{c.case_number}</h1>
        <Badge className="rounded-[9999px]" variant={c.status === "resolved" ? "success" : c.status === "dismissed" ? "destructive" : "warning"}>{c.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardHeader className="p-6 pb-3"><CardTitle className="text-[17px] font-[600]">মামলার তথ্য</CardTitle></CardHeader>
          <CardContent className="p-6 pt-0 space-y-3 text-[15px]">
            <div><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">ধরন</Label><p className="mt-0.5">{c.type === "appeal" ? "আপিল" : c.type === "mediation" ? "মধ্যস্থতা" : "সালিশ"}</p></div>
            <div><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">বিবাদিত পরিমাণ</Label><p className="mt-0.5 font-semibold">{formatCurrency(c.disputed_amount || 0)}</p></div>
            <div><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">দায়ের তারিখ</Label><p className="mt-0.5">{formatDate(c.created_at)}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardHeader className="p-6 pb-3"><CardTitle className="text-[17px] font-[600]">বিবরণ</CardTitle></CardHeader>
          <CardContent className="p-6 pt-0"><p className="text-[15px] whitespace-pre-wrap">{c.description || "-"}</p></CardContent>
        </Card>
      </div>

      {c.status === "filed" || c.status === "under_review" || c.status === "hearing" ? (
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardHeader className="p-6 pb-3"><CardTitle className="text-[17px] font-[600]">মামলা নিষ্পত্তি</CardTitle></CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-2"><Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">নিষ্পত্তি নোট</Label>
              <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--ink-muted-48)]" value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleResolve("resolved")} disabled={saving}>নিষ্পত্তি করুন</Button>
              <Button variant="destructive" onClick={() => handleResolve("dismissed")} disabled={saving}>খারিজ করুন</Button>
            </div>
          </CardContent>
        </Card>
      ) : c.resolution_notes ? (
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardHeader className="p-6 pb-3"><CardTitle className="text-[17px] font-[600]">নিষ্পত্তি নোট</CardTitle></CardHeader>
          <CardContent className="p-6 pt-0"><p className="text-[15px] whitespace-pre-wrap">{c.resolution_notes}</p></CardContent>
        </Card>
      ) : null}
    </div>
  );
}
