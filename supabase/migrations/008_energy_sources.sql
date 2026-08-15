-- ============================================
-- Ajoute energy_sources aux biens : liste libre
-- des sources d'énergie (ex. "Électricité", "Gaz de ville",
-- "Pompe à chaleur", "Chaudière fioul").
-- ============================================

ALTER TABLE properties ADD COLUMN IF NOT EXISTS energy_sources text[] NOT NULL DEFAULT '{}';
