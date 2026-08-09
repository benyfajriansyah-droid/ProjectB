CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  raw_text TEXT NOT NULL,
  hook TEXT NOT NULL,
  tema TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS platform_executions (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ig', 'tiktok')),
  status TEXT NOT NULL DEFAULT 'ide_baru' CHECK (status IN ('ide_baru', 'draft', 'terjadwal', 'tayang', 'skip')),
  format TEXT,
  scheduled_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_platform_executions_idea_id ON platform_executions (idea_id);
