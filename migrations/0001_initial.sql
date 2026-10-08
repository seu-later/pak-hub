PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS mods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  creator_name TEXT NOT NULL DEFAULT 'Unknown',
  uploader_name TEXT NOT NULL DEFAULT 'Unknown',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS releases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mod_id INTEGER NOT NULL REFERENCES mods(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL DEFAULT 'Unversioned',
  channel TEXT NOT NULL DEFAULT 'unknown' CHECK (channel IN ('stable', 'beta', 'untested', 'unknown')),
  changelog TEXT NOT NULL DEFAULT '',
  published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_recommended INTEGER NOT NULL DEFAULT 0 CHECK (is_recommended IN (0, 1)),
  source_channel_id TEXT NOT NULL,
  source_message_id TEXT NOT NULL UNIQUE,
  source_message_url TEXT NOT NULL,
  source_thread_id TEXT,
  source_thread_url TEXT
);

CREATE TABLE IF NOT EXISTS pak_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  release_id INTEGER NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  variant_label TEXT NOT NULL DEFAULT 'Default build',
  size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
  sha256 TEXT NOT NULL CHECK (length(sha256) = 64),
  github_asset_id TEXT NOT NULL,
  github_tag TEXT NOT NULL,
  download_url TEXT NOT NULL,
  UNIQUE (release_id, github_asset_id)
);

CREATE INDEX IF NOT EXISTS idx_mods_category_name ON mods(category, name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_releases_mod_date ON releases(mod_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_releases_recommended ON releases(mod_id, is_recommended);
CREATE INDEX IF NOT EXISTS idx_files_release ON pak_files(release_id);
