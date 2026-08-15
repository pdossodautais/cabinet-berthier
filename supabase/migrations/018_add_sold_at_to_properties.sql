-- Ajout d'un statut "vendu/loué" sur les biens
-- sold_at NULL = bien disponible
-- sold_at NOT NULL = bien vendu (vente) ou loué (location)
-- Le label affiché dépend de properties.transaction_type

ALTER TABLE properties
  ADD COLUMN sold_at TIMESTAMPTZ NULL;

-- Index partiel pour les queries qui filtrent les disponibles uniquement
CREATE INDEX idx_properties_sold_at_null
  ON properties(id)
  WHERE sold_at IS NULL;
