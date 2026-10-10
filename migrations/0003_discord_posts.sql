ALTER TABLE mods ADD COLUMN root_message_id TEXT;
ALTER TABLE mods ADD COLUMN root_posted_at TEXT;
ALTER TABLE mods ADD COLUMN root_message_url TEXT;
ALTER TABLE mods ADD COLUMN root_post_content TEXT NOT NULL DEFAULT '';

ALTER TABLE releases ADD COLUMN posted_by TEXT NOT NULL DEFAULT 'Unknown';
ALTER TABLE releases ADD COLUMN post_content TEXT NOT NULL DEFAULT '';

UPDATE mods
SET root_message_id = (
  SELECT source_message_id FROM releases
  WHERE releases.mod_id = mods.id
  ORDER BY published_at ASC, id ASC LIMIT 1
),
root_posted_at = (
  SELECT published_at FROM releases
  WHERE releases.mod_id = mods.id
  ORDER BY published_at ASC, id ASC LIMIT 1
),
root_message_url = (
  SELECT source_message_url FROM releases
  WHERE releases.mod_id = mods.id
  ORDER BY published_at ASC, id ASC LIMIT 1
),
root_post_content = (
  SELECT changelog FROM releases
  WHERE releases.mod_id = mods.id
  ORDER BY published_at ASC, id ASC LIMIT 1
);

UPDATE releases
SET posted_by = COALESCE((SELECT uploader_name FROM mods WHERE mods.id = releases.mod_id), 'Unknown'),
    post_content = changelog;

UPDATE mods SET creator_name = uploader_name;

CREATE INDEX IF NOT EXISTS idx_releases_mod_message ON releases(mod_id, source_message_id);

-- Re-import message history so every post gets its own sender and text fields.
DELETE FROM import_state WHERE id = 1;
