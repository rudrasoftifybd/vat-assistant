export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  org_id: string | null;
  full_name: string | null;
  role: string;
  language: string;
  created_at: string;
}

export interface Client {
  id: string;
  org_id: string;
  name: string;
  bin: string | null;
  tin: string | null;
  phone: string | null;
  email: string | null;
  business_type: string | null;
  address: string | null;
  annual_turnover: number | null;
  registration_date: string | null;
  vat_registered: boolean;
  created_at: string;
}

export interface VatReturn {
  id: string;
  client_id: string;
  period_month: number;
  period_year: number;
  status: "draft" | "submitted" | "paid";
  total_sales: number;
  total_purchases: number;
  output_tax: number;
  input_tax: number;
  net_vat: number;
  adjustments: number;
  amount_due: number;
  due_date: string | null;
  submitted_at: string | null;
  paid_at: string | null;
  return_data: Record<string, unknown> | null;
  created_at: string;
}

export interface InvoiceLineItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  org_id: string;
  client_id: string | null;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_bin: string | null;
  billing_address: string | null;
  items: InvoiceLineItem[];
  subtotal: number;
  vat_amount: number;
  vat_rate: number;
  total_amount: number;
  status: "issued" | "cancelled" | "adjusted";
  adjusted_by: string | null;
  created_at: string;
}

export interface ComplianceTask {
  id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  type: string;
  status: "pending" | "completed" | "overdue";
  completed_at: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  client_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  tags: string[] | null;
  uploaded_at: string;
}

export interface Adjustment {
  id: string;
  client_id: string;
  invoice_id: string | null;
  type: "credit" | "debit";
  amount: number;
  reason: string | null;
  adjustment_date: string;
  created_at: string;
}

export interface RegisterEntry {
  id: string;
  org_id: string;
  client_id: string | null;
  type: "purchase" | "sales";
  entry_date: string;
  party_name: string;
  party_bin: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  vat_amount: number;
  invoice_ref: string | null;
  created_at: string;
}

export interface RefundRequest {
  id: string;
  org_id?: string;
  client_id: string;
  type: "diplomatic" | "tourist" | "export";
  amount: number;
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
  supporting_docs?: string[];
  nbr_ref_no?: string | null;
  created_at: string;
}

export interface VatAgent {
  id: string;
  org_id: string;
  name: string;
  agent_number?: string | null;
  license_valid_until?: string | null;
  status: "active" | "inactive" | "suspended";
  created_at: string;
}

export interface AgentAssignment {
  id: string;
  agent_id: string;
  client_id: string;
  assigned_at: string;
}

export interface AdrCase {
  id: string;
  org_id: string;
  client_id: string;
  case_number?: string | null;
  type: "appeal" | "mediation" | "arbitration";
  status: "filed" | "under_review" | "hearing" | "resolved" | "dismissed";
  description?: string | null;
  disputed_amount?: number | null;
  resolution_notes?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  org_id?: string | null;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  created_at: string;
}
