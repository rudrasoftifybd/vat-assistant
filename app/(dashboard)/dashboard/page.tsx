"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { useAuthStore } from "@/store/use-auth";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Users, FileText, Calendar, AlertCircle, Plus, ArrowRight, TrendingUp, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface DashboardData {
  totalClients: number;
  pendingTasks: number;
  pendingReturns: number;
  upcomingDeadlines: number;
}

const chartData = [
  { month: "জুলাই", vat: 45000 },
  { month: "আগস্ট", vat: 52000 },
  { month: "সেপ্টেম্বর", vat: 48000 },
  { month: "অক্টোবর", vat: 61000 },
  { month: "নভেম্বর", vat: 55000 },
  { month: "ডিসেম্বর", vat: 67000 },
];

export default function DashboardPage() {
  const { language } = useLanguageStore();
  const { organization } = useAuthStore();
  const [data, setData] = useState<DashboardData>({
    totalClients: 0,
    pendingTasks: 0,
    pendingReturns: 0,
    upcomingDeadlines: 0,
  });

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.user.id)
        .single();

      if (!profile?.org_id) return;

      const { count: totalClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("org_id", profile.org_id);

      const { count: pendingTasks } = await supabase
        .from("compliance_tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: pendingReturns } = await supabase
        .from("vat_returns")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft");

      setData({
        totalClients: totalClients || 0,
        pendingTasks: pendingTasks || 0,
        pendingReturns: pendingReturns || 0,
        upcomingDeadlines: pendingTasks || 0,
      });
    }
    loadData();
  }, []);

  const kpiCards = [
    {
      title: t("dashboard.total_clients", language),
      value: data.totalClients,
      icon: Users,
      href: "/dashboard/clients",
      change: "+2",
    },
    {
      title: t("dashboard.pending_returns", language),
      value: data.pendingReturns,
      icon: FileText,
      href: "/dashboard/vat/returns",
      change: null,
    },
    {
      title: t("dashboard.upcoming_deadlines", language),
      value: data.upcomingDeadlines,
      icon: Calendar,
      href: "/dashboard/compliance",
      change: null,
    },
    {
      title: language === "bn" ? "মোট ভ্যাট" : "Total VAT",
      value: "৳ ৩,২৮,০০০",
      icon: DollarSign,
      href: "/dashboard/vat/returns",
      change: "+12%",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[34px] md:text-[40px] font-[600] tracking-[-0.374px] text-[var(--ink)] leading-[1.1]">
            {t("dashboard.title", language)}
          </h1>
          {organization && (
            <p className="text-[17px] text-[var(--ink-muted-48)] mt-1 tracking-[-0.374px]">
              {organization.name}
            </p>
          )}
        </div>
        <Link href="/dashboard/clients/new" className="hidden sm:block">
          <Button variant="primary" size="default" className="gap-2">
            <Plus className="h-4 w-4" />
            {language === "bn" ? "নতুন ক্লায়েন্ট" : "New Client"}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Link key={kpi.title} href={kpi.href}>
            <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] p-[24px] transition-all duration-200 hover:border-[var(--action-blue)]/30 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="w-[36px] h-[36px] rounded-[10px] bg-[var(--canvas-parchment)] flex items-center justify-center group-hover:bg-[var(--action-blue)]/10 transition-colors">
                  <kpi.icon className="h-[18px] w-[18px] text-[var(--ink-muted-48)] group-hover:text-[var(--action-blue)] transition-colors" />
                </div>
                {kpi.change && (
                  <span className="text-[12px] text-green-600 font-[500] bg-green-50 rounded-[9999px] px-2 py-0.5">
                    {kpi.change}
                  </span>
                )}
              </div>
              <div className="text-[28px] font-[600] tracking-[-0.374px] text-[var(--ink)] leading-none">
                {kpi.value}
              </div>
              <div className="text-[14px] text-[var(--ink-muted-48)] mt-1 tracking-[-0.224px]">
                {kpi.title}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] p-[24px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[17px] font-[600] tracking-[-0.374px] text-[var(--ink)]">
              {t("dashboard.monthly_vat_trend", language)}
            </h3>
            <TrendingUp className="h-[18px] w-[18px] text-[var(--ink-muted-48)]" />
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="vatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--action-blue)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="var(--action-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--ink-muted-48)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--ink-muted-48)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--canvas)",
                    border: "1px solid var(--hairline)",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                />
                <Area type="monotone" dataKey="vat" stroke="var(--action-blue)" strokeWidth={2} fill="url(#vatGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] p-[24px]">
          <h3 className="text-[17px] font-[600] tracking-[-0.374px] text-[var(--ink)] mb-4">
            {t("dashboard.quick_actions", language)}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/clients/new">
              <div className="flex flex-col items-center justify-center gap-2 h-[100px] rounded-[14px] border border-[var(--hairline)] bg-[var(--canvas-parchment)] hover:bg-[var(--action-blue)]/5 hover:border-[var(--action-blue)]/30 transition-all duration-200 cursor-pointer">
                <Plus className="h-5 w-5 text-[var(--action-blue)]" />
                <span className="text-[13px] text-[var(--ink-muted-48)] text-center leading-tight">
                  {t("dashboard.new_client", language)}
                </span>
              </div>
            </Link>
            <Link href="/dashboard/vat/invoices/new">
              <div className="flex flex-col items-center justify-center gap-2 h-[100px] rounded-[14px] border border-[var(--hairline)] bg-[var(--canvas-parchment)] hover:bg-[var(--action-blue)]/5 hover:border-[var(--action-blue)]/30 transition-all duration-200 cursor-pointer">
                <Plus className="h-5 w-5 text-[var(--action-blue)]" />
                <span className="text-[13px] text-[var(--ink-muted-48)] text-center leading-tight">
                  {t("dashboard.new_invoice", language)}
                </span>
              </div>
            </Link>
            <Link href="/dashboard/vat/returns/new">
              <div className="flex flex-col items-center justify-center gap-2 h-[100px] rounded-[14px] border border-[var(--hairline)] bg-[var(--canvas-parchment)] hover:bg-[var(--action-blue)]/5 hover:border-[var(--action-blue)]/30 transition-all duration-200 cursor-pointer">
                <Plus className="h-5 w-5 text-[var(--action-blue)]" />
                <span className="text-[13px] text-[var(--ink-muted-48)] text-center leading-tight">
                  {t("dashboard.new_return", language)}
                </span>
              </div>
            </Link>
            <Link href="/dashboard/clients">
              <div className="flex flex-col items-center justify-center gap-2 h-[100px] rounded-[14px] border border-[var(--hairline)] bg-[var(--canvas-parchment)] hover:bg-[var(--action-blue)]/5 hover:border-[var(--action-blue)]/30 transition-all duration-200 cursor-pointer">
                <ArrowRight className="h-5 w-5 text-[var(--action-blue)]" />
                <span className="text-[13px] text-[var(--ink-muted-48)] text-center leading-tight">
                  {language === "bn" ? "সব ক্লায়েন্ট" : "All Clients"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
