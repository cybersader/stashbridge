CREATE TABLE IF NOT EXISTS sync_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  origin TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  browser_id TEXT NOT NULL,
  UNIQUE(origin, key)
);

CREATE INDEX IF NOT EXISTS idx_sync_entries_updated ON sync_entries(updated_at);
CREATE INDEX IF NOT EXISTS idx_sync_entries_origin_key ON sync_entries(origin, key);
