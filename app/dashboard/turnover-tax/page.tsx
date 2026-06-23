"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateTurnoverTax } from "@/lib/vat-calculations";
import type { VatReturn } from "@/types/database";

export default function TurnoverTaxPage() {
  const { language } = useLanguageStore();
  const [returns, setReturns] = useState<(VatReturn & { client_name?: string; is_turnover_tax_eligible?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadReturns(); }, []);

  async function loadReturns() {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
    if (!profile?.org_id) return;

    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, annual_turnover, is_turnover_tax_eligible")
      .eq("org_id", profile.org_id);

    const eligibleClientIds = (clients || [])
      .filter((c) => {
        const turnover = c.annual_turnover || 0;
        return turnover < 5_000_000 || c.is_turnover_tax_eligible;
      })
      .map((c) => c.id);

    const clientMap = new Map(clients?.map((c) => [c.id, c.name]) || []);
    const turnoverMap = new Map(clients?.map((c) => [c.id, c.is_turnover_tax_eligible]) || []);

    if (eligibleClientIds.length === 0) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("vat_returns")
      .select("*")
      .in("client_id", eligibleClientIds)
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false });

    if (data) {
      setReturns(
        data.map((r) => ({
          ...r,
          client_name: clientMap.get(r.client_id) || "-",
          is_turnover_tax_eligible: turnoverMap.get(r.client_id) || false,
        }))
      );
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await createClient().from("vat_returns").delete().eq("id", id);
    setReturns(returns.filter((r) => r.id !== id));
    setDeleteId(null);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[34px] font-[600] tracking-[-0.374px]">টার্নওভার ট্যাক্স (মুসক ৯.২)</h1>
          <p className="text-[15px] text-[var(--ink-muted-48)] mt-1.5">বার্ষিক টার্নওভার ৫০ লক্ষ টাকার নিচে — করের হার ৩%</p>
        </div>
        <Link href="/dashboard/turnover-tax/new">
          <Button className="gap-2"><Plus className="h-4 w-4" />নতুন টার্নওভার ট্যাক্স</Button>
        </Link>
      </div>

      <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none overflow-hidden">
        <Table><TableHeader><TableRow>
          <TableHead>ক্লায়েন্ট</TableHead>
          <TableHead>মেয়াদ</TableHead>
          <TableHead>মোট বিক্রয়</TableHead>
          <TableHead>প্রযোজ্য হার</TableHead>
          <TableHead>কর পরিমাণ</TableHead>
          <TableHead>অবস্থা</TableHead>
          <TableHead>তারিখ</TableHead>
          <TableHead>কর্ম</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {returns.length === 0 ? (
            <TableRow><TableCell colSpan={8} className="py-16 text-center text-[17px] text-[var(--ink-muted-48)]">
              <Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" />কোনো টার্নওভার ট্যাক্স রিটার্ন নেই
            </TableCell></TableRow>
          ) : returns.map((r) => {
            const tax = calculateTurnoverTax(r.total_sales);
            return (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.client_name}</TableCell>
                <TableCell>{r.period_month}/{r.period_year}</TableCell>
                <TableCell>{formatCurrency(r.total_sales, language)}</TableCell>
                <TableCell>3%</TableCell>
                <TableCell className="font-semibold">{formatCurrency(tax.turnoverTax, language)}</TableCell>
                <TableCell><Badge className="rounded-[9999px]" variant={r.status === "draft" ? "warning" : "success"}>{r.status}</Badge></TableCell>
                <TableCell>{formatDate(r.created_at, language)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody></Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <DialogHeader><DialogTitle>মুছে ফেলুন</DialogTitle><DialogDescription>আপনি কি এই টার্নওভার ট্যাক্স রিটার্ন মুছে ফেলতে চান?</DialogDescription></DialogHeader>
          <DialogFooter className="px-6 pb-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>বাতিল করুন</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>মুছে ফেলুন</Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
