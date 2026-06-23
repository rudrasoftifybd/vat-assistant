import { NextResponse } from "next/server";
import { syncPendingSubmissions } from "@/lib/evat-integration";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await syncPendingSubmissions();

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync submissions error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
