"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Plus, FileDown, Store, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RegisterEntry, Client } from "@/types/database";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function SalesPage() {
  const { language } = useLanguageStore();
  const [entries, setEntries] = useState<(RegisterEntry & { client_name?: string })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RegisterEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { client_id: "", party_name: "", party_bin: "", product_name: "", quantity: "1", unit_price: "0", vat_amount: "0", invoice_ref: "", entry_date: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
    if (!profile?.org_id) return;
    const { data: cls } = await supabase.from("clients").select("*").eq("org_id", profile.org_id);
    if (cls) setClients(cls);
    const clientMap = new Map(cls?.map((c) => [c.id, c.name]) || []);
    const { data } = await supabase.from("register_entries").select("*").eq("org_id", profile.org_id).eq("type", "sales").order("entry_date", { ascending: false });
    if (data) setEntries(data.map((e) => ({ ...e, client_name: e.client_id ? clientMap.get(e.client_id) || "-" : "-" })));
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
    if (!profile?.org_id) return;
    const qty = parseInt(form.quantity) || 0;
    const price = parseFloat(form.unit_price) || 0;
    const vat = parseFloat(form.vat_amount) || 0;
    const payload = { org_id: profile.org_id, client_id: form.client_id || null, type: "sales", entry_date: form.entry_date, party_name: form.party_name, party_bin: form.party_bin || null, product_name: form.product_name, quantity: qty, unit_price: price, total_price: qty * price, vat_amount: vat, invoice_ref: form.invoice_ref || null };

    if (editingEntry) {
      await supabase.from("register_entries").update(payload).eq("id", editingEntry.id);
    } else {
      await supabase.from("register_entries").insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    setEditingEntry(null);
    setForm(emptyForm);
    loadData();
  }

  async function handleDelete(id: string) {
    await createClient().from("register_entries").delete().eq("id", id);
    setEntries(entries.filter((e) => e.id !== id));
    setDeleteId(null);
  }

  function openEdit(entry: RegisterEntry) {
    setEditingEntry(entry);
    setForm({ client_id: entry.client_id || "", party_name: entry.party_name, party_bin: entry.party_bin || "", product_name: entry.product_name, quantity: entry.quantity.toString(), unit_price: entry.unit_price.toString(), vat_amount: entry.vat_amount.toString(), invoice_ref: entry.invoice_ref || "", entry_date: entry.entry_date });
    setShowForm(true);
  }

  function openAdd() {
    setEditingEntry(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();
      const data = entries.map((e) => ({
        "তারিখ": e.entry_date,
        "গ্রাহক": e.party_name,
        "বিআইএন": e.party_bin || "",
        "পণ্য": e.product_name,
        "পরিমাণ": e.quantity,
        "একক মূল্য": e.unit_price,
        "মোট": e.total_price,
        "মুসক": e.vat_amount,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "বিক্রয় রেজিস্টার");
      XLSX.writeFile(wb, "sales_register.xlsx");
      toast.success("এক্সেল ফাইল ডাউনলোড করা হয়েছে");
    } catch (err) {
      toast.error("এক্সেল export ব্যর্থ হয়েছে");
    }
  };

  const totalAmount = entries.reduce((s, e) => s + e.total_price, 0);
  const totalVat = entries.reduce((s, e) => s + e.vat_amount, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">{t("registers.sales", language)}</h1>
        <div className="flex gap-3">
          <Button variant="pearl-capsule" onClick={handleExport} className="gap-2"><FileDown className="h-4 w-4" />{t("registers.export_excel", language)}</Button>
          <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" />{t("registers.new_entry", language)}</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px]"><CardHeader className="pb-2"><CardTitle className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)]">{t("registers.total_price", language)}</CardTitle></CardHeader><CardContent><div className="text-[22px] font-[700] tracking-[-0.374px]">{formatCurrency(totalAmount, language)}</div></CardContent></Card>
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px]"><CardHeader className="pb-2"><CardTitle className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)]">{t("registers.vat_amount", language)}</CardTitle></CardHeader><CardContent><div className="text-[22px] font-[700] tracking-[-0.374px]">{formatCurrency(totalVat, language)}</div></CardContent></Card>
      </div>

      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px]"><CardContent className="p-0">
        <Table><TableHeader><TableRow>
          <TableHead>{t("registers.sales_date", language)}</TableHead>
          <TableHead>{t("invoices.customer", language)}</TableHead>
          <TableHead>{t("invoices.customer_bin", language)}</TableHead>
          <TableHead>{t("registers.product_name", language)}</TableHead>
          <TableHead>{t("registers.quantity", language)}</TableHead>
          <TableHead>{t("registers.unit_price", language)}</TableHead>
          <TableHead>{t("registers.total_price", language)}</TableHead>
          <TableHead>{t("registers.vat_amount", language)}</TableHead>
          <TableHead>{t("common.actions", language)}</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow><TableCell colSpan={9} className="py-16 text-center text-[17px] text-[var(--ink-muted-48)]"><Store className="mx-auto h-12 w-12 mb-4 opacity-50" />{t("common.no_data", language)}</TableCell></TableRow>
          ) : entries.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{formatDate(e.entry_date, language)}</TableCell>
              <TableCell className="font-medium">{e.party_name}</TableCell>
              <TableCell>{e.party_bin || "-"}</TableCell>
              <TableCell>{e.product_name}</TableCell>
              <TableCell>{e.quantity}</TableCell>
              <TableCell>{formatCurrency(e.unit_price, language)}</TableCell>
              <TableCell>{formatCurrency(e.total_price, language)}</TableCell>
              <TableCell>{formatCurrency(e.vat_amount, language)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(e.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody></Table>
      </CardContent></Card>

      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditingEntry(null); }}>
        <DialogHeader><DialogTitle className="text-[17px] font-[600]">{editingEntry ? t("common.edit", language) : t("registers.new_entry", language)}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <p className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)]">{t("registers.entry_details", language) || "Entry Details"}</p>
          <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] p-[24px]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[13px] text-[var(--ink-muted-80)] tracking-[-0.224px]">{t("registers.sales_date", language)}</Label><Input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} required /></div>
              <div className="space-y-2"><Label className="text-[13px] text-[var(--ink-muted-80)] tracking-[-0.224px]">{t("clients.name", language)}</Label><Select value={form.client_id} onChange={(e) => { const c = clients.find((cl) => cl.id === e.target.value); setForm({ ...form, client_id: e.target.value, party_name: c?.name || form.party_name, party_bin: c?.bin || form.party_bin }); }} placeholder={t("common.search", language)} options={clients.map((c) => ({ value: c.id, label: c.name }))} /></div>
              <div className="space-y-2"><Label className="text-[13px] text-[var(--ink-muted-80)] tracking-[-0.224px]">{t("invoices.customer", language)}</Label><Input value={form.party_name} onChange={(e) => setForm({ ...form, party_name: e.target.value })} required /></div>
              <div className="space-y-2"><Label className="text-[13px] text-[var(--ink-muted-80)] tracking-[-0.224px]">{t("invoices.customer_bin", language)}</Label><Input value={form.party_bin} onChange={(e) => setForm({ ...form, party_bin: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-[13px] text-[var(--ink-muted-80)] tracking-[-0.224px]">{t("registers.product_name", language)}</Label><Input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} required /></div>
              <div className="space-y-2"><Label className="text-[13px] text-[var(--ink-muted-80)] tracking-[-0.224px]">{t("registers.quantity", language)}</Label><Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></div>
              <div className="space-y-2"><Label className="text-[13px] text-[var(--ink-muted-80)] tracking-[-0.224px]">{t("registers.unit_price", language)}</Label><Input type="number" min="0" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} required /></div>
              <div className="space-y-2"><Label className="text-[13px] text-[var(--ink-muted-80)] tracking-[-0.224px]">{t("registers.vat_amount", language)}</Label><Input type="number" min="0" step="0.01" value={form.vat_amount} onChange={(e) => setForm({ ...form, vat_amount: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingEntry(null); }}>{t("common.cancel", language)}</Button>
            <Button type="submit" disabled={saving}>{saving ? t("common.saving", language) : t("common.save", language)}</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogHeader><DialogTitle className="text-[17px] font-[600]">{t("common.delete", language)}</DialogTitle><DialogDescription className="text-[13px] text-[var(--ink-muted-80)]">{t("clients.delete_confirm", language)}</DialogDescription></DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>{t("common.cancel", language)}</Button>
          <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>{t("common.delete", language)}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
