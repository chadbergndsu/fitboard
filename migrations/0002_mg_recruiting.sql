-- App tables for MG Recruiting Source portals
CREATE TABLE IF NOT EXISTS portal_notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portal_notes_user_idx ON portal_notes (user_id);
