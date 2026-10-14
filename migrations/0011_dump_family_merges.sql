/* Fold clear release-name splits into their established families.  File,
 * credit, source, hash, size, and R2 metadata are intentionally untouched. */
UPDATE dump_files SET base_key = 'custom-difficulty2', base_name = 'custom-difficulty2', version = 'beta-13-elitem-testpak1', prerelease = 1
  WHERE filename = 'custom-difficulty2-beta-13-elitem-testpak1.zip';
UPDATE dump_files SET base_key = 'custom-difficulty2', base_name = 'custom-difficulty2', version = 'beta-RLTP4', prerelease = 1
  WHERE filename = 'custom-difficulty2-beta-RLTP4.zip';
UPDATE dump_files SET base_key = 'custom-difficulty2', base_name = 'custom-difficulty2', version = 'beta-RLTP7', prerelease = 1
  WHERE filename = 'custom-difficulty2-beta-RLTP7.zip';
UPDATE dump_files SET base_key = 'custom-difficulty2', base_name = 'custom-difficulty2', version = '14-rc1', prerelease = 1
  WHERE filename = 'custom-difficulty2-update-14-rc1.zip';
UPDATE dump_files SET base_key = 'custom-difficulty2', base_name = 'custom-difficulty2', version = '15', prerelease = 0
  WHERE filename = 'custom-difficulty2-update-15.zip';
UPDATE dump_files SET base_key = 'custom-difficulty2', base_name = 'custom-difficulty2', version = '15a', prerelease = 0
  WHERE filename = 'custom-difficulty2-update-15a.zip';
UPDATE dump_files SET base_key = 'custom-difficulty2', base_name = 'custom-difficulty2', version = '15b', prerelease = 0
  WHERE filename = 'custom-difficulty2-update-15b.zip';
UPDATE dump_files SET base_key = 'custom-difficulty2', base_name = 'custom-difficulty2', version = '16a', prerelease = 0
  WHERE filename = 'custom-difficulty2-update-16a.zip';
UPDATE dump_files SET base_key = 'custom-difficulty2', base_name = 'custom-difficulty2', version = '17', prerelease = 0
  WHERE filename = 'custom-difficulty2-update-17.zip';
UPDATE dump_files SET base_key = 'custom-difficulty2', base_name = 'custom-difficulty2', version = '18', prerelease = 0
  WHERE filename = 'custom-difficulty2-update-18.zip';

UPDATE dump_files SET base_key = 'eee', base_name = 'EEE', version = '1.0.3', prerelease = 0
  WHERE filename = 'EEEv.1.0.3.pak';
UPDATE dump_files SET base_key = 'eee', base_name = 'EEE', version = '1.3.1-hotfix', prerelease = 0
  WHERE filename = 'EEEv1.3.1_hotfix.pak';
UPDATE dump_files SET base_key = 'eee', base_name = 'EEE', version = '1.3.1-hotfix2', prerelease = 0
  WHERE filename = 'EEEv1.3.1_hotfix2.pak';
UPDATE dump_files SET base_key = 'eee', base_name = 'EEE', version = '1.3.1-hotfix3', prerelease = 0
  WHERE filename = 'EEEv.1.3.1_hotfix3.pak';
UPDATE dump_files SET base_key = 'eee', base_name = 'EEE', version = '1.4.1', prerelease = 0
  WHERE filename = 'EEEv.1.4.1.pak';

UPDATE dump_files SET base_key = 'woh_cd2', base_name = 'WoH_cd2', version = '0.3', prerelease = 0
  WHERE filename = 'WoH cd2 v0.3.pak';

UPDATE dump_files SET base_key = 'deep_dive_carry', base_name = 'Deep_Dive_Carry'
  WHERE filename = 'Deep_Dives_Carry_-_V0.1.0_P.pak';
UPDATE dump_files SET base_key = 'deep_dive_carry_x2_enemies', base_name = 'Deep_Dive_Carry_x2_Enemies', version = '0.5.0', prerelease = 0
  WHERE filename = 'Deep_Dives_Carry_x2_Enemies_-_V0.5.0_P.pak';
UPDATE dump_files SET base_key = 'deep_dive_carry_x2_enemies', base_name = 'Deep_Dive_Carry_x2_Enemies', version = '1.0.0', prerelease = 0
  WHERE filename = 'Deep_Dive_Carry_x2_Enemies_v_1_0_0_P.pak';

UPDATE dump_files SET base_key = 'no_crawler_puddles', base_name = 'NoCrawlerPuddles'
  WHERE filename = 'NoCrawlerPuddles.pak';
UPDATE dump_files SET base_name = 'NoCrawlerPuddles'
  WHERE base_key = 'no_crawler_puddles';
UPDATE dump_files SET base_key = 'purple_mcao', base_name = 'Purple_MCAO'
  WHERE filename = 'purplemcao.pak';

UPDATE dump_files SET base_key = 'betterterminal', base_name = 'BetterTerminal', version = '1', prerelease = 0
  WHERE filename = 'BetterTerminal1.pak';
UPDATE dump_files SET base_key = 'betterterminal', base_name = 'BetterTerminal', version = '3', prerelease = 0
  WHERE filename = 'BetterTerminal3.pak';

UPDATE dump_files SET base_key = 'mev', base_name = 'MEV', version = '4.8', prerelease = 0
  WHERE filename = 'MEVv4_8.pak';
UPDATE dump_files SET base_key = 'mev', base_name = 'MEV', version = '5.3', prerelease = 0
  WHERE filename = 'MEVv5_3.pak';
UPDATE dump_files SET base_key = 'mev', base_name = 'MEV', version = '5.4', prerelease = 0
  WHERE filename = 'MEVv5_4.pak';
UPDATE dump_files SET base_key = 'mev', base_name = 'MEV', version = '5.4.1', prerelease = 0
  WHERE filename = 'MEVv5_4_1.pak';
UPDATE dump_files SET base_key = 'mev', base_name = 'MEV', version = '5.4.2', prerelease = 0
  WHERE filename = 'MEVv5_4_2.pak';

UPDATE dump_files SET base_key = 'viewmodeldecoupler', base_name = 'ViewmodelDecoupler', version = '1.10', prerelease = 0
  WHERE filename = 'ViewmodelDecoupler110.pak';
UPDATE dump_files SET base_key = 'viewmodeldecoupler', base_name = 'ViewmodelDecoupler', version = '1.11', prerelease = 0
  WHERE filename = 'ViewmodelDecoupler111.pak';

UPDATE dump_files SET base_key = 'arcadecorerez', base_name = 'arcadecorerez', version = '4b', prerelease = 0
  WHERE filename = 'arcadecorerezv4b.pak';
UPDATE dump_files SET base_key = 'arcadecorerez', base_name = 'arcadecorerez', version = '5b', prerelease = 0
  WHERE filename = 'arcadecorerezv5b.pak';
UPDATE dump_files SET base_key = 'arcadecorerez', base_name = 'arcadecorerez', version = '6b', prerelease = 0
  WHERE filename = 'arcadecorerezv6b.pak';

UPDATE dump_files SET base_key = 'novakbalance_b', base_name = 'NovakBalance_B', version = '2', prerelease = 0
  WHERE filename = 'NovakBalanceB2.pak';
UPDATE dump_files SET base_key = 'generaloptimizer', base_name = 'GeneralOptimizer', version = '600', prerelease = 0
  WHERE filename = 'GeneralOptimizer600.pak';
UPDATE dump_files SET base_key = 'novaksenemymiscellanea', base_name = 'NovaksEnemyMiscellanea', version = '1022', prerelease = 0
  WHERE filename = 'NovaksEnemyMiscellanea1022.pak';

UPDATE dump_files SET base_key = 'removeextraneousparticles', base_name = 'RemoveExtraneousParticles', version = '14', prerelease = 0
  WHERE filename = 'RemoveExtraneousParticles14.pak';
UPDATE dump_files SET base_key = 'removeextraneousparticles', base_name = 'RemoveExtraneousParticles', version = '15', prerelease = 0
  WHERE filename = 'RemoveExtraneousParticles15.pak';

INSERT INTO dump_descriptions (base_key, description) VALUES
  ('betterterminal', 'Reworks terminal upgrade and overclock entries and their descriptions.'),
  ('deep_dive_carry_x2_enemies', 'Changes Deep Dive carry rules and doubles enemy counts.'),
  ('mev', 'Adds the Mission Event Variants enemy/event pack.'),
  ('removeextraneousparticles', 'Removes extraneous enemy, fire, gas, and objective particles.'),
  ('viewmodeldecoupler', 'Decouples selected weapon/projectile effects from the first-person viewmodel.')
ON CONFLICT(base_key) DO UPDATE SET description = excluded.description;

