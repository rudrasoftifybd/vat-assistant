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
} from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileText, Download, Trash2, FolderOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Document, Client } from "@/types/database";

export default function DocumentsPage() {
  const { language } = useLanguageStore();
  const [documents, setDocuments] = useState<(Document & { client_name?: string })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    const { data } = await supabase.from("documents").select("*").order("uploaded_at", { ascending: false });
    if (data) setDocuments(data.map((d) => ({ ...d, client_name: clientMap.get(d.client_id) || "-" })));
    setLoading(false);
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedClient) return;
    setUploading(true);
    const supabase = createClient();
    const fileExt = selectedFile.name.split(".").pop();
    const filePath = `${selectedClient}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, selectedFile);
    if (uploadError) { console.error(uploadError); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);
    await supabase.from("documents").insert({ client_id: selectedClient, file_name: selectedFile.name, file_url: urlData.publicUrl, file_size: selectedFile.size, mime_type: selectedFile.type });
    setUploading(false); setShowUpload(false); setSelectedFile(null); setSelectedClient(""); loadData();
  };

  const handleDelete = async (id: string) => {
    await createClient().from("documents").delete().eq("id", id);
    setDocuments(documents.filter((d) => d.id !== id));
    setDeleteId(null);
  };

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">{t("documents.title", language)}</h1>
        <Button onClick={() => setShowUpload(true)} className="gap-2"><Upload className="h-4 w-4" />{t("documents.upload", language)}</Button>
      </div>

      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px]">
        <CardContent className="p-0">
          <Table><TableHeader><TableRow>
            <TableHead>{t("documents.file_name", language)}</TableHead>
            <TableHead>{t("clients.name", language)}</TableHead>
            <TableHead>{t("documents.file_size", language)}</TableHead>
            <TableHead>{t("documents.mime_type", language)}</TableHead>
            <TableHead>{t("common.date", language)}</TableHead>
            <TableHead>{t("common.actions", language)}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-16 text-center text-[17px] text-[var(--ink-muted-48)]"><FolderOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />{t("documents.no_documents", language)}</TableCell></TableRow>
            ) : documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium flex items-center gap-2"><FileText className="h-4 w-4" />{doc.file_name}</TableCell>
                <TableCell>{doc.client_name}</TableCell>
                <TableCell>{doc.file_size ? formatFileSize(doc.file_size) : "-"}</TableCell>
                <TableCell>{doc.mime_type || "-"}</TableCell>
                <TableCell>{formatDate(doc.uploaded_at, language)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button></a>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(doc.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody></Table>
        </CardContent>
      </Card>

      <Dialog open={showUpload} onOpenChange={setShowUpload} className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)]">
        <DialogHeader><DialogTitle>{t("documents.upload", language)}</DialogTitle></DialogHeader>
        <form onSubmit={handleUpload} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("clients.name", language)}</Label>
            <Select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} placeholder={t("common.search", language)} options={clients.map((c) => ({ value: c.id, label: c.name }))} required />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">ফাইল</Label>
            <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>{t("common.cancel", language)}</Button>
            <Button type="submit" disabled={uploading}>{uploading ? t("common.loading", language) : t("common.save", language)}</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)]">
        <DialogHeader><DialogTitle>{t("common.delete", language)}</DialogTitle><DialogDescription>{t("documents.delete_confirm", language)}</DialogDescription></DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>{t("common.cancel", language)}</Button>
          <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>{t("common.delete", language)}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
