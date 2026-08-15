-- ============================================
-- Tracking des alertes déjà envoyées
-- Permet de notifier un abonné à une alerte quand un bien MODIFIÉ entre
-- dans ses critères, sans spam (chaque bien n'est notifié qu'une fois
-- par alerte).
-- ============================================

ALTER TABLE property_alerts
  ADD COLUMN IF NOT EXISTS notified_property_ids uuid[] NOT NULL DEFAULT '{}';

-- Index GIN pour les requêtes « est-ce que cette alerte a déjà été
-- notifiée pour ce bien ? » en O(log n) sur un text[]
CREATE INDEX IF NOT EXISTS idx_property_alerts_notified_property_ids
  ON property_alerts USING GIN (notified_property_ids);
