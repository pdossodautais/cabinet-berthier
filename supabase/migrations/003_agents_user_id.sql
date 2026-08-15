-- Lier les agents aux utilisateurs auth pour l'invitation/connexion
ALTER TABLE agents ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_agents_user_id ON agents(user_id);
