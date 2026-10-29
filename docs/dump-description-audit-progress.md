# Pak Dump description audit progress

Catalog: 893 groups / 1169 unique files. All packages acquired and hash-checked.

Reviewed through static analysis: **849**. Pending: **44**. Runtime verified: **0**.

Cooked JSON exported for 1084 packages (121746 assets). Extraction and automated comparison do not count as semantic review.

## Reviewed corrections

| Group | Previous description | Reviewed description |
| --- | --- | --- |
| 0.4sDelayCryoMines | Adds a 0.4-second delay before the Zhukov's Cryo Minelets trigger. | Reduces Zhukov Cryo Minelets arming time to roughly 0.4 seconds, randomized between 0.3 and 0.5 seconds. |
| 000__BDE_Drill_Boi_Drill | Changes weapon, upgrade, or overclock data for 000 BDE Drill Boi Drill. | Buffs drills with more damage, rate, mining, fuel and stagger. |
| 009__BDB_Hypocritas_Edition | Big Dig Boi edition: enlarges the pickaxe dig size and replaces most terrain materials with the Speedy Smol Sons set. | Sets terrain pickaxe dig size to 225, enlarges the Double Drills carve area, and replaces cave terrain materials. |
| 010_BDB_CrassusEdition | Adds the Big Dig Boi Crassus Edition menu and interface assets. | Adds the Crassus Edition Big Dig Boi interface, with profile controls, activity logs, and debug screens. |
| 30tickrate | Adds a 30-tick-rate gameplay package. | Sets pathfinding enemies and their movement components to a 0.03-second tick interval, about 33 updates per second. |
| 500IWNoCooldown | Removes Iron Will's cooldown. | Sets Iron Will to 500 uses with no cooldown between activations. |
| A1toB7 | Archive of older K.O.N.G. and SLSS custom-difficulty JSON presets. | Bundles legacy K.O.N.G. and SLSS custom-difficulty JSON presets. |
| AC_CurentFireRate | Adds a current-fire-rate display for the Autocannon. | Adds a debug watch showing the Autocannon’s current firing interval. |
| AC_rework | Changes the weapon crosshair/UI for AC rework. | Rebalances the Autocannon toward stronger area damage and kill power, with revised upgrades and overclocks intended to compete with the Minigun and Hurricane. |
| ActorMonitor | Changes cave, terrain, or biome content for Actor Monitor. | Adds a debug monitor showing status effects and instance counts on aimed targets. |
| AggressiveWebSpitters | Changes enemy definitions or variants for Aggressive Web Spitters. | Makes Web Spitters attack relentlessly with longer sight and faster reactions. |
| agmixture_asch_P | Changes the Goo Cannon's AG Mixture overclock velocity and gravity behavior. | Swaps AG Mixture overclock’s velocity bonus for a stronger custom velocity effect; gravity and arc bonuses unchanged. |
| AGMixtureFixes_P | Fixes the Goo Cannon's AG Mixture overclock and its velocity bonus. | Fixes the AG Mixture velocity bonus to target base goo projectiles and reorders its upgrade slots. |
| AlbinoSeptics | Recolors Septic Spreader puddles and materials white. | Recolors Septic Spreader white with pink glow, lights and acid. |
| AllyOutlinesPlus-0.4.0 | Adds team-outline, ping-icon, and team-tag UI assets for highlighting allies. | Adds team outlines, ping icons and health/armor team tags for allies, with color settings. |
| Alternative_Boomstick | Replaces the Boomstick with an alternative weapon setup. | Replaces the Boomstick’s firing, reload, and shell sounds with an alternative audio set. |
| AlternativeEggLayouts | Adds alternative Egg Hunt cave layouts. | Adds 12 custom Egg Hunt cave layouts, including Generation, HotDrop, VerticalStack, Salvage-like and vanilla-based variants. |
| AlternativeEggLayouts_mixed | Combines alternative Egg Hunt layouts with other custom cave layouts. | Adds 12 custom Egg Hunt cave layouts, including Generation, HotDrop, VerticalStack, Salvage-like and vanilla-based variants. |
| AlwaysAllowHaz5 | Allows beer buffs to be used on Hazard 5 missions. | Removes the minimum player-rank gate for joining Hazard 5 servers through the server list; full servers remain unavailable. |
| AlwaysAllowHaz5_2 | Changes enemy definitions or variants for Always Allow Haz5 2. | Removes the minimum player-rank gate for joining Hazard 5 servers through the server list; full servers remain unavailable. |
| alwaysSprint | Keeps sprint enabled automatically. | Automatically sets the running state while not firing and enables client-authoritative movement on player characters. |
| AlwaysSprint_P | Adds an always-sprint mod with a saved toggle. | Maintains the running state while use-item is held; it also contains a SteamID-gated path that writes a local text file and opens a browser URL. |
| ammopercent_patched | Adds an ammo-percentage display and settings UI. | Adds ammo-percentage and grenade-count HUD with color and position settings. |
| Annoying_Audio | Adjusts loud enemy and weapon sounds, including the Minigun gyro. | Quiets loud weapon, explosion and death sounds, muting the Minigun gyro and tails. |
| Annoying_Audio_nogyrochange | Adjusts loud enemy and weapon sounds without changing the Minigun gyro. | Quiets EPC fire and thermal, chemical and goo death sounds (volumes slashed, fire core muted). |
| Anti-Asthma | Removes or reduces dust, smoke, debris, and other cave particle effects. | Removes ambient dust, drill debris, footstep bursts and cave atmosphere particles. |
| Anti-Lung_Cancer | Removes or reduces Drillevator, Drilldozer, and drill smoke effects. | Removes Refinery smoke and steam plus Drilldozer and Drillevator smoke effects. |
| AntiLag-0.1.0-alpha.5-r9 | Keeps local movement during host corrections, including grapple and movement-base cases; it is client-only. | Client-side movement correction mod that protects eligible walking, falling, and grapple movement from host corrections, then returns to stock correction until a genuine host acknowledgement after unsupported states. |
| Antipet | Disables pet behavior in missions. | Counters client-side pet mods in missions by lowering the priority of pets attached to player characters; updates every five seconds. |
| apurplegunge-nomist | Changes visual effects for apurplegunge nomist. | Recolors Goo Cannon corrosion visuals purple, including particles, decals, and status icons, and replaces the corrosive death effect with an empty Niagara system to remove its mist. |
| apurplegunge_withmist | Recolors Goo Cannon corrosion effects purple and restores the mist effect. | Recolors Goo Cannon corrosion visuals purple, including particles, decals, and status icons, while retaining the corrosive death mist effect. |
| arcadecorerez | Reworks Radioactive Exclusion Zone terrain, uranium crystals, and props. | Reskins Radioactive Exclusion Zone materials and props in an arcadecore style; version notes mention purple uranium crystals and an animated plant material. |
| ArcAmmunition_English | Adds an electric ammunition overclock for the Minigun. | English text add-on for Flying_Dickcat’s Minigun Arc Ammunition overclock; the author used Google Translate and guesswork, so wording may be off. |
| Armor_Rig_Overhaul | Overhauls armor upgrades for all four classes, including health and regeneration options. | Removes shield-break AoE upgrades for all classes, buffs shield-break damage and triples the HP upgrade. |
| asch_P | Adds an impact-damage upgrade for the Engineer's PGL. | Raises the PGL’s Spiky Grenade upgrade bonus to 890 direct damage. |
| AutoPlatformGun | Makes the Platform Gun fire automatically. | Makes the Platform Gun fully automatic at two shots per second and removes its rate-of-fire upgrade choice. |
| AutoPlatformGunAntiSchmorp | Alternative automatic Platform Gun implementation. | Makes the Platform Gun fully automatic at 1.5 shots per second and removes its rate-of-fire upgrade choice. |
| BackToRig | Adds an action to return from a mission to the Space Rig. | Adds a “Back to Rig” action to end the mission and return to the Space Rig. |
| backup_FSD-WindowsNoEditorU39去除霰射吐株、荆棘丛、脓毒粒子 | Adds custom assets for backup FSD Windows No Editor U39去除霰射吐株、荆棘丛、脓毒粒子. | Strips multiple enemy and hazard particle effects, including Barrage Infector, Lobber, Bramble, and Exploding Goo Plant effects. |
| balance | Rebalances and extends weapon overclocks and upgrades, including Coil Gun content. | Adds around 120 custom weapon overclocks and their schematics, while rebalancing weapon stats and upgrade values across many classes. |
| Better_Cavegen | Replaces mission cave-generation presets with larger and more varied layouts. | Reworks cave-generation and mission-room presets, with changes to biome foliage density. |
| BetterLokIndicatorBlue | Changes the LOK-1 lock-on beam indicator to blue. | Recolors the Better LOK-1 lock-on beam indicator blue. |
| BetterLokIndicatorCyanFix | Changes the LOK-1 lock-on beam indicator to cyan. | Recolors the Better LOK-1 lock-on beam indicator cyan. |
| BetterLokIndicatorMagenta | Changes the LOK-1 lock-on beam indicator to magenta. | Recolors the Better LOK-1 lock-on beam indicator magenta. |
| BetterLokIndicatorPink | Changes the LOK-1 lock-on beam indicator to pink. | Recolors the Better LOK-1 lock-on beam indicator pink. |
| BetterLokIndicatorPurple | Changes the LOK-1 lock-on beam indicator to purple. | Recolors the Better LOK-1 lock-on beam indicator purple. |
| BetterLokIndicatorWhite | Changes the LOK-1 lock-on beam indicator to white. | Recolors the Better LOK-1 lock-on beam indicator white. |
| BetterLokIndicatorYellow | Changes the LOK-1 lock-on beam indicator to yellow. | Recolors the Better LOK-1 lock-on beam indicator yellow. |
| BetterNades | Reworks grenade behavior and upgrades, including cluster, incendiary, HE, and boomerang grenades. | Reworks grenades: 25-fragment clusters, faster bigger HE with friendly fire, fire-damage incendiaries, 500-damage kinetic stickies. |
| BetterRevolver | Adds an alternative Bulldog Revolver weapon setup. | Reworks the Bulldog firing cue with a simpler close-range graph. |
| BetterShieldBubble | Reworks the shield bubble material, mesh, and wipe effect. | Re-skins the shield bubble with sunflower tiles. |
| BetterShieldBubbleNoWipe | Reworks the shield bubble visuals and removes the wipe effect. | Re-skins the shield bubble with sunflower tiles and removes the wipe effect. |
| bettershieldbubblewithwipe | Reworks the shield bubble visuals while keeping the wipe effect. | Re-skins the shield bubble with sunflower tiles while keeping the wipe effect. |
| BetterTerminal | Reworks terminal upgrade and overclock entries and their descriptions. | Replaces Build Terminal flavor text for upgrades, overclocks, and grenades with Karl.gg or Official Wiki text. Weapon and perk descriptions remain unchanged; rebalance mods may conflict (Mint priority -1). |
| BHFixTest_P | Test fix for the Minigun's BH/overclock behavior. | Test tweak: the Minigun can no longer hit its owner and manual-heat handling is removed. |
| Big_Dig_Boi_-_Extra | Changes weapon, upgrade, or overclock data for Big Dig Boi Extra. | Adds complementary Big Dig Boi settings with pickaxe dig-size presets of 200, 250, and 270; the author says only the host needs it. |
| Big_Dig_Boi_-_Profiles | Adds custom assets for Big Dig Boi Profiles. | Bundles 10 standalone Big Dig Boi profiles, including Dig Bigger Holes, Underhill Deluxe, Speedy Smol Sons, Blackout Stout, and Hypocritas Edition. |
| Big_Dig_Bois_AIO_Bonanza__1000__8_27_2026_11_24_PM | Adds custom assets for Big Dig Bois AIO Bonanza 1000 8 27 2026 11 24 PM. | Big Dig Boi AIO variant that sets the pickaxe dig size to 1000. |
| Big_Dig_Bois_AIO_Bonanza__180__8_27_2026_10_59_PM | Adds custom assets for Big Dig Bois AIO Bonanza 180 8 27 2026 10 59 PM. | Big Dig Boi AIO variant that sets the pickaxe dig size to 180. |
| Big_Dig_Bois_AIO_Bonanza__225__8_27_2026_11_16_PM | Adds custom assets for Big Dig Bois AIO Bonanza 225 8 27 2026 11 16 PM. | Big Dig Boi AIO variant that sets the pickaxe dig size to 225. |
| Big_Dig_Bois_AIO_Bonanza__325__8_27_2026_11_22_PM | Adds custom assets for Big Dig Bois AIO Bonanza 325 8 27 2026 11 22 PM. | Big Dig Boi AIO variant that sets the pickaxe dig size to 325. |
| Big_Dig_Bois_AIO_Bonanza__8_27_2026_1_04_AM | Adds custom assets for Big Dig Bois AIO Bonanza 8 27 2026 1 04 AM. | Bundles nine separate Big Dig Boi variants for Dig Bigger Holes, Underhill Deluxe, One Hit Wonder, Rocky Mountain Ale, Speedy Smol Sons, and Blackout Stout. |
| Big_Dig_Bois_AIO_Bonanza__9001__8_27_2026_11_27_PM | Adds custom assets for Big Dig Bois AIO Bonanza 9001 8 27 2026 11 27 PM. | Big Dig Boi AIO variant that sets the pickaxe dig size to 9001. |
| bigger_black_box_bubble | Adds custom assets for bigger black box bubble. | Enlarges the Salvage defense bubble in three sizes with all-overlap triggers. |
| BiomassNoCD | Removes the cooldown from the Heavy Particle Accelerator's Biomass effect. | Sets Heavy Particle Cannon minimum time between Biomass gains to 0, removing its cooldown. |
| Biomes_Evolution | Adds evolved Mactera variants, including electric shooters and projectiles. | Adds elemental Mactera, Woodlouse, and Shooting Plant variants, plus a Rock Bomber and matching projectiles. |
| BlackEPC | Recolors EPC firing, projectile, and heat effects black. | Recolors the EPC muzzle, charged-shot, overheat, and projectile effects black. |
| blackgraydarkdescent | Recolors the Dark Descent global skin material black and gray. | Recolors the Dark Descent armor skin near-black and gray. |
| bluebettershieldbubblenowipe | Recolors the shield bubble blue and removes its wipe effect. | Re-skins the shield bubble blue with sunflower tiles and removes the wipe effect. |
| BlueBreachCutter | Recolors the Breach Cutter beam and impact effects blue. | Recolors the Line Cutter from magenta to blue across weapon, projectile and particles. |
| BlueEPC | Recolors EPC firing, projectile, and heat effects blue. | Recolors the EPC muzzle, charged-shot, overheat, and projectile effects blue. |
| BluePhaseBomb | Recolors Facility phase-bomb and weakpoint effects blue. | Recolors the Facility phase bomb and explosion range indicators blue. |
| BlueSand | Recolors Sandblasted Corridors terrain blue. | Recolors Sandblasted Corridors Rock01 wall, floor and subsurface tints from orange-brown to cyan-blue. |
| BlueSentryIndicators | Recolors Sentry Gun range and EMP indicators blue. | Shows the sentry range sphere and recolors arc and EMP indicators blue. |
| BlueSeptics | Recolors Septic Spreader puddles and materials blue. | Recolors Septic Spreader acid, puddles, glow and projectiles blue and gives puddles trigger overlap. |
| BlueTransparentSkin | Adds a blue transparent skin variant. | Gives armor a blue transparent glass skin at 0.05 opacity. |
| BoykisserClassIcons | Replaces the four class icons with Boykisser artwork. | Replaces the four class icons with Boykisser artwork. |
| BP_Mod_Manager | Adds a mod manager for managing installed mods. | Adds an in-game manager that lists loaded mods, opens their settings pages, and lets players enable or disable mods that allow it; it also manages the menu key and notifications. |
| Breach_Cutter_Mactera | Adds Mactera enemies that use Breach Cutter-style attacks. | Gives all Mactera shooters including Trijaws Breach Cutter projectiles. |
| Breach_Cutter_Mactera_No_Trijaws | Adds Breach Cutter-style Mactera attacks while excluding Trijaws. | Gives Mactera shooters Breach Cutter projectiles, excluding TripleShooter Trijaws. |
| BrighterSentryIndicators | Changes HUD or UI assets for Brighter Sentry Indicators. | Shows the sentry range sphere with brighter magenta-white indicators. |
| BringBackBeerWave | Adds custom assets for Bring Back Beer Wave. | Restores landmine special events and drops weapon skins from lost packs. |
| BringBackFrozenEnemyParticles | Adds custom assets for Bring Back Frozen Enemy Particles. | Restores frozen-enemy particles suppressed by particle-removal mods; load it above those mods in Mint. |
| BringBackMineralFragments | Adds custom assets for Bring Back Mineral Fragments. | Restores mineral and crystal mining fragments for players using particle-removal mods; load it above them in Mint. |
| BRT_Overhaul | Overhauls the BRT Burst Pistol's upgrades, overclocks, and firing behavior. | Reworks the BRT7 Burst Fire Pistol into a close-range, shotgun-style secondary, with redesigned upgrades, overclocks, and firing behavior. |
| build-inspector-with-names | Changes cave, terrain, or biome content for build inspector with names. | Edits Build Inspector so player names appear whenever there is more than one player, making same-class teammates easier to distinguish. |
| bulkrumblefix | Changes audio cues for bulkrumblefix. | Removes the farthest distance layer from the Bulk Detonator explosion sound. |
| BulkTweaks | Tweaks Bulk Detonator behavior. | Buffs Bulk Detonator health and armor across three variants. |
| bulldogcrosshair | Replaces the Bulldog Revolver crosshair. | Hides Bulldog crosshair parts offscreen. |
| bulldogcrosshairgreen | Changes the weapon crosshair/UI for bulldogcrosshairgreen. | Moves Bulldog crosshair parts offscreen, leaving a green-tinted remnant. |
| BulldogDotCrosshair | Replaces the Bulldog Revolver crosshair with a dot. | Replaces the Bulldog crosshair with a single dot. |
| BulldogRework | Reworks the Bulldog Revolver's upgrades and overclocks. | Rebalances Bulldog Revolver damage, ammo, spread, upgrades, and overclocks. |
| Bullet_Sponge_P | Makes enemies tougher by increasing their effective health. | Raises Hazard 5 enemy and small-enemy damage resistance to 3.6×; selected large-enemy resistance categories rise to 4.2×. |
| BurpleFlamethrower | Recolors Flamethrower effects purple-blue. | Recolors flamethrower flames burple across muzzle, impact and sticky flames. |
| BuyableBeerResources | Adds custom assets for Buyable Beer Resources. | Adds Trade Terminal pages to buy and sell beer ingredients and Phazyonite. |
| CALLFORMOMMY | Replaces Bosco call-back voice lines with custom audio. | Replaces Bosco’s eight call-back sound cues with custom audio. |
| CANDIDATES | Contains experimental candidate custom-difficulty JSON presets. | Bundles 15 experimental generated custom-difficulty JSON presets, each defining its own enemy roster, wave spawners, pools, resupply rules, and caps. |
| Caretaker | Replaces the Caretaker enemy definition. | Weakens the Caretaker with less health and weakspots plus easier burn and freeze. |
| cave | Replaces mission and cave-generation DNA for Egg, Refinery, Escort, and other missions. | Reworks procedural cave generation across biomes and missions, changing room-query choices, tunnel-noise settings, terrain generation, and extraction layouts. |
| CaveGraphicsBoost | Replaces cave terrain materials and decorative foliage with simple flat materials to target lower GPU material cost. | Replaces selected cave terrain materials with a flatter, neutral surface material. |
| CaveLeechAudioAdjustments | Adjusts Cave Leech attack, movement, and grab audio. | Replaces Cave Leech movement, arm-movement, bite, and grab sound cues. |
| CaveLeechCapsuleAttenuation_P | Adjusts Cave Leech movement-audio attenuation. | Gives Cave Leech movement its own attenuation and lowers volume (1.75 to 1.2). |
| CaveLeechSound_P | Adjusts Cave Leech movement audio. | Gives Cave Leech movement its own attenuation and lowers volume (1.75 to 1.2). |
| CaveUnshittifier1 | Reworks Refinery cave-generation layouts to reduce problematic room layouts. | Tightens Refinery room queries to exclude vertical and mini-level rooms. |
| CCCallMule | Adds a chat command for calling the M.U.L.E. | Adds chat commands to call the M.U.L.E. and request a resupply. |
| CCStartingNitra | Adds starting Nitra to missions. | Lets the host set a starting Nitra amount per difficulty through chat; missions begin with that much extra Nitra. |
| cd1-client | Client-side Custom Difficulty 1 framework and utility assets. | Enables the CD1 custom-difficulty framework when you join a lobby running CD1; it does nothing in other lobbies and works without the original CD1 pak. |
| CD2CustomSFX | Adds custom sound effects for Custom Difficulty 2 enemies and attacks. | Bundles hundreds of sound samples and matching sound cues, organized into source folders including Vermintide 2, Little Nightmares, Donkey Kong 64, and Donkey Kong Jungle Beat. |
| CDCompat-0.2.0-alpha.4-drg0923 | Adds a Custom Difficulty engine selector and supporting CD1/CD2 integration for the 2026-09-23 DRG build. | Integrates the CD1 and CD2 custom-difficulty engines behind an in-game engine and difficulty selector; this experimental build targets the 2026-09-23 game update. |
| ChatEmbiggener | Increases chat text and UI size. | Adds timestamps to chat messages, widens the chat panel to half the viewport, and expands its message history. |
| ChatMirror | Mirrors chat messages through a custom chat UI. | Adds a separate chat window that mirrors messages and provides text-size controls. |
| CheatManager | Changes cave, terrain, or biome content for Cheat Manager. | Enables the game’s Cheat Manager for Sandbox testing by attaching it to the local player controller. |
| CheckResup | Adds a chat command for checking resupply status. | Server-side chat messages announce when a resupply is available at the configured nitra cost, report a modified cost, and say when no more resupplies are possible. |
| CigarGunsling | Replaces weapon inspect/gunsling animations with cigar-themed animations. | Replaces weapon-inspect animations with cigar-smoking routines in first- and third-person views. |
| CigarGunsling_Lowered | Replaces weapon inspect/gunsling animations with lowered cigar-themed animations. | Adds cigar-smoking weapon-inspect animations and lowers the weapon during inspections in first and third person. |
| CigarRevive | Replaces revive animations with cigar-themed animations. | Replaces the revive-drink canteen animation with a longer cigar-smoking animation. |
| CleanerPauseMenu | Cleans up the pause menu and status screen. | Makes the pause menu less opaque and blurred, hides DLC, merchandise and modding buttons, and removes the season logo and smoke. |
| CleanerShieldBubble | Uses a cleaner shield bubble material. | Calms the shield bubble: displacement intensity 30 to 10 and wipe speed 50 to 10. |
| clientaxefix | Changes weapon, upgrade, or overclock data for clientaxefix. | Fixes client-side Driller axe bouncing; the host must install it. Axes still bounce off dwarves, drop pods and resupplies. |
| clientaxefix_stickier | Fixes thrown-axe sticking behavior and makes axes stick more reliably. | Host-required fix for client Driller axe bouncing, using the author’s stickier alternative. |
| clutterbegone | Removes or reduces cave clutter, decals, and debris. | Hides cave visuals by assigning its translucent m_invis material to 70 foliage, debris, and plague meshes, and removing material-parent overrides from biome and decal assets. |
| CM15ColdTest | Test change for Zhukov Cryo Minelets' trigger and cold behavior. | Test build with faster Cryo Minelet arming and more damage. |
| CoilGunBalance-0.6StunR_P | Rebalances Coil Gun width, fear, stun, and projectile behavior (0.6 stun revision). | Rebalances the Coil Gun like CoilGunBalance_P but with a narrower 2m shockwave (150 to 60). |
| CoilGunBalance_P | Rebalances Coil Gun width, fear, stun, burn, and projectile behavior. | Rebalances the Coil Gun: hotter longer charge, slower reload, stronger smaller blasts, guaranteed stun, narrower fear and trails. |
| CoilGunFear2m_P | Sets the Coil Gun's fear radius to 2 metres and adjusts its shot width. | Sets both the Coil Gun’s fear radius upgrade and shockwave range upgrade to 2 metres. |
| CoilgunParticles | Changes visual effects for Coilgun Particles. | Restores the Coil Gun’s particle effects for players who want its visuals while using other particle-removal mods. |
| Collectiblesforsale | Changes HUD or UI assets for Collectiblesforsale. | Makes all four barley collectibles tradable (buy 1000, sell 250). |
| ConflagrationOfTheWicked_English | Adds a fire ammunition overclock for the Minigun. | Adds Flying Dickcat’s Conflagration of the Wicked fire-ammunition overclock for the Minigun. |
| CosmeticRestrictionRemover_P | Removes class and seasonal restrictions from cosmetic armor and materials. | Removes seasonal locks from the four 2023 Oktoberfest class armors and allows alternate armor materials. |
| CppTest_P | Changes cave, terrain, or biome content for Cpp Test P. | Test mod that repeatedly posts “Hello from a C++ generated Blueprint” as an in-game message. |
| Creator | Changes cave, terrain, or biome content for Creator. | Adds an in-game actor-class manager with searchable lists for removing selected classes and adding them back, plus a configurable update delay. |
| CrippledCrawlers | Adds custom assets for Crippled Crawlers. | Reduces Core Spawn Crawler melee base damage from 9 to 6. |
| CrossbowUnfucker | Reworks Crossbow bolts and upgrades, including reload, cryo, and pheromone behavior. | Makes the crossbow full-auto at 20 shots/s with fast reload, hotter shorter cryo and harsher penalties. |
| CrossHairmo | Adds ammo and health information to the crosshair HUD. | Adds movable ammo and health counter widgets at the crosshair with position settings. |
| Crosshairs | Replaces weapon crosshairs with a custom crosshair set. | Centers and standardizes weapon crosshairs with uniform opacity. |
| Cull4 | Culls selected enemy actors and effects to reduce performance cost. | Shortens draw distances for many enemies, including spider variants, Woodlice, Jellyfish, and enemy spawners; it also adjusts selected enemy mesh and material assets. |
| custom-difficulty2 | Custom Difficulty 2 framework and content pack. | Lets players create, save, delete, and select custom difficulty profiles using mutators for enemy and player settings and spawn behavior; includes an in-game difficulty editor. |
| custom_C4_particle | Adds custom assets for custom C4 particle. | Replaces the C4 explosion particle with an edited Turret Whip particle effect. |
| Custom_Enemy_Cap | Changes the maximum number of enemies that can spawn. | Adds configurable enemy and swarmer caps with HUD counts; the host removes excess enemies and can lower the caps when frame rate drops. |
| CustomCaveLayouts | Adds selectable custom cave-layout presets and hot-drop settings. | Adds custom procedural cave layouts; newer builds also provide Mod Hub controls for mission layouts, starting rooms, and hot drops. |
| customcavelayouts01 | Adds one custom cave-layout preset. | Adds an alternate procedural cave generator that selects rooms from mission DNA and branches on mission length. |
| CustomCaveLayouts43 | Adds custom assets for Custom Cave Layouts43. | Adds custom cave rooms and retags existing rooms as CustomBig or CustomMedium so the Custom Layouts pool can select them. |
| CustomCaveLayouts43.pak | Adds custom assets for Custom Cave Layouts43. | Adds Mod Hub controls for selecting mission layouts, starting rooms, and hot drops, and retags cave rooms into custom size pools for procedural generation. |
| customcavelayouts_general_10.pak | Adds custom assets for customcavelayouts general 10. | Adds a Mod Hub page for choosing custom cave layouts and mission room-generation options across multiple mission types. |
| customcavelayouts_general_11.pak | Adds custom assets for customcavelayouts general 11. | Adds a Mod Hub page for choosing custom cave layouts and mission room-generation options across multiple mission types. |
| CustomCaveLayouts_General_16 | Adds custom assets for Custom Cave Layouts General 16. | Adds alternate cave layouts for multiple mission types, with a Mod Hub page to select options; it replaces mission-room query sets for missions such as Egg Hunt, Escort, Refinery, and Salvage. |
| CustomCaveLayouts_General_16.pak | Adds custom assets for Custom Cave Layouts General 16. | Adds a Mod Hub page for choosing custom cave layouts and mission room-generation options across multiple mission types. |
| CustomCaveLayouts_General_18.pak | Adds general custom cave-layout presets for set 18. | Adds a Mod Hub page for choosing custom cave layouts and mission room-generation options across multiple mission types. |
| CustomCrosshairImport | Changes the weapon crosshair/UI for Custom Crosshair Import. | Lets you use an image file as your crosshair, with size and opacity settings. |
| Customizable_Weapon_FOV | Adds saved per-weapon first-person field-of-view settings. | Adds a keybind-opened widget to adjust weapon viewmodel FOV and position, with presets. |
| Customizable_Weapon_Viewmodel_FOV | Adds custom assets for Customizable Weapon Viewmodel FOV. | Adds an in-game editor for per-weapon viewmodel offsets, with saved presets and X/Y/Z controls. |
| CustomPlayerTitle | Adds a custom player-title selector and saved title. | Adds a Mod Hub page to enter and save a custom player title. |
| customrooms | Adds a large set of custom mission rooms and layout DNA. | Adds custom procedural cave-room sets by redirecting mission DNA to custom size tags and updating room generators and starting-room pools; details vary across builds. |
| customrooms_24 | Adds custom mission rooms and layout DNA for room set 24. | Adds custom procedural cave rooms and redirects mission DNA queries to CustomSmall, CustomMedium, and CustomBig room tags. |
| customrooms_26_mixed | Mixed custom room/layout pack for set 26. | Adds custom cave rooms to the Extraction linear and Motherlode/Star room pools. |
| customrooms_30_mixed | Mixed custom room/layout pack for set 30. | Adds mixed custom cave rooms to the Extraction linear, Deep Scan tunnel-web, and Motherlode/Star room pools. |
| customrooms_33_mixed | Mixed custom room/layout pack for set 33. | Adds mixed custom cave rooms to the Extraction, Deep Scan, and Motherlode/Star pools, with updated room tags and generator layouts. |
| customrooms_47_mixed | Mixed custom room/layout pack for set 47. | Adds mixed custom cave rooms to the Extraction linear room pool. |
| customrooms_50.pak | Adds custom mission rooms for room set 50. | Adds custom procedural rooms and routes Extraction, Salvage, and Motherlode/Star generation to those room sets; Escort shaft rooms are tagged for the custom Escort pool. |
| customrooms_50_mixed | Mixed custom room/layout pack for set 50. | Adds mixed custom cave rooms to the Extraction linear room pool. |
| customrooms_54_mixed | Mixed custom room/layout pack for set 54. | Adds mixed custom cave rooms to Extraction, Refinery, Salvage, and Motherlode/Star room pools. |
| customrooms_55_fixed_PE | Custom room pack for set 55 with a Point Extraction layout fix. | Adds custom procedural cave rooms, including big rooms and Escort shaft challenges, and updates mission room pools to select custom-tagged rooms. |
| customrooms_55_mixed | Mixed custom room/layout pack for set 55. | Adds mixed custom cave rooms to Extraction, Refinery, Salvage, and Motherlode/Star room pools. |
| customrooms_55_mixed_fixed_PE | Mixed set-55 room/layout pack with a Point Extraction fix. | Adds custom procedural cave rooms and expands room pools for Extraction, Refinery, Salvage, and Motherlode/Star missions. |
| customrooms_60_mixed | Mixed custom room/layout pack for set 60. | Adds mixed custom cave rooms to Extraction, Refinery, Salvage, and Motherlode/Star room pools. |
| customrooms_73.pak | Adds custom mission rooms for room set 73. | Adds custom cave layouts by routing mission DNA to custom size tags and updating shaft-room categories and mission room pools. |
| customrooms_73_combined.pak | Adds combined custom mission rooms for room set 73. | Adds custom cave rooms, retags vanilla rooms into custom size pools, and gives linear Extraction a 1,699-room generator pool. |
| customrooms_73_mixed.pak | Adds mixed custom mission rooms for room set 73. | Adds custom cave rooms, retags vanilla rooms into custom size pools, and gives linear Extraction a 558-room generator pool. |
| customrooms_big | Large custom mission-room and layout pack. | Adds custom cave rooms, redirects mission DNA to custom size tags, and changes Extraction, Deep Scan, and Motherlode/Star room pools. |
| CustomRoomsEscortUnlocker | Unlocks the longer and more complex Escort mission rooms. | Unlocks custom Escort rooms in medium and long missions. |
| CustomRoomsRefineryUnlocker | Unlocks the medium and complex Refinery rooms. | Unlocks custom Refinery rooms by retargeting medium and complex room queries. |
| CustomTerrainSettings | Adds settings for terrain materials, hits required, and pickaxe dig size. | Adds a searchable UI to customize terrain material properties such as explosion-proof, hits needed and pickaxe size. |
| Cyan_MCAO | Recolors the electric-platform/ambient effect cyan. | Replaces the electric-platform effect with a minimal cyan set. |
| CyanBreachCutter | Recolors the Breach Cutter beam and impact effects cyan. | Recolors the Line Cutter cyan across weapon, projectile and particles. |
| CyanEPC | Recolors EPC firing, projectile, and heat effects cyan. | Recolors the EPC muzzle, charged-shot, overheat, and projectile effects cyan. |
| CyanSentryIndicators | Recolors Sentry Gun range and EMP indicators cyan. | Shows the sentry range sphere and recolors indicators cyan. |
| Cyber_Plat | Replaces weapon reload/melee audio and adds controller vibration settings. | Replaces the Engineer Platform Gun’s placement, firing, and reload sounds with custom samples. |
| Damage_Overlay_Removal | Changes cave, terrain, or biome content for Damage Overlay Removal. | Removes blood, leech, electric, generic, infected, pheromone, radiation, shield and web damage overlays. |
| DamageText | Displays configurable damage numbers over enemies. | Adds configurable damage numbers, per-dwarf damage tracking, mission damage totals, and resupply counters. |
| darkChocolate_a11 | Adds the Dark Chocolate weapon set and inventory entries for all classes (a11). | Adds Dark Chocolate weapon and item entries to all four class inventories. |
| darkChocolate_a22 | Adds the Dark Chocolate weapon set and inventory entries for all classes (a22). | Adds Dark Chocolate weapon and item entries to all four class inventories; this version also adds Concussion, Floodlight, Pheromone, and Turret grenade entries. |
| darkergs | Darkens the Glacial Strata/Ice Caves rock material. | Darkens Glacial Strata rock wall fresnel and tints toward deep blue. |
| DarkFlamethrower | Recolors flamethrower flame and impact effects dark. | Switches flamethrower flame materials to the blue burst variant. |
| dashable | Makes the Dash perk available in more movement situations. | Removes Dash’s exclusivity with movement-speed bonuses, letting Dash stack with Scout speed boosts. |
| DEA_a | Adds Donnie's Enemy Addon variants, including colored and modified grunts and spitters. | Adds Donnie’s Enemy Addon variants, including Glasher, Guardian, and Clubber Grunts, modified Spitters and Shooters, and alternate Mactera and Bomber types. |
| DEA_a01 | Adds custom assets for DEA a01. | Adds 13 custom enemy variants: a Glasher Grunt, colored/stagger Spitters, Bouncer/Ice/Spawner Shooters, a Slobber, Trundle Mactera, Grooter, Fanatic, and Shotgun Menace. |
| DEA_a01_jpg | Adds custom assets for DEA a01 jpg. | Adds custom enemy variants, including Glasher, colored and stagger spitters, several shooters, Trundle, Grooter, and Fanatic types. |
| DEA_a02 | Adds custom assets for DEA a02. | Adds custom enemy variants including Glasher, colored and stagger Spitters, new Shooters and Mactera, Trundle, Grooter, Fanatic, Sprout, and Stabber Vine. |
| DEA_a03 | Changes enemy definitions or variants for DEA a03. | Adds custom enemy variants, including Glasher, Spitter and Shooter types, Mactera and Bomber variants, Woodlouse Shooter, Drone Breeder, Sprout, and Stabber Vine. |
| DEA_a05t1 | Adds the Donnie's Enemy Addon t1 enemy variant set. | Adds custom enemy variants including Glasher, Guardian, Clubber, colored Spitters, new Shooters, Mactera, Grooters, Fanatics, and Shooting Plants. |
| DEA_a05t2 | Adds the Donnie's Enemy Addon t2 enemy variant set. | Adds custom enemy variants including Glasher, Guardian, Clubber, colored Spitters, new Shooters, Mactera, Grooters, Fanatics, and Shooting Plants. |
| DEA_b | Adds the Donnie's Enemy Addon b enemy variant set and acid projectiles. | Adds Donnie’s Enemy Addon variant set B, with many custom creature variants and an Acid Bomber that fires projectiles and leaves acid puddles. |
| Deep_Dive_Carry | Changes Deep Dive carry rules. | Sets enemy-count, damage, and large-enemy resistance scaling to the four-player values across standard Hazard 3–5 and Deep Dive Hazard 3.5–5.5; renames Hazard 5 to “Carry5”. |
| Deep_Dive_Carry_x2_Enemies | Changes Deep Dive carry rules and doubles enemy counts. | Raises enemy-count scaling to about 2.8–3× across Hazard 5 and Deep Dive Hazard 4.5–5.5, while flattening enemy damage and large-enemy resistance to the four-player values. |
| DefenderHawkeyeSentries | Changes Defender Sentry's focused-fire upgrade for precision targeting. | Expands the Defender upgrade with manual laser-pointer targeting plus range, rotation and burst-cooldown effects. |
| Destroyer | Adds the Destroyer mod's custom gameplay actor. | Randomly destroys a level actor every 5 or 30 seconds, depending on the archive variant; the slower variant logs the actor name. |
| DevConsole | Adds developer-console access in missions and the Space Rig. | Adds keyboard shortcuts for Unreal game/unit performance overlays and stat-file recording in missions and the Space Rig. |
| DimBlueFlame | Dims the flame effects and tints them blue. | Halves fire and explosion texture resolution (2048 to 1024), including blue flames. |
| DimBurpleFlame | Dims the flame effects and tints them burple. | Halves fire and explosion texture resolution and tints flames burple. |
| DimCyanFlame | Dims the flame effects and tints them cyan. | Halves fire and explosion texture resolution and tints flames cyan. |
| DimGreenFlame | Dims the flame effects and tints them green. | Halves fire and explosion texture resolution and tints flames green. |
| DimLimeFlame | Dims the flame effects and tints them lime. | Halves fire and explosion texture resolution and tints flames lime. |
| DimmerIncendiary | Adds custom assets for Dimmer Incendiary. | Makes incendiary explosions use the plain explosion material with a smoke texture. |
| DimOrangeFlame | Dims the flame effects and tints them orange. | Halves fire and explosion texture resolution and tints flames orange. |
| DimPinkFlame | Dims the flame effects and tints them pink. | Halves fire and explosion texture resolution and tints flames pink. |
| DimRedFlame | Dims the flame effects and tints them red. | Halves fire and explosion texture resolution and tints flames red. |
| DimWhiteFlame | Dims the flame effects and tints them white. | Halves fire and explosion texture resolution and tints flames white. |
| DimYellowFlame | Dims the flame effects and tints them yellow. | Halves fire and explosion texture resolution and tints flames yellow. |
| DisableButterFingers | Disables forced item drops from the Butter Fingers effect. | Raises the fall-speed threshold for dropping carried objects, preventing ordinary falls from forcing a drop. |
| DisplayEvents | Adds custom assets for Display Events. | Adds a customizable HUD strip for cave events and collectibles, with icon, orientation, position, scale, and opacity controls. |
| DOA | Changes cave, terrain, or biome content for DOA. | Adds 30 custom overclock upgrades and schematics for weapons and equipment, including Advanced Combat Module, Barrier System, Cryo Nade Launcher, and Tuned Platform. |
| DontCaretaker | Removes the Caretaker encounter. | Lowers the volume of 12 Caretaker cues, including wake-up, pain, and death sounds; the changed cue multipliers range from 0.3 to 0.6. |
| Double_AMMO_PGL_P | Doubles the Engineer PGL's ammunition. | Doubles PGL ammo (8 to 16) and reworks the LOK slow-on-lock penalty. |
| DRAKIndicator | Changes the weapon crosshair/UI for DRAKIndicator. | Adds a DRAK-25 overheat indicator to the crosshair, showing heat and estimated shots remaining. |
| DRAKIndicator_v0.1.1S | Adds a heat/ammo indicator for the DRAK Plasma Carbine. | Adds a DRAK-25 overheat indicator to the crosshair, showing heat and estimated shots remaining. |
| DRGLogger | Adds mission, session, player, and event logging. | Logs match events, kills, downs and revives with enemy/player watchers and optional auto-upload. |
| DrillAnimationChange | Changes first-person drill drilling animations. | Speeds up first-person drill animations 4x (sequence length 1s to 0.25s). |
| Drilldozer_Hack-C_No_FF_Dmg | Adds custom assets for Drilldozer Hack C No FF Dmg. | Removes friendly fire on the Drilldozer and Hacking Pod (0.1 to 0). |
| DrillsTest | Test pack for drill behavior and animation. | Adds F1/F2 drill measurements for velocity, distance, mining rate, fuel use, heat, and drill speed. |
| Drone_Breeders | Adds drone breeder enemies and homing drones. | Makes Jelly Breeders spawn homing drones instead of eggs, using a packaged homing-drone projectile. |
| DropPodCompleteShusher | Silences drop-pod idle and arrival ambience. | Silences drop-pod idle and arrival ambience (volumes to 0). |
| droppodimmunity | Makes players immune inside the Drop Pod. | Reduces damage taken inside the Drop Pod about 100-fold, for near-immunity. |
| DwarfCollision | Changes dwarf-to-dwarf collision. | Fixes dwarf hitbox collision that can let you enter a small gap but prevent you from getting back out. |
| DynamicWeaponAndLightingModifications_English | Adds dynamic weapon and lighting customization settings. | Adds saved Mod Hub controls for weapon stats, flashlights, and flares, including recoil, fire rate, ammo, heat, light range, and flare cooldown. |
| EboniteTweaks | Tweaks Ebonite Glyphid and Ebonite Bulk behavior. | Makes Ebonite enemies damageable with more health and deeper physical weakness. |
| ED_Spider_Tank_HeavySpawn | Adds a heavy Spider Tank spawn variant. | Adds a Glyphid Sentinel heavy Spider Tank spawn definition, with a 120 difficulty rating, one minimum spawn, and a 300-unit spawn spread. |
| EEE | Adds the Extreme Enemy Evolution framework and enemy variants. | Adds a large roster of custom enemy types and variants, including modified spiders, specialized shooting plants, custom Nexuses, and enemy breeders. |
| elecbluebettershieldbubblenowipe | Changes visual effects for elecbluebettershieldbubblenowipe. | Re-skins the shield bubble electric-blue with sunflower tiles and removes the wipe effect. |
| Electrobegone | Adds custom assets for Electrobegone. | Lowers Electric Plant health from 350 to 10 so a single hit destroys it. |
| EliminationWithPressureWaves | Adds pressure waves to Elimination missions. | Adds a continuous Spider Motherlode wave controller to Elimination missions with no startup delay. |
| EliminationWithWaves | Adds enemy waves to Elimination missions. | Re-enables normal and scripted enemy waves during Elimination missions. |
| ElytrasModManager | Adds the shared local/replicated mod-manager framework used by other mods. | Provides Elytra’s shared mod framework: Mod Hub configuration pages, typed option registration, save/state helpers, and local or replicated singleton utilities. |
| End_music | Adds custom assets for End music. | Replaces evacuation end-of-wave music with a Smeshariki cartoon track (about 2 minutes). |
| Enemy_HP_Tint | Tints enemies according to their current health and saves the setting. | Tints enemies by remaining health with configurable colors and thresholds. |
| EnemyCull5 | Culls selected enemy actors and effects to improve performance. | Shortens draw distances for many enemies, including spider variants, Woodlice, Jellyfish, and enemy spawners; it also adjusts selected enemy mesh and material assets. |
| EnemyCullLPEOnlyTrash | Culls low-priority enemy trash while preserving larger enemies. | Culls only low-priority trash enemies and bundles Low Poly Enemies assets; this is a fork of Enemy Cull. |
| EnemyCullNoLPE | Culls common enemy actors without the low-priority-enemy filter. | Shortens render distance for several enemies and a Spider spawner, including Grunts, Swarmers, and Mactera. |
| EnemyCullNoLPEOnlyTrash | Culls selected enemy trash without the low-priority-enemy condition. | Caps render distance on swarm trash enemies for performance (grunts 3800, swarmers 2750). |
| EnemyDeathOverlapFix | Fixes overlapping enemy-death sound effects. | Raises enemy-death sound concurrency from 3 to 10 overlapping voices, reducing cut-out. |
| EnemyOpt | Adds configurable enemy optimization and culling settings. | Adds a saved enemy frame-rate setting that lowers enemy actor and component tick frequency to reduce update cost. |
| EnemyPerfBoost | Throttles distant enemy and animation updates based on distance and visibility to reduce CPU work. | Reduces update work for distant, off-screen Pathfinder enemies by slowing their actor, movement, and animation ticks. |
| EngineerOverhaul | Overhauls Engineer weapons, upgrades, overclocks, and player effects. | Rebalances weapon stats and upgrade tiers across multiple weapons, changing values such as ammo, damage, handling, and weapon effects. |
| EngineerOverhaulLOK1Only | Applies the Engineer overhaul only to LOK-1 upgrades and overclocks. | Rebalances only the LOK-1, with faster and longer-range locks, higher base damage, and revised lock-based upgrades and overclocks. |
| EnnBiomeSchrompv7.1Toggleable | Adds toggleable biome, cave-noise, and biome-enemy changes (v7.1). | Adds a Mod Hub toggle between the Schmorp and vanilla biome settings, with custom cave layouts and reactive-terrain effects. |
| Enns_Biome_Schmorp | Adds biome, cave-noise, and biome-enemy changes. | Raises Nitra-generation odds in Magma, Shallow, and Ossuary biomes, and removes native stationary spawns from Ossuary so Custom Difficulty 2 can manage them. |
| epc_Remove_all_particles | Removes EPC muzzle, projectile, hit, and heat particles. | Strips EPC muzzle, charging, overheat and impact particles down to a single emitter each. |
| epc_Remove_P_electric_a | Removes the EPC electric-arc particle. | Removes the EPC electric-arc particle. |
| epcnospreadrecoil | Removes EPC spread and recoil. | Removes EPC spread and recoil (pitch/yaw 30 to 0, spread 1 to 0). |
| epcnospreadrecoilff | Removes EPC spread and recoil, including charged-shot behavior. | Removes EPC spread, recoil and friendly fire. |
| EventEraser | Disables selected mission events and saves the setting. | Adds a settings UI to disable seasonal and special events such as Nemesis, Jet Boots, Lost Pack and Cargo Crate. |
| EveryoneSoundsLikeDoomSlayer | Replaces dwarf voice lines with Doom Slayer-style voice audio. | Deepens all dwarf voice pitches, Driller most of all. |
| EveryoneSoundsLikeDriller | Makes every dwarf use Driller voice lines. | Lowers Engineer, Gunner and Scout voice pitch to Driller’s 0.8 level. |
| expandedmissions | Expands the available mission and planet-zone setup data. | Removes mission restrictions and sets 6-7 missions per zone. |
| ExpAutocannon_P | Adds experimental Autocannon upgrades and overclocks. | Adds experimental Autocannon upgrades and overclocks, narrows its base spread, and removes the weapon's direct-hit stagger duration. |
| ExtractionWithWaves | Adds enemy waves to Extraction missions. | Restores normal and scripted wave scheduling during Extraction missions. |
| FalloutFontRecreation | Changes HUD or UI assets for Fallout Font Recreation. | Replaces UI composite fonts with single Fallout-style typefaces. |
| FasterPraetGas | Speeds up Praetorian gas-cloud behavior. | Makes acid gas clouds reach full strength almost instantly (warmup 10s to 0.1s). |
| FasterResupplies_FixedVersion_P | Speeds up resupply interactions and fixes the earlier version. | Speeds resupplies (4s to 2.67s) and reworks Resupplier perk to health-only. |
| FatBoyChanges | Changes Fat Boy ammunition, damage, and radiation behavior. | Nerfs Fat Boy: removes the +300% damage bonus with a harsher ammo penalty and weaker faster radiation. |
| FatboyFriendlyFireRemover | Removes Fat Boy radiation friendly fire. | Adds a no-friendly-fire effect to Fat Boy and zeroes its radiation damage to players. |
| FBS_1 | Adds the FBS gameplay actor and mission hook. | Adds a sphere actor at each Fat Boy radiation-cloud location and keeps it until that cloud’s lifetime ends. |
| FireBomberPrjVisibility | Makes Fire Bomber projectiles and ground fire more visible. | Makes Fire Bomber projectiles and bomb drops glow with bright Spaceball emissive materials. |
| FixedSatchelChargeCollision | Fixes Satchel Charge collision. | Switches Satchel Charge collision to a Custom profile that blocks WorldDynamic and stops overlapping penetrating hitscan. |
| FixMacteraProjectileTrailNotShowing | Restores missing Mactera and rival projectile trails. | Restores visible projectile trails removed by particle-removal mods, helping track Mactera shots and judge their trajectories. |
| FixMyMarriage | Adds no gameplay changes. | The package is empty; UnrealPak lists zero files. |
| FlameThrowerOverhaul | Overhauls Flamethrower upgrades, heat, damage, ammo, and sticky-fire behavior. | Rebalances Flamethrower: direct damage 11→12, explosive-target radial damage 55→27.5, projectile hold time 0.4→0.833s, and sticky flames last 5s. |
| FlammableGasFix | Adds custom assets for Flammable Gas Fix. | Bundles Steeve visibility improvements with a pak that reverts the Praetorian gas fix. |
| flarecleanuplagfix | Fixes flare cleanup behavior to reduce flare-related lag. | Periodically destroys inactive flare actors and disables their ticks to clear spent flares from the level. |
| FlatFlashlight | Replaces the flashlight texture with a flat light pattern. | Removes flashlight texture clamping for a flatter, wider light cone. |
| FlyingDickcats_Polaris_English | Adds the Polaris ice weapon/overclock assets. | English text translation for Flying Dickcat’s Polaris ice weapon and overclock; the author says the translation used Google Translate and guesswork. |
| fmparticles | Changes drone-revive explosion particles. | Restores the fear-triggering cloud burst after a successful Field Medic revive; load it above particle-removal mods. |
| Foober_Fix | Fixes bomber and explosion projectile particles. | Enlarges Fire Bomber projectiles and removes the generic explosion burst. |
| FPM | Adds the FPM gameplay package. | Tracks frame-time spikes and periodically writes the time, frame count, and largest recorded dip in milliseconds to a local text file. |
| FpsOnDemand | Adds an on-demand FPS display with saved settings. | Adds a hotkey menu for changing graphics quality, resolution scale, and the FPS cap. |
| friendlyfungusgeyser | Changes cave, terrain, or biome content for friendlyfungusgeyser. | Disables Fungus Bogs geyser damage and makes the interval between eruptions extremely long. |
| friendlyfungusgoo | Changes cave, terrain, or biome content for friendlyfungusgoo. | Removes the movement slowdown caused by Fungus Bogs sticky goo. |
| FriendlyStickyMines | Prevents Sticky Mines from damaging teammates. | Removes friendly fire from Sticky Mines (modifier 0.5 to 0). |
| frostbombervisibility | Adds custom assets for frostbombervisibility. | Disables Frost Bomber ice-pool burst particles (bursts to 0). |
| FSD-WindowsNoEditor | Base Deep Rock Galactic game-content archive, not a standalone mod. | Archive of Deep Rock Galactic cooked game assets, including enemy, weapon, environment, and mission content; it is not a standalone gameplay mod. |
| FSD-WindowsNoEditor 实 提高帧率 核弹屏蔽光效_P | Adds custom assets for FSD Windows No Editor 实 提高帧率 核弹屏蔽光效 P. | Removes the light emitted by Fat Boy’s lingering radiation cloud. |
| FSD-WindowsNoEditor-照明枪亮度和范围增加 | Adds custom assets for FSD Windows No Editor 照明枪亮度和范围增加. | Increases Scout flare brightness and extends its light radius from 35 to 75 metres. |
| FSD-WindowsNoEditor[客机]去除长时电浆粒子效果 | Adds custom assets for FSD Windows No Editor[客机]去除长时电浆粒子效果. | Hides the lingering particle effect from the EPC’s Persistent Plasma overclock. |
| FSD-WindowsNoEditor_low_poly_u39 | Low-poly Deep Rock Galactic game-content archive for Update 39. | Simplifies Update 39 enemy and objective meshes, including the Caretaker, leeches, jellyfish, plants, woodlice, and spiders. |
| FSD-WindowsNoEditorU39去机炮特效_P | Adds custom assets for FSD Windows No Editor U39去机炮特效 P. | Removes Autocannon particle effects, including casing, shot impact, first/third-person muzzle flashes, Mortar Barrage explosions, and Carpet Bomber effects. |
| FSD-WindowsNoEditorU39去泥土特效(240819)_P | Adds custom assets for FSD Windows No Editor U39去泥土特效(240819) P. | Removes enemy spawn-cloud dust effects. |
| FSD-WindowsNoEditorU39去火箭特效_P | Adds custom assets for FSD Windows No Editor U39去火箭特效 P. | Removes Micro Missile Launcher particle effects, including muzzle, exhaust, trails, impacts, cluster separation, and Butcher Rounds visuals. |
| FSD-WindowsNoEditorU39去除吐丝和蛛网（仅删除蛛网视觉）_P | Adds custom assets for FSD Windows No Editor U39去除吐丝和蛛网（仅删除蛛网视觉） P. | Removes the webbed screen overlay while keeping spit effects. |
| FSD-WindowsNoEditor功能 结算展示难度代码_P | Adds custom assets for FSD Windows No Editor功能 结算展示难度代码 P. | Displays the selected difficulty name in mission selection and the Deep Dive completion header. |
| FSD-WindowsNoEditor吐珠起床声 | Adds custom assets for FSD Windows No Editor吐珠起床声. | Replaces the Spitballer fold-up wake-up sound with direct wave playback. |
| FSD-WindowsNoEditor提高帧数-去除贴花_P | Adds custom assets for FSD Windows No Editor提高帧数 去除贴花 P. | Disables dozens of decal materials, including bullet impacts, bug splats, fire, corrosion, puddles, footprints, and Scorched Earth. |
| FSD-WindowsNoEditor提高帧率-冰冻粒子 | Adds custom assets for FSD Windows No Editor提高帧率 冰冻粒子. | Disables frozen-impact burst particles (burst count 20 to 0). |
| FSD-WindowsNoEditor提高帧率-删除人员空降仓模型_P | Adds custom assets for FSD Windows No Editor提高帧率 删除人员空降仓模型 P. | Removes the bottom, front, and right supply-pod spawn mesh pieces. |
| FSD-WindowsNoEditor提高帧率-去M1K特效_P | Adds custom assets for FSD Windows No Editor提高帧率 去M1K特效 P. | Reduces M1000 casing, tracer, reload-spark, and muzzle-flash particle effects. |
| FSD-WindowsNoEditor提高帧率-去除岩痘粒子，可见死亡毒物、岩痘虫轨迹弹道 | Adds custom assets for FSD Windows No Editor提高帧率 去除岩痘粒子，可见死亡毒物、岩痘虫轨迹弹道. | Removes many Rockpox and plague particle effects, including spores, impacts, tendrils, larva effects, and projectile visuals. |
| FSD-WindowsNoEditor提高帧率-移除荧光棒体积_P | Adds custom assets for FSD Windows No Editor提高帧率 移除荧光棒体积 P. | Hides the flare and flare-gun dart meshes, including both dart variants. |
| FSD-WindowsNoEditor蓝色基岩 | Adds custom assets for FSD Windows No Editor蓝色基岩. | Recolors burnt bedrock blue. |
| FUCKDownSound | Removes or replaces the player-down sound. | Replaces the player-down sound with a shorter louder one. |
| FuckEndScreen | Replaces the mission-end screen with a custom end screen and font. | Adds a keybind that spikes time dilation for fast mission resets, reverting on return to the Space Rig. |
| FuckVB | Adds the VB Alternative balance framework and custom weapon overclocks. | Adds an in-game selector for alternate weapon-overclock configurations, with Heavy Hitter, SCC, Overdrive, Oversized, Flechettes, Hyper, and vanilla modes. |
| GasWarning | Adds visible range warnings for Praetorian and Neurotoxin gas clouds. | Adds outline warning indicators to neurotoxin grenades, acid clouds and radioactive tank death gas. |
| GBSNoDwarfEnemyCollision | Changes weapon, upgrade, or overclock data for GBSNo Dwarf Enemy Collision. | Makes the Goo Cannon trail projectile pass through dwarves via a NoDwarfCollision variant. |
| geiger_counter | Adds Geiger-counter audio and radiation visuals for radioactive enemies and biomes. | Adds radiation-themed Geiger-counter voice lines and changes radioactive clouds, crystals, and enemy visuals. |
| GeneralOptimizer | Adds configurable optimization handlers for enemies, objectives, and cave generation. | Adjusts enemy and objective update intervals; versions 2.00 and later also remove dead enemy actors after a short delay and reduce collision, physics, and shadow work on selected cave debris. |
| GenOpTest | Test build of the General Optimizer. | Adds configurable performance handlers that adjust enemy and objective update intervals, reduce selected enemy and cave-debris processing, and clean up dead enemy actors after a short delay. |
| GFO | Adds the GFO gameplay package. | Increases the resource amounts on Aquarqs, Mule Legs, eggs, and other gems based on the primary mission objective. |
| gk2_asch_P | Adds a GK2 Assault Rifle upgrade/overclock. | Buffs GK2 damage to 22 with universal stagger at reduced ammo. |
| GK2BurstFire16 | Adds a GK2 burst-fire overclock (16-round variant). | Raises the GK2 Damage_2 upgrade bonus Amount from 2 to 16. |
| GK2BurstFire29 | Adds a GK2 burst-fire overclock (29-round variant). | Raises the GK2 Damage_2 upgrade bonus Amount from 2 to 29. |
| Glacial_Biome_Recolour | Recolors Glacial Strata/Ice Caves terrain. | Recolors Glacial Strata ice and rock tints from bright cyan-green toward muted gray-teal. |
| GndCollision3 | Fixes grenade ground collision and impact behavior. | Switches grenade collision to the Ragdoll profile and removes needle-sprayer bounce. |
| Green_MCAO | Recolors the electric-platform/ambient effect green. | Replaces the electric-platform effect with a minimal green set. |
| greenbettershieldbubblenowipe | Recolors the shield bubble green and removes its wipe effect. | Re-skins the shield bubble green with sunflower tiles and removes the wipe effect. |
| GreenBreachCutter | Recolors the Breach Cutter beam and impact effects green. | Recolors the Line Cutter green across weapon, projectile and particles. |
| GreenEPC | Recolors EPC firing, projectile, and heat effects green. | Recolors the EPC muzzle, charged-shot, overheat, and projectile effects green. |
| GreenFlamethrower | Recolors Flamethrower flame and impact effects green. | Recolors flamethrower flames green across muzzle, impact and sticky flames. |
| GreenSentryIndicators | Recolors Sentry Gun range and EMP indicators green. | Shows the sentry range sphere and recolors indicators green. |
| GreenStingtails | Recolors Stingtail armor green. | Recolors Stingtail armor from red to green. |
| GrenadeLauncherVWA | Reworks Grenade Launcher upgrades, overclocks, and projectile effects. | Rebalances the Grenade Launcher: stronger blasts, weaker friendly fire and tighter incendiary spread. |
| GSH | Adds the GSH gameplay package. | Raises each player’s personal Gold capacity to 1,000. |
| GSM | Adds the GSM gameplay package. | Moves each player’s carried Gold into the team’s shared resource pool. |
| Hack_Node_No_Delay | Adds custom assets for Hack Node No Delay. | Shortens hacking transmitter-node connection delay to 0.1 seconds. |
| hauntmemaybe | Adds custom assets for hauntmemaybe. | Changes the Haunted Cave Crassus Detonator choice to a Bulk Detonator. |
| Haz5p4x2_P | Hazard 5 custom difficulty with four-player enemy scaling and doubled enemies. | Sets Hazard 5 enemy-count modifier to 3× for all party sizes, with 3.4× enemy damage and 1.5× resistance. |
| Haz6x2 | Adds a Hazard 6 custom difficulty with doubled enemies. | Adds the Hazard 6 “Hurtme” profile with enemy-count modifiers of 1.9×–3.3×, enemy damage of 3.3×–4.1×, and 1.4×–1.75× resistance by party size; resupply costs 40 Nitra instead of 80. |
| haz6x2_-_experimental_62700_P | Adds an experimental Hazard 6 custom difficulty with doubled enemies. | Adds experimental Hazard 6 scaling (1.9×–3.3× enemy count by party size) and raises active-enemy and Swarmer caps from 60 to 120; resupply costs 40 Nitra. |
| Haz6x2_P | Adds a Hazard 6 custom difficulty with doubled enemies. | Adds Hazard 6 enemy-count modifiers of 1.9×–3.3×, damage of 3.3×–4.1×, and resistance of 1.4×–1.75× by party size; its files set resupply cost to 40 or 60 Nitra instead of 80. |
| haz6x2Experimental_P | Adds an experimental Hazard 6 custom difficulty with doubled enemies. | Adds experimental Hazard 6 scaling (1.9×–3.3× enemy count by party size) and raises active-enemy and Swarmer caps from 60 to 120; resupply costs 40 Nitra. |
| Hazard6p4 | Adds a Hazard 6 custom difficulty with four-player scaling. | Sets Hazard 6 enemy-count modifier to 1.65×, enemy damage to 4.1×, and resistance to 1.75× for every party-size entry. |
| Hazard6x2p4 | Adds a Hazard 6 custom difficulty with doubled enemies and four-player scaling. | Sets Hazard 6 enemy-count modifier to 3.3×, enemy damage to 4.1×, and resistance to 1.75× for every party-size entry. |
| HazardName | Displays the current Hazard setting/name in the UI. | Displays the selected or active Hazard name in a HUD text widget. |
| HealthNumber | Displays player health values in the HUD. | Shows numeric health on enemies and bosses with a custom font HUD. |
| healthShieldNum | Changes cave, terrain, or biome content for health Shield Num. | Displays current health and shield values as numbers in the HUD. |
| healthShieldNumEtherealEdition | Adds ethereal-styled health and shield numbers to the HUD. | Shows current and maximum health and shield values in a separate HUD widget. |
| healthShieldNumWhiteEdition | Changes cave, terrain, or biome content for health Shield Num White Edition. | Displays current health and shield values as numbers in the HUD, using the white edition’s styling. |
| heatfreezevcwc0.1 | Changes weapon, upgrade, or overclock data for heatfreezevcwc0.1. | Converts two Microwave Gun overclocks into Freeze Ray and Heat Ray variants. |
| HeavyExtractionCavegenRevert | Reverts the Heavy Extraction cave-generation setup. | Reverts Heavy Extraction verticality and distance overrides to inherited defaults. |
| hellfire-bug | Patches Hellfire behavior; exact changes are not documented in the archive. | Every two seconds, spawns a Spider Swarmer and Acid Cloud at each Coilgun burn trail. |
| HitscanHitsInfo | Displays hit information for hitscan weapons. | Reports hitscan targets and damage by component, armor plate, and destructible weakpoint, with game messages and a Mod Hub log. |
| homing_drone_beep | Adds a beep sound to homing drones. | Replaces the homing-drone idle loop with a short mono beep. |
| HorrorVacuiContent | Adds Horror Vacui enemy, mission, and overclock content. | Adds a large custom-content bundle with weapon overclocks and upgrade changes, enemy variants, and custom Egg Hunt and Refinery cave layouts. |
| howmenydorfs | Adds a UI counter for the number of dwarves/players in the mission. | Adds a configurable dwarf counter widget with save data. |
| hoxiron3 | Adds or reworks Egg Collection, Extraction, Motherlode, and Iron resource data. | Adds a mineable Iron resource with icon and end-screen tracking, plus mission compatibility fixes. |
| hsnVR | Adds health/shield number HUD elements for VR. | Adds health/shield number widgets to the armor HUD for VR. |
| HurricaneChangesMod | Changes Hurricane Micro Missile upgrades, projectiles, ignition, and shot behavior. | Makes Hurricane missiles home almost instantly with stronger nitro, stagger and ignition plus tighter spread. |
| InfiniteEggs | Adds infinite-egg gameplay with egg spawners, traps, and a settings GUI. | Adds an endless egg-spawning event framework with wave, trap and boon sliders plus GUI. |
| Input__P | Changes Minigun muzzleflash, tracer, and heat effects. | Recolors Minigun muzzle flash and tracers pure red. |
| inspectmod | Adds weapon inspection/gunsling behavior and audio. | Adds gunsling animations to weapon handling across most of the weapon roster. |
| InspectSpeedX2 | Doubles weapon inspect/gunsling animation speed. | Doubles weapon inspect (gunsling) animation speed. |
| InspectSpeedX2_Idle_Animation | Changes audio cues for Inspect Speed X2 Idle Animation. | Speeds up the alternate idle-animation weapon inspections to 2×. |
| InspectSpeedX2OG | Doubles original weapon inspect animation speed. | Speeds up the original weapon and tool inspection animations to the 2× version. |
| InspectSpeedX5 | Changes visual effects for Inspect Speed X5. | Quintuples weapon inspect (gunsling) animation speed. |
| InspectSpeedX5_Idle_Animation | Changes audio cues for Inspect Speed X5 Idle Animation. | Speeds up the alternate idle-animation weapon inspections to 5×. |
| InspectSpeedX5OG | Quintuples original weapon inspect animation speed. | Speeds up the original weapon and tool inspection animations to the 5× version. |
| instant_C4_indicator | Makes the C4 placement indicator appear instantly. | Makes the C4 explosion-range indicator appear at full size immediately instead of expanding over a second. |
| instantgaswhitegreen | Recolors the Praetorian/Neurotoxin gas cloud white and green. | Recolors the death gas cloud white-green, larger and hanging still. |
| instantziplineboost | Adds custom assets for instantziplineboost. | Removes the activation delay before gaining speed when riding down a zipline. |
| InvisibleEngiVerdigris | Adds custom assets for Invisible Engi Verdigris. | Turns the Engineer Verdigris paintjob into a near-invisible hologram. |
| invisibleskin | Adds custom assets for invisibleskin. | Makes armor fully invisible with zero-opacity glass. |
| invulnerable_lootbugs | Adds custom assets for invulnerable lootbugs. | Makes Loot Bugs invulnerable to undefined damage types; host-only and applies to clients. |
| IRM Rebalance mod 260919 | Rebalances weapon upgrades and overclocks across the arsenal. | Rebalances base stats, upgrades, and overclocks across many weapon families, changing damage, ammo, firing and reload behavior, and overclock bonuses or penalties. |
| IronWillStatus_ClientEvents | Adds the client-side Iron Will status HUD and settings UI. | Shows the Iron Will roster HUD with extra perk-status chips, driven by client events. |
| IronWillStatus_Host | Adds the host-side relay and HUD for Iron Will status. | Shows the Iron Will roster HUD with a host relay for loadout refresh. |
| IronWillTracker | Adds an Iron Will availability tracker and settings page. | Shows a HUD roster of teammates’ Iron Will perk status, with opacity and position settings. |
| ItchyArseRevival | Replaces revive and drone-revive audio with custom comedic lines. | Adds custom voice lines for Bosco revives, dwarves thanking a rescuer, and Iron Will activation. |
| ItemDumper_P | Adds an item-dumping/debug tool. | Writes a text file listing in-game item actors when NumPad 1 is pressed. |
| KEKW_P | Adds experimental gameplay-mode and UI assets. | Injects a DRG Lib and Mod Manager loader into mission, tutorial and Space Rig player states. |
| Kicker | Changes cave, terrain, or biome content for Kicker. | Adds a Mod Hub page to refresh the lobby player list and kick selected players; requires UUI or MOGHub. |
| KnightEngineerArmorMagmaCape | Adds a magma-cape material for Engineer's Knight armor. | Gives the Engineer Knight armor a magma cape material. |
| lederhorsen_unrestricted | Unlocks the 2023 Oktoberfest armor set for all four classes. | Allows all four classes’ Lederhosen armor to use other paintjobs and removes its seasonal restriction. |
| LegRemover | Changes cave, terrain, or biome content for Leg Remover. | Stops gibbed legs spawning from large spiders: grunts, spitters, septics and Dreadnoughts. |
| lessAnnoyingBossBar | Reduces distracting boss-bar effects. | Shrinks the boss bar with smaller font, icons and no red glow. |
| LessBrightRadiationEffects | Dims radioactive clouds and radiation effects. | Dims radiation cloud lights (intensity 350 to 30) and softens their green tint. |
| LessBrightRadioactiveCrystals | Dims radioactive crystals and related rival-beam effects. | Kills the radioactive crystal glow (light 8000/25000 to 0, damage pulse capped at 5000). |
| LessBrightStickyFlames | Dims sticky-flame effects. | Halves sticky-flame burst texture resolution (2048 to 1024). |
| LessDwarfDucking | Reduces automatic audio ducking when dwarves speak. | Keeps enemy sounds louder when dwarves speak: 3rd-enemy ducking 0.45 to 0.85, 2nd-enemy 0.6 to 0.85. |
| LessLoudIgnitionSound | Reduces the Flamethrower's ignition sound volume. | Quiets the flamethrower ignition blast (1.5 to 0.3). |
| LessMachineDucking | Reduces automatic audio ducking during machine activity. | Keeps combat sounds louder during machine activity: projectile impacts 0.2 to 1.0, explosions 0.5 to 0.8, enemies up to 1.0. |
| LightAlloyComponents_English | Adds a light-alloy Minigun component/overclock set. | English text translation for Flying Dickcat’s Light Alloy Components Minigun overclocks; the author says the Chinese text was translated with Google Translate and guesswork. |
| LightBlueFlamethrower | Recolors Flamethrower effects light blue. | Recolors flamethrower flames light blue across muzzle, impact and sticky flames. |
| LightBlueGunge | Recolors Goo Cannon and Patrol Bot laser effects light blue. | Recolors Goo Cannon goo light blue across canister, balls, muzzle and impacts. |
| lightpinkgs | Recolors Glacial Strata/Ice Caves rock light pink. | Recolors Glacial Strata rock walls light pink. |
| LinearSaboPLS | Makes Sabotage cave generation more linear. | Replaces Sabotage facility rooms with a linear set plus Sabo complexity rooms. |
| LionheartedLittleLootBugs | Reworks Loot Bugs to be tougher/lionhearted. | Gives Loot Bugs 999,999 health, speeds up normal Loot Bugs, and suppresses hit drops and Golden Loot Bug mineral drops. |
| LionheartedLittleLootSans | Reworks Loot Bugs and removes their sound effects. | Gives Loot Bugs 999,999 health, speeds up normal ones, suppresses hit and Golden Loot Bug drops, and renames normal Loot Bugs to “Azuki-San”. |
| LokMacroLensFix | Fixes the LOK-1 macro lens upgrade area size. | Shrinks the LOK-1 macro-lens lock-area upgrade bonus from 0.2 to 0.01. |
| LootSansSummerName | Changes cave, terrain, or biome content for Loot Sans Summer Name. | Renames normal Loot Bugs to “Azuki-San” and changes their description to “Adorable! <3”; Golden Loot Bugs are unchanged. |
| LootSansSummerName_WithGoldenSans | Changes Loot Bug names/font styling, including Golden Loot Bugs. | Renames normal and Golden Loot Bugs to “Azuki-San” and “Golden Azuki-San”, with matching custom descriptions. |
| LoveGrinding | Replaces Refinery pipe-grinding audio cues. | Replaces Refinery pipe-grinding sounds with a Dwarf voice clip. |
| LowChanceMacteraSwarms | Lowers the chance of Mactera swarms. | Lowers Mactera swarm selection weight from 1.0 to 0.33, making those swarms rarer. |
| magentabettershieldbubblenowipe | Recolors the shield bubble magenta and removes its wipe effect. | Re-skins the shield bubble magenta with sunflower tiles and removes the wipe effect. |
| MandatorySecondariesAlways | Makes secondary objectives mandatory. | Makes the secondary objective required for mission completion, with a /mandatory chat command. |
| ManualTargetingDefenderSentry | Adds manual targeting to the Defender Sentry. | Adds manual laser-pointer targeting to the Defender sentry upgrade. |
| MarkedForDeath | Adds/reworks the M1000 Marked for Death overclock. | Converts the M1000 Electrocuting Focus Shots overclock into Marked For Death, plus base-weapon buffs. |
| MarkedForDeath-Vanilla | Adds the Marked for Death overclock with vanilla-compatible values. | Converts the M1000 Electrocuting Focus Shots overclock into Marked For Death, keeping base-weapon stats. |
| MarkedForDeathTest | Test build of the M1000 Marked for Death overclock. | Test build boosting Marked for Death to 2x damage with -75% focus damage. |
| maximalTerrainScanner | Expands the Terrain Scanner reveal range/display. | Raises the terrain scanner to 1024×1024 resolution with a wider field of view and full-scene capture. |
| MaxLocksECR | Increases the LOK-1 maximum lock count. | Adds a -3 lock-amount penalty to the Lock Explosions overclock. |
| mcao_nosparks_nosmoke | Removes sparks and smoke from the ambient/electric platform effect. | Disables beam, smoke and spark emitters in the electric-platform effect, keeping flashes and rolling lightning. |
| MenaceProjFix | Fixes Menace projectile behavior. | Keeps Glyphid Menace projectiles visible up to 150 metres instead of 50 metres. |
| MetalSlugOST | Adds Metal Slug-inspired music and sound assets. | Replaces mission, wave, loading-screen, and menu music cues with custom tracks. |
| MEV | Adds the Mission Event Variants enemy/event pack. | Adds a large roster of alternate enemy variants, including colored and behavior-modified spiders, Mactera, Woodlice, and other creatures. |
| MEV_Exp_electricSTEnerf | Nerfs the electric status effect used by MEV enemies. | Sets the electric Spider Shooter status effect to 0.5 damage per tick and a 30% movement-speed penalty lasting 2 seconds. |
| mev_s5_encountersettings | Changes MEV Season 5 encounter settings. | Raises stationary-enemy minimum to 100 for Season 5 MEV encounters, plus a zero-chance dummy entry. |
| mev_s5_encountersettings_obncedition | Adds custom assets for mev s5 encountersettings obncedition. | Disables all four special encounters and raises stationary-enemy minimum to 100. |
| mev_s5_stalker | Adds the MEV Season 5 Stalker enemy. | Adds the beta Stalker enemy descriptor to MEV so encounter settings can spawn it; load this pak above MEV. |
| mfdbolt | Changes weapon, upgrade, or overclock data for mfdbolt. | Converts crossbow pheromone bolts into Marked-for-Death spitter darts with a banshee trail. |
| MichWarnings | Adds mission warnings, including a magnetic-death warning. | Adds a Death Magnetic cave event: randomly placed iron chunks trigger a Beer Ambush wave when removed. |
| milkChocolate_a03 | Changes weapon, upgrade, or overclock data for milk Chocolate a03. | Swaps the Coil Gun to Engineer and the Grenade Launcher to Gunner. |
| Minecraft_Eating_Resupply_SFX | Replaces resupply interaction sounds with Minecraft eating sounds. | Replaces resupply interaction audio with Minecraft eating and drinking sounds. |
| MinecraftBars | Changes cave, terrain, or biome content for Minecraft Bars. | Replaces the standard health and armor display with Minecraft-style hearts and armor icons. |
| Minigun2xammo | Doubles Minigun ammunition. | Halves Minigun ammo consumption per shot and increases movement speed while firing from 50% to 75%. |
| MinigunFix | Fixes the Minigun heat-glow material. | Reverts the Minigun heat-glow material to inherited defaults. |
| MinimalDotty | Simplifies the Drilldozer status HUD. | Replaces the Drilldozer HUD with a compact status display and a dedicated fuel widget. |
| Minimalism | Provides minimal visual replacements for cave environment, foliage, particles, critters, and room objects. | Cuts cave-scene clutter by stripping emitters from many particle effects and removing or simplifying selected props, meshes, and materials. |
| minimalSentry | Simplifies the Sentry Gun HUD. | Strips the Sentry HUD to a single minimal widget. |
| MiracleEventTools | Adds tools and UI for inspecting or changing mission-event values. | Adds event-broadcast tools: spectator camera control and Aquarq deposit tracking with a player menu. |
| MiracleTeslaMines_WIP | Changes the weapon crosshair/UI for Miracle Tesla Mines WIP. | Adds launcher-deployed Tesla Mines; three linked mines form a field that slows and damages enemies while draining charge. |
| MiscCull6 | Culls miscellaneous props and effects to improve performance. | Shortens draw distances for many cave hazards, collectibles, and enemy puddles; also dims Gold Chunk glow and shortens Sentinel Goo puddle lifetime. |
| MiscOptimizations | Applies miscellaneous prop and objective optimizations. | Shortens draw distances for Refinery and Minehead equipment, flares and the Flare Gun, Goo Cannon puddles, and assorted cave hazards and props. |
| Missile__Stickynade_Foobers | Changes Hurricane missiles and sticky grenades to Foober-style projectiles. | Makes Fire Bombers shoot sticky grenades and foober missiles. |
| mission-log-performance-mode | Adds a low-overhead mission-log performance mode. | Limits the Mission Log UI to the last 200 missions to prevent stalls. |
| MissionDispatch | Adds a mission dispatch library and UI for browsing/filtering missions. | Adds a mission dispatch window to roll random missions with biome, hazard and warning options. |
| MissionHax_P | Adds mission cheats and debug tools. | Changes mission generation to 16 missions per zone, six extra biomes, and much higher mutator and warning settings. |
| MissionRequester | Changes HUD or UI assets for Mission Requester. | Lets clients request missions from the map, with a host approve/reject popup and anti-spam cooldown. |
| MissionsHUD | Adds a HUD for mission, objective, beer, and mission-row information. | Adds a filterable mission-list HUD with timers, beer and assignment rows. |
| MitBossHealthBar | Changes cave, terrain, or biome content for Mit Boss Health Bar. | Shows the smaller boss health bars above bosses while you look at them. |
| MitRoomIndicator | Adds room and mission indicators with enemy-pool tracking. | Adds a room marker and trackables panel for enemy-pool counts, objectives, mission countdowns, and player count. |
| Mk series | Adds custom difficulties ranging from roughly Hazard 3 to Hazard 9+, with normal and nitra-pressure variants. | Adds six Mk custom-difficulty presets, roughly Hazard 3 through Hazard 9+, with enemy-pool and cap changes plus mission-specific resupply or nitra-pressure variants. |
| MLS | Adds mission mutator icons and mission-loading settings. | Replaces the Critical Weakness mission-map icon with a smaller 129px version. |
| ModHub | Adds the ModHub mod-management interface. | Adds a ModHub menu for browsing and opening pages registered by other mods, with a configurable hotkey. |
| ModHub_Font | Adds the HammerBro font used by ModHub UI. | Replaces Mod Hub UI fonts with custom typefaces. |
| mods_P | Adds shared gameplay-feature and UI framework assets used by mods. | Adds shared Mod Hub UI and settings hooks for gameplay, performance, keybindings, and logs, with related server-browser and Space Rig integration. |
| MOMMY | Replaces falling and impact audio with custom voice lines. | Routes all dwarf falling screams to a single falling voice line. |
| more_egg_swarms_P | Increases enemy swarms during Egg Hunt missions. | Adds Egg Hunt swarms: 3 for 4 eggs, 4 for 6 eggs, and 5 for 8 eggs. |
| More_Enemies_Variants | Adds more enemy variants, including Fire Bombers, Mactera, and new stationary enemies. | Adds Fire Bombers, veteran and triple-shooter Mactera, and radioactive swarmers to mission encounters. |
| More_Steeve_Types | Adds or increases steeve types. | Lets you tame additional Glyphid types as Steeve. |
| MoreInterestingSwarmerSwarm_P | Adds or increases interesting swarmer swarm p. | Adds Praetorians and Grunts to Swarmer swarms through a packaged SwarmersPlus enemy group. |
| MoreOverclocks_English | Adds additional weapon overclocks. | Provides English names and descriptions for six untranslated overclocks. |
| morePlayersList | Adds more player entries to the player list UI. | Expands the in-mission team display to 1,234 units high so the player list can show more entries. |
| MortarGooClustersParticles | Changes Mortar and Goo Cluster particle effects. | Strips most emitters and modules from mortar, missile-cluster and goo-explosion particles. |
| MortarSpreadReduction | Reduces Autocannon Mortar Shell spread. | Tightens Autocannon mortar spread: horizontal 22 to 7, vertical 8 to 4. |
| most-dangerous-enemy | Changes the Grunt enemy marker/configuration. | Replaces the Glyphid Grunt codex description with meme text about grunts killing players. |
| mugs-are-mines | Changes cave, terrain, or biome content for mugs are mines. | Makes Oktoberfest mug lids collidable with a bright orange light and simplified materials. |
| multifunctionIndicator | Adds configurable persistent ammo and weapon indicators. | Adds a configurable HUD ammo bar with per-weapon settings and a Mod Hub settings panel. |
| MuzzleFlash_Smoke_Adjustments | Adjusts weapon muzzle flashes and smoke effects. | Reduces selected weapon muzzle-flash, smoke, and explosion emitters, including the Minigun, Bolt Rifle, and Detpack. |
| MuzzleFlash_Smoke_Adjustments_Mercy_Special | Adjusts weapon muzzle flashes, smoke, and special weapon effects. | Tones down most visually intrusive weapon effects; Gunner primary-weapon effects are changed less than the others. |
| MyArseIsItchy | Replaces Space Rig wake-up/cabin audio with custom lines. | Replaces Space Rig wake-up voice cues with alternate dwarf lines, and adds custom Bosco-revive, revive-thanks, and Iron Will lines. |
| NEA_tendril_fix_v0.4.7_base | Fixes Tendril behavior and supplies base New Enemy Addon content (v0.4.7). | Includes War of Hoxxes enemies and warning content, including Tendril and Golem variants, and updates the spider enemy registry to include its custom entries. |
| NerfedNuke2_P | Adds custom assets for Nerfed Nuke2 P. | Reworks the Fat Boy overclock into triple -30% area-damage penalties, leaving near-zero area damage. |
| neuro_mod | Changes Neurotoxin grenade smoke and cloud visuals. | Swaps neurotoxin cloud smoke to custom materials. |
| neurogrenadeconegreen | Recolors the Neurotoxin grenade nozzle cone green. | Recolors the neurotoxin grenade nozzle cone green. |
| newbiomes | Adds new biome definitions, cave terrain, and biome assets. | Enables the unfinished Deep Core, Sponge Cluster and Caustic Mire test biomes. |
| NewOCParticleRemoves | Removes particle effects from newly added overclocks. | Provides separate particle-removal paks for Cluster Charges, Combustive Goo Mix, and Mortar Rounds, plus one pak that removes all three. |
| NewWeaponSkins | Adds new weapon skin materials. | Gives weapons holographic skins across 17 paintjobs. |
| No_Azure_Vines | Removes Azure Weald vines. | Shrinks Azure Weald vines, grass roofs and ceiling grass. |
| no_bulk_fragments_carve | Prevents Bulk Detonator fragments from carving terrain. | Stops Bulk Detonator cluster fragments from carving terrain (carve diameter 400cm to 0). |
| No_Carve_Exploders | Prevents Exploder enemies from carving terrain. | Sets the Exploder explosion crater dimensions to zero, preventing its explosion from carving terrain while retaining its damage call. |
| no_clawparts_collision | Removes collision from tentacle claw parts. | Removes tentacle claw debris collision and cuts its lifetime (15s to 0.1s). |
| No_Cooldown_or_resupply_pods | Removes or disables cooldown or resupply pods. | Removes the resupply pod call cooldown (5 seconds to 0). |
| No_Crawler_Puddles_No_Materials | Removes Crawler puddles and their associated materials/effects. | Removes crawler puddles and strips all crawler blood, death and impact particles. |
| NO_FREEZE_FOG_CRYO_TRAILS | Removes or disables freeze fog cryo trails. | Removes sticky-frost plume particles. |
| no_homing_septic | Removes or disables homing septic. | Disables homing on Septic Spreader lobber projectiles. |
| no_landing_damage | Removes landing damage from mission equipment and pods. | Removes landing and crash damage from supply pods, structures and vehicles (1000 to 0). |
| no_low_oxygen | Removes the Low Oxygen warning and mission hazard. | Disables the Low Oxygen hazard: mutator removed and hazard bonus 0.2 to 0. |
| no_magma_maggot_death_damage | Removes Magma Maggot death damage. | Removes Magma Maggot death explosion damage (25 to 0). |
| no_mortar_ff | Prevents Mortar Shell projectiles from damaging teammates. | Removes mortar friendly fire and enlarges its terrain carve (80 to 340). |
| No_Recovery_Simple | Removes recovery delays and related perk/upgrade interactions. | Disables the shield regenerator and pheromone effect and zeroes drill upgrade bonuses. |
| No_Resupply_Call_Cooldown | Removes the resupply-call cooldown. | Removes the resupply pod call cooldown (5 seconds to 0). |
| No_Resupply_Cooldown_P | Removes or disables resupply cooldown p. | Removes the resupply pod call cooldown (5 seconds to 0). |
| no_season_event_waves | Removes or disables season event waves. | Stops Pool Floats and Oktoberfest mugs from triggering enemy waves; the host must run it for the change to affect the lobby. |
| no_sentinel_dig_damage | Removes Sentinel digging damage. | Removes Dreadnought HeavySpawn carve-attack damage (15 to 0). |
| NO_SHIELD_LINK_OVERLAY | Removes or disables shield link overlay. | Makes the shield-link overlay fully transparent (tint alpha 1 to 0). |
| no_stickyfrost_plumes | Removes or disables stickyfrost plumes. | Removes sticky-frost plume particles (spawn rate and burst to 0). |
| no_weather | Removes or disables weather. | Disables biome storm/quake events (event probability 1 to 0). |
| NoAmmoBar | Removes the ammo/supply bar HUD element. | Hides the segmented ammo-supply bars in the HUD. |
| NoAnimation | Removes target-HUD animation effects. | Speeds up enemy target HUD intro animations so they finish almost instantly. |
| NoAnimationVisible | Hides target-HUD animation elements. | Makes the enemy target HUD intro nearly instant (5×→999×); the temperature widget also changes its animation threshold from >0 to >-1 and its triggered intro rate from 3×→999×. |
| NoAutocannonRecoil | Removes or disables autocannon recoil. | Greatly reduces Autocannon recoil: pitch 30 to 3, yaw 40 to 2, spring stiffness 200 to 50. |
| NoAutocannonRecoilAndLessSpread | Removes Autocannon recoil and reduces its spread. | Reduces Autocannon recoil and spread: pitch 30 to 3, yaw 40 to 2, spread 22/8 to 16/6. |
| NoBarrelKicking | Removes or disables barrel kicking. | Stops barrels from being kicked or moved (BarrelKicking stat 1 to 0). |
| NoBunny | Disables the Great Egg Hunt bunny. | Removes the Easter Bunny’s cave and throwable props from the Great Egg Hunt. |
| NoC4Collision | Removes or disables c4collision. | Prevents projectiles from intercepting C4; this host-side change applies to the whole lobby. |
| NoCameraShakeComplete | Removes cooked camera-shake effects while leaving weapon recoil and weapon Blueprints unchanged. | Disables 53 packaged camera-shake effects, including weapon, drilling and environmental shakes. |
| NoCarve121 | Disables terrain carving for selected objective props and biome materials. | Disables terrain carving from a bundle of weapons and explosives, including the PGL, Autocannon, Hurricane Mortar Rounds, Bulldog, and several grenades. |
| NoCarveResinite | Prevents Resinite deposits from carving terrain. | Stops Resinite amber deposits from carving terrain. |
| NoClusterGNDLag | Reduces grenade cluster ground effects that cause lag. | Stops HE grenade explosions from carving terrain, easing cluster lag (carve diameter to 0). |
| nocollisiongrottostalactite | Removes or disables collisiongrottostalactite. | Removes collision from tutorial grotto stalactite debris (HitOnly to NoCollision). |
| nocollisionsentry | Removes or disables collisionsentry. | Makes the Engineer sentry ignore projectiles, hitscans and penetrating hitscan; works client-side. |
| nocollisionsentrypartial | Removes or disables collisionsentrypartial. | Makes the sentry ignore projectiles and hitscans but keep penetrating-hitscan overlap; for MCAO/EMD/Turret Whip. |
| nocollisionstalactites | Removes collision from stalactites in supported biomes. | Removes stalactite collision in Ossuary Depths, Crystal, Salt and Tutorial caves. |
| NoCollisionStickyIce | Removes or disables collision sticky ice. | Removes Sticky Ice collision so shots and drills pass through, like sticky flames; client-side. |
| NoCombatDucking | Disables combat audio ducking. | Disables combat audio ducking across 13 mixes. |
| NoCrawlerPuddles | Removes Crawler puddles. | Makes Core Spawn Crawler puddles disappear almost immediately; the two versions use 0.01- and 0.001-second lifetimes. |
| NoCriticalWeakness | Removes the Critical Weakness mutator. | Removes the Critical Weakness anomaly’s bonus weakpoint damage. |
| NoCrosshairButInfo | Removes weapon crosshairs while retaining crosshair information. | Removes weapon and equipment crosshairs while retaining the associated tool and weapon charge information. |
| NoDoors | Removes Space Rig doors. | Removes the BP_Bulkhead01 doors from the Space Rig when it loads. |
| NoDorettaSound | Removes Doretta and Drilldozer voice, engine, and damage sounds. | Mutes 24 Doretta/Drilldozer audio cues; Doretta’s petting voice cue remains audible. |
| NoDorettaSoundButTakingDamage | Removes Doretta sounds except damage-taken sounds. | Mutes 23 Doretta/Drilldozer cues, keeps the petting voice, and leaves the vehicle-taking-damage cue unmodified. |
| NoDownBox | Removes the downed-player HUD box. | Removes the downed-player HUD box and input prompt slots. |
| NoDreadOrSwarmerSwarms | Removes or disables dread or swarmer swarms. | Disables Dreadnought boss and Swarmer swarm waves (weights to 0). |
| NoDreadPraetOrSwarmerSwarms | Disables Dreadnought, Praetorian, and Swarmer swarms. | Disables Dreadnought boss, Praetorian and Swarmer swarm waves (weights to 0). |
| NoDreadPraetOrSwarmerSwarms_P | Removes or disables dread praet or swarmer swarms p. | Disables Dreadnought boss, Praetorian and Swarmer swarm waves (weights to 0). |
| NoDreadSwarms | Removes or disables dread swarms. | Disables the Dreadnought boss swarm wave (weight 0.25 to 0). |
| NoDrillsParticles | Removes drill debris and spark particles. | Disables the drill debris and gunsling spark particle effects. |
| NoDropPodSoundButDoors | Removes drop-pod sounds while retaining door sounds. | Mutes 35 Drop Pod, cabin, and Minehead audio cues while leaving the six pod-door cues unchanged. |
| NoDropPodSoundButLastDoor | Removes drop-pod sounds while retaining the final-door sound. | Mutes 41 Drop Pod audio cues, including the six pod-door cues. |
| NoDropPodSoundButLastDoorAndDocking | Removes drop-pod sounds while retaining the final-door and docking sounds. | Mutes 40 Drop Pod audio cues, including all six pod-door cues; leaves the Mule Ready cue unchanged. |
| noducc | Removes the Bullet Hell warning. | Disables the Bullet Hell warning: all mutators removed and hazard bonus 0.3 to 0. |
| noduckon_perks_grab_down | Prevents audio ducking when perks activate, dwarves are grabbed, or players go down. | Disables audio ducking for perk activations, downs, grabs and related states. |
| nodwarfcollisionleads | Removes or disables dwarfcollisionleads. | Lets Leadbursters pass through dwarves on the client, including when hosting. |
| NoDwarfShieldRegenSound | Removes dwarf shield-regeneration sounds. | Silences the sounds played while dwarf shields regenerate and when they finish recharging. |
| NoElevatorPlantScream | Removes the Elevator Plant scream. | Mutes the Elevator Plant scream by routing its sound reference to the package’s silent cue. |
| NoEliteParticles | Removes elite-enemy beacon particles. | Removes the regular and large Hero Enemy beacon particle effects. |
| NoEquipmentSwitchingAndJumpingSound | Removes equipment-switching and jumping sounds. | Silences body-movement and jumping foley sounds. |
| NoEvents | Disables mission events. | Clears the active mission-events list at mission startup. |
| NoExplosionDucking | Disables audio ducking from explosions. | Eases explosion ducking across five mixes, with dwarf speech slightly more ducked in two. |
| NoFailureGown | Removes the mission-failure gown. | Removes the medical gown worn after a failed mission. |
| NoFFGas | Prevents gas clouds from damaging friendly dwarves. | Removes friendly fire from neurotoxin and Praetorian acid gas. |
| NoFlareSound | Removes flare impact and fuse sounds. | Mutes thrown flare impact and burning-fuse sounds. |
| NOFUCKINGSTATUES3 | Removes selected seasonal/statue props. | Removes anniversary trophy and lunar horse and rabbit statues. |
| nofungusgas | Removes Fungus Bogs poison gas. | Stops Fungus Bogs poison-gas fungus from spawning its gas cloud; host-required. |
| nogasspitpraet | Removes Praetorian gas spit. | Disables Praetorian special spit attacks and acid clouds in the matching no-spit, no-gas, and combined variants. |
| NoGooDwarfCollision | Prevents Goo Cannon projectiles and puddles from colliding with dwarves. | Makes charged and normal goo projectiles pass through dwarves. |
| NoGooDwarfCollisionv2enns | Prevents Goo Cannon projectiles and puddles from colliding with dwarves (v2). | Makes all goo projectiles, fragments and trails pass through dwarves, disabling goo friendly fire; host-required. |
| NoGravityRecalibrationSound | Removes the gravity-recalibration alarm. | Silences the Space Rig gravity recalibration alarm. |
| NoGrenadeDucking | Disables audio ducking from grenades. | Keeps speech and characters loud through explosions (dwarf speech 0.5 to 0.9, characters/enemies to 0.9). |
| NoHealthGettingHitSound | Removes the player health hit sound. | Silences the sound played when a dwarf takes health damage. |
| NoHUDBackground | Removes or disables hudbackground. | Makes the shared bracket-style HUD window background and edges transparent. |
| NoHudBackgroundNoGrenadeFlareKeybinds | Removes the HUD background and grenade/flare keybinds. | Makes the HUD bracket background transparent. |
| NoIgnitionDucking | Removes or disables ignition ducking. | Keeps enemy audio loud during weapon communication (EnemiesParent 0.6 to 1.0). |
| NoInertRockpoxCorruptor | Removes inert Rockpox Corruptor slime trails. | Removes inert Rockpox Corruptor slime-trail carving. |
| NoJetBoots | Removes or disables jet boots. | Disables Jet Boots treasure events (chance 0.1 to 0, including Deep Dives). |
| NoLaserPointerSound | Removes laser-pointer activation, marker, and scanner sounds. | Silences laser-pointer and terrain-scanner sounds. |
| noleggies | Removes spider leg collision/geometry. | Hides spider legs by scaling leg meshes to zero. |
| NoLight | Removes or disables light. | In Sandbox, press Ctrl+Shift+F7 to remove interactive spotlights from the current map. |
| NoLoadingScreenDropPodSound | Removes drop-pod sounds from the loading screen. | Silences loading-screen drop pod, space ambience and planet-impact sounds. |
| NoLoadingTips | Removes loading-screen tips. | Removes the loading-screen tip slot, keeping the remaining layout. |
| NoLootbugGold | Removes or disables lootbug gold. | Removes gold from Loot Bug drops and cuts chunks (5-15 to 2-5, nitra only). |
| NoLow2 | Removes the Low Oxygen warning. | Detaches the Low Oxygen mutator from its warning, disabling the effect. |
| NoM1000Zoom | Removes M1000 zoom behavior. | Removes M1000 focus zoom and its stack tracking. |
| NoMCDucking | Disables Mission Control audio ducking. | Stops Mission Control radio from ducking other audio (SFX, music, dwarf speech and UI to full volume). |
| NoMilestones | Disables milestone/retirement entries. | Prevents the assignment-progress popup on returning to the Space Rig from locking movement and chat. |
| NoMineHeadSound | Removes Minehead drilling and deployment sounds. | Silences Mine Head launch, foldout and close sounds. |
| Non_meltable_platforms | Makes spawned platforms non-melting and low-fall-damage. | Prevents normal and upgraded Engineer platforms from melting in fire or being dissolved. |
| NoObjectThrowingSound | Removes the object-throwing sound. | Removes the dwarf object-throwing sound. |
| NoPerkDucking | Disables audio ducking when perks activate. | Keeps enemy audio louder when perks activate (EnemiesParent 0.7 to 0.9). |
| NoPlantCarve | Prevents plants from carving terrain. | Host-side mod that removes terrain carving from exploding puffballs (exploding plants), including in Fungus Bogs and Magma Core. |
| noplatformdelay | Removes or disables platformdelay. | Makes Platform Gun shots create their platforms immediately on impact. |
| NoPowerAttackChargedSound | Removes the charged power-attack sound. | Silences the pickaxe power-attack charge sound. |
| NoRadResistEnemies | Removes radiation resistance from radioactive enemies. | Removes radiation resistance from radioactive grunts, swarmers and tanks. |
| NoRadResistPiercingFix | Fixes radiation resistance/piercing behavior for radioactive enemies. | Removes radiation and piercing resistance from radioactive enemies. |
| noragdoll-grabberfix | Prevents Grabber ragdolls and fixes the grabber downed state. | Fixes Grabber behavior in no-ragdoll setups by preventing Grabber ragdolls; it does not require a separate ragdoll mod. |
| noragdoll-grabberfix(praetopp) | Prevents Grabber ragdolls with the Praetorian-opponent variant. | Prevents Grabber ragdolls while retaining Praetorian and Oppressor ragdolls, so their gas-spawn positions remain visible. |
| NoReviveCanteen | Removes or disables revive canteen. | Replaces the revive canteen model with a snow-particle mesh. |
| NoRevivedSound | Removes the successful-revive sound. | Silences the sound played when a dwarf is successfully revived. |
| NoRevivingDwarfSound | Removes revive-in-progress and revive-bottle sounds. | Silences the revival-in-progress loop and revive-bottle sound. |
| norockduck | Disables audio ducking from Ommoran rock attacks and communication. | Disables Ommoran rock-attack and communication audio ducking. |
| NoSalute | Removes or disables salute. | Removes the pickaxe salute animation. |
| nosaveprogresswarning | Removes the save-progress warning. | Strips the restore-save dialog buttons and content. |
| NoScreenRays | Removes Terrain Scanner screen rays. | Removes Terrain Scanner screen rays. |
| NoSeasonalRigs | Removes seasonal Space Rig variants. | Removes six seasonal Space Rig decoration layouts, including Christmas and Halloween; Oktoberfest is not included. |
| NoSeasonalRigs2 | Removes or disables seasonal rigs2. | Removes Space Rig decorations for seven seasonal events, including Oktoberfest, using the unseasoned layout. |
| NoSeasonalRigs3 | Removes seasonal Space Rig variants and ambience. | Removes seven seasonal Space Rig layouts and replaces Halloween, Oktoberfest, spring and summer ambience with the normal Space Rig loop. |
| NoShellbackSpitParticle | Removes Shellback spit particles. | Strips Shellback spit particles to a single short-lived emitter. |
| NoShieldGettingHitSound | Removes the shield-hit sound. | Silences the sound played when a dwarf’s shield takes a hit. |
| NoSpacerigDoorCollision | Removes Space Rig bulkhead-door collision. | Removes pawn collision from Space Rig bulkhead doors so players pass through. |
| NoSpaceRigEventAmbience | Removes or disables space rig event ambience. | Replaces four seasonal Space Rig ambience cues (Easter, Halloween, Oktoberfest, and Summer) with silence. |
| NoSpecialSwarms_P | Disables special swarms. | Disables Dreadnought boss and all special swarms: grunts, Mactera, Praetorians and Swarmers. |
| NOSTATUES | Removes seasonal/statue props. | Removes anniversary trophy and lunar rabbit statues. |
| NoStickyCarve | Prevents sticky grenades from carving terrain. | Stops sticky grenades from carving terrain (carve diameter to 0). |
| NoSuprises_PatchedMEV | Removes surprise events with MEV compatibility fixes. | Disables surprise special encounters and trims special events for MEV. |
| NoSwarmerSwarm_P | Disables Swarmer Swarm missions/events. | Disables Swarmer swarm waves (weight 1.0 to 0). |
| NoThumperFF | Prevents Thumper grenade effects from damaging teammates. | Removes friendly fire from Thumper rounds (modifier 0.5 to 0). |
| NotSoHumbleFlareGunChanges | Removes or disables t so humble flare gun changes. | Buffs the flare gun projectile with higher damage and speed, lower gravity, a brighter warm light, and a 3,600-second lifetime. |
| NotSoInstantEquipmentSwitch | Adds a visible delay to equipment switching. | Sets animated equipment’s equip duration to 0.2 seconds for a less instantaneous weapon switch. |
| NoTurretWhipFF | Removes friendly fire from Turret Whip. | Removes friendly fire from Turret Whip projectiles (modifier 0.5 to 0). |
| NoUplinkBubbleSound | Removes Uplink/Fuel Cell bubble sounds. | Silences Salvage Operation uplink triangulation, uplink completion and fuel-cell charging sounds. |
| NoUplinkBubbleSoundButCompleted | Removes Uplink bubble sounds but keeps the completion sound. | Silences uplink triangulation and fuel-cell charging but keeps the completion sound. |
| NoUplinkBuildingSound | Removes Uplink and Fuel Cell building sounds. | Mutes Uplink and Fuel Cell opening/building sounds. |
| NovakBalance_B | Applies Novak's weapon and overclock balance set B. | Adds around 120 custom weapon overclocks and schematics across the arsenal, including Drak, GK2, and Goo Cannon upgrades. |
| NovaksEnemyMiscellanea | Adds Novak's miscellaneous enemy variants and effects. | Adds assorted enemy variants and behavior assets, including Electrocrystal and leaper enemies, healing orbs, smart rocks, custom projectiles, and Stalker speed effects. |
| NoVictoryShouts | Removes victory shouts. | Disables the Yeah victory shout. |
| novines | Removes Fungus Bogs vines. | Shrinks Fungus Bogs vines and grass roofs to unit scale. |
| NoVolatileGuts | Removes Volatile Guts explosion damage/effects. | Removes Volatile Guts explosion damage (80-220 to 0). |
| nuke_range_indicator | Adds a green blast-radius indicator to the Engineer's Mini-Nuke radiation cloud. | Adds a visible ring to the lingering radiation-cloud effect and reduces the brightness of Fat Boy’s cloud light. |
| NukeballersSingle | Adds custom assets for Nukeballers Single. | Turns a Spitball Infector into a single Nukeballer firing nuke projectiles. |
| NWOS_AllDirections | Changes sprint movement to work in all directions. | Extends No Walk Only Sprint so autosprint works with W/A/S/D at the same speed in every direction; vanilla slowdowns still apply. Client-side and replaces the original NWOS pak. |
| OBNC_patchedMEV | Patches event and special-event settings for MEV compatibility. | Disables seasonal events, special encounters, treasures and holiday cave debris for MEV runs. |
| OCFrameworkActors | Adds shared actors and data for the Overclock Framework. | Provides Overclock Framework V2 support assets: custom-overclock actor templates, item templates for weapons, tools and armor, and the overclock selection UI. |
| OCFrameworkUpdate | Updates shared actors and data for the Overclock Framework. | Provides Overclock Framework V2 support assets: custom-overclock actor templates, item templates for weapons, tools and armor, and the overclock selection UI. |
| OHT | Adds the OHT gameplay package. | Sets each player’s pickaxe rock and dirt mining bonuses to 3. |
| OJBurstFireThing | Adds a burst-fire Assault Rifle overclock. | Retunes the GK2 burst-fire overclock with a smaller clip bonus and percentage damage. |
| OneHitResources | Adds custom assets for One Hit Resources. | Raises mining strength to 9 for near one-hit resource mining. |
| OnlyGenericnDreadSwarms | Adds custom assets for Only Genericn Dread Swarms. | Keeps only generic and Dreadnought waves; removes grunt, Mactera, Praetorian and Swarmer specials. |
| Opaque_Crosshair-Updated_for_S5 | Changes the weapon crosshair/UI for Opaque Crosshair Updated for S5. | Replicates the Opaque Crosshair mod for Season 5. |
| orangebettershieldbubblenowipe | Recolors the shield bubble orange and removes its wipe effect. | Re-skins the shield bubble orange with sunflower tiles and removes the wipe effect. |
| Ossuary_All_Zones | Unlocks Ossuary biome zones. | Adds the Ossuary biome to all four planet zones with adjusted missions. |
| OssuaryBiomeUnlocker | Unlocks the Ossuary biome. | Adds a hotkey-triggered way to generate and select a mission in Ossuary Depths. |
| OutlinedPheromones | Outlines pheromone-marked enemies. | Outlines active attackable targets near the local player and refreshes the marked set every 0.1 seconds. |
| OverclockingOverclocks | Adds an overclock-editing framework with custom upgrade schemas. | Adds 56 custom weapon overclocks with matching schematics, upgrade effects, and associated audio assets. |
| PA6-3 | Changes weapon, upgrade, or overclock data for PA6 3. | Buffs the Boomstick damage bonus to +6 flat and pellets to +3. |
| Pacagmas Custom Vanities | Adds custom pickaxe and vanity parts, including Tonfa and Lollichop. | Adds custom pickaxes such as the Tonfa and Lollichop, plus vanity cosmetics including Among Us suits, barrel armor, bunny and Chernobog sets, TF2 Civilian outfits, and paintjobs. |
| Pastel_Salt_Pits | Changes cave, terrain, or biome content for Pastel Salt Pits. | Gives Salt Pits pastel rock and crystal tints with blue fog. |
| PastelFlamethrower | Recolors flamethrower effects with pastel colors. | Recolors flamethrower flames pastel across muzzle, impact and sticky flames. |
| PCCNoExplosion | Disables the platform explosion effect from the related overclock. | Sets the Heavy Particle Cannon’s Platform Explosions upgrade value to 300 (the matching game asset is 1). |
| PeachAutoSprint | Automates sprinting and removes several movement slowdowns. | Raises base movement speed to 1.45×, reduces several weapon and environmental slowdowns, and makes the Pistol A automatic. |
| PerkStatusModThatBetterFuckingWorks | Adds custom assets for Perk Status Mod That Better Fucking Works. | Shows the Iron Will roster HUD with host relay, repackaged to work. |
| Phero2Chem | Changes weapon, upgrade, or overclock data for Phero2Chem. | Makes the Pheromone grenade apply the Crossbow Chemical Explosion status effect within a 400-unit radius, guaranteeing two targets and then affecting every second target. |
| pickaxe | Replaces pickaxe assets and Space Rig pickaxe UI. | Sets the pickaxe's stagger chance to 100%; another archive variant adds a Pickaxe page to Mod Hub. |
| PickaxeCancel | Allows pickaxe attacks and animations to be cancelled. | Cancels the Pickaxe salute animation when you press left or right mouse, or the 6 key. |
| PINGMOMMY | Replaces Engineer laser-pointer voice lines with custom audio. | Replaces dwarf laser-pointer callouts with the same “Generic Falling 08” voice line. |
| Pink_MCAO | Recolors the electric-platform/ambient effect pink. | Replaces the electric-platform effect with a minimal pink set. |
| pinkbettershieldbubblenowipe | Recolors the shield bubble pink and removes its wipe effect. | Re-skins the shield bubble pink with sunflower tiles and removes the wipe effect. |
| pinkblue_Ossuary | Changes visual effects for pinkblue Ossuary. | Re-tints Boneyard bones brighter pink-blue. |
| PinkBreachCutter | Recolors the Breach Cutter beam and impact effects pink. | Recolors the Line Cutter pink across weapon, projectile and particles. |
| PinkEPC | Recolors EPC firing, projectile, and heat effects pink. | Recolors the EPC muzzle, charged-shot, overheat, and projectile effects pink. |
| PinkFlamethrower | Recolors Flamethrower flame and impact effects pink. | Recolors flamethrower flames pink across muzzle, impact and sticky flames. |
| pinkhair | Recolors dwarf hair materials pink. | Recolors purple dwarf hair pink. |
| pinksaltpitsbluecrystalsfixed | Recolors Salt Pits terrain and fixes the crystal color to blue. | Recolors Salt Pits rock pink with blue crystals. |
| pinksaltpitsfixed | Recolors Salt Pits terrain and crystals pink. | Recolors Salt Pits rock and crystals pink. |
| pinksaltpitslesssaturationfixed | Recolors Salt Pits terrain with lower-saturation pinks. | Recolors Salt Pits rock and crystals a less-saturated pink. |
| PinkSeptics | Recolors Septic Spreader puddles and materials pink. | Recolors Septic Spreader puddle light, acid overlay and projectiles pink. |
| PinkStingtails | Recolors Stingtail armor pink. | Recolors Stingtail armor pink. |
| PipelinePriorityFix | Fixes Refinery pipeline segment priority handling. | Sets pipe-grinding interaction priority to 4 and Refinery pipe-start priority to 5; other pipe segment actions use priority 2. |
| platform_snow | Changes cave, terrain, or biome content for platform snow. | Points Ice Caves deep-snow terrain at the low-fall-damage platform material. |
| playerPing | Adds a configurable player-ping HUD/widget. | Adds a per-player ping readout beside the team list, with its color shifting from green toward red as latency rises. |
| PowerPerks | Adds or reworks perk effects and descriptions. | Rebalances numerous perks, including stronger See You in Hell and Shield Boost effects, wider Beast Master interaction range, and changes to other perk bonuses. |
| PraetGasFreezeFix | Fixes Praetorian gas-cloud freezing behavior. | Removes freeze damage from Praetorian acid clouds (350/200/130 to 0). |
| PrideLight_P | Adds configurable Pride-colored Space Rig lights. | Adds rainbow pride-colored spotlights to caves. |
| prjstuff | Adds or replaces projectile and enemy assets for crystals, plants, and floating rocks. | Adds custom enemies and projectiles: electrocrystal, Korlok core, homing cluster bombs and quiet flying rocks. |
| purple_cryo | Changes visual effects for purple cryo. | Recolors Cryo Cannon particle and material effects, including frozen-enemy visuals, in purple tones. |
| Purple_MCAO | Recolors the electric-platform/ambient effect purple. | Replaces the electric-platform effect with a minimal purple set. |
| PurpleFlamethrower | Recolors Flamethrower flame and impact effects purple. | Recolors flamethrower flames purple across muzzle, impact and sticky flames. |
| PurplePhaseBomb | Recolors Facility phase-bomb and weakpoint effects purple. | Recolors the Facility phase bomb and explosion range indicators purple. |
| PwndShowcase_P | Adds a property/asset inspector and debug showcase tool. | Demonstrates loading native libraries and hijacking calls at runtime; inspect it before use. |
| Radialjaw | Changes Mactera Tri-Jaw projectile behavior. | Spreads Tri-Jaw shots radially with more projectiles at 0.05s delays. |
| RadialjawEX | Changes Mactera Tri-Jaw projectile behavior (extended variant). | Extends Tri-Jaw radial spread with more projectiles at 0.05s delays, tighter than Radialjaw. |
| RainbowFlamethrower | Cycles flamethrower effects through rainbow colors. | Recolors flamethrower flames blue across first-person, impact and sticky-flame particles. |
| RainbowNitra | Recolors Nitra materials with a rainbow gradient. | Recolors nitra veins with a rainbow gradient texture. |
| RandomRefineryBreakdowns | Adds custom assets for Random Refinery Breakdowns. | Randomizes Refinery pipeline breakdowns (cooldown 50-70s to 1-150s). |
| RC_ACspread | Reworks Autocannon recoil and spread. | Tightens Autocannon spread: horizontal 22 to 16, vertical 8 to 6. |
| RC_Assault_MagBlaster_P | Replaces the Assault Rifle with the Mag Blaster model and animations. | Replaces the Assault Rifle’s appearance with the Mag Blaster, including its model, first-/third-person reload and firing animations, and weapon audio. |
| RC_Burst_TwoHandSMG_P | Replaces the Burst Pistol with a two-handed SMG model and animations. | Replaces the Burst Pistol’s appearance and handling animations with a two-handed SMG model, reload, and firing assets. |
| RC_BXE_SMGAnim_P | Changes BXE/SMG weapon animations. | Swaps the SMG reload animation for a custom first-person montage. |
| RC_M1000_BattleRifle_P | Replaces the M1000 with a battle-rifle model and animations. | Supplies a Rogue Core Battle Rifle model, weapon assets, first- and third-person animations, and firing/reload sounds. |
| RC_Revolver_Devastator_P | Replaces the Bulldog/Revolver with the Devastator model and animations. | Replaces the Bulldog/Revolver visuals with the Devastator model and its firing, reload, and first-/third-person animations. |
| RC_SMG_Bolnir_P | Replaces the SMG with the Bolnir model and animations. | Replaces the SMG’s visuals with the Bolnir model, including weapon meshes, firing, and reload animations. |
| RCarmor | Adds Rogue Core armor cosmetics. | Adds five Rogue Core vanity sets: Backtracker, Falconeer, Guardian, Slicer, and Spotter, with their matching armor and headwear meshes. |
| RealWeaponStatsRemake | Reworks weapon stats, upgrades, and overclocks. | Halves Zhukov and Minigun ammo and clip with matching halved shot costs, and speeds manual cooling. |
| RecallableMovementFixes | Fixes movement for recallable sentry and shield-regenerator objects. | Fixes recalled shield and sentry movement with small pathfinders and no spring. |
| redbettershieldbubblenowipe | Recolors the shield bubble red and removes its wipe effect. | Re-skins the shield bubble red with sunflower tiles and removes the wipe effect. |
| RedBreachCutter | Recolors the Breach Cutter beam and impact effects red. | Recolors the Line Cutter red across weapon, projectile and particles. |
| RedEPC | Recolors EPC firing, projectile, and heat effects red. | Recolors the EPC muzzle, charged-shot, overheat, and projectile effects red. |
| RedFlamethrower | Recolors Flamethrower flame and impact effects red. | Recolors flamethrower flames blue, despite the name. |
| redholo | Adds a red holographic skin variant. | Gives armor a red holographic skin. |
| redmcao | Adds custom assets for redmcao. | Recolors the electric-platform effect red. |
| RedSentryIndicators | Recolors Sentry Gun range and EMP indicators red. | Shows the sentry range sphere and recolors indicators red. |
| Reduce_Mining_Fragments | Changes visual effects for Reduce Mining Fragments. | Reduces pebble debris from power drilling and from mining minerals and metals; the author excludes Hollow Bough and Fungus Bogs. |
| Reduce_Mining_Fragments_minimal_dust | Reduces mining debris to minimal dust. | Reduces mining debris and uses the minimal-dust variant. |
| Reduce_Mining_Fragments_minimal_dust__sparks | Reduces mining debris to minimal dust while keeping sparks. | Reduces mining debris with minimal dust and sparks. |
| Reduce_Mining_Fragments_minimal_dust_zero_sparks | Reduces mining debris to minimal dust and removes sparks. | Reduces mining debris with minimal dust and removes the sparks. |
| Reduce_Mining_Fragments_zero_dust__sparks | Removes mining debris dust while keeping sparks. | Reduces mining debris and removes dust while retaining the spark effect. |
| reduced_e_holding_lite | Reduces mission-event carry/hold requirements (lite version). | Shortens hold-to-interact times on treasures, events and the Mule (e.g. 10s to 2s, 5s to 1s). |
| Reduced_Sentinel_Carve_and_Damage | Reduces Sentinel terrain carving and damage. | Reduces Sentinel carve damage (15 to 10) and radius (500 to 400/350). |
| ReducedBulkDucking | Reduces audio ducking from Bulk Detonator explosions. | Keeps game audio louder through Bulk Detonator blasts: dwarf speech and shields to 0.8, enemies to 0.4, pitch undropped. |
| ReducedClusterParticles | Reduces Micro Missile cluster particle effects. | Strips Micro Missile cluster muzzle, separation, trail and impact particles. |
| ReliableLandscape | Reduces cave rendering cost by disabling nonessential debris and terrain shadows and removing selected ambient effects. | Disables bloom, motion blur, ambient occlusion, light shafts, volumetric fog, and shadows; hides selected cave debris, terrain shadows, spent flares, and turret debris. |
| remove-all-muzzle-flashes | Removes weapon muzzle-flash particles. | Removes weapon muzzle flashes when used with Remove All Particles but Weapons. |
| Remove_All_Particles_And_Some_WeaponsNTools_S5 | Removes many Season 5 particles and selected weapon/tool effects. | Removes or simplifies many particle effects across weapons, enemies, objectives, hazards, and environments. |
| Remove_All_Particles_And_Some_WeaponsNTools_S6 | Removes many Season 6 particles and selected weapon/tool effects. | Reduces particle effects across weapons, enemies, and mission objectives, including disabled weapon emitters and empty Doretta spark effects. |
| Remove_All_Particles_And_Some_WeaponsNTools_S6v | Removes many Season 6 particles and selected weapon/tool effects (variant). | Reduces particle effects across weapons, enemies, and mission objectives, including disabled weapon emitters and empty Doretta spark effects. |
| Remove_All_S6_Particles | Removes Season 6 particle effects. | Removes Season 6 event particles: repaired-domain thrusters, Boneyards spikes, dust and bone terrain. |
| Remove_Drillevator_Engine_Exhaust | Removes drillevator engine exhaust. | Removes Drillevator engine exhaust and standing smoke. |
| remove_hotglowANDscorchedearth_P | Removes hot glow and Scorched Earth footprint effects. | Disables a broad set of decal materials, including Hot Glow and Scorched Earth, as well as blood splats, bullet impacts, and dwarf footprints. |
| remove_scorchedearthONLY_P | Removes Scorched Earth footprint effects. | Disables Scorched Earth and many other decal materials, including blood splats, bullet impacts, puddles, and dwarf footprints. |
| remove_weather_slows | Removes movement slowdowns from snowstorms, sandstorms, and earthquakes. | Removes storm, quake and sandstorm slowdowns for enemies and players. |
| RemoveCWCImpactParticles | Removes Corrosive Wave Cooker impact particles. | Empties Corrosive Wave Cooker impact particles. |
| RemoveExtraneousParticles | Removes extraneous enemy, fire, gas, and objective particles. | Removes selected weapon and tool particles, including casing, explosion, projectile, and impact effects. |
| RemoveGooBoomParticles | Removes Goo explosion particles. | Removes Goo Cannon explosion particles. |
| RemoveGunkSeedSecondary | Removes gunk seed secondary. | Removes Gunk Seed, barnacle and egg secondaries plus Deep Scan, Morkite Well and Excavation deep dives. |
| RemoveMortarParticles | Removes Mortar Shell explosion particles. | Removes Mortar Shell explosion particles. |
| removeobstructiveparticles | Removes obstructive Goo, Mortar, Ice, and Micro Missile particles. | Strips missile-cluster and goo particles that block vision. |
| RemoveUnwantedAssetChanges | Removes unwanted asset changes. | Restores selected base-game visuals altered by the Azuki-San lootbug, flare, and flare-gun-ammo mods, including Space Rig holograms and loading-screen Hoxxes. |
| ResponsiveGrenadeAnimation | Changes weapon, upgrade, or overclock data for Responsive Grenade Animation. | Speeds grenade equip and throw animations 2.5x. |
| RestartMission | Adds an in-game mission restart action and UI. | Adds keybinds and UI to restart, reroll or switch missions mid-run. |
| ResupShamer | Adds resupply/ammo tracking and a resupply-shaming status display. | Reports each player’s ammo and health refill percentages in chat after a resupply. |
| revert-em-discharge | Reverts Sentry EM discharge behavior. | Removes the sentry arc and EMP discharge indicators. |
| Revert_Deployable_Sentries_on_Caretaker | Changes enemy definitions or variants for Revert Deployable Sentries on Caretaker. | Lets Engineer sentries be placed on the Caretaker again. |
| RevertEMDischargeVWA | Reverts Sentry EM discharge behavior for VWA. | Reverts the sentry to faster redeploy, faster reload and bigger ammo. |
| ReviveTwerk_Fast_P | Replaces the revive animation with a faster twerk animation. | Replaces the revive animation with a twerk at 2.5x speed. |
| ReviveTwerk_P | Replaces the revive animation with a twerk animation. | Replaces the revive animation with a twerk at normal speed. |
| revolverSound | Replaces the Bulldog Revolver's firing sound with FAMAS-style audio. | Replaces the Bulldog revolver’s first-person firing sound with three custom gunshot samples selected at random. |
| RoomsInfo | Displays cave-room/layout information during missions. | Prints spawned cave-room names with Num8 (remappable through DRGLib); requires a CheatManager enabler. |
| ruble | Changes the Credits icon. | Changes the Credits icon to a custom texture. |
| RudeMissionControl | Replaces Mission Control voice lines with rude/custom audio. | Adds an alternate Mission Control voice pack with hundreds of audio assets, profile settings, and separate muted and placeholder voice tables. |
| Sabo_SingleHack | Changes Sabotage to use a single hacking objective. | Completes the remaining hacking generators when one finishes in a Sabotage mission. |
| Sabo_SingleHack_StageFix | Changes Sabotage to use one hack and fixes stage progression. | Completes the remaining hacking generators and advances the Sabotage objective to stage 3. |
| SaboCheat | Adds a Sabotage cheat/utility. | Automatically completes Sabotage hacking stations on the server. |
| SabotagewithStationaries | Adds stationary enemies to Sabotage missions. | Enables normal and stationary encounters in Sabotage with 12 minimum stationaries. |
| SAD | Adds custom assets for SAD. | Turns the Space Rig dark and haunted with ghost actors plus lamp and ambient color settings. |
| SakuraMods_FastDeposit | Speeds up depositing minerals and objects. | Adds an Alt+F toggle for faster resource deposits; it only triggers while carrying resources, not already depositing, and below 150 ms ping. |
| SaltPits_Biome_Recolour | Recolors Salt Pits biome terrain. | Darkens Salt Pits rock wall red tints (wall tint 0.46 to 0.15, fresnel 0.57 to 0.07). |
| SaluteCancel | Allows the salute animation to be cancelled. | Lets the player interrupt the salute animation while its montage is playing. |
| SalvagePLSTest | Test replacement for Salvage procedural layout data. | Replaces Salvage test rooms with defaults (test layout mod). |
| SalvoChanger | Changes Hurricane Salvo overclock acceleration, area boost, and projectile behavior. | Makes Hurricane buckshot homing with instant acceleration. |
| sandboxutilities_cd2b10b | Adds shared Custom Difficulty sandbox utilities and JSON/UI helpers. | Adds Custom Difficulty 2 descriptor support to AssemblyStorm’s Sandbox Utilities pak; it can replace the original Sandbox Utilities pak. |
| SaveEditor | Adds a Space Rig save editor for rank, overclocks, resources, season data, and scrip. | Adds a save editor for overclocks, player rank, resources and seasons. |
| SaveNormalizer | Adds custom assets for Save Normalizer. | Clears the current save’s modded/sandboxed flag and saves it to disk when loaded in the Space Rig. |
| SBSC_patchedMEV | Patches seasonal event, encounter, and enemy settings for MEV compatibility (v7). | Disables seasonal events, special encounters and anniversary trophies for MEV runs. |
| ScripCheat | Adds a cheat for Season Scrip and season-tree data. | Sets season-pass XP per level to 1 and season-token rewards to 500, sharply accelerating season progression and token gain. |
| sdfandraymarchskins | Adds custom vanity and weapon-skin assets using SDF/ray-marched materials. | Adds SDF-patterned weapon paintjobs and their material variants to the Custom Vanity Framework. |
| season2CoreStone | Adds Season 2 Core Stone content. | Updates Season 2 challenge content to Core Stone and Rift references. |
| SecondWindMod_P | Changes the Marathon Man/Second Wind perk behavior. | Shortens Marathon Man sprint-boost time per rank (5s to 2s at base, down to 0s at max). |
| SentriesOnDoretta | Allows recallable Sentries to be placed on Doretta. | Places Engineer turrets on Doretta and makes them move with her. Host install is required for movement; recall before repositioning to avoid aim offsets. |
| SepticSpreaderBuff | Changes enemy definitions or variants for Septic Spreader Buff. | Enlarges Septic Spreader puddles and speeds up its fragments. |
| SeriousSamClassicSFX | Changes audio cues for Serious Sam Classic SFX. | Replaces Bulldog and Boomstick reload sounds with Serious Sam samples. |
| Shield_Expiration_Colors_No_Flashing | Changes cave, terrain, or biome content for Shield Expiration Colors No Flashing. | Edits Shield Expiration Colors to remove the green/yellow and red/green blinking phases as the Gunner shield expires. |
| shieldc4count | Adds a configurable C4 count/settings HUD. | Shows HUD counters for teammates’ shields and C4, with placement and disarm options. |
| ShieldColors3_5 | Changes cave, terrain, or biome content for Shield Colors3 5. | Recolors the Gunner shield as it expires, with code edits for compatibility with Modified Gunner Shield Effect. |
| ShieldColors3_5NoWipe | Adds saved shield-bubble color settings and removes the wipe effect. | Recolors the Gunner shield as it expires, with code edits for compatibility with Modified Gunner Shield Effect and its NoWipe variants. |
| ShieldLinkRange-0.1.0 | Adds Shield Link range UI and shield-ring visual assets. | Draws a ring around dwarves to show their Shield Link radius, updating its size from LinkDistance and hiding it while the terrain scanner is raised. The Mod Hub page provides visibility and display-mode settings. |
| shieldste0 | Changes shield regeneration status-effect behavior. | Makes you immune to damage while shields regenerate (resistance 0.5 to 0); host-only. |
| shieldsteincrease | Changes weapon, upgrade, or overclock data for shieldsteincrease. | Raises damage resistance while shields regenerate to about 99% (0.5 to 0.01); host-only. |
| silent_ledge_grab | Removes ledge-grab animation/audio feedback. | Silences ledge-grab animation sounds. |
| SilentGrapplingGun | Removes Grappling Hook firing, travel, and cooldown sounds. | Silences Grappling Hook fire, travel, progress and cooldown sounds. |
| silentidledroppod | Silences idle drop-pod ambience and alarms. | Silences drop-pod idle, steam and load-beam sounds. |
| SilentRolloverShit | Changes audio cues for Silent Rollover Shit. | Silences UI button rollover sounds. |
| SilentSentry | Changes audio cues for Silent Sentry. | Makes sentry firing, movement, and deployment much quieter, and replaces its activation and deactivation sounds with custom clips. |
| SilentZipline | Removes Zipline activation and sliding sounds. | Silences zipline riding sounds and shouts. |
| SimpleHeatCrosshaircyantomagenta | Adds a simple heat crosshair with a cyan to magenta color scheme. | Adds a heat crosshair widget with hardcoded cyan-magenta colors. |
| SimpleHeatCrosshaircyantowhite | Adds a simple heat crosshair with a cyan to white color scheme. | Adds a heat crosshair widget with hardcoded cyan-white colors. |
| SimpleHeatCrosshairmagentatocyan | Adds a simple heat crosshair with a magenta to cyan color scheme. | Adds a heat crosshair widget with hardcoded magenta-cyan colors. |
| SimpleHeatCrosshairmidnight | Adds a simple heat crosshair with a midnight color scheme. | Adds a heat crosshair widget with hardcoded midnight colors. |
| SimpleHeatCrosshairpinktocobalt | Adds a simple heat crosshair with a pink to cobalt color scheme. | Adds a heat crosshair widget with hardcoded pink-cobalt colors. |
| SimpleHeatCrosshairpinktopurple | Adds a simple heat crosshair with a pink to purple color scheme. | Adds a heat crosshair widget with hardcoded pink-purple colors. |
| SimpleHeatCrosshairwhitetored | Adds a simple heat crosshair with a white to red color scheme. | Adds a heat crosshair widget with hardcoded white-red colors. |
| SimpleHeatCrosshairyellowtopink | Adds a simple heat crosshair with a yellow to pink color scheme. | Adds a heat crosshair widget with hardcoded yellow-pink colors. |
| SimpleIconcolor_WhiteFix | Fixes white gear and grenade icon colors. | Removes gradient backgrounds and border bars from HUD elements such as the ammo bar. |
| skinpack | Adds a collection of cosmetic skins. | Adds 352 custom paintjobs, about 60 distinct designs excluding recolors; most are animated and require Custom Vanity Framework. |
| SkipAtComplete | Adds an option to skip completed mission states. | Skips the end-of-mission screen and the Performance Pass after mission completion. |
| SkipWithContinue | Adds a skip/continue option after a mission completes. | Makes the end screen’s Continue button skip the Performance Pass. |
| SlimeTrailNoDamage | Removes damage from Rockpox Corruptor slime trails. | Removes the Rockpox slime-trail contact effect. |
| slopskins | Adds the Slopskins cosmetic skin collection. | Adds SDF-patterned weapon paintjobs and their material variants to the Custom Vanity Framework. |
| SludgePumpMod | Reworks Sludge Pump upgrades and Goo Cannon behavior. | Combines Goo Cannon tier-1 velocity and AoE upgrades into one choice, keeping clip capacity. |
| SmootherCarveResinite | Smooths Resinite deposit terrain carving. | Smooths Resinite carving with rarer, cheaper carver updates. |
| SomeBugsSomeContent | Changes Season 4 event chances and Rockpox enemy settings. | Disables Season 4 events and Rockpox swarms. |
| SoonerZiplineBoost | Makes the Zipline boost activate sooner. | Makes the zipline speed boost kick in almost immediately (0.25s to 0.001s). |
| spacerigtweaks | Adjusts Space Rig smoke, drop-pod ambience, and related rig effects. | Darkens the Space Rig by removing extra lights from the drop pod and terminals while keeping many ambient point lights; also removes Forge and drop-pod drill smoke. |
| SpawnParticles | Changes enemy-spawn particles. | Restores enemy spawn particles; load it above particle-removal mods. |
| SpecialShells | Changes weapon, upgrade, or overclock data for Special Shells. | Reworks the shotgun-jump overclock into Special Shells with tighter spread and half ammo. |
| SpitballerNuke | Adds custom assets for Spitballer Nuke. | Makes Spitballers fire 3-shot bursts of Fat Boy nukes; required by all players. |
| SpitballerNukeEX | Adds custom assets for Spitballer Nuke EX. | Makes Spitballers fire a continuous barrage of slow radiation-only nukes; required by all. |
| SpitballerNukeU | Adds custom assets for Spitballer Nuke U. | Makes Spitballers fire rapid 10-shot bursts of fast nukes; required by all players. |
| Splattered_Sentry_Gun | Changes weapon, upgrade, or overclock data for Splattered Sentry Gun. | Adds a physics asset to the Engineer sentry mesh, enabling ragdoll physics. |
| Sprint | Changes cave, terrain, or biome content for Sprint. | Raises forward walking speed to sprint speed when no movement-slowing status is active. |
| ssas | Adds the SSAS gameplay/settings mod. | When Facility Power Station shield generators are present, assigns the Drop Pod a randomized target point near a generator and turns it toward a generator. |
| ST_projectile_mod | Reworks the projectile and Inferno particle effects. | Reworks Flamethrower inferno muzzle, impact, projectile and drop particles around a ribbon trail and beam. |
| ST_projectile_mod_noexplosion | Reworks the projectile effects without the explosion effect. | Reworks the inferno projectile trail like ST_projectile_mod but strips muzzle and impact explosion effects. |
| StalkerFootstepTweaks | Adjusts Stalker footstep audio. | Replaces Stalker footsteps with metallic impact sounds at 5x volume. |
| StalkerLowGraphicsFix | Reduces or fixes Stalker camouflage graphics cost. | Simplifies the Stalker ghost material to cut graphics cost. |
| StalkerMaterialRetexture | Retextures the Stalker camouflage material. | Retextures Stalker camouflage as a ghost material with fringe colors. |
| StayInMyHands | Prevents carried objects from being forcibly dropped. | Stops carried objects dropping on hard falls (max fall velocity 1000 to 10000). |
| Steeve Better Visibility | Improves Steeve's visibility with custom materials and particles. | Swaps Steeve’s beastmaster particles for heart particles, improving visibility. |
| stickiergoo | Makes Goo Cannon puddles stickier. | Makes goo puddles persist without terrain. |
| StickyShield | Makes Shield Regenerator shields stickier/longer-lasting. | Lets the shield regenerator attach to creatures and sentry spots with blocking collision. |
| StingerBalance_P | Rebalances Stingtail behavior. | Rebalances Stingtails with more health, no resistances or armor and a brighter weakspot light. |
| StingtailAudioFix | Fixes Stingtail attack audio. | Raises Stingtail attack-tell cue priority to 1.1 so it is not drowned out. |
| StingtailGlowingArmor | Adds custom assets for Stingtail Glowing Armor. | Reworks Stingtail armor material with brighter tints and lower emissive multiplier. |
| StingtailGrabDamageTest | Test changes Stingtail grab damage. | Test build removing Stingtail grab damage and leg armor with faster hooks. |
| strafe_stingtails | Allows Stingtails to strafe while attacking. | Buffs Stingtails with faster hook attacks, more health and less stagger immunity. |
| StubbyElectricGuarantee | Guarantees the Stubby SMG electric effect under its upgrade conditions. | Guarantees Stubby electrocution and removes its spread, with slight variant differences. |
| SugarRush1.0.3 | Adds Sugar Rush mod content and UI assets (v1.0.3). | Resizes selected UI textures for assignment, class-milestone, and challenge screens: most are halved, one upgrade icon is reduced to 128×128, and the “No Active Assignment” image is doubled. |
| tealbettershieldbubblenowipe | Recolors the shield bubble teal and removes its wipe effect. | Re-skins the shield bubble teal with sunflower tiles and removes the wipe effect. |
| TemperatureNumber | Displays temperature values in the HUD. | Shows numeric temperature on enemies and bosses with a custom font HUD. |
| TemperatureNumber_LOGGED | Displays temperature values in the HUD with logging enabled. | Adds numeric temperature readouts for dwarves and enemies, including boss-fight HUD indicators, with color changes for heat and freeze levels. |
| teparticles | Changes the Minigun heat-burst particle effect. | Restores the Minigun T5B target-explosion particles; load it above particle-removal mods in Mint. |
| Test_P | Test balance pack for Assault Rifle stats, upgrades, and overclocks. | Test balance pack that broadly retunes weapon stats, upgrades, overclocks, and projectiles; other archived versions also change Hazard 5/Deep Dive settings, enemy stats, and the active-enemy cap. |
| Time4Tests | Changes cave, terrain, or biome content for Time4Tests. | Sandbox test mod with hotkeys for global time dilation: 0 toggles pause, - cycles 1/0.1/0.05, and = cycles 1/2/8. Zero dilation can leave the cursor stuck; client effects may differ. |
| TrackingIconOptions | Adds configurable tracking icons for objectives, players, fuel, and sentries. | Customizes tracking icons: teammate, sentry and fuel persistency plus opacity and smaller utility icons. |
| TransFlamethrower | Makes Flamethrower effects translucent. | Downscales four Flamethrower and explosion effect textures from 2048×2048 to 1024×1024. |
| TransparentLaserMark | Makes the laser-mark HUD bracket transparent. | Makes the small HUD bracket window’s normal border fully transparent; its alternate gold highlight color remains visible. |
| TransSeptics | Makes Septic Spreader materials and acid puddle effects translucent. | Recolors Septic Spreader pink and white with matching acid and lights. |
| TrashEnemyCulling | Culls low-value enemy actors to improve performance. | Caps render distance on trash enemies for performance (crawlers 3800, swarmers 2750). |
| TripleBarrel | Adds custom assets for Triple Barrel. | Converts the Pack Rat overclock into Triple Barrel with extra ammo bonuses. |
| truedarkmode | Darkens Space Rig lighting, smoke, and console materials. | Silences drop-pod idle and steam plus removes Space Rig smoke. |
| Turbojaw | Changes Mactera Tri-Jaw firing behavior. | Greatly increases Tri-Jaw projectile count with 0.05s delays. |
| turretDebrisBeGone | Removes turret-base debris. | Removes Caretaker turret-base debris (collider and mesh scaled to zero). |
| TurretWhipNoCost | Removes the ammo/resource cost from Turret Whip. | Removes the Turret Whip special-attack ammo cost (5 to 0). |
| Tutorial_Biome_Recolour | Recolors Tutorial biome terrain and rock particles. | Darkens tutorial rock tints from olive-green to dark brown. |
| TutorialBiomeUnlocker | Unlocks the Tutorial biome. | Adds a hotkey-triggered way to generate and select a mission in the Tutorial biome. |
| twerkanimationreplace | Replaces the dwarf dance animation with a twerk animation. | Replaces the dwarf dance with a longer twerk animation. |
| U39更多敌人简化模型 | Adds custom assets for U39更多敌人简化模型. | Replaces skeletal meshes for a broad range of enemies with simplified models, including spiders, jellyfish, leeches, plants, woodlice, and plague creatures. |
| U39更多敌人简化模型(单删看守着) | Replaces many enemy models with simplified low-poly versions for Update 39; Caretaker is excluded. | Replaces a broad set of enemy and cave-creature skeletal meshes with simplified models, including leeches, jellyfish, plants, woodlice, and spiders. |
| u40 | Update 40 custom-difficulty/configuration text presets. | Adds five Update 40 custom-difficulty presets for Hazards 6–9+, changing enemy waves, resistances, caps, and resupply settings; the author notes timed surges and altered enemy rosters. |
| UI_HowFarMule | Adds a HUD display for the M.U.L.E. distance. | Adds a mission HUD readout showing the M.U.L.E.’s distance in meters, with color changing by range. |
| UnfinishedGrenades | Changes cave, terrain, or biome content for Unfinished Grenades. | Lets you equip the unfinished Bear Trap, Plasma Boomerang and Damage Enhancer grenades with keys 6–8; grenades refill automatically. |
| Unfreezable_Nexuses | Changes enemy definitions or variants for Unfreezable Nexuses. | Makes Spawner Nexuses nearly unfreezable. |
| Unfreezable_Stationaries | Changes cave, terrain, or biome content for Unfreezable Stationaries. | Makes Cave Leech, Spawner Nexus, Jelly Breeder and Spitball plants nearly unfreezable. |
| unified-ui | Adds a unified ModHub UI with sorting, tabs, settings, and saved layout. | Adds a resizable, translucent mod manager with mod tabs, a sortable and favoritable mod list, per-mod pages, and configurable menu settings. |
| Unified_Weapon_Balance | Rebalances weapon stats, upgrades, overclocks, and status effects. | Rebalances weapons and upgrades across the arsenal, changing base damage, ammo, recoil/spread, overclocks, upgrade combinations, and status-effect values across many weapon families. |
| v0.21 | Version 0.21 custom-difficulty/configuration text presets. | Adds Chinese custom-difficulty presets for tiers 1–9 plus a Clear 6 challenge; the author notes describe enemy roster, wave timing, cap, resistance, and challenge-objective changes. |
| v2_Reduce_Mining_Fragments_minimal_dust__sparks | Changes visual effects for v2 Reduce Mining Fragments minimal dust sparks. | Cuts power-drill debris and reduces fragments from mining minerals and metals; Hollow Bough and Fungus Bogs are unchanged. |
| VCM | Changes vertical corpse movement behavior. | Changes dead-player physics to keep vertical corpse movement while reducing horizontal drift. |
| VEA-Exp | Adds experimental enemy variants and status effects. | Enemy rebalance: faster Cave Leech grabs, more Young Woodlouse health, revised Spider attacks and resistances, Plague infection changes, and shorter acid and goo puddle lifetimes. |
| VEA-Exp_b2 | Adds experimental enemy variants and status effects (build b2). | Enemy rebalance: faster Cave Leech grabs, more Young Woodlouse health, revised Spider attacks and resistances, Plague infection changes, and shorter acid and goo puddle lifetimes. Also revises Spider Spitter AI. |
| VEA_Add_Second_STE_to_Praet_Spit | Adds a second status effect to Praetorian spit. | Applies the Plasma Carbine’s Conductive Thermals status effect to qualifying cone-attack hits before the original overlap handler. |
| VEA_Add_Second_STE_to_Praet_Spit_Actually_Goes_Second_Now | Adds a second status effect to Praetorian spit with the ordering fix. | Applies the Plasma Carbine’s Conductive Thermals status effect to qualifying cone-attack hits after the original overlap handler. |
| ViewmodelDecoupler | Decouples selected weapon/projectile effects from the first-person viewmodel. | Decouples selected Breach Cutter, EPC, and Hurricane projectiles from the weapon viewmodel by repositioning them to the first-person camera direction. |
| VolatileGutsNoFriendly | Removes friendly fire from Volatile Guts explosions. | Removes friendly fire from Volatile Guts explosions. |
| VT2Ping | Adds a ping marker effect. | Replaces the laser-pointer mark sound with a longer Vermintide-style ping (0.86s to 3s). |
| VWA-SalvoSpread | Changes weapon, upgrade, or overclock data for VWA Salvo Spread. | Tightens Hurricane salvo spread across five strength variants. |
| VWARevertNTPStacks | Reverts Neurotoxin Payload stack behavior for VWA. | Rebalances weapon and upgrade stats across the arsenal, changing values such as damage, ammo, fire rate, spread, handling, and status-effect behavior. |
| WalkableCharacterSelector | Adds custom assets for Walkable Character Selector. | Loads the Character Selection level behind the Space Rig; access it with Sandbox Utilities. |
| WarthogNoMovementSpread | Removes movement spread from the Warthog. | Removes Warthog spread entirely, including while moving and sprinting. |
| WaveCookerT5Booster | Changes the Wave Cooker's Tier 5 Booster upgrade. | Maxes Wave Cooker tier-5 shock chances and explosion bonuses. |
| WebSpitter1500cmReposition | Changes enemy definitions or variants for Web Spitter1500cm Reposition. | Makes Web Spitters reposition from 1500cm away with tighter approach. |
| WebSpitter150cmReposition | Moves Web Spitters 150 cm from their original position. | Halves Web Spitter reposition distance (300 to 150cm). |
| WebSpitter300cmReposition | Moves Web Spitters 300 cm from their original position. | Widens one Web Spitter approach radius (200 to 1000) and tightens another (1000 to 100). |
| White_Biomes | Recolors biome terrain and post-processing effects white. | Changes the main cave-rock material to white and uses neutral-gray fog, giving caves a pale biome look. |
| WhiteAsylum | Adds custom assets for White Asylum. | Turns selected biome environment material tints white across Azure Weald, Hollow Bough, Bone Yards, Fungus Bogs, and other regions. |
| whitebettershieldbubblenowipe | Recolors the shield bubble white and removes its wipe effect. | Re-skins the shield bubble white with sunflower tiles and removes the wipe effect. |
| WhiteBreachCutter | Recolors the Breach Cutter beam and impact effects white. | Recolors the Line Cutter white across weapon, projectile and particles. |
| WhiteEPC | Recolors EPC firing, projectile, and heat effects white. | Recolors the EPC muzzle, charged-shot, overheat, and projectile effects white. |
| whitegoo | Changes visual effects for whitegoo. | Recolors Goo Cannon goo and corrosive visuals white, including projectile, puddle, decal, and enemy-corrosion assets. |
| WhiteSentryIndicators | Recolors Sentry Gun range and EMP indicators white. | Shows the sentry range sphere and recolors indicators white. |
| WhiteStingtails | Recolors Stingtail armor and flesh white. | Recolors Stingtail armor and flesh white. |
| WindowMarker | Adds a GUI for marking windows. | Automatically outlines enemies seen by players and retains marked targets for 20 seconds; activation is restricted by a Steam-ID check. |
| WOH | Adds the War of Hoxxes enemy pack. | Adds War of Hoxxes enemy variants and themed mission warning content, including Golems, Sharks, Assault Bots, Ghosts, Tendrils, and Fortress, Graveyard, and Tomb warnings. |
| WoH_cd2 | Adds the War of Hoxxes enemy pack for Custom Difficulty 2. | Ports Wrath of Hoxxes enemy content to Custom Difficulty 2 by moving its enemy descriptors to a visible location and removing them from the pool. |
| XZSChatManager_NoMusic | Changes HUD or UI assets for XZSChat Manager No Music. | Removes music playback from XZS Chat Manager by removing its music-file paths. |
| XZSChatManager_v1_1_3_withoutthestupidfuckingmusicthatsdrivingmecrazyplaying | Adds the XZS chat manager without its background music. | Adds an XZS chat overlay with player messages, synchronized player icons, avatar-image downloads, and language switching. |
| YakuzaSFX | Replaces selected pickaxe, boss-bar, and power-attack audio with Yakuza-style sound effects. | Replaces pickaxe power-attack impact and boss-bar sounds with Yakuza meme sounds. |
| YakuzaSFXDayum | Replaces selected pickaxe, boss-bar, and power-attack audio with alternate Yakuza-style sound effects. | Replaces pickaxe power-attack impact and boss-bar sounds with Yakuza meme sounds, using the dayum tiger-drop take. |
| yellowbettershieldbubblenowipe | Recolors the shield bubble yellow and removes its wipe effect. | Re-skins the shield bubble yellow with sunflower tiles and removes the wipe effect. |
| YellowBreachCutter | Recolors the Breach Cutter beam and impact effects yellow. | Recolors the Line Cutter yellow across weapon, projectile and particles. |
| YellowEPC | Recolors EPC firing, projectile, and heat effects yellow. | Recolors the EPC muzzle, charged-shot, overheat, and projectile effects yellow. |
| YellowSentryIndicators | Recolors Sentry Gun range and EMP indicators yellow. | Shows the sentry range sphere and recolors indicators yellow. |
| YoMAMA | Adds enemy speed-buff dummy variants for testing. | Adds custom enemy variants and test dummies, including spider tanks with health, speed, stun, temperature, and other aura effects, plus movement-speed and shield-control dummies. |
| zAOE_Indicator | Adds colored area-of-effect indicators for explosions, Fire Bombers, and similar attacks. | Disables twin-mine, bomber and explosion burst particles. |
| ZhukovsHalfRecoilAndSpread | Halves Zhukov recoil and spread. | Halves Zhukov recoil and spread. |
| Zip | Adds the Zip movement/utility mod. | Sets the Zipline Gun usable component’s interaction priority to -101 when the Zip actor begins play. |
| ziplinesmallercable30 | Makes Zipline cables 30% smaller. | Halves zipline cable width (6 to 3) and raises line priority (2 to 5). |
| ziplinesmallerhitbox | Changes weapon, upgrade, or overclock data for ziplinesmallerhitbox. | Shrinks the zipline grab hitbox radius (60 to 20) and raises line priority (2 to 5). |
| ziplinesmallerhitbox30 | Makes Zipline hitboxes 30% smaller. | Shrinks the zipline grab hitbox radius (60 to 30) and raises line priority (2 to 5). |
| ziplinesmallerhitbox40 | Makes Zipline hitboxes 40% smaller. | Shrinks the zipline grab hitbox radius (60 to 40) and raises line priority (2 to 5). |
| ziplinesmallerhitboxandcable | Makes Zipline cables and hitboxes smaller. | Shrinks zipline cable width (6 to 1) and grab hitbox (60 to 20). |
| ZiplineSoundRemoval | Removes Zipline activation and sliding sounds. | Mutes zipline gun on/off, sliding and boost sounds. |
| zznuketest3particle | Test change for the radioactive cloud particle used by nuclear effects. | Adds a fourth mesh emitter to the large radioactive-cloud particle (test). |
| 去除所有脚印，虫子血迹和子弹弹孔以提高帧数_P | Adds custom assets for 去除所有脚印，虫子血迹和子弹弹孔以提高帧数 P. | Disables many decal materials, including dwarf footprints, bug blood splats, and bullet impacts; it also removes several fire, corrosion, and puddle decals. |

## Held for missing evidence (not publishable yet)

- Needs rogue-core-baseline: 1P_negotiations_P, 4_resupply_racks_P, Accelerate100_P, AltIcons_P, BreathingRoom_P, bubblegum_weapons_P, Chat_Notifs2_P, Chat_Notifs_P, critdart_P, female_dwarves_P, free_beer_P, Instant_Falcon_Anim_P, instant_rewind_anim_P, male_dwarves_P, NoHuffPuff_P, NoPickaxeSlow_P, PS4_icons_P, QuietSentry_P, RogueCoreVanityTest, Silent_Blocked_MopC_P, Silent_MopC_clientside_P, SimpleClassesIcons_P, simpler_c4_particle_P, WeaponFOV_P, no_heavylanding_P, bubblegum2_P
  Rogue Core packages: DRG 4.27 UnrealPak reports PakEntry mismatch and UAssetGUI cannot parse them. Needs Rogue Core build baseline and compatible reader before any description.

- Needs deeper-static-analysis: FixDreadnoughtAttackIndicatorNotShowing, FixDreadnoughtStompIndicatorNotShowing, FixPatrolBotLaserSightNotShowing
  Extracted but static evidence is inconclusive (identical-to-vanilla properties, profile-name-only changes, or unclear semantics). Needs deeper bytecode, bulk-data, or era-baseline analysis.

- Needs trace-targets-and-shield-hook: NoRecovery_NoShieldInteraction
  The extracted InitCave Blueprint repeatedly toggles usability on traced cave actors and their interaction components. The package export does not expose a shield-recovery hook, so the claimed relationship to shield regeneration is not established.

- Needs historical-game-build-or-source: CustomRoomsEscortUnlockerMixedAndCombined
  All four Escort room DNA exports match the installed game baseline exactly. The archive does not demonstrate an unlock change in this build.

- Needs historical-game-build-or-source: CustomRoomsRefineryUnlockerMixedAndCombined
  Both Refinery room DNA exports match the installed game baseline exactly. The archive does not demonstrate an unlock change in this build.

- Needs compatible-static-mesh-parser-or-source: input_P
  All four flare and flare-gun mesh assets extract from the PAK, but UAssetGUI produced no JSON exports. The binaries differ from the separate empty-mesh flare removal package, so its exact effect is unresolved.

- Needs resolve-deep-scan-state-enum: DeepCheat
  The server waits 15 seconds and calls Deep_Scan_Objective.ChangeState(1), but the cooked asset does not resolve the objective state enum. The user-visible result of state 1 must be mapped before describing this as a completion or unlock cheat.

- Needs resolve-refinery-state-enum-for-both-variants: NoRefining
  Two package variants set the refinery state to numeric values 5 and 6. The corresponding RefineryState enum labels and resulting player-visible behavior are unresolved.

- Needs different-build-or-author-source: mcaoparticles
  The package’s only exported asset, NS_ElectricPlatform, has byte-identical cooked JSON to the installed game baseline. No visual change is demonstrated in this build.

- Needs compatible-blueprint-parser-or-source: Enemy_Perf
  The package exports four EnemyPerf Blueprint classes, but UAssetGUI provides no cooked properties or readable function bytecode. The performance behavior cannot be established from this export.

- Needs mod-specific-source-or-runtime-entrypoint: nodamage
  The 289 exported assets are the Elytra Mod Manager UI/framework and shared state-manager support. No asset or readable graph in this PAK exposes a no-damage toggle or damage behavior, so the existing test-mode description is unsubstantiated by this package.

- Needs matching-game-binary-containing-signature-or-author-source: bitfix
  The release Lua overwrites two bytes at UStickyFlameSpawner::TrySpawnStickyFlameHit+0x2C with a short unconditional jump (EB 32). Its signature is absent from the installed FSD-Win64-Shipping.exe, so the skipped branch cannot be mapped from this build.

- Needs matching-build-uasset-headers-or-a-parser-for-unversioned-uexp-overlays: Haz6
  The package contains only .uexp overrides for DFC_Haz_05_Lethal, BP_EscortMule, and ITM_SupplyDrop; no matching .uasset headers are included. Pairing the overrides with installed headers produced no parser export.

- Needs matching-build-uasset-headers-or-a-parser-for-unversioned-uexp-overlays: Hazard_6_2x
  The package contains only .uexp overrides for DFC_Haz_05_Lethal, BP_EscortMule, and ITM_SupplyDrop; no matching .uasset headers are included. Pairing the overrides with installed headers produced no parser export.

- Needs trace-sprint-state-flow: SprintFixer
  The exported Blueprint resets fireCounter and calls offFire and 2offFire, but its full input/state flow does not establish the exact player-visible sprint behavior. Needs the resolved parent-class or author context and a traced event path.

- Needs identify-descriptor-counter-widget-and-binding: nodescriptorcounter
  The package includes Elytra Mod Manager and damage-monitor assets, but no changed widget or function has yet been tied to removing the descriptor count. Needs the exact changed UI binding/function and a matching EMM baseline.

- Needs author-context-or-release-baseline: vanillaEPC
  Of 134 exported assets, 133 match the installed game baseline; the remaining asset changes a cached texture reference. The intended player-visible effect is not established. Needs author context or the matching release baseline.

## Remaining work

Continue the pending queue with package-specific property, bytecode, media and source-context review. Establish historical baselines where the current game differs. Resolve raw exports using a compatible parser or mappings. Review large multi-feature bundles and every distinct version before accepting group-level text.

No production descriptions have been updated by this audit. The pending migration and local recovery snapshot carry the reviewed text; publication requires a live-update request.

## Evidence

Reviewed claims and exact package hashes: `docs/dump-descriptions-reviewed.json`. Complete queue: `docs/dump-description-audit-status.json`. Private raw context, packages, exports and vanilla comparisons: `.dump-audit/` (ignored by Git).
