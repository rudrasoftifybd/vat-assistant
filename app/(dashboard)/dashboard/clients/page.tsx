"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, Building2 } from "lucide-react";
import type { Client } from "@/types/database";
import { formatDate } from "@/lib/utils";

export default function ClientsPage() {
  const { language } = useLanguageStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.user.id)
      .single();

    if (!profile?.org_id) return;

    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false });

    if (data) setClients(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("clients").delete().eq("id", id);
    setClients(clients.filter((c) => c.id !== id));
    setDeleteId(null);
  }

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.bin && c.bin.toLowerCase().includes(search.toLowerCase())) ||
      (c.tin && c.tin.toLowerCase().includes(search.toLowerCase()))
  );

  const businessTypeLabels: Record<string, string> = {
    manufacturer: t("clients.manufacturer", language),
    trader: t("clients.trader", language),
    service: t("clients.service", language),
  };

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
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">
          {t("clients.title", language)}
        </h1>
        <Link href="/dashboard/clients/new">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("clients.add_client", language)}
          </Button>
        </Link>
      </div>

      <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] p-[24px] space-y-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-muted-48)]" />
          <Input
            placeholder={t("common.search", language) + "..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 rounded-[9999px]"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--ink-muted-48)]">
            <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-[17px] tracking-[-0.224px]">{t("common.no_data", language)}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clients.name", language)}</TableHead>
                <TableHead>{t("clients.bin", language)}</TableHead>
                <TableHead>{t("clients.tin", language)}</TableHead>
                <TableHead>{t("clients.phone", language)}</TableHead>
                <TableHead>{t("clients.business_type", language)}</TableHead>
                <TableHead>{t("common.status", language)}</TableHead>
                <TableHead>{t("common.date", language)}</TableHead>
                <TableHead>{t("common.actions", language)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium tracking-[-0.224px]">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="hover:text-[var(--primary)] transition-colors"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell className="tracking-[-0.224px]">{client.bin || "-"}</TableCell>
                  <TableCell className="tracking-[-0.224px]">{client.tin || "-"}</TableCell>
                  <TableCell className="tracking-[-0.224px]">{client.phone || "-"}</TableCell>
                  <TableCell className="tracking-[-0.224px]">
                    {client.business_type
                      ? businessTypeLabels[client.business_type] || client.business_type
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={client.vat_registered ? "success" : "secondary"}
                      className="rounded-[9999px]"
                    >
                      {client.vat_registered ? t("clients.vat_registered", language) : "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="tracking-[-0.224px]">
                    {formatDate(client.created_at, language)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-3">
                      <Link href={`/dashboard/clients/${client.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(client.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)]">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-[600] tracking-[-0.374px]">
              {t("clients.delete_client", language)}
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[var(--ink-muted-48)] tracking-[-0.224px]">
              {t("clients.delete_confirm", language)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t("common.cancel", language)}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {t("common.delete", language)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
