INSERT INTO dump_descriptions (base_key, description) VALUES
  ('allyoutlinesplus-0.4.0', 'Adds team-outline, ping-icon, and team-tag UI assets for highlighting allies.'),
  ('antilag-0.1.0-alpha.5-r9', 'Keeps local movement during host corrections, including grapple and movement-base cases; it is client-only.'),
  ('cdcompat-0.2.0-alpha.4-drg0923', 'Adds a Custom Difficulty engine selector and supporting CD1/CD2 integration for the 2026-09-23 DRG build.'),
  ('shieldlinkrange-0.1.0', 'Adds Shield Link range UI and shield-ring visual assets.')
ON CONFLICT(base_key) DO UPDATE SET description = excluded.description;
