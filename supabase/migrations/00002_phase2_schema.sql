-- Phase 2: Advanced Compliance & Notifications

-- 1. Add new fields to vat_returns
ALTER TABLE vat_returns
  ADD COLUMN IF NOT EXISTS surcharge NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS late_fee NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS adjusted_input_tax NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS submission_payload JSONB;

-- 2. Add credit/debit note fields to invoices
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS is_credit_note BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_invoice_id UUID REFERENCES invoices(id);

-- 3. Add turnover tax flag to clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS is_turnover_tax_eligible BOOLEAN DEFAULT FALSE;

-- 4. Add notification tracking to compliance_tasks
ALTER TABLE compliance_tasks
  ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;
