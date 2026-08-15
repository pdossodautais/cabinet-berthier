-- ============================================
-- Debug : dump les policies/grants de contacts dans la console PG
-- ============================================
DO $$
DECLARE
  r record;
BEGIN
  RAISE NOTICE '=== Policies on contacts ===';
  FOR r IN
    SELECT policyname, cmd, roles::text, permissive, qual::text, with_check::text
    FROM pg_policies WHERE tablename='contacts'
  LOOP
    RAISE NOTICE 'Policy: % | % | roles=% | permissive=% | check=%',
      r.policyname, r.cmd, r.roles, r.permissive, r.with_check;
  END LOOP;

  RAISE NOTICE '=== Grants on contacts ===';
  FOR r IN
    SELECT grantee, privilege_type FROM information_schema.role_table_grants
    WHERE table_name='contacts' AND grantee IN ('anon','authenticated','postgres','service_role')
  LOOP
    RAISE NOTICE 'Grant: % % contacts', r.grantee, r.privilege_type;
  END LOOP;

  RAISE NOTICE '=== RLS state ===';
  FOR r IN SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname='contacts' LOOP
    RAISE NOTICE 'RLS on %: enabled=% force=%', r.relname, r.relrowsecurity, r.relforcerowsecurity;
  END LOOP;
END $$;
