-- ============================================
-- Agent roles (multi-agent auth)
-- ============================================
ALTER TABLE agents ADD COLUMN role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent'));

-- ============================================
-- Estimations (demandes d'estimation)
-- ============================================
CREATE TYPE estimation_status AS ENUM ('nouveau', 'en_cours', 'terminé');

CREATE TABLE estimations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL DEFAULT '',
  property_type property_type NOT NULL DEFAULT 'appartement',
  surface NUMERIC,
  rooms INTEGER,
  message TEXT,
  status estimation_status NOT NULL DEFAULT 'nouveau'
);

CREATE INDEX idx_estimations_status ON estimations(status);
CREATE INDEX idx_estimations_created_at ON estimations(created_at DESC);

-- RLS
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert estimations"
  ON estimations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin full access on estimations"
  ON estimations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Blog posts
-- ============================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES agents(id) ON DELETE SET NULL
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_is_published ON posts(is_published);

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admin full access on posts"
  ON posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Testimonials (témoignages clients)
-- ============================================
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  photo_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true
);

-- RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published testimonials"
  ON testimonials FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admin full access on testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Property documents (plans, diagnostics)
-- ============================================
CREATE TABLE property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'document' CHECK (type IN ('plan', 'diagnostic', 'document')),
  position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);

-- RLS
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view documents of published properties"
  ON property_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_documents.property_id
      AND properties.is_published = true
    )
  );

CREATE POLICY "Admin full access on property_documents"
  ON property_documents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Contact replies (réponses admin)
-- ============================================
CREATE TABLE contact_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_by UUID REFERENCES agents(id) ON DELETE SET NULL
);

CREATE INDEX idx_contact_replies_contact_id ON contact_replies(contact_id);

-- RLS
ALTER TABLE contact_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on contact_replies"
  ON contact_replies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Storage bucket for documents & blog
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access on documents bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Authenticated upload on documents bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated update on documents bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Authenticated delete on documents bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Public read access on blog bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog');

CREATE POLICY "Authenticated upload on blog bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog');

CREATE POLICY "Authenticated update on blog bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog');

CREATE POLICY "Authenticated delete on blog bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog');
