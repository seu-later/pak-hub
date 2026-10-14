DROP INDEX IF EXISTS idx_dump_files_filename;
CREATE INDEX IF NOT EXISTS idx_dump_files_filename ON dump_files(filename);
CREATE INDEX IF NOT EXISTS idx_dump_files_sha256 ON dump_files(sha256);
