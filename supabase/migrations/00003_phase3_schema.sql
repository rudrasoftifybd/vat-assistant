-- Phase 3: Advanced Compliance, Integration, Enterprise Features

-- 1. Refund requests (Mushak 10.1, 10.2)
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('diplomatic', 'tourist', 'export')),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'paid')),
  supporting_docs JSONB,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- 2. VAT agents (Mushak 3)
CREATE TABLE IF NOT EXISTS vat_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  agent_number TEXT UNIQUE,
  license_valid_until DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vat_agents ENABLE ROW LEVEL SECURITY;

-- 3. Agent assignments (Mushak 3.4)
CREATE TABLE IF NOT EXISTS agent_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES vat_agents(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  authorized_actions TEXT[],
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

-- 4. ADR cases (Mushak 17)
CREATE TABLE IF NOT EXISTS adr_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  description TEXT,
  dispute_amount NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_mediation', 'resolved', 'rejected')),
  facilitator_id UUID REFERENCES vat_agents(id),
  agreement_terms JSONB,
  started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE adr_cases ENABLE ROW LEVEL SECURITY;

-- 5. Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Add e-VAT fields to vat_returns
ALTER TABLE vat_returns
  ADD COLUMN IF NOT EXISTS evat_submission_id TEXT,
  ADD COLUMN IF NOT EXISTS evat_response JSONB,
  ADD COLUMN IF NOT EXISTS submitted_to_evat_at TIMESTAMPTZ;

-- 7. RLS policies for new tables
CREATE POLICY refund_select ON refund_requests
  FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY refund_insert ON refund_requests
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM clients WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY refund_update ON refund_requests
  FOR UPDATE USING (client_id IN (SELECT id FROM clients WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY agent_select ON vat_agents
  FOR SELECT USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY agent_insert ON vat_agents
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY agent_update ON vat_agents
  FOR UPDATE USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY adr_select ON adr_cases
  FOR SELECT USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY adr_insert ON adr_cases
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY adr_update ON adr_cases
  FOR UPDATE USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY audit_select ON audit_logs
  FOR SELECT USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
