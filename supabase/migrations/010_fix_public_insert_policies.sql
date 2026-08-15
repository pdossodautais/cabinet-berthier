-- ============================================
-- Fix RLS sur insertions publiques (policies explicites TO anon)
-- ============================================

DROP POLICY IF EXISTS "Public can insert contacts" ON contacts;
CREATE POLICY "Public can insert contacts"
  ON contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert estimations" ON estimations;
CREATE POLICY "Public can insert estimations"
  ON estimations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can create alerts" ON property_alerts;
CREATE POLICY "Anyone can create alerts"
  ON property_alerts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
