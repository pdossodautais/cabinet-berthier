-- ============================================
-- Notification preferences per agent
-- ============================================

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, event_type)
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all preferences (needed by web app to send notifications)
CREATE POLICY "Authenticated can view notification preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (true);

-- Agents can update their own preferences
CREATE POLICY "Agents can manage own notification preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = (SELECT auth.uid())
    )
  );

-- Insert default preferences for all existing agents
INSERT INTO notification_preferences (agent_id, event_type, enabled)
SELECT id, event_type, true
FROM agents
CROSS JOIN (VALUES ('contact'), ('estimation')) AS events(event_type)
ON CONFLICT DO NOTHING;
