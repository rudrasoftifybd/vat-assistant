import { toast } from "sonner";

export async function withToast<T>(
  promise: Promise<T>,
  messages: {
    loading?: string;
    success?: string;
    error?: string;
  }
): Promise<T | null> {
  const id = toast.loading(messages.loading || "সংরক্ষণ করা হচ্ছে...");

  try {
    const result = await promise;
    toast.success(messages.success || "সফলভাবে সংরক্ষিত হয়েছে", { id });
    return result;
  } catch (err) {
    const msg = (err as Error)?.message || "একটি ত্রুটি হয়েছে";
    toast.error(messages.error || msg, { id });
    return null;
  }
}

export async function submitVatReturn(returnId: string, clientId: string) {
  return withToast(
    fetch("/api/submit-vat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ return_id: returnId, client_id: clientId }),
    }).then((r) => r.json()),
    {
      loading: "রিটার্ন জমা দেওয়া হচ্ছে...",
      success: "রিটার্ন সফলভাবে জমা দেওয়া হয়েছে",
      error: "রিটার্ন জমা দিতে ব্যর্থ হয়েছে",
    }
  );
}
