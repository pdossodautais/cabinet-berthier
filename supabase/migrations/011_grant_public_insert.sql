-- ============================================
-- GRANT INSERT aux rôles anon/authenticated
-- ============================================
-- RLS policies seules ne suffisent pas : Postgres exige AUSSI une
-- permission niveau table. Les migrations initiales n'avaient pas
-- grant-é les INSERT sur les tables de formulaires publics, du coup
-- même avec les policies corrigées en 010, l'anon tombe en 42501.

GRANT INSERT ON contacts TO anon, authenticated;
GRANT INSERT ON estimations TO anon, authenticated;
GRANT INSERT ON property_alerts TO anon, authenticated;
