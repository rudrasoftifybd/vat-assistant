import { createClient } from "@/lib/supabase/client";

interface AggregatedRegisterData {
  total_sales: number;
  vatable_sales: number;
  vat_free_sales: number;
  output_tax: number;
  total_purchases: number;
  vatable_purchases: number;
  input_tax: number;
}

export async function autoFillFromRegisters(
  clientId: string,
  orgId: string,
  periodMonth: number,
  periodYear: number
): Promise<AggregatedRegisterData> {
  const supabase = createClient();

  const startDate = `${periodYear}-${String(periodMonth).padStart(2, "0")}-01`;
  const endDate = new Date(periodYear, periodMonth, 0).toISOString().split("T")[0];

  const { data: entries } = await supabase
    .from("register_entries")
    .select("*")
    .eq("org_id", orgId)
    .eq("client_id", clientId)
    .gte("entry_date", startDate)
    .lte("entry_date", endDate);

  const salesEntries = (entries || []).filter((e) => e.type === "sales");
  const purchaseEntries = (entries || []).filter((e) => e.type === "purchase");

  const total_sales = salesEntries.reduce((sum, e) => sum + (e.total_price || 0), 0);
  const output_tax = salesEntries.reduce((sum, e) => sum + (e.vat_amount || 0), 0);
  const vatable_sales = total_sales - output_tax;

  const total_purchases = purchaseEntries.reduce((sum, e) => sum + (e.total_price || 0), 0);
  const input_tax = purchaseEntries.reduce((sum, e) => sum + (e.vat_amount || 0), 0);
  const vatable_purchases = total_purchases - input_tax;

  return {
    total_sales,
    vatable_sales,
    vat_free_sales: 0,
    output_tax,
    total_purchases,
    vatable_purchases,
    input_tax,
  };
}
