"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { useAuthStore } from "@/store/use-auth";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Bug } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { setUser, setProfile, setOrganization, setLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoadingState] = useState(false);

  const loadUserData = async (userId: string) => {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (profile) {
      setProfile(profile);
      if (profile.org_id) {
        const { data: org } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", profile.org_id)
          .single();
        if (org) setOrganization(org);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("ইমেইল ও পাসওয়ার্ড আবশ্যক");
      return;
    }

    setLoadingState(true);
    const supabase = createClient();

    const loginEmail = email === "admin" ? "admin@taxflow.com" : email;
    const loginPassword = password === "admin" && email === "admin" ? "Admin@123" : password;

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "ভুল ইমেইল বা পাসওয়ার্ড"
        : authError.message);
      setLoadingState(false);
      return;
    }

    if (data.user) {
      setUser(data.user);
      await loadUserData(data.user.id);
    }

    setLoadingState(false);
    router.push("/dashboard");
  };

  const handleDemoLogin = async () => {
    setLoadingState(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: "admin@taxflow.com",
      password: "Admin@123",
    });

    if (authError) {
      setError("ডেমো অ্যাকাউন্ট পাওয়া যায়নি। setup.sql রান করুন।");
      setLoadingState(false);
      return;
    }

    if (data.user) {
      setUser(data.user);
      await loadUserData(data.user.id);
    }

    setLoadingState(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)] p-4">
      <Card className="w-full max-w-sm bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
        <CardHeader className="text-center pb-0 pt-[28px]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-[24px] font-[600] tracking-[-0.374px]">{t("auth.login_title", language)}</CardTitle>
          <CardDescription className="text-[15px] text-[var(--ink-muted-48)] tracking-[-0.224px]">
            {t("common.app_name", language)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-[24px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[14px] font-[500] text-[var(--ink-muted-80)]">{t("auth.email", language)}</Label>
              <Input
                id="email"
                type="text"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[14px] font-[500] text-[var(--ink-muted-80)]">{t("auth.password", language)}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-[var(--destructive)]">{error}</p>
            )}
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? t("common.loading", language) : t("common.login", language)}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--hairline)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--canvas)] px-2 text-[var(--ink-muted-48)]">
                ডেমো
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary-pill"
            className="w-full gap-2"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <Bug className="h-4 w-4" />
            ডেমো লগইন (admin / admin)
          </Button>

          <div className="text-center text-sm">
            <span className="text-[var(--ink-muted-48)]">
              {t("auth.no_account", language)}{" "}
            </span>
            <Link
              href="/signup"
              className="text-[var(--primary)] hover:underline font-medium"
            >
              {t("common.signup", language)}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
