"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
      if (!profile?.org_id) return;
      const { data } = await supabase.from("audit_logs").select("*, profiles(email)").eq("org_id", profile.org_id).order("created_at", { ascending: false }).limit(100);
      if (data) setLogs(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="animate-spin h-8 w-8 mx-auto mt-32" />;

  return (
    <div className="space-y-7 max-w-[1440px] mx-auto">
      <h1 className="text-[34px] font-[600] tracking-[-0.374px] flex items-center gap-3">
        <Shield className="h-7 w-7" />অডিট লগ
      </h1>
      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[13px] font-[500] text-[var(--ink-muted-48)] tracking-[-0.224px]">সময়</TableHead>
                <TableHead className="text-[13px] font-[500] text-[var(--ink-muted-48)] tracking-[-0.224px]">ব্যবহারকারী</TableHead>
                <TableHead className="text-[13px] font-[500] text-[var(--ink-muted-48)] tracking-[-0.224px]">কর্ম</TableHead>
                <TableHead className="text-[13px] font-[500] text-[var(--ink-muted-48)] tracking-[-0.224px]">রিসোর্স</TableHead>
                <TableHead className="text-[13px] font-[500] text-[var(--ink-muted-48)] tracking-[-0.224px]">আইডি</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <Shield className="mx-auto h-10 w-10 mb-4 text-[var(--ink-muted-48)] opacity-50" />
                    <p className="text-[17px] text-[var(--ink-muted-48)]">কোনো লগ নেই</p>
                  </TableCell>
                </TableRow>
              ) : logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-[13px] tracking-[-0.224px]">{formatDate(l.created_at)}</TableCell>
                  <TableCell className="font-mono text-[13px] tracking-[-0.224px]">{l.profiles?.email || l.user_id?.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-[9999px] text-[12px] px-3 py-0.5">{l.action}</Badge>
                  </TableCell>
                  <TableCell className="text-[15px] tracking-[-0.224px]">{l.resource_type}</TableCell>
                  <TableCell className="font-mono text-[13px] tracking-[-0.224px]">{l.resource_id?.slice(0, 8) || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
