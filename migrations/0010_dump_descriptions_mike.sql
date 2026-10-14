INSERT INTO dump_descriptions (base_key, description) VALUES
  ('cccallmule', 'Adds a chat command for calling the M.U.L.E.'),
  ('ccstartingnitra', 'Adds starting Nitra to missions.'),
  ('chatmirror', 'Mirrors chat messages through a custom chat UI.'),
  ('eventeraser', 'Disables selected mission events and saves the setting.'),
  ('fpm', 'Adds the FPM gameplay package.'),
  ('fpsondemand', 'Adds an on-demand FPS display with saved settings.'),
  ('gfo', 'Adds the GFO gameplay package.'),
  ('gsm', 'Adds the GSM gameplay package.'),
  ('infiniteeggs', 'Adds infinite-egg gameplay with egg spawners, traps, and a settings GUI.'),
  ('mandatorysecondariesalways', 'Makes secondary objectives mandatory.'),
  ('michwarnings', 'Adds mission warnings, including a magnetic-death warning.'),
  ('oht', 'Adds the OHT gameplay package.'),
  ('ui_howfarmule', 'Adds a HUD display for the M.U.L.E. distance.'),
  ('vcm', 'Changes vertical corpse movement behavior.'),
  ('windowmarker', 'Adds a GUI for marking windows.')
ON CONFLICT(base_key) DO UPDATE SET description = excluded.description;
