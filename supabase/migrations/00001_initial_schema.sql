-- VAT & Compliance Assistant - Initial Schema
-- Run this in Supabase SQL Editor

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 2. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  language TEXT DEFAULT 'bn',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bin TEXT UNIQUE,
  tin TEXT,
  phone TEXT,
  email TEXT,
  business_type TEXT,
  address TEXT,
  annual_turnover NUMERIC,
  registration_date DATE,
  vat_registered BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 4. VAT Returns (Mushak 9.1)
CREATE TABLE IF NOT EXISTS vat_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  period_month INT NOT NULL,
  period_year INT NOT NULL,
  status TEXT DEFAULT 'draft',
  total_sales NUMERIC DEFAULT 0,
  total_purchases NUMERIC DEFAULT 0,
  output_tax NUMERIC DEFAULT 0,
  input_tax NUMERIC DEFAULT 0,
  net_vat NUMERIC DEFAULT 0,
  adjustments NUMERIC DEFAULT 0,
  amount_due NUMERIC DEFAULT 0,
  due_date DATE,
  submitted_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  return_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vat_returns ENABLE ROW LEVEL SECURITY;

-- 5. Invoices (Mushak 6.3)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_bin TEXT,
  billing_address TEXT,
  items JSONB,
  subtotal NUMERIC DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  vat_rate NUMERIC DEFAULT 15,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'issued',
  adjusted_by UUID REFERENCES invoices(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 6. Compliance Tasks
CREATE TABLE IF NOT EXISTS compliance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE compliance_tasks ENABLE ROW LEVEL SECURITY;

-- 7. Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  tags TEXT[],
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 8. Adjustments (Mushak 6.7 & 6.8)
CREATE TABLE IF NOT EXISTS adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  reason TEXT,
  adjustment_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE adjustments ENABLE ROW LEVEL SECURITY;

-- 9. Register Entries (Mushak 6.1 & 6.2)
CREATE TABLE IF NOT EXISTS register_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sales')),
  entry_date DATE NOT NULL,
  party_name TEXT NOT NULL,
  party_bin TEXT,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  invoice_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE register_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Organizations: users can see their own org
CREATE POLICY org_select ON organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY org_insert ON organizations
  FOR INSERT WITH CHECK (true);

-- Profiles: users can see/edit their own profile
CREATE POLICY profile_select ON profiles
  FOR SELECT USING (id = auth.uid() OR org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY profile_insert ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY profile_update ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Clients: org isolation
CREATE POLICY client_select ON clients
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY client_insert ON clients
  FOR INSERT WITH CHECK (org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY client_update ON clients
  FOR UPDATE USING (org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY client_delete ON clients
  FOR DELETE USING (org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

-- Vat Returns: via client org
CREATE POLICY vat_return_select ON vat_returns
  FOR SELECT USING (client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY vat_return_insert ON vat_returns
  FOR INSERT WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY vat_return_update ON vat_returns
  FOR UPDATE USING (client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Invoices: org isolation
CREATE POLICY invoice_select ON invoices
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY invoice_insert ON invoices
  FOR INSERT WITH CHECK (org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY invoice_update ON invoices
  FOR UPDATE USING (org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

-- Compliance Tasks: via client org
CREATE POLICY task_select ON compliance_tasks
  FOR SELECT USING (client_id IS NULL OR client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY task_insert ON compliance_tasks
  FOR INSERT WITH CHECK (client_id IS NULL OR client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY task_update ON compliance_tasks
  FOR UPDATE USING (client_id IS NULL OR client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Documents: via client org
CREATE POLICY doc_select ON documents
  FOR SELECT USING (client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY doc_insert ON documents
  FOR INSERT WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY doc_delete ON documents
  FOR DELETE USING (client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Adjustments: via client org
CREATE POLICY adj_select ON adjustments
  FOR SELECT USING (client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY adj_insert ON adjustments
  FOR INSERT WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Register Entries: org isolation
CREATE POLICY reg_select ON register_entries
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY reg_insert ON register_entries
  FOR INSERT WITH CHECK (org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY reg_delete ON register_entries
  FOR DELETE USING (org_id IN (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket policy (if using storage)
CREATE POLICY "documents_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "documents_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "documents_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents');
