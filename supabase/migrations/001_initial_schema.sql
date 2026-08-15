-- ============================================
-- Agents (équipe de l'agence)
-- ============================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ============================================
-- Properties (biens immobiliers)
-- ============================================
CREATE TYPE property_type AS ENUM ('appartement', 'maison', 'terrain', 'commerce', 'bureau');
CREATE TYPE transaction_type AS ENUM ('vente', 'location');
CREATE TYPE energy_rating AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G');

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  type property_type NOT NULL DEFAULT 'appartement',
  transaction_type transaction_type NOT NULL DEFAULT 'vente',
  price NUMERIC NOT NULL DEFAULT 0,
  surface NUMERIC NOT NULL DEFAULT 0,
  rooms INTEGER NOT NULL DEFAULT 1,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  energy_rating energy_rating,
  ghg_rating energy_rating,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index pour les requêtes fréquentes
CREATE INDEX idx_properties_is_published ON properties(is_published);
CREATE INDEX idx_properties_is_featured ON properties(is_featured);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_slug ON properties(slug);

-- ============================================
-- Property Media (photos des biens)
-- ============================================
CREATE TABLE property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT
);

CREATE INDEX idx_property_media_property_id ON property_media(property_id);

-- ============================================
-- Contacts (leads)
-- ============================================
CREATE TYPE contact_status AS ENUM ('nouveau', 'lu', 'traité', 'archivé');

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  status contact_status NOT NULL DEFAULT 'nouveau'
);

CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);

-- ============================================
-- Settings (config de l'agence)
-- ============================================
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Valeurs par défaut
INSERT INTO settings (key, value) VALUES
  ('agency_name', 'Mon Agence Immobilière'),
  ('agency_address', '1 rue de la Paix, 75001 Paris'),
  ('agency_phone', '01 23 45 67 89'),
  ('agency_email', 'contact@monagence.fr'),
  ('agency_hours', 'Lun-Ven: 9h-18h, Sam: 10h-13h'),
  ('agency_description', 'Votre agence immobilière de confiance en Île-de-France.'),
  ('social_facebook', ''),
  ('social_instagram', ''),
  ('social_linkedin', ''),
  ('social_twitter', '');

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Vitrine : lecture publique des biens publiés
CREATE POLICY "Public can view published properties"
  ON properties FOR SELECT
  USING (is_published = true);

-- Vitrine : lecture publique des médias des biens publiés
CREATE POLICY "Public can view media of published properties"
  ON property_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_media.property_id
      AND properties.is_published = true
    )
  );

-- Vitrine : lecture publique des agents actifs
CREATE POLICY "Public can view active agents"
  ON agents FOR SELECT
  USING (is_active = true);

-- Contacts : insertion publique (formulaire)
CREATE POLICY "Public can insert contacts"
  ON contacts FOR INSERT
  WITH CHECK (true);

-- Settings : lecture publique
CREATE POLICY "Public can view settings"
  ON settings FOR SELECT
  USING (true);

-- Admin : full access pour les utilisateurs authentifiés
CREATE POLICY "Admin full access on properties"
  ON properties FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on property_media"
  ON property_media FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on agents"
  ON agents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Storage buckets
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('properties', 'properties', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('agents', 'agents', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies : lecture publique
CREATE POLICY "Public read access on properties bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'properties');

CREATE POLICY "Public read access on agents bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agents');

-- Storage policies : upload/delete pour les authentifiés
CREATE POLICY "Authenticated upload on properties bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'properties');

CREATE POLICY "Authenticated update on properties bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'properties');

CREATE POLICY "Authenticated delete on properties bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'properties');

CREATE POLICY "Authenticated upload on agents bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'agents');

CREATE POLICY "Authenticated update on agents bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'agents');

CREATE POLICY "Authenticated delete on agents bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'agents');
