-- ============================================
-- GRANT USAGE sur les enums utilisés par les formulaires publics
-- ============================================
-- La column `contacts.status` est de type `contact_status` (enum).
-- Postgres exige GRANT USAGE sur le type enum pour qu'un rôle
-- puisse INSERT une ligne qui référence ce type, même si la colonne
-- a un DEFAULT. Sans ce grant, l'anon tombe en RLS violation (faux
-- message Postgres — en réalité c'est un type permission denied).

GRANT USAGE ON TYPE contact_status TO anon, authenticated;
GRANT USAGE ON TYPE estimation_status TO anon, authenticated;
