-- Filled forms storage for Mushak Forms Library (Phase 4)
CREATE TABLE IF NOT EXISTS filled_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  form_id TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'archived')),
  pdf_url TEXT,
  filled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_filled_forms_org_client_form ON filled_forms(org_id, client_id, form_id);

ALTER TABLE filled_forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS org_isolation ON filled_forms;
CREATE POLICY org_isolation ON filled_forms
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_filled_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_filled_forms_updated_at ON filled_forms;
CREATE TRIGGER trg_filled_forms_updated_at
  BEFORE UPDATE ON filled_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_filled_forms_updated_at();
