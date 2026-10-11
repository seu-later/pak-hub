CREATE TABLE IF NOT EXISTS dump_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_key TEXT NOT NULL,
  base_name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '',
  prerelease INTEGER NOT NULL DEFAULT 0,
  filename TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  sha256 TEXT NOT NULL,
  r2_key TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dump_files_filename ON dump_files(filename);
CREATE INDEX IF NOT EXISTS idx_dump_files_base ON dump_files(base_key, prerelease, version, filename);
