"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Plus, Receipt, Trash2, Pencil } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RefundRequest } from "@/types/database";

const statusVariants: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
  draft: "warning", submitted: "secondary", approved: "success", rejected: "destructive", paid: "success",
};

export default function RefundsPage() {
  const { language } = useLanguageStore();
  const [refunds, setRefunds] = useState<(RefundRequest & { client_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<RefundRequest | null>(null);
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
    const { data } = await supabase.from("refund_requests").select("*").order("created_at", { ascending: false });
    if (data) setRefunds(data.map((r) => ({ ...r, client_name: cm.get(r.client_id) || "-" })));
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await createClient().from("refund_requests").delete().eq("id", id);
    setRefunds(refunds.filter((r) => r.id !== id)); setDeleteId(null);
  }

  async function handleEdit() {
    if (!editTarget) return;
    await createClient().from("refund_requests").update({ status: editStatus }).eq("id", editTarget.id);
    setRefunds(refunds.map((r) => (r.id === editTarget.id ? { ...r, status: editStatus as any } : r)));
    setEditTarget(null);
  }

  if (loading) return <div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mt-32" />;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">রিফান্ড অনুরোধ (মুসক ১০.১/১০.২)</h1>
        <Link href="/dashboard/refunds/new"><Button className="gap-2"><Plus className="h-4 w-4" />নতুন রিফান্ড</Button></Link>
      </div>
      <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none overflow-hidden">
        <Table><TableHeader><TableRow>
          <TableHead>ক্লায়েন্ট</TableHead>
          <TableHead>ধরন</TableHead>
          <TableHead>পরিমাণ</TableHead>
          <TableHead>অবস্থা</TableHead>
          <TableHead>তারিখ</TableHead>
          <TableHead>কর্ম</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {refunds.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="py-16 text-center text-[17px] text-[var(--ink-muted-48)]"><Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" />কোনো রিফান্ড নেই</TableCell></TableRow>
          ) : refunds.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.client_name}</TableCell>
              <TableCell><Badge className="rounded-[9999px]">{r.type === "diplomatic" ? "কূটনৈতিক" : r.type === "tourist" ? "পর্যটক" : "রপ্তানি"}</Badge></TableCell>
              <TableCell className="font-semibold">{formatCurrency(r.amount, language)}</TableCell>
              <TableCell><Badge className="rounded-[9999px]" variant={statusVariants[r.status]}>{r.status}</Badge></TableCell>
              <TableCell>{formatDate(r.created_at, language)}</TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setEditTarget(r); setEditStatus(r.status); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody></Table>
      </div>

      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <DialogHeader><DialogTitle>অবস্থা পরিবর্তন</DialogTitle></DialogHeader>
          <div className="px-6 pb-4"><Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
            options={["draft","submitted","approved","rejected","paid"].map((s) => ({ value: s, label: s }))} />
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
