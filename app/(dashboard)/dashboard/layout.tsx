"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/use-auth";
import { Sidebar } from "@/components/shared/sidebar";
import { AppleNav } from "@/components/shared/apple-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { setUser, setProfile, setOrganization, setLoading, isLoading } =
    useAuthStore();

  useEffect(() => {
    const { user, profile, organization } = useAuthStore.getState();

    if (user && profile) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !cancelled) router.push("/login");
    });

    supabase.auth.getUser()
      .then(async ({ data: { user } }) => {
        if (cancelled) return;
        if (!user) {
          setLoading(false);
          router.push("/login");
          return;
        }
        setUser(user);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (cancelled) return;

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          setLoading(false);
          return;
        }

        if (profile) {
          setProfile(profile);
          if (profile.org_id) {
            const { data: org } = await supabase
              .from("organizations")
              .select("*")
              .eq("id", profile.org_id)
              .single();
            if (!cancelled && org) setOrganization(org);
          }
        }

        if (!cancelled) setLoading(false);
      })
      .catch((err) => {
        console.error("Auth check error:", err);
        if (!cancelled) {
          setLoading(false);
          router.push("/login");
        }
      });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--canvas-parchment)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--action-blue)] border-t-transparent animate-spin" />
          <span className="text-[14px] text-[var(--ink-muted-48)]">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--canvas-parchment)]">
      <AppleNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
