import { createClient } from "@/lib/supabase/client";

export interface VatCalculationResult {
  netVat: number;
  surcharge: number;
  lateFee: number;
  totalDue: number;
}

export interface Mushak91Payload {
  taxPayer: {
    bin: string;
    name: string;
    period: { month: number; year: number };
  };
  part3_output_tax: {
    taxable_sales: number;
    vat_rate: number;
    output_tax: number;
    credit_notes: number;
    debit_notes: number;
    adjusted_output_tax: number;
  };
  part4_input_tax: {
    taxable_purchases: number;
    input_tax: number;
    personal_usage_adjustment: number;
    adjusted_input_tax: number;
  };
  part5_net_vat: {
    gross_vat_payable: number;
    input_tax_credit: number;
    net_vat_payable: number;
    surcharge: number;
    late_fee: number;
    total_due: number;
  };
  part6_adjustments: Array<{
    type: string;
    reason: string;
    amount: number;
    date: string;
  }>;
  part7_declaration: {
    declared_by: string;
    designation: string;
    date: string;
  };
}

/**
 * Rule 26: Partial Exemption
 * If input tax > 90% of output tax, cap input tax credit at 90%.
 */
function applyPartialExemption(outputTax: number, inputTax: number): number {
  if (outputTax <= 0) return inputTax;
  const ratio = inputTax / outputTax;
  if (ratio > 0.9) {
    return outputTax * 0.9;
  }
  return inputTax;
}

/**
 * Rule 30: Personal Use Adjustment
 * Add 15% VAT on deemed private usage of business assets.
 * Default: assume 5% of gross purchases are for personal use.
 */
function calculatePersonalUseAdjustment(purchases: number): number {
  const personalUse = purchases * 0.05;
  return personalUse * 0.15;
}

/**
 * Calculate surcharge: 2% per month on unpaid VAT (Rule 35)
 */
function calculateSurcharge(netVat: number, monthsLate: number): number {
  if (monthsLate <= 0) return 0;
  return netVat * 0.02 * monthsLate;
}

/**
 * Calculate late fee: Fixed BDT 200 per month (Rule 36)
 */
function calculateLateFee(monthsLate: number): number {
  if (monthsLate <= 0) return 0;
  return 200 * monthsLate;
}

/**
 * Main calculation: Net VAT = (Output Tax + Additions) - (Input Tax + Adjustments)
 * Reference: Rules 27-29, 30, 35, 36
 */
export function calculateNetVat(params: {
  totalSales: number;
  totalPurchases: number;
  outputTax: number;
  inputTax: number;
  adjustments: number;
  monthsLate?: number;
}): VatCalculationResult {
  const { totalSales, totalPurchases, outputTax, inputTax, adjustments, monthsLate = 0 } = params;

  const personalUseAdj = calculatePersonalUseAdjustment(totalPurchases);
  const adjustedInput = applyPartialExemption(outputTax, inputTax);
  const adjustedInputAfterPersonal = adjustedInput - personalUseAdj;

  const netVat = outputTax - adjustedInputAfterPersonal + adjustments;
  const surcharge = calculateSurcharge(netVat, monthsLate);
  const lateFee = calculateLateFee(monthsLate);
  const totalDue = netVat + surcharge + lateFee;

  return { netVat, surcharge, lateFee, totalDue };
}

/**
 * Get adjustments for a period (credit/debit notes)
 */
export async function getAdjustmentsForPeriod(
  clientId: string,
  month: number,
  year: number
): Promise<{ creditNotes: number; debitNotes: number }> {
  const supabase = createClient();

  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: creditNotes } = await supabase
    .from("invoices")
    .select("total_amount")
    .eq("client_id", clientId)
    .eq("is_credit_note", true)
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate);

  const { data: debitNotes } = await supabase
    .from("invoices")
    .select("total_amount")
    .eq("client_id", clientId)
    .eq("is_credit_note", false)
    .eq("status", "adjusted")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate);

  const creditSum = (creditNotes || []).reduce((s, i) => s + (i.total_amount || 0), 0);
  const debitSum = (debitNotes || []).reduce((s, i) => s + (i.total_amount || 0), 0);

  return { creditNotes: creditSum, debitNotes: debitSum };
}

/**
 * Generate Mushak 9.1 JSON payload matching NBR spec (Section 6, Parts 3-7)
 */
export async function generateMushak91Payload(
  returnId: string,
  declaredBy?: string
): Promise<Mushak91Payload> {
  const supabase = createClient();

  const { data: vatReturn } = await supabase
    .from("vat_returns")
    .select("*")
    .eq("id", returnId)
    .single();

  if (!vatReturn) throw new Error("VAT return not found");

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", vatReturn.client_id)
    .single();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", vatReturn.client_id)
    .eq("status", "issued");

  const adjustments = await getAdjustmentsForPeriod(
    vatReturn.client_id,
    vatReturn.period_month,
    vatReturn.period_year
  );

  const personalUseAdj = calculatePersonalUseAdjustment(vatReturn.total_purchases);

  const payload: Mushak91Payload = {
    taxPayer: {
      bin: client?.bin || "",
      name: client?.name || "",
      period: { month: vatReturn.period_month, year: vatReturn.period_year },
    },
    part3_output_tax: {
      taxable_sales: vatReturn.total_sales,
      vat_rate: 15,
      output_tax: vatReturn.output_tax,
      credit_notes: adjustments.creditNotes,
      debit_notes: adjustments.debitNotes,
      adjusted_output_tax: vatReturn.output_tax + adjustments.debitNotes - adjustments.creditNotes,
    },
    part4_input_tax: {
      taxable_purchases: vatReturn.total_purchases,
      input_tax: vatReturn.input_tax,
      personal_usage_adjustment: personalUseAdj,
      adjusted_input_tax: vatReturn.input_tax - personalUseAdj,
    },
    part5_net_vat: {
      gross_vat_payable: vatReturn.output_tax,
      input_tax_credit: vatReturn.input_tax,
      net_vat_payable: vatReturn.net_vat,
      surcharge: vatReturn.surcharge || 0,
      late_fee: vatReturn.late_fee || 0,
      total_due: vatReturn.amount_due,
    },
    part6_adjustments: (invoices || [])
      .filter((inv) => inv.is_credit_note || inv.status === "adjusted")
      .map((inv) => ({
        type: inv.is_credit_note ? "Credit Note (6.7)" : "Debit Note (6.8)",
        reason: inv.is_credit_note ? "Credit adjustment" : "Debit adjustment",
        amount: inv.total_amount,
        date: inv.invoice_date,
      })),
    part7_declaration: {
      declared_by: declaredBy || client?.name || "",
      designation: "Taxpayer / Representative",
      date: new Date().toISOString().split("T")[0],
    },
  };

  return payload;
}

/**
 * Calculate turnover tax (Mushak 9.2) - 3% on gross turnover
 * Reference: Rule 41
 */
export function calculateTurnoverTax(grossTurnover: number): {
  turnoverTax: number;
  applicableRate: number;
  isEligible: boolean;
} {
  const applicableRate = 0.03;
  const isEligible = grossTurnover < 5_000_000;
  return {
    turnoverTax: isEligible ? grossTurnover * applicableRate : 0,
    applicableRate,
    isEligible,
  };
}
