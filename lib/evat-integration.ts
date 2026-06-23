import { createClient } from "@/lib/supabase/server";
import { generateMushak91Payload } from "@/lib/vat-calculations";

interface EvatConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
}

function getConfig(): EvatConfig {
  return {
    apiUrl: process.env.NBR_EVAT_API_URL || "",
    clientId: process.env.NBR_CLIENT_ID || "",
    clientSecret: process.env.NBR_CLIENT_SECRET || "",
    webhookSecret: process.env.NBR_WEBHOOK_SECRET || "",
  };
}

const SIMULATION_MODE = process.env.SIMULATION_MODE !== "false";

let _accessToken: string | null = null;
let _tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  const config = getConfig();
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;

  if (!config.clientId || !config.clientSecret) {
    throw new Error("NBR credentials not configured");
  }

  const res = await fetch(`${config.apiUrl}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) throw new Error(`NBR auth failed: ${res.status}`);

  const data = await res.json();
  _accessToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
  return _accessToken!;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 401 && i < retries - 1) {
        _accessToken = null;
        _tokenExpiry = 0;
        const authHeader = (options.headers as Record<string, string>)?.Authorization;
        if (authHeader?.startsWith("Bearer ")) {
          const newToken = await getAccessToken();
          (options.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
        }
        continue;
      }
      if (res.status >= 500 && i < retries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }
      return res;
    } catch (_) {
      if (i === retries - 1) throw _;
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function submitVatReturn(returnId: string, clientId: string, declaredBy?: string) {
  const supabase = await createClient();
  const payload = await generateMushak91Payload(returnId, declaredBy);

  if (!getConfig().apiUrl || SIMULATION_MODE) {
    console.log("[SIMULATION] Mushak 9.1 Submission Payload:", JSON.stringify(payload, null, 2));
    const simId = `SIM-${Date.now()}`;
    await supabase
      .from("vat_returns")
      .update({
        status: "submitted",
        submission_payload: payload as unknown as Record<string, unknown>,
        submitted_to_evat_at: new Date().toISOString(),
        evat_submission_id: simId,
        evat_response: { simulated: true, message: "No live NBR gateway configured" },
        evat_status: "accepted",
      })
      .eq("id", returnId);
    return { success: true, mode: "simulation", submissionId: simId, payload };
  }

  const token = await getAccessToken();

  const res = await fetchWithRetry(`${getConfig().apiUrl}/returns/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-NBR-Source": "vat-assistant",
      "X-NBR-Request-ID": returnId,
    },
    body: JSON.stringify(payload),
  });

  const responseData = await res.json();

  if (!res.ok) {
    await supabase.from("vat_returns").update({
      evat_response: responseData,
      evat_status: "rejected",
      submission_error: responseData.message || `HTTP ${res.status}`,
    }).eq("id", returnId);
    throw new Error(`NBR submission failed: ${responseData.message || res.status}`);
  }

  const submissionId = responseData.submission_id || responseData.tax_period_ref;
  await supabase.from("vat_returns").update({
    status: "submitted",
    submission_payload: payload as unknown as Record<string, unknown>,
    submitted_to_evat_at: new Date().toISOString(),
    evat_submission_id: submissionId,
    evat_response: responseData,
    evat_status: "pending",
  }).eq("id", returnId);

  return { success: true, mode: "live", submissionId, payload };
}

export async function checkSubmissionStatus(submissionId: string, returnId?: string) {
  if (!getConfig().apiUrl || SIMULATION_MODE) {
    return { status: "simulated", evat_status: "accepted", message: "Simulation mode" };
  }

  const token = await getAccessToken();
  const res = await fetchWithRetry(`${getConfig().apiUrl}/returns/status/${submissionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);

  const data = await res.json();
  const nbrStatus = (data.status || "").toLowerCase();

  const evatStatus = nbrStatus === "accepted" ? "accepted"
    : nbrStatus === "paid" ? "paid"
    : nbrStatus === "rejected" ? "rejected"
    : nbrStatus === "pending" ? "pending"
    : "unknown";

  if (returnId) {
    const supabase = await createClient();
    const update: Record<string, unknown> = {
      evat_status: evatStatus,
      evat_response: data,
      synced_at: new Date().toISOString(),
    };
    if (evatStatus === "accepted") update.status = "submitted";
    if (evatStatus === "paid") { update.status = "paid"; update.paid_at = new Date().toISOString(); }
    if (evatStatus === "rejected") update.status = "draft";
    await supabase.from("vat_returns").update(update).eq("evat_submission_id", submissionId);
  }

  return { ...data, evat_status: evatStatus };
}

export async function syncPendingSubmissions(): Promise<{ synced: number; errors: number }> {
  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("vat_returns")
    .select("id, evat_submission_id")
    .not("evat_submission_id", "is", null)
    .in("evat_status", ["pending", "submitted"])
    .limit(50);

  if (!pending || pending.length === 0) return { synced: 0, errors: 0 };

  let synced = 0;
  let errors = 0;

  for (const ret of pending) {
    try {
      await checkSubmissionStatus(ret.evat_submission_id!, ret.id);
      synced++;
    } catch {
      errors++;
    }
  }

  return { synced, errors };
}

export async function handleWebhook(req: Request) {
  const config = getConfig();
  const signature = req.headers.get("x-nbr-signature");
  const body = await req.text();

  if (config.webhookSecret) {
    const expectedSig = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(body + config.webhookSecret))
      .then((h) => Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, "0")).join(""));

    if (signature !== expectedSig) {
      return { valid: false, error: "Invalid signature" };
    }
  }

  const payload = JSON.parse(body);
  const supabase = await createClient();

  if (payload.submission_id) {
    const nbrStatus = (payload.status || "").toLowerCase();
    const evatStatus = nbrStatus === "accepted" ? "accepted"
      : nbrStatus === "paid" ? "paid"
      : nbrStatus === "rejected" ? "rejected"
      : "pending";

    const update: Record<string, unknown> = {
      evat_status: evatStatus,
      evat_response: payload,
      synced_at: new Date().toISOString(),
    };

    if (evatStatus === "paid") { update.status = "paid"; update.paid_at = new Date().toISOString(); }
    if (evatStatus === "rejected") update.status = "draft";

    const { data: existing } = await supabase
      .from("vat_returns")
      .select("id")
      .eq("evat_submission_id", payload.submission_id)
      .maybeSingle();

    if (existing) {
      await supabase.from("vat_returns").update(update).eq("id", existing.id);
    }
  }

  return { valid: true, payload };
}
