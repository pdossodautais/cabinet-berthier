-- ============================================
-- Property Alerts (alertes e-mail)
-- ============================================
CREATE TABLE IF NOT EXISTS property_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  email text NOT NULL,
  transaction_type text,
  property_type text,
  city text,
  prix_max integer,
  surface_min integer,
  rooms integer,
  is_active boolean DEFAULT true NOT NULL
);

CREATE INDEX idx_property_alerts_email ON property_alerts(email);
CREATE INDEX idx_property_alerts_active ON property_alerts(is_active) WHERE is_active = true;

ALTER TABLE property_alerts ENABLE ROW LEVEL SECURITY;

-- Public can create alerts
CREATE POLICY "Anyone can create alerts" ON property_alerts FOR INSERT TO anon WITH CHECK (true);

-- Authenticated can manage all alerts
CREATE POLICY "Authenticated can manage alerts" ON property_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
