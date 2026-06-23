"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Plus, FileText, Pencil, Trash2, Send } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { submitVatReturn } from "@/lib/mutations";
import type { VatReturn } from "@/types/database";

const statusLabels: Record<string, string> = {
  draft: "vat.draft",
  submitted: "vat.submitted",
  paid: "vat.paid",
};

const statusVariants: Record<string, "warning" | "success" | "secondary"> = {
  draft: "warning",
  submitted: "success",
  paid: "secondary",
};

const monthLabels: Record<number, string> = {
  1: "months.1", 2: "months.2", 3: "months.3", 4: "months.4",
  5: "months.5", 6: "months.6", 7: "months.7", 8: "months.8",
  9: "months.9", 10: "months.10", 11: "months.11", 12: "months.12",
};

export default function VatReturnsPage() {
  const { language } = useLanguageStore();
  const [returns, setReturns] = useState<(VatReturn & { client_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<VatReturn | null>(null);
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => { loadReturns(); }, []);

  async function loadReturns() {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
    if (!profile?.org_id) return;
    const { data: clients } = await supabase.from("clients").select("id, name").eq("org_id", profile.org_id);
    const clientMap = new Map(clients?.map((c) => [c.id, c.name]) || []);
    const { data } = await supabase.from("vat_returns").select("*")
      .in("client_id", clients?.map((c) => c.id) || [])
      .order("period_year", { ascending: false }).order("period_month", { ascending: false });
    if (data) setReturns(data.map((r) => ({ ...r, client_name: clientMap.get(r.client_id) || "-" })));
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await createClient().from("vat_returns").delete().eq("id", id);
    setReturns(returns.filter((r) => r.id !== id));
    setDeleteId(null);
  }

  async function handleEditStatus() {
    if (!editTarget) return;
    await createClient().from("vat_returns").update({ status: editStatus }).eq("id", editTarget.id);
    setReturns(returns.map((r) => (r.id === editTarget.id ? { ...r, status: editStatus as VatReturn["status"] } : r)));
    setEditTarget(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">{t("vat.returns", language)}</h1>
        <Link href="/dashboard/vat/returns/new"><Button variant="primary" className="gap-2"><Plus className="h-4 w-4" />{t("vat.new_return", language)}</Button></Link>
      </div>
      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] overflow-hidden shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clients.name", language)}</TableHead>
                <TableHead>{t("vat.period", language)}</TableHead>
                <TableHead>{t("vat.total_sales", language)}</TableHead>
                <TableHead>{t("vat.net_vat", language)}</TableHead>
                <TableHead>{t("vat.amount_due", language)}</TableHead>
                <TableHead>{t("common.status", language)}</TableHead>
                <TableHead>{t("common.date", language)}</TableHead>
                <TableHead>{t("common.actions", language)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-[17px] text-[var(--ink-muted-48)] py-16 text-center"><FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />{t("common.no_data", language)}</TableCell></TableRow>
              ) : (
                returns.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.client_name}</TableCell>
                    <TableCell>{t(monthLabels[r.period_month], language)} {r.period_year}</TableCell>
                    <TableCell>{formatCurrency(r.total_sales, language)}</TableCell>
                    <TableCell>{formatCurrency(r.net_vat, language)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(r.amount_due, language)}</TableCell>
                    <TableCell><Badge variant={statusVariants[r.status]}>{t(statusLabels[r.status], language)}</Badge></TableCell>
                    <TableCell>{formatDate(r.created_at, language)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.status === "draft" && (
                          <Button variant="ghost" size="icon" onClick={() => submitVatReturn(r.id, r.client_id)} title="জমা দিন"><Send className="h-4 w-4 text-blue-500" /></Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => { setEditTarget(r); setEditStatus(r.status); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogHeader><DialogTitle>{t("common.edit", language)}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
            options={[
              { value: "draft", label: t("vat.draft", language) },
              { value: "submitted", label: t("vat.submitted", language) },
              { value: "paid", label: t("vat.paid", language) },
            ]}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>{t("common.cancel", language)}</Button>
            <Button variant="primary" onClick={handleEditStatus}>{t("common.save", language)}</Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogHeader><DialogTitle>{t("common.delete", language)}</DialogTitle><DialogDescription>{t("clients.delete_confirm", language)}</DialogDescription></DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>{t("common.cancel", language)}</Button>
          <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>{t("common.delete", language)}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
