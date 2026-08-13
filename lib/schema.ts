/**
 * Schema statements, applied in order on first use.
 *
 * Kept as a TS constant rather than a .sql file read at runtime: on Vercel the
 * bundler doesn't trace loose data files, so an fs.readFileSync would break in
 * production.
 */
export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS ideas (
    id TEXT PRIMARY KEY,
    raw_text TEXT NOT NULL,
    hook TEXT NOT NULL,
    tema TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS platform_executions (
    id TEXT PRIMARY KEY,
    idea_id TEXT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('ig', 'tiktok')),
    status TEXT NOT NULL DEFAULT 'ide_baru' CHECK (status IN ('ide_baru', 'draft', 'terjadwal', 'tayang', 'skip')),
    format TEXT,
    scheduled_at TEXT
  )`,

  `CREATE INDEX IF NOT EXISTS idx_platform_executions_idea_id ON platform_executions (idea_id)`,

  // Amounts are whole rupiah stored as BIGINT — floating point would quietly
  // drift once totals get large.
  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('masuk', 'keluar')),
    amount BIGINT NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    venture TEXT,
    note TEXT,
    occurred_on DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_transactions_occurred_on ON transactions (occurred_on DESC)`,

  // One row per account per capture. Filled by hand today; an API sync would
  // write the same shape, so the panel doesn't change when that arrives.
  `CREATE TABLE IF NOT EXISTS social_snapshots (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL CHECK (platform IN ('ig', 'tiktok')),
    tema TEXT NOT NULL,
    followers INTEGER,
    views INTEGER,
    engagement INTEGER,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'api')),
    recorded_on DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE UNIQUE INDEX IF NOT EXISTS idx_social_unique
     ON social_snapshots (platform, tema, recorded_on)`,

  // The daily briefing is generated once and reused, so opening the dashboard
  // repeatedly doesn't spend AI quota.
  `CREATE TABLE IF NOT EXISTS briefings (
    briefing_on DATE PRIMARY KEY,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
];
