"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { useAuthStore } from "@/store/use-auth";
import { t, type Language } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Globe, User, Building2 } from "lucide-react";

export default function SettingsPage() {
  const { language, setLanguage } = useLanguageStore();
  const { profile, organization, setProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || "");
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    await supabase
      .from("profiles")
      .update({ full_name: fullName, language })
      .eq("id", profile?.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    if (profile) {
      setProfile({ ...profile, full_name: fullName, language });
    }
  };

  return (
    <div className="space-y-7 max-w-[1440px] mx-auto">
      <h1 className="text-[34px] font-[600] tracking-[-0.374px]">{t("settings.title", language)}</h1>

      <div className="max-w-2xl space-y-7">
        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardHeader className="pt-[20px] px-[24px] pb-0">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[var(--primary)]" />
              <CardTitle className="text-[17px] font-[600] tracking-[-0.374px]">{t("settings.language", language)}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-[24px]">
            <div className="flex gap-3">
              <Button
                variant={language === "bn" ? "default" : "outline"}
                onClick={() => setLanguage("bn")}
                className="flex-1"
              >
                {t("settings.bengali", language)}
              </Button>
              <Button
                variant={language === "en" ? "default" : "outline"}
                onClick={() => setLanguage("en")}
                className="flex-1"
              >
                {t("settings.english", language)}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] shadow-none">
          <CardHeader className="pt-[20px] px-[24px] pb-0">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[var(--primary)]" />
              <CardTitle className="text-[17px] font-[600] tracking-[-0.374px]">{t("settings.profile", language)}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-[24px]">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[14px] font-[500] text-[var(--ink-muted-80)]">{t("settings.full_name", language)}</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[14px] font-[500] text-[var(--ink-muted-80)]">{t("auth.email", language)}</Label>
                <Input value={profile?.id || ""} disabled />
              </div>
              {organization && (
                <div className="space-y-2">
                  <Label className="text-[14px] font-[500] text-[var(--ink-muted-80)]">{t("settings.org_name", language)}</Label>
                  <div className="flex items-center gap-2 p-3 rounded-[12px] border border-[var(--hairline)] bg-[var(--canvas)]">
                    <Building2 className="h-4 w-4 text-[var(--ink-muted-48)]" />
                    <span className="text-[15px] tracking-[-0.224px]">{organization.name}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" disabled={saving}>
                  {saving ? t("common.saving", language) : t("common.save", language)}
                </Button>
                {saved && (
                  <span className="text-[15px] text-green-600 tracking-[-0.224px]">
                    {t("settings.saved", language)}
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
