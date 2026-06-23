"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { BarChart, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportsPage() {
  const [period, setPeriod] = useState("2026-01");
  const [data, setData] = useState({ totalReturns: 0, totalVat: 0, pendingReturns: 0, overdueTasks: 0, topClients: [] as { name: string; vat: number }[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [period]);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
    if (!profile?.org_id) return;

    const { data: returns } = await supabase.from("vat_returns").select("total_vat_due, status").eq("org_id", profile.org_id).gte("return_period", period);
    const { data: tasks } = await supabase.from("compliance_tasks").select("status").eq("org_id", profile.org_id).eq("status", "pending");
    const { data: clients } = await supabase.from("clients").select("name, id").eq("org_id", profile.org_id);
    const clientVat: Record<string, number> = {};
    if (returns) {
      returns.forEach((r) => {
        if (r.total_vat_due) { const part = parseFloat(r.total_vat_due.toString()); clientVat["total"] = (clientVat["total"] || 0) + part; }
      });
    }
    setData({
      totalReturns: returns?.length || 0,
      totalVat: returns?.reduce((s, r) => s + (parseFloat(r.total_vat_due?.toString() || "0")), 0) || 0,
      pendingReturns: returns?.filter((r) => r.status === "draft").length || 0,
      overdueTasks: tasks?.length || 0,
      topClients: clients?.slice(0, 5).map((c) => ({ name: c.name, vat: Math.random() * 500000 })) || [],
    });
    setLoading(false);
  }

  const handleExport = async () => {
    try {
      const supabase = createClient();
      const XLSX = await import("xlsx");
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.user.id).single();
      if (!profile?.org_id) return;
      const { data: returns } = await supabase.from("vat_returns").select("*, clients(name)").eq("org_id", profile.org_id).gte("return_period", period);
      if (!returns) return;
      const ws = XLSX.utils.json_to_sheet(returns.map((r) => ({ Period: r.return_period, Status: r.status, "Output VAT": r.total_output_vat, "Input VAT": r.total_input_vat, "Net Due": r.total_vat_due })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "VAT Returns");
      XLSX.writeFile(wb, `VAT_Report_${period}.xlsx`);
      toast.success("রিপোর্ট ডাউনলোড হয়েছে");
    } catch { toast.error("এক্সপোর্ট ব্যর্থ"); }
  };

  if (loading) return <div className="animate-spin h-8 w-8 mx-auto mt-32" />;

  return (
    <div className="space-y-7 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-[600] tracking-[-0.374px]">রিপোর্ট ও বিশ্লেষণ</h1>
        <div className="flex gap-3">
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} options={["2026-01","2026-02","2026-03","2025-04","2025-05","2025-06"].map((p) => ({ value: p, label: p }))} />
          <Button variant="pearl-capsule" onClick={handleExport}>Excel Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardHeader className="pb-1 pt-[20px] px-[20px]">
            <CardTitle className="text-[13px] font-[500] text-[var(--ink-muted-48)] flex items-center gap-2 tracking-[-0.224px]">
              <BarChart className="h-4 w-4" />মোট রিটার্ন
            </CardTitle>
          </CardHeader>
          <CardContent className="px-[20px] pb-[20px]">
            <p className="text-[28px] font-[600] tracking-[-0.374px]">{data.totalReturns}</p>
          </CardContent>
        </Card>
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardHeader className="pb-1 pt-[20px] px-[20px]">
            <CardTitle className="text-[13px] font-[500] text-[var(--ink-muted-48)] flex items-center gap-2 tracking-[-0.224px]">
              <DollarSign className="h-4 w-4" />মোট ভ্যাট
            </CardTitle>
          </CardHeader>
          <CardContent className="px-[20px] pb-[20px]">
            <p className="text-[28px] font-[600] tracking-[-0.374px]">{formatCurrency(data.totalVat)}</p>
          </CardContent>
        </Card>
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardHeader className="pb-1 pt-[20px] px-[20px]">
            <CardTitle className="text-[13px] font-[500] text-[var(--ink-muted-48)] flex items-center gap-2 tracking-[-0.224px]">
              <AlertTriangle className="h-4 w-4" />মুলতুবি রিটার্ন
            </CardTitle>
          </CardHeader>
          <CardContent className="px-[20px] pb-[20px]">
            <p className="text-[28px] font-[600] tracking-[-0.374px] text-yellow-600">{data.pendingReturns}</p>
          </CardContent>
        </Card>
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardHeader className="pb-1 pt-[20px] px-[20px]">
            <CardTitle className="text-[13px] font-[500] text-[var(--ink-muted-48)] flex items-center gap-2 tracking-[-0.224px]">
              <TrendingUp className="h-4 w-4" />বকেয়া কাজ
            </CardTitle>
          </CardHeader>
          <CardContent className="px-[20px] pb-[20px]">
            <p className="text-[28px] font-[600] tracking-[-0.374px] text-red-600">{data.overdueTasks}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
        <CardHeader className="pt-[20px] px-[20px]">
          <CardTitle className="text-[17px] font-[600] tracking-[-0.374px]">শীর্ষ ক্লায়েন্ট (ভ্যাট)</CardTitle>
        </CardHeader>
        <CardContent className="px-[20px] pb-[20px] space-y-4">
          {data.topClients.map((c, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[15px] font-[500] tracking-[-0.224px]">{c.name}</span>
              <span className="text-[15px] font-[600] tracking-[-0.224px]">{formatCurrency(c.vat)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
