"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Bell, Radio } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function RealTimePage() {
  const [notifications, setNotifications] = useState<{ event: string; payload: any; time: Date }[]>([]);
  const supabase = createClient();

  const handleRealtime = useCallback((payload: any) => {
    setNotifications((prev) => [{ event: payload.eventType, payload: payload.new, time: new Date() }, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("schema-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public" }, handleRealtime)
      .on("postgres_changes", { event: "UPDATE", schema: "public" }, handleRealtime)
      .on("postgres_changes", { event: "DELETE", schema: "public" }, handleRealtime)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [handleRealtime, supabase]);

  return (
    <div className="max-w-[1440px] mx-auto space-y-[24px]">
      <h1 className="text-[34px] font-[600] tracking-[-0.374px] flex items-center gap-[10px]"><Radio className="h-[22px] w-[22px]" />রিয়েল-টাইম নোটিফিকেশন</h1>
      <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] p-[24px]">
        <h2 className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)] mb-[16px]">লাইভ ইভেন্ট স্ট্রিম</h2>
        <div className="space-y-[8px] max-h-[600px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-[17px] text-[var(--ink-muted-48)]">
              <Bell className="mx-auto h-[44px] w-[44px] mb-[12px] opacity-50" />কোনো ইভেন্ট নেই। ডেটা পরিবর্তন হলে এখানে দেখা যাবে।
            </div>
          ) : notifications.map((n, i) => (
            <div key={i} className="flex items-center gap-[10px] text-[15px] tracking-[-0.224px] p-[12px] rounded-[12px] bg-[var(--ink-muted-08)]">
              <Badge className="rounded-[9999px] text-[11px]" variant={n.event === "INSERT" ? "success" : n.event === "UPDATE" ? "secondary" : "destructive"}>{n.event}</Badge>
              <span className="font-mono text-[13px] truncate max-w-[300px]">{JSON.stringify(n.payload).slice(0, 100)}</span>
              <span className="text-[13px] text-[var(--ink-muted-48)] ml-auto">{formatDate(n.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
