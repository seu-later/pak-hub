UPDATE dump_files
SET posted_by = CASE
    WHEN posted_by IS NULL OR posted_by = '' OR posted_by = 'Unknown' THEN COALESCE(
      (SELECT NULLIF(r.posted_by, 'Unknown')
       FROM pak_files pf
       JOIN releases r ON r.id = pf.release_id
       WHERE pf.sha256 = dump_files.sha256
       ORDER BY r.published_at DESC, r.id DESC
       LIMIT 1),
      posted_by,
      'Unknown')
    ELSE posted_by
  END,
  source_message_url = COALESCE(
    (SELECT r.source_message_url
     FROM pak_files pf
     JOIN releases r ON r.id = pf.release_id
     WHERE pf.sha256 = dump_files.sha256
       AND r.source_message_url LIKE 'https://discord.com/channels/878318716801155233/%'
     ORDER BY r.published_at DESC, r.id DESC
     LIMIT 1),
    source_message_url),
  source_guild = COALESCE(
    (SELECT '878318716801155233'
     FROM pak_files pf
     JOIN releases r ON r.id = pf.release_id
     WHERE pf.sha256 = dump_files.sha256
       AND r.source_message_url LIKE 'https://discord.com/channels/878318716801155233/%'
     ORDER BY r.published_at DESC, r.id DESC
     LIMIT 1),
    source_guild)
WHERE EXISTS (
  SELECT 1 FROM pak_files pf WHERE pf.sha256 = dump_files.sha256
);
