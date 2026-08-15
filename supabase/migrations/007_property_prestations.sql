-- ============================================
-- Ajoute 3 champs aux biens :
--   features          : tableau libre de prestations (ex. "Ascenseur", "Balcon")
--   construction_year : année de construction
--   heating_type      : libellé libre ("Chauffage central radiateur", "Pompe à chaleur")
-- ============================================

ALTER TABLE properties ADD COLUMN IF NOT EXISTS features text[] NOT NULL DEFAULT '{}';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS construction_year integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS heating_type text;
