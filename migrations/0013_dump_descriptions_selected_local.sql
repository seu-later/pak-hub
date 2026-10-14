INSERT INTO dump_descriptions (base_key, description) VALUES
  ('cavegraphicsboost', 'Replaces cave terrain materials and decorative foliage with simple flat materials to target lower GPU material cost.'),
  ('enemyperfboost', 'Throttles distant enemy and animation updates based on distance and visibility to reduce CPU work.'),
  ('minimalism', 'Provides minimal visual replacements for cave environment, foliage, particles, critters, and room objects.'),
  ('nocamerashakecomplete', 'Removes cooked camera-shake effects while leaving weapon recoil and weapon Blueprints unchanged.'),
  ('reliablelandscape', 'Reduces cave rendering cost by disabling nonessential debris and terrain shadows and removing selected ambient effects.')
ON CONFLICT(base_key) DO UPDATE SET description = excluded.description;
