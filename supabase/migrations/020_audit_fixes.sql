-- Migration 020: Audit fixes
-- Addresses issues #2, #11, #12, #13, #14 from audit.md

-- #2: Add loyalty_discount_amount column to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS loyalty_discount_amount numeric(12,2) NOT NULL DEFAULT 0;

-- #11: Create owner_uploads table
CREATE TABLE IF NOT EXISTS owner_uploads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  pet_id uuid references pets(id) on delete cascade,
  url text not null,
  file_name text,
  uploaded_at timestamptz not null default now()
);

ALTER TABLE owner_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_uploads_owner_full ON owner_uploads FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')));

-- #12: Create inpatient_medications table
CREATE TABLE IF NOT EXISTS inpatient_medications (
  id uuid primary key default gen_random_uuid(),
  inpatient_record_id uuid references inpatient_records(id) on delete cascade,
  name text not null,
  unit_price numeric(12,2) not null default 0,
  quantity int not null default 1,
  created_at timestamptz not null default now()
);

ALTER TABLE inpatient_medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY inpatient_medications_staff_full ON inpatient_medications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')));

-- #12: Create inpatient_services table
CREATE TABLE IF NOT EXISTS inpatient_services (
  id uuid primary key default gen_random_uuid(),
  inpatient_record_id uuid references inpatient_records(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

ALTER TABLE inpatient_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY inpatient_services_staff_full ON inpatient_services FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')));

-- #13: Add missing indexes
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_pets_customer_id ON pets(customer_id);

-- #14: Drop old RLS policies that use auth.role() (from 001_core.sql)
-- These are superseded by the subquery-based policies in 018_rls_audit.sql
DO $$
BEGIN
  -- Drop old policies from 001 that use auth.role()
  DROP POLICY IF EXISTS profiles_owner_full ON profiles;
  DROP POLICY IF EXISTS profiles_staff_read ON profiles;
  DROP POLICY IF EXISTS profiles_self_read ON profiles;
  DROP POLICY IF EXISTS profiles_self_update ON profiles;
  
  -- Re-create with consistent subquery approach
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'profiles_owner_full' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY profiles_owner_full ON profiles FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner'))
      WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'profiles_staff_read' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY profiles_staff_read ON profiles FOR SELECT
      USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'profiles_self_read' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY profiles_self_read ON profiles FOR SELECT
      USING (id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'profiles_self_update' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY profiles_self_update ON profiles FOR UPDATE
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Fix RLS on pos tables (012_pos.sql) to use subquery instead of auth.role()
DO $$
BEGIN
  DROP POLICY IF EXISTS invoices_staff_full ON invoices;
  DROP POLICY IF EXISTS invoice_items_staff_full ON invoice_items;
  DROP POLICY IF EXISTS refunds_staff_full ON refunds;
  
  CREATE POLICY invoices_staff_full ON invoices FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')));

  CREATE POLICY invoice_items_staff_full ON invoice_items FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')));

  CREATE POLICY refunds_staff_full ON refunds FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'staff')));
END $$;