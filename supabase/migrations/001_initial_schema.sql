-- ============================================================================
-- 001_initial_schema.sql
-- BrokerApp database schema: tables, indexes, RLS policies, triggers, storage
-- ============================================================================

-- =========================
-- 1. TABLES
-- =========================

-- 1a. organizations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1b. profiles (references auth.users and organizations)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1c. properties (references profiles and organizations)
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  address text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  price integer NOT NULL,
  square_meters integer NOT NULL,
  rooms smallint NOT NULL,
  bedrooms smallint NOT NULL,
  bathrooms smallint NOT NULL,
  build_year smallint NOT NULL,
  energy_label text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'published')),
  images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1d. adverts (references properties)
CREATE TABLE IF NOT EXISTS adverts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  platform text NOT NULL DEFAULT 'funda' CHECK (platform IN ('funda', 'pararius', 'jaap')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1e. activity_log (references profiles and properties)
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('generated', 'edited', 'published')),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  property_address text NOT NULL,
  platform text CHECK (platform IN ('funda', 'pararius', 'jaap')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- 2. INDEXES
-- =========================

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_organization_id ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_adverts_property_id ON adverts(property_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id_created_at ON activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_property_id ON activity_log(property_id);

-- =========================
-- 3. TRIGGER FUNCTIONS
-- =========================

-- 3a. Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables that have updated_at
DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_properties_updated_at ON properties;
CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3b. Auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =========================
-- 4. ROW LEVEL SECURITY
-- =========================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE adverts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- 4a. organizations policies
DROP POLICY IF EXISTS "Members can read their own organization" ON organizations;
CREATE POLICY "Members can read their own organization"
  ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update their organization" ON organizations;
CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner'));

-- 4b. profiles policies
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Org members can read each other" ON profiles;
CREATE POLICY "Org members can read each other"
  ON profiles FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- 4c. properties policies
DROP POLICY IF EXISTS "Users can read their own properties" ON properties;
CREATE POLICY "Users can read their own properties"
  ON properties FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Org members can read org properties" ON properties;
CREATE POLICY "Org members can read org properties"
  ON properties FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()));

DROP POLICY IF EXISTS "Users can create their own properties" ON properties;
CREATE POLICY "Users can create their own properties"
  ON properties FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own properties" ON properties;
CREATE POLICY "Users can update their own properties"
  ON properties FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own properties" ON properties;
CREATE POLICY "Users can delete their own properties"
  ON properties FOR DELETE
  USING (user_id = auth.uid());

-- 4d. adverts policies
DROP POLICY IF EXISTS "Users can read their own adverts" ON adverts;
CREATE POLICY "Users can read their own adverts"
  ON adverts FOR SELECT
  USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create adverts for their properties" ON adverts;
CREATE POLICY "Users can create adverts for their properties"
  ON adverts FOR INSERT
  WITH CHECK (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own adverts" ON adverts;
CREATE POLICY "Users can update their own adverts"
  ON adverts FOR UPDATE
  USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own adverts" ON adverts;
CREATE POLICY "Users can delete their own adverts"
  ON adverts FOR DELETE
  USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

-- 4e. activity_log policies
DROP POLICY IF EXISTS "Users can read their own activity" ON activity_log;
CREATE POLICY "Users can read their own activity"
  ON activity_log FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own activity" ON activity_log;
CREATE POLICY "Users can insert their own activity"
  ON activity_log FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =========================
-- 5. STORAGE BUCKETS
-- =========================

-- 5a. Create buckets (idempotent via ON CONFLICT)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('property-images', 'property-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 5b. Storage policies

-- Public read for property-images
DROP POLICY IF EXISTS "Public read for property images" ON storage.objects;
CREATE POLICY "Public read for property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Public read for avatars
DROP POLICY IF EXISTS "Public read for avatars" ON storage.objects;
CREATE POLICY "Public read for avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload own files" ON storage.objects;
CREATE POLICY "Authenticated users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    (bucket_id = 'property-images' OR bucket_id = 'avatars')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can update their own files
DROP POLICY IF EXISTS "Authenticated users can update own files" ON storage.objects;
CREATE POLICY "Authenticated users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    (bucket_id = 'property-images' OR bucket_id = 'avatars')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can delete their own files
DROP POLICY IF EXISTS "Authenticated users can delete own files" ON storage.objects;
CREATE POLICY "Authenticated users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    (bucket_id = 'property-images' OR bucket_id = 'avatars')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
