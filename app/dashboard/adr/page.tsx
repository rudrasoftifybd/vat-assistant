"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Plus, Scale, Trash2, Pencil, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { AdrCase } from "@/types/database";

const caseVariants: Record<string, "warning" | "secondary" | "success" | "destructive"> = {
  filed: "warning", under_review: "secondary", hearing: "secondary", resolved: "success", dismissed: "destructive",
};

export default function AdrPage() {
  const [cases, setCases] = useState<(AdrCase & { client_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<AdrCase | null>(null);
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
    if (!profile?.org_id) return;
    const { data: clients } = await supabase.from("clients").select("id, name").eq("org_id", profile.org_id);
    const cm = new Map(clients?.map((c) => [c.id, c.name]) || []);
    const { data } = await supabase.from("adr_cases").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false });
    if (data) setCases(data.map((c) => ({ ...c, client_name: cm.get(c.client_id) || "-" })));
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await createClient().from("adr_cases").delete().eq("id", id);
    setCases(cases.filter((c) => c.id !== id)); setDeleteId(null);
    toast.success("মামলা মুছে ফেলা হয়েছে");
  }

  async function handleEdit() {
    if (!editTarget) return;
    await createClient().from("adr_cases").update({ status: editStatus }).eq("id", editTarget.id);
    setCases(cases.map((c) => (c.id === editTarget.id ? { ...c, status: editStatus as any } : c)));
    setEditTarget(null);
    toast.success("অবস্থা আপডেট হয়েছে");
  }

  if (loading) return <div className="animate-spin h-8 w-8 mx-auto mt-32 border-4 border-[var(--primary)] border-t-transparent rounded-full" />;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">ADR মামলা (আপিল ও সালিশ)</h1>
        <Link href="/dashboard/adr/new"><Button className="gap-2"><Plus className="h-4 w-4" />নতুন মামলা</Button></Link>
      </div>
      <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none overflow-hidden">
        <Table><TableHeader><TableRow>
          <TableHead>কেস নম্বর</TableHead><TableHead>ক্লায়েন্ট</TableHead><TableHead>ধরন</TableHead><TableHead>অবস্থা</TableHead><TableHead>পরিমাণ</TableHead><TableHead>তারিখ</TableHead><TableHead>কর্ম</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {cases.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="py-16 text-center text-[17px] text-[var(--ink-muted-48)]"><Scale className="mx-auto h-12 w-12 mb-4 opacity-50" />কোনো মামলা নেই</TableCell></TableRow>
          ) : cases.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono">{c.case_number || "-"}</TableCell>
              <TableCell className="font-medium">{c.client_name}</TableCell>
              <TableCell><Badge className="rounded-[9999px]" variant="outline">{c.type === "appeal" ? "আপিল" : c.type === "mediation" ? "মধ্যস্থতা" : "সালিশ"}</Badge></TableCell>
              <TableCell><Badge className="rounded-[9999px]" variant={caseVariants[c.status]}>{c.status === "filed" ? "দায়ের" : c.status === "under_review" ? "পর্যালোচনা" : c.status === "hearing" ? "শুনানি" : c.status === "resolved" ? "নিষ্পত্তি" : "খারিজ"}</Badge></TableCell>
              <TableCell className="font-semibold">{formatCurrency(c.disputed_amount || 0)}</TableCell>
              <TableCell>{formatDate(c.created_at)}</TableCell>
              <TableCell className="flex gap-1">
                <Link href={`/dashboard/adr/${c.id}`}><Button variant="ghost" size="icon"><FileText className="h-4 w-4" /></Button></Link>
                <Button variant="ghost" size="icon" onClick={() => { setEditTarget(c); setEditStatus(c.status); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody></Table>
      </div>

      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <DialogHeader><DialogTitle>অবস্থা পরিবর্তন</DialogTitle></DialogHeader>
          <div className="px-6 pb-4"><Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
            options={["filed","under_review","hearing","resolved","dismissed"].map((s) => ({ value: s, label: s }))} />
          </div>
          <DialogFooter className="px-6 pb-4"><Button variant="outline" onClick={() => setEditTarget(null)}>বাতিল</Button><Button onClick={handleEdit}>সংরক্ষণ</Button></DialogFooter>
        </div>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <DialogHeader><DialogTitle>মুছে ফেলুন</DialogTitle><DialogDescription>আপনি কি নিশ্চিত?</DialogDescription></DialogHeader>
          <DialogFooter className="px-6 pb-4"><Button variant="outline" onClick={() => setDeleteId(null)}>বাতিল</Button><Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>মুছে ফেলুন</Button></DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
