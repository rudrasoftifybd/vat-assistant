import { createClient } from "@/lib/supabase/client";

export function subscribeToTable(
  table: string,
  orgId: string,
  onInsert: (payload: any) => void,
  onUpdate: (payload: any) => void,
  onDelete: (payload: any) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`collab-${table}-${orgId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table, filter: `org_id=eq.${orgId}` },
      (payload) => onInsert(payload.new)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table, filter: `org_id=eq.${orgId}` },
      (payload) => onUpdate(payload.new)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table, filter: `org_id=eq.${orgId}` },
      (payload) => onDelete(payload.old)
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
