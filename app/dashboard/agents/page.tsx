"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Trash2, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { VatAgent } from "@/types/database";

export default function AgentsPage() {
  const [agents, setAgents] = useState<VatAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
    if (!profile?.org_id) return;
    const { data } = await supabase.from("vat_agents").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false });
    if (data) setAgents(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await createClient().from("vat_agents").delete().eq("id", id);
    setAgents(agents.filter((a) => a.id !== id)); setDeleteId(null);
    toast.success("এজেন্ট মুছে ফেলা হয়েছে");
  }

  if (loading) return <div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mt-32" />;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">ভ্যাট এজেন্ট (মুসক ৩)</h1>
        <Link href="/dashboard/agents/new"><Button className="gap-2"><Plus className="h-4 w-4" />নতুন এজেন্ট</Button></Link>
      </div>
      <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none overflow-hidden">
        <Table><TableHeader><TableRow>
          <TableHead>নাম</TableHead>
          <TableHead>এজেন্ট নম্বর</TableHead>
          <TableHead>লাইসেন্স বৈধতা</TableHead>
          <TableHead>অবস্থা</TableHead>
          <TableHead>কর্ম</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {agents.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="py-16 text-center text-[17px] text-[var(--ink-muted-48)]"><Users className="mx-auto h-12 w-12 mb-4 opacity-50" />কোনো এজেন্ট নেই</TableCell></TableRow>
          ) : agents.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium"><Link href={`/dashboard/agents/${a.id}`} className="hover:text-[var(--primary)]">{a.name}</Link></TableCell>
              <TableCell className="font-mono">{a.agent_number || "-"}</TableCell>
              <TableCell>{a.license_valid_until ? formatDate(a.license_valid_until) : "-"}</TableCell>
              <TableCell><Badge className="rounded-[9999px]" variant={a.status === "active" ? "success" : "secondary"}>{a.status}</Badge></TableCell>
              <TableCell className="flex gap-1">
                <Link href={`/dashboard/agents/${a.id}`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody></Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <DialogHeader><DialogTitle>মুছে ফেলুন</DialogTitle><DialogDescription>আপনি কি নিশ্চিত?</DialogDescription></DialogHeader>
          <DialogFooter className="px-6 pb-4"><Button variant="outline" onClick={() => setDeleteId(null)}>বাতিল</Button><Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>মুছে ফেলুন</Button></DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
