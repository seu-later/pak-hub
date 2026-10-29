# Bitfix downloads

Collected on 27 October 2026 from the user's four Practical DRG threads. Files under `public/downloads/bitfix` are unchanged attachment downloads, hosted locally so Discord URL signatures cannot expire. Descriptions in `public/bitfix.js` were checked against the source posts and the downloaded Lua code. No game-runtime compatibility claim is made by this source audit.

The DLL and Lua destination folders are confirmed by the [original setup post](https://discord.com/channels/878318716801155233/1277798700764237895/1277798700764237895) and [upstream usage instructions](https://github.com/trumank/bitfix#usage): `d3d9.dll` beside `FSD-Win64-Shipping.exe` in `FSD\Binaries\Win64`, Lua files in its `bitfix` subdirectory. The upstream MIT notice is included as `LICENSE-bitfix.txt`.

| File | Source message | Attachment ID | SHA-256 |
| --- | --- | --- | --- |
| d3d9.dll | [donnie danko, setup post](https://discord.com/channels/878318716801155233/1277798700764237895/1277798700764237895) | 1277798702894813289 | AEDB2570D43AB70943A5262CEE84E92E81AEA8DC195AF712FF6EA9181258B89E |
| non_flare_devouring_drop_pod.lua | [donnie danko, setup post](https://discord.com/channels/878318716801155233/1277798700764237895/1277798700764237895) | 1277798703616491591 | E7EBF16D080B973CC4976F018C3C892A58A400F3D63154A68C4ED725DE7A6885 |
| increased_players_fix.lua | [Nad, additional scripts](https://discord.com/channels/878318716801155233/1277798700764237895/1283090623628316733) | 1283090622584197223 | 2EF17ED40975EC23B91CAB146E5F06ABA9139627540AB48889652EA164AEC7BE |
| normal_terrain_scanner_mat.lua | [Nad, additional scripts](https://discord.com/channels/878318716801155233/1277798700764237895/1283090623628316733) | 1283090622919610429 | 523E4A3D5C66B3FB5A241B559A0C64A3CB92D7E6586E466D059FCBF1F586983A |
| critter_cull_crash_fix.lua | [67, Critter Cull Crash Fix](https://discord.com/channels/878318716801155233/1545533105522348092/1545534051967041647) | 1545534051987882004 | 0BE081C0846DE7DA14520CC6D6D99A1D91B68302FC1CC57156704EE3AD5383D1 |
| aggro_cap.lua | [67, Aggro Cap](https://discord.com/channels/878318716801155233/1545533105522348092/1545886589912227932) | 1545886589622812683 | 92E7F67065E6C2B2B5A7E9E025340B2CB849FAACB829B0C2BD33FDB19443F6E3 |
| camera_shot_origin.lua | [seu, replacement version](https://discord.com/channels/878318716801155233/1550256972924850226/1552891890913902653) | 1552891890410455050 | 9FECEC841FC9568A7811925B663CCD0DF701D24954A472FF56CE2FEE51349E72 |
| stickier_flame.lua | [seu, replacement version](https://discord.com/channels/878318716801155233/1553092661974663239/1553355725286154250) | 1553355724967641118 | B376ABE4D4E5B2D92D75CEF70D42E497AE71AB80F2A90CA2BF61679A4B5F47C8 |

## Version choices

- `aggro_cap.lua` replaces the older `max_attackers.lua`. It defaults to 64, clamps configuration to 32–128, wraps ground attacker slots to the original 32-entry ring, and bounds flying attacker accesses. The author describes this as fixing the original script's out-of-bounds slot reads.
- Camera-Origin Weapon Fire uses the replacement uploaded after the original stopped working following a game update. Its code covers muzzle, projectile, zipline, and continuous flame/cryo origins.
- Stickier Flame / Ice uses the replacement linked from the thread's edited setup reply. Stickier Sludge is a separate mod.io mod, not a Lua attachment in that thread, so it is not listed as a Bitfix Lua download.
- The older `targets_explode_fix.lua` in the setup discussion is marked by its author as broken and crashing the game. It is excluded. The difficulty-scaling example is also excluded because the discussion warns that it interferes with CD2 scaling.
- Critter Cull Crash Fix skips null entries in the critter culling loop; its source discussion identifies exceeding the critter cap as the trigger. Large Lobby Crash Fix is described without a precise player threshold because the original post and upstream example disagree on the threshold.
