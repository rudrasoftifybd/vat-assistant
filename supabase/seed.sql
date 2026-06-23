-- Seed: Create demo admin user
-- Run this AFTER the migration SQL
-- Uses Supabase's auth functions to create a user with known credentials

-- Create demo organization
INSERT INTO organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Organization')
ON CONFLICT (id) DO NOTHING;

-- Note: Supabase auth users must be created via the Auth API or Dashboard.
-- Go to Authentication > Users > Invite user or Add user:
--   Email: admin@taxflow.com
--   Password: Admin@123
-- Then manually run:
--   INSERT INTO profiles (id, org_id, full_name, role, language)
--   VALUES ('<USER_ID>', '00000000-0000-0000-0000-000000000001', 'Admin', 'admin', 'bn');

-- Or use the Supabase Admin API to create user:
-- select extensions.uuid_generate_v4() into user_id;
-- Then insert profile with that user_id.
