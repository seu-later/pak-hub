# Pak Dump description accuracy plan

## Objective and scope

Give players a concise, accurate account of what each Pak Dump mod does. Review every group, including descriptions that currently look complete. Names, asset paths, and existing descriptions are discovery clues, not proof of behavior.

Planning baseline: the recovery snapshot generated on 14 October 2026 contains 893 groups, 1,173 downloadable files, and 416 groups linked to Pak List posts. Reconcile this against the current catalog before starting; these counts are not a permanent target.

This plan does not change descriptions, game files, or production data.

## Findings and available tools

- `tools/dump-descriptions.mjs` combines manual text with name-based and asset-category guesses. Manually entered descriptions also need evidence review.
- `tools/dump-inventory.mjs` lists archive members; it does not establish gameplay behavior or inspect nested packages deeply.
- `tools/drg-doctor.ps1` in the parent workspace confirmed UnrealPak, UAssetGUI, UE4.27, an FSD modkit project, the installed game, and its base PAK. FModel is also present; validate its export workflow before relying on it.
- Existing parent-workspace extraction, JSON transformation, and verification scripts provide examples. Their previous reports are leads; verify that their hashes and game versions match the files under review.
- The recently exhausted D1 quota makes repeated production queries unsuitable for analysis. Work from one export and local files, then perform bounded verification requests.

## 1. Freeze an inventory and create an evidence ledger

Capture the current groups, descriptions, exact filenames, hashes, versions, game identity, available post links, and download locations. Read existing local exports first and fetch only missing information.

Create one analysis record per unique file hash, with group membership recorded separately. Identical files can share analysis; similarly named files cannot. Retain earlier versions and optional variants rather than assuming the newest file explains all downloads.

Each record contains: old description, candidate description, concrete claims, supporting source locations, relevant asset/property/function differences, baseline version, analysis status, contradictory evidence, and remaining questions. Keep private post context outside public artifacts.

## 2. Recover original context and establish identity

Match files to original Discord posts, Pak List records, manifests, READMEs, source repositories, and author release pages where available. Prefer exact hashes or attachment identifiers to title similarity. Translate non-English notes before interpreting intent.

Determine whether each package targets Deep Rock Galactic, Rogue Core, another game, or is a preset/tool rather than a game mod. Establish the release era and dependencies. Author notes explain intended behavior; the distributed file must support that explanation. Log disagreements instead of silently picking one source.

## 3. Inspect actual contents and compare against the correct baseline

Extract packages into isolated analysis directories without modifying supplied packages or installed assets. Inspect nested PAKs and bundled configuration or scripts. Do not execute unknown bundled programs.

Use UnrealPak for inventory/extraction and UAssetGUI or a validated FModel workflow for cooked assets. Follow the established UE4.27 tooling and verify support for each package's actual engine format.

For overridden assets, compare against an unmodified game asset from the corresponding build where available. Do not treat differences from today's game as proof that an old mod deliberately changed every differing property. Identify added assets, copied dependencies, and the reachable logic that actually uses them.

| Content | Evidence to establish the player-visible effect |
| --- | --- |
| Blueprint gameplay | Entry events, hooks, branch conditions, function calls, timers, changed defaults, and referenced assets; decode bytecode when needed and supported |
| Weapon/enemy/difficulty data | Exact changed rows, values, units, affected modes, and how game logic reads them |
| HUD/widgets | Widget structure, bindings, visibility rules, displayed values, settings, and update logic |
| Materials/particles/models | Changed parameters, referenced textures/meshes, emitter behavior, and rendered output when data is ambiguous |
| Audio/animation | Actual referenced clips, cue routing, attenuation/timing/play-rate changes, and previews where needed |
| Presets/scripts/tools | Configuration contents, entry points, documented invocation, and effective changes |

An asset name such as `Smoke`, a class name, or a string in a name table is insufficient to conclude that an effect is removed, a feature is enabled, or a performance benefit exists.

## 4. Resolve uncertainty and version differences

Classify every file as verified, needs deeper investigation, or blocked with a specific missing piece. Verified means the description's concrete claims have supporting evidence; record separately whether behavior was observed in game or established through static analysis.

Use targeted isolated runtime checks for behavior that static evidence cannot settle: trigger the relevant feature, inspect the result, and compare against an unmodified baseline. Restore the prior environment afterward. Confirm host/client scope through networking logic or a corresponding runtime check before claiming it.

If a compatible historical baseline, decoder, runnable environment, or necessary source context is unavailable, retain the unresolved question explicitly. Request author clarification through the user when needed; do not contact people automatically. Do not mark the audit complete by substituting plausible prose.

Compare every distinct version/variant. Write group text only for shared behavior; identify material version differences beside the affected download when necessary. Flag misleading group merges for separate correction instead of describing unrelated files as one mod.

## 5. Write and review the descriptions

Use one or two short sentences: what changes, its concrete target, and any essential limitation. Aim for roughly 80–180 characters; retain the existing 240-character limit unless verified content needs a separately agreed presentation change.

Avoid vague verbs without an effect, inferred benefits, marketing claims, and implementation-only lists. Preserve meaningful distinctions such as removing an effect versus reducing it, changing a visual versus changing damage, or requiring a host versus working locally.

Review each sentence against its evidence ledger. A useful standard is: can a player predict the observable change, and can every factual part of that prediction be justified? Automated checks cannot prove semantic accuracy.

## 6. Run a representative pilot, then complete the catalog

Start with 15–20 varied groups: misleading names, non-English entries, simple cosmetic changes, Blueprint gameplay changes, multiple versions, and poorly documented packages. Include some descriptions that currently appear credible to expose systematic errors.

Produce a before/after review table with evidence and uncertainty, then use the findings to refine the process. Continue through a tracked queue in manageable batches of about 25 groups. Automation may cache downloads, extract/export assets, calculate diffs, and flag gaps; it must not auto-approve generated interpretations.

Report progress as groups reviewed, files analyzed, descriptions verified, and unresolved cases. Estimate remaining work after the pilot; avoid promising a full audit duration before measuring the difficult cases.

## 7. Integrate and publish reviewed results

Make reviewed descriptions and their evidence records the durable source of truth. Disable name-based publication guesses so regeneration cannot overwrite verified text. Preserve existing applied migrations; generate new targeted upserts for approved corrections.

Check exact group mapping, length limits, source privacy, variant coverage, deterministic regeneration, and migration/API behavior. Refresh the recovery snapshot so quota-related fallback responses do not restore superseded descriptions. Verify both the normal database path and fallback path, and account for the five-minute API cache.

Prepare the local before/after result for review. Apply production changes only after a live update is requested. At publication, verify every catalog page in a bounded pass, reconcile counts and descriptions with the approved ledger, and keep the prior description mapping for rollback.

## Completion criteria

- Every current group and unique file is accounted for, with all existing descriptions reviewed.
- Every published behavioral claim has traceable supporting evidence for the relevant file/version.
- Important variant differences, game identity, and necessary limitations are correctly represented.
- No description is accepted solely from a filename, an asset list, or a generic generation rule.
- Unresolved cases remain visible in the audit report and prevent a claim of full completion.
- Approved text agrees across the generator, database, API, recovery snapshot, and displayed preview.
