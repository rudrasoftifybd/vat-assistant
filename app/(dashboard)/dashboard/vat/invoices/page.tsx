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
import { Plus, Receipt, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice } from "@/types/database";

const statusLabels: Record<string, string> = {
  issued: "invoices.issued",
  cancelled: "invoices.cancelled",
  adjusted: "invoices.adjusted",
};

const statusVariants: Record<string, "success" | "destructive" | "warning"> = {
  issued: "success",
  cancelled: "destructive",
  adjusted: "warning",
};

export default function InvoicesPage() {
  const { language } = useLanguageStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => { loadInvoices(); }, []);

  async function loadInvoices() {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
    if (!profile?.org_id) return;
    const { data } = await supabase.from("invoices").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false });
    if (data) setInvoices(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await createClient().from("invoices").delete().eq("id", id);
    setInvoices(invoices.filter((i) => i.id !== id));
    setDeleteId(null);
  }

  async function handleEditStatus() {
    if (!editTarget) return;
    await createClient().from("invoices").update({ status: editStatus }).eq("id", editTarget.id);
    setInvoices(invoices.map((i) => (i.id === editTarget.id ? { ...i, status: editStatus as Invoice["status"] } : i)));
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
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">{t("invoices.tax_invoice", language)}</h1>
        <Link href="/dashboard/vat/invoices/new"><Button className="gap-2"><Plus className="h-4 w-4" />{t("invoices.new_invoice", language)}</Button></Link>
      </div>
      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("invoices.invoice_number", language)}</TableHead>
                <TableHead>{t("invoices.invoice_date", language)}</TableHead>
                <TableHead>{t("invoices.customer", language)}</TableHead>
                <TableHead>{t("invoices.subtotal", language)}</TableHead>
                <TableHead>{t("invoices.vat_amount", language)}</TableHead>
                <TableHead>{t("invoices.total", language)}</TableHead>
                <TableHead>{t("common.status", language)}</TableHead>
                <TableHead>{t("common.actions", language)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-16 text-center text-[17px] text-[var(--ink-muted-48)]"><Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" />{t("common.no_data", language)}</TableCell></TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-medium">{inv.invoice_number}</TableCell>
                    <TableCell>{formatDate(inv.invoice_date, language)}</TableCell>
                    <TableCell>{inv.customer_name}</TableCell>
                    <TableCell>{formatCurrency(inv.subtotal, language)}</TableCell>
                    <TableCell>{formatCurrency(inv.vat_amount, language)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(inv.total_amount, language)}</TableCell>
                    <TableCell><Badge variant={statusVariants[inv.status]} className="rounded-[9999px]">{t(statusLabels[inv.status], language)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditTarget(inv); setEditStatus(inv.status); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(inv.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)} className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)]">
        <DialogHeader><DialogTitle className="text-[17px] font-[600] tracking-[-0.374px]">{t("common.edit", language)}</DialogTitle></DialogHeader>
        <div className="space-y-4 p-[24px] pt-0">
          <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
            options={[
              { value: "issued", label: t("invoices.issued", language) },
              { value: "cancelled", label: t("invoices.cancelled", language) },
              { value: "adjusted", label: t("invoices.adjusted", language) },
            ]}
          />
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setEditTarget(null)}>{t("common.cancel", language)}</Button>
            <Button onClick={handleEditStatus}>{t("common.save", language)}</Button>
          </DialogFooter>
        </div>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)]">
        <DialogHeader><DialogTitle className="text-[17px] font-[600] tracking-[-0.374px]">{t("common.delete", language)}</DialogTitle><DialogDescription className="text-[13px] text-[var(--ink-muted-48)]">{t("clients.delete_confirm", language)}</DialogDescription></DialogHeader>
        <DialogFooter className="p-[24px] pt-0 gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>{t("common.cancel", language)}</Button>
          <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>{t("common.delete", language)}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
