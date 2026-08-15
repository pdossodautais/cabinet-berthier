DO $$
DECLARE r record;
BEGIN
  RAISE NOTICE '=== Triggers on contacts ===';
  FOR r IN SELECT tgname, tgenabled, pg_get_triggerdef(t.oid) AS def
    FROM pg_trigger t JOIN pg_class c ON t.tgrelid=c.oid
    WHERE c.relname='contacts' AND NOT tgisinternal
  LOOP
    RAISE NOTICE '  % (% ) : %', r.tgname, r.tgenabled, r.def;
  END LOOP;

  RAISE NOTICE '=== Column constraints ===';
  FOR r IN SELECT column_name, column_default, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_name='contacts' ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '  % : default=% nullable=% type=%',
      r.column_name, COALESCE(r.column_default,'NULL'), r.is_nullable, r.data_type;
  END LOOP;
END $$;
