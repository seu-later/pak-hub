ALTER TABLE dump_files ADD COLUMN posted_by TEXT NOT NULL DEFAULT 'Unknown';
ALTER TABLE dump_files ADD COLUMN source_message_url TEXT;
ALTER TABLE dump_files ADD COLUMN source_guild TEXT;
