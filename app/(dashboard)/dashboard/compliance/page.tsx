"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Calendar, CheckCircle2, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ComplianceTask, Client } from "@/types/database";

const typeLabels: Record<string, string> = {
  vat_return: "compliance.vat_return_task",
  vat_payment: "compliance.vat_payment_task",
  tax_return: "compliance.tax_return_task",
  tds: "compliance.tds_task",
  renewal: "compliance.renewal_task",
};

const statusVariants: Record<string, "success" | "warning" | "secondary"> = {
  completed: "success",
  pending: "warning",
  overdue: "secondary",
};

const emptyForm = { client_id: "", title: "", description: "", due_date: "", type: "vat_return" };

export default function CompliancePage() {
  const { language } = useLanguageStore();
  const [tasks, setTasks] = useState<(ComplianceTask & { client_name?: string })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ComplianceTask | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
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
    const { data } = await supabase.from("compliance_tasks").select("*").order("due_date", { ascending: true });
    if (data) setTasks(data.map((t) => ({ ...t, client_name: t.client_id ? clientMap.get(t.client_id) || "-" : "-" })));
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = { client_id: form.client_id || null, title: form.title, description: form.description || null, due_date: form.due_date, type: form.type, status: "pending" as const };

    if (editingTask) {
      await supabase.from("compliance_tasks").update(payload).eq("id", editingTask.id);
    } else {
      await supabase.from("compliance_tasks").insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    setEditingTask(null);
    setForm(emptyForm);
    loadData();
  }

  async function handleDelete(id: string) {
    await createClient().from("compliance_tasks").delete().eq("id", id);
    setTasks(tasks.filter((t) => t.id !== id));
    setDeleteId(null);
  }

  async function markComplete(id: string) {
    await createClient().from("compliance_tasks").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id);
    loadData();
  }

  function openEdit(task: ComplianceTask) {
    setEditingTask(task);
    setForm({ client_id: task.client_id || "", title: task.title, description: task.description || "", due_date: task.due_date, type: task.type });
    setShowForm(true);
  }

  function openAdd() {
    setEditingTask(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  const filteredTasks = tasks.filter((t) => filter === "all" || t.status === filter);
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const overdueCount = tasks.filter((t) => t.status === "overdue").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">{t("compliance.title", language)}</h1>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" />{t("compliance.add_task", language)}</Button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />{t("compliance.pending", language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />{t("compliance.overdue", language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />{t("compliance.completed", language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px]">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: "all", label: "সব" },
                { value: "pending", label: t("compliance.pending", language) },
                { value: "completed", label: t("compliance.completed", language) },
                { value: "overdue", label: t("compliance.overdue", language) },
              ]} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="py-16 text-center text-[17px] text-[var(--ink-muted-48)]">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />{t("compliance.no_tasks", language)}
              </div>
            ) : filteredTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border border-[var(--hairline)] rounded-[12px] bg-[var(--canvas)]">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge variant={statusVariants[task.status]} className="rounded-[9999px]">{t(`compliance.${task.status}`, language)}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-[var(--ink-muted-80)]">
                    <span>{t(typeLabels[task.type] || "compliance.vat_return_task", language)}</span>
                    {task.client_name && <span>• {task.client_name}</span>}
                    <span>• {t("compliance.due_date", language)}: {formatDate(task.due_date, language)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {task.status !== "completed" && (
                    <Button variant="ghost" size="sm" onClick={() => markComplete(task.id)} className="gap-1"><CheckCircle2 className="h-4 w-4" /></Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEdit(task)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(task.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) { setEditingTask(null); setForm(emptyForm); } }} className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)]">
        <DialogHeader><DialogTitle>{editingTask ? t("compliance.edit_task", language) : t("compliance.add_task", language)}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("compliance.task", language)}</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("compliance.type", language)}</Label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                options={Object.entries(typeLabels).map(([v, k]) => ({ value: v, label: t(k, language) }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("compliance.due_date", language)}</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("compliance.client", language)}</Label>
            <Select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} placeholder={t("common.search", language)} options={clients.map((c) => ({ value: c.id, label: c.name }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingTask(null); setForm(emptyForm); }}>{t("common.cancel", language)}</Button>
            <Button type="submit" disabled={saving}>{saving ? t("common.saving", language) : t("common.save", language)}</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)]">
        <DialogHeader><DialogTitle>{t("common.delete", language)}</DialogTitle><DialogDescription>{t("clients.delete_confirm", language)}</DialogDescription></DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>{t("common.cancel", language)}</Button>
          <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>{t("common.delete", language)}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
