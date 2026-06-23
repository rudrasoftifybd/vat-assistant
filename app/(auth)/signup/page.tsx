"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema } from "@/lib/validations";

export default function SignupPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = signupSchema.safeParse({
      email,
      password,
      confirmPassword,
      fullName,
      orgName,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) return;

    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: orgName })
      .select()
      .single();

    if (orgError) {
      setError(orgError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      org_id: orgData.id,
      full_name: fullName,
      language: "bn",
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)] p-4">
      <div className="w-full max-w-[420px] bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] p-[24px]">
        <h1 className="text-[24px] font-[600] tracking-[-0.374px] text-center mb-[24px]">{t("auth.signup_title", language)}</h1>
        <form onSubmit={handleSubmit} className="space-y-[20px]">
          <div className="space-y-[6px]">
            <Label htmlFor="fullName" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("auth.full_name", language)}</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-[6px]">
            <Label htmlFor="orgName" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("auth.org_name", language)}</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-[6px]">
            <Label htmlFor="email" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("auth.email", language)}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-[6px]">
            <Label htmlFor="password" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("auth.password", language)}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-[6px]">
            <Label htmlFor="confirmPassword" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("auth.confirm_password", language)}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-[13px] text-[var(--destructive)]">{error}</p>
          )}
          <Button type="submit" className="w-full" variant="primary" disabled={loading}>
            {loading ? t("common.loading", language) : t("common.signup", language)}
          </Button>
        </form>
        <div className="mt-[20px] text-center text-[15px] tracking-[-0.224px]">
          <span className="text-[var(--ink-muted-48)]">
            {t("auth.have_account", language)}{" "}
          </span>
          <Button variant="link" asChild>
            <Link href="/login">{t("common.login", language)}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
