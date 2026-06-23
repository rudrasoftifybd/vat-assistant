import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/lib/evat-integration";

export async function POST(req: NextRequest) {
  try {
    const result = await handleWebhook(req);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Webhook processed", data: result.payload });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
