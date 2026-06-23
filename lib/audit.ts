import { createClient } from "@/lib/supabase/client";

export async function logAudit(
  action: string,
  resourceType: string,
  resourceId: string | null,
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null
) {
  try {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.user.id)
      .single();

    await supabase.from("audit_logs").insert({
      org_id: profile?.org_id || null,
      user_id: user.user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_data: oldData,
      new_data: newData,
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
