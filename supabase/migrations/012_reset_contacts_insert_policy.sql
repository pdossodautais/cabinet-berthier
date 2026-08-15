-- ============================================
-- Reset complet de la policy INSERT sur contacts
-- ============================================
-- 010 et 011 n'ont pas suffi — l'anon reçoit toujours 42501 sur
-- contacts.insert. Test : reset complet avec le cas le plus basique
-- possible (FORCE RLS, DROP toutes policies, re-CREATE, GRANT).

-- 1. DROP toutes les policies existantes sur contacts
DROP POLICY IF EXISTS "Public can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Admin full access on contacts" ON contacts;

-- 2. GRANT les permissions niveau table
GRANT INSERT ON contacts TO anon;
GRANT INSERT ON contacts TO authenticated;
GRANT SELECT, UPDATE, DELETE ON contacts TO authenticated;

-- 3. Re-CREATE les policies
CREATE POLICY "anon_insert_contacts"
  ON contacts AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_all_contacts"
  ON contacts AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Idem estimations + property_alerts pour cohérence
DROP POLICY IF EXISTS "Public can insert estimations" ON estimations;
DROP POLICY IF EXISTS "Admin full access on estimations" ON estimations;

GRANT INSERT ON estimations TO anon;
GRANT INSERT ON estimations TO authenticated;
GRANT SELECT, UPDATE, DELETE ON estimations TO authenticated;

CREATE POLICY "anon_insert_estimations"
  ON estimations AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_all_estimations"
  ON estimations AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can create alerts" ON property_alerts;
DROP POLICY IF EXISTS "Authenticated can manage alerts" ON property_alerts;

GRANT INSERT ON property_alerts TO anon;
GRANT INSERT ON property_alerts TO authenticated;
GRANT SELECT, UPDATE, DELETE ON property_alerts TO authenticated;

CREATE POLICY "anon_insert_property_alerts"
  ON property_alerts AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_all_property_alerts"
  ON property_alerts AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
