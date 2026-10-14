INSERT INTO dump_descriptions (base_key, description) VALUES
  ('blackgraydarkdescent', 'Recolors the Dark Descent global skin material black and gray.'),
  ('enemycullnolpe', 'Culls common enemy actors without the low-priority-enemy filter.'),
  ('noammobar', 'Removes the ammo/supply bar HUD element.'),
  ('nuke_range_indicator', 'Adds a green blast-radius indicator to the Engineer''s Mini-Nuke radiation cloud.'),
  ('revolversound', 'Replaces the Bulldog Revolver''s firing sound with FAMAS-style audio.'),
  ('sdfandraymarchskins', 'Adds custom vanity and weapon-skin assets using SDF/ray-marched materials.')
ON CONFLICT(base_key) DO UPDATE SET description = excluded.description;
