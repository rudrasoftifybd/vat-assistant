import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { submitVatReturn } from "@/lib/evat-integration";

export async function POST(request: Request) {
  try {
    const { return_id, client_id, declared_by } = await request.json();

    const rateLimitResponse = await checkRateLimit(`submit-vat-${client_id || "anonymous"}`);
    if (rateLimitResponse) return rateLimitResponse;

    if (!return_id || !client_id) {
      return NextResponse.json({ error: "return_id and client_id are required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: vatReturn } = await supabase
      .from("vat_returns")
      .select("*")
      .eq("id", return_id)
      .eq("client_id", client_id)
      .single();

    if (!vatReturn) {
      return NextResponse.json({ error: "VAT return not found" }, { status: 404 });
    }

    if (vatReturn.status === "submitted" || vatReturn.status === "paid") {
      return NextResponse.json({ error: "Return already submitted" }, { status: 409 });
    }

    const result = await submitVatReturn(return_id, client_id, declared_by);

    return NextResponse.json({
      success: true,
      mode: result.mode,
      submissionId: result.submissionId,
      message: result.mode === "simulation"
        ? "SIMULATION: Payload logged. No actual submission made."
        : "Return submitted to NBR e-VAT gateway.",
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Submission failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
