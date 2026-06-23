import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { form_id, form_data, client_id, status } = await request.json();

    if (!form_id || !form_data) {
      return NextResponse.json({ error: "form_id and form_data are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("filled_forms")
      .insert({
        org_id: profile.org_id,
        client_id: client_id || null,
        form_id,
        form_data,
        status: status || "draft",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Save form error:", err);
    return NextResponse.json(
      { error: "Failed to save form", details: (err as Error).message },
      { status: 500 }
    );
  }
}
