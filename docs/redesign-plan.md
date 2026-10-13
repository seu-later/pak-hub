# Pak Hub — comprehensive redesign plan

Prepared 13 October 2026. Scope: Pak List, Pak Dump, Dependencies, About, and their shared interface.

**Status: implemented locally; see [the implementation report](C:/Users/seu/Documents/drgmodding/PakHub/docs/redesign-implementation.md) for delivered work, current checks and verification limits.** This document preserves the research and intended direction that guided the build. Proposed targets are not retroactive benchmark claims.

**Subsequent user correction:** no heroes or unrequested microcopy on any page. Removed the About promotional composition, Dependencies introduction/sidebar, repeated footers and preview helper header. This takes precedence over supporting-page copy or hero proposals in this archived plan.

## 1. Success criteria and direction

Pak Hub should feel like a deliberately art-directed interactive archive. Keep its dark appearance, phosphor green, dense list, quick descriptions, and direct downloads. Give it a recognizable spatial identity through typography, translucent layers, and a small number of carefully coordinated interactions.

The main composition stays recognizable: centred navigation; compact search and sorting; a long list on the left; a description and files panel on the right. The catalogue opens directly into browsing. The visual signature is a **horizontal slice revealing the next preview**, paired with a green indicator that travels between controls and a restrained scene that responds behind the interface.

“Transparent background” means transparent/translucent interface surfaces over a dark scene within the webpage. Text needs a stable contrast layer. Start with deep charcoal, warm off-white type, the existing green, and faint mineral/metallic depth. Use brighter movement around the preview and page margins; keep the reading area calm.

Measurable design targets:

- At 1440 × 900, aim for at least 14 ordinary catalogue rows visible without scrolling; at 1280 × 900, at least 12. Validate with real and explicitly labelled stress fixtures.
- Desktop rows: approximately 40–44 px for ordinary entries, replacing the current 54 px minimum. Exceptional names may take more room.
- Touch rows and interactive targets: at least 44 px. Full names remain available in the preview and accessible labels.
- No oversized catalogue hero, navbar divider, entrance fade on navigation, or movement of navbar labels.
- Hover, keyboard focus, and click update the preview reliably. Rapid changes never produce ghost content, stale downloads, or a growing animation queue.
- All four pages share the same visual language and motion rules.
- Search, sort, pagination, source links, file versions, error recovery, and downloads retain their existing behaviour.

Award quality is a design ambition. Completion is judged by composition, interaction quality, reliability, and browsing speed, rather than by a promised award.

## 2. What the current workspace shows

| Area | Finding | Planned response |
| --- | --- | --- |
| Architecture | Static HTML and vanilla JS; Cloudflare Pages, D1 and R2; locally vendored Lenis. No root frontend package manifest. | Extend this structure. Keep animation code small and optional; evaluate dependencies before adding them. |
| Shared styling | `public/styles.css` contains several generations of component overrides, roughly 2,800 lines. | Consolidate the rules of components being redesigned, after recording their states. Avoid another large override layer. |
| Page consistency | Pak List starts with controls; Pak Dump and Dependencies retain large editorial intros. About contains only its title and a maintainer sentence. | Give both catalogues compact headers; design Dependencies and About around their actual content. |
| Catalogue density | Ordinary rows have a 54 px minimum; Pak List places author/date below the name. | Use aligned desktop columns and compact secondary information. Let the preview carry the longer detail. |
| Preview | Both catalogue scripts duplicate a two-layer transition. The outgoing 190 ms animation has no forward fill, while cleanup waits for a 460 ms incoming animation. | Reproduce the suspected flash, then fix it. An outgoing layer must stay hidden until removal. |
| Preview state | Render keys describe selection/status rather than all content revisions. Outgoing content is visually disabled but not made inert or hidden to accessibility APIs. | Account for data updates; ensure one accessible, actionable preview; handle interrupted transitions explicitly. |
| Nav and sort | Indicators already exist, but move through `left` and `width`. Pak List also attaches a magnetic effect to navigation links. | Use measured transform movement and scaling; remove navbar label motion; share indicator behaviour across pages. |
| Scrolling | Preview is sticky, independently scrollable, and excluded from Lenis. Some historical code computes extra stage height from row count. | Keep the useful sticky split. Inspect the actual effect of the extra-height code before removing it. |
| Preview policy | Local previews already override OS reduced motion through shared preview detection. | Preserve full motion as the default for future local previews. Production continues to support reduced motion. |
| Existing work | Workspace includes unrelated API, import, database migration and description changes. | Keep redesign edits in the frontend and its design documentation. Preserve existing changes. |

Primary implementation files: `public/styles.css`, `public/site-motion.js`, `public/app.js`, `public/dump.js`, and all four HTML pages. Read rendering, selection, loading, and download handlers before editing each component.

`PRODUCT.md` agrees with the dense catalogue direction. `DESIGN.md` still describes a large masthead/hero, visible search, and older motion decisions. Update it during implementation to reflect this brief and the delivered design.

The reported 36/36 tests and previous browser checks are historical evidence. They are not a current verification of the future redesign. No tests were run for this planning-only deliverable.

## 3. Reference study: evidence and adaptation

### OFFFORM

Live catalogue navigation and PicassoWeb component inspection confirmed transparent roster rows, strict column alignment, small metadata, very faint horizontal rules, and duplicate front/back text faces inside clipped rows. The inspected row measured 51 px high at 1440 × 900; its typography was 10 px Courier, which is too small to copy directly into Pak Hub.

A hover capture showed the highlighted roster name and a floating portrait appearing. Captured declared motion includes 280 ms colour/glow transitions on the row, a 150 ms cursor opacity transition, and a 650 ms masked **hero** reveal with `cubic-bezier(.76,0,.24,1)`. That 650 ms duration belongs to the hero, not a measured preview swap.

Motion DNA reported Lenis and WebGL. Its zero detected ScrollTriggers is a detection result, not proof that the page has no custom scroll logic.

Adapt alignment, clipped text rolls, deliberate spacing, and smooth masking. Preserve Pak Hub's readable sizes, centred static navbar, and immediate catalogue access. The full-page capture contains unresolved/lazy blank regions; those are not layout references.

Source: [OFFFORM](https://offform.net/).

### Joshgrafik

PicassoWeb inspected the full-index row and recorded its hover at 1440 × 900. The frames show the preview beginning as a thin horizontal strip and opening into a full image. The row simultaneously changes to a dark background with light type.

Measured row definitions: 250 ms colour/background transitions; 350 ms horizontal inset with `cubic-bezier(.22,1,.36,1)`; a 600 ms diagonal arrow cycle. The preview's exact internal easing and row-to-row replacement timing were not recovered from these captures.

Adapt the visible slice-opening behaviour into the fixed right panel. Use transforms for the small row nudge rather than copying layout-changing padding. Keep real text and downloads in the DOM; the reference's floating screenshot must not obscure Pak Hub's list.

Before matching the preview more closely, capture A → B → C → A hover changes, pointer exit, keyboard focus, and the relevant click state. Clicking the reference row is an external visit; distinguish that from Pak Hub's selection action.

Source: [Joshgrafik full index](https://www.joshgrafik.com/#index).

### Aengel

PicassoWeb first reached the entry screen: large condensed display type, a fine grid, technical labels, and detailed ticket-like visual objects. The browser study then entered the actual experience. Live screens showed a dark spatial arch/vegetation scene behind sparse persistent controls; after scrolling, the arch appeared separated into floating fragments.

This demonstrates a useful relationship between a quiet interface and expressive spatial content. Exact camera paths, timing curves, and the complete project sequence remain to be measured.

Adapt spatial depth, responsive geometry, and precise small details. For Pak Hub, develop original abstract layered slabs or an archive-like folded structure. Its motion follows selection and gentle pointer movement; it does not represent unsupported facts about a mod. Aengel's immersive entry gate is not appropriate for browsing paks.

Source: [Aengel](https://aengel.io/).

### Additional Awwwards research

The installed Awwwards MCP returned these Site of the Day / Developer Award references:

- [Gil Huybrecht](https://gilhuybrecht.com/) — inspected screenshot: dark surface, crisp metadata across the top, numbered project groupings and a repeated image grid. Adapt alignment and hierarchy. Much of its full-page capture remained lazy/unresolved; its motion has not been studied.
- [Pensatori Irrazionali](https://pensatori-irrazionali.com/) — discovery candidate for WebGL and microinteractions; live component study pending.
- [Léo Parpeix](https://leoparpeix.com/) — discovery candidate for experimental transitions and 3D; live component study pending.

Keep OFFFORM, Joshgrafik, and Aengel as the primary references. Inspect at most two additional components if they solve an identified gap. Recreate techniques with Pak Hub's own assets, content, and code.

## 4. Installed tools and skill workflow

| Tool or skill | Concrete use | Deliverable |
| --- | --- | --- |
| Awwwards Inspiration + MCP | Search by editorial layout, typography, WebGL and microinteractions; verify award metadata; inspect captures. | Small reference board with reasons for each chosen technique. |
| Awwwards Motion Study + Motion DNA MCP | Capture load, dwell, slow scroll, hover and click; compare desktop and mobile; identify implementation fingerprints. | Motion inventory distinguishing observed properties from inferred implementation. |
| PicassoWeb skill + MCP | `inspect_component` for structure/states; `capture_motion` for actual animation; `extract_responsive` for uncertain breakpoints. | Component measurements, frames and state specifications. |
| Scroll Analyzer MCP | Open one reference at a time, pass entry gates, inspect scroll triggers/scripts, watch target elements and export a report. | Scroll ranges, sticky/pin behaviour, scene/DOM relationships. |
| UI Extractor + FFmpeg/ffprobe | Review usable recordings in contact sheets, then inspect short sequences at finer frame intervals. | Frame-by-frame notes; no observations claimed from unusable footage. |
| Impeccable | Establish context, sharpen hierarchy, reduce visual noise, review every rendered page and state. | Updated design specification and concrete visual corrections. |
| GSAP Core, Timeline, Performance | Coordinate preview, controls and optional scene; handle interruption, reuse pointer tweens and batch geometry reads. | A consistent, bounded motion layer. |
| GSAP ScrollTrigger | Apply only where About or a scene truly needs a scroll-linked timeline. | Explicit ranges and mobile alternatives, with cleanup. |

Current research limitation: Scroll Analyzer's Aengel opening did not return during the bounded session and was stopped; the entry was inspected through the browser instead. Confirm server/browser health before its next capture. The reported six dev/test advisories and clean production audit are existing status, not an audit rerun here.

The supplied `C:/Users/seu/Videos/2026-10-13 12-52-32.mp4` is 55.37 seconds. Contact-sheet samples are black. FFmpeg black detection reported `black_start:0 black_end:55.35 black_duration:55.35`. This recording cannot substantiate reference motion observations.

Existing Pingfusi review remains incomplete because of the previously reported lack of credits. Keep human review as a later available review channel; do not make implementation depend on an unavailable account.

## 5. Shared visual system

### Composition

Use a broad responsive grid with approximately 24–40 px desktop gutters. At wide sizes, allocate roughly 60% to the catalogue and 40% to the preview, separated by a deliberate 24–40 px gap. Adjust against real long names and descriptions rather than locking a portfolio proportion.

The navbar occupies a compact fixed/sticky band, centred exactly within the viewport. Its surface may become slightly more opaque over scrolling content. It has no bottom divider, wordmark/icon reinstatement, entrance fade, magnetic movement, or reappearance animation after data updates.

Below it, align the compact page label, search trigger, sorting and count on one grid. The list and preview start together. The page scrolls naturally; the preview sticks below the nav. Derive offsets from the real shared header height.

### Typography and material

- Keep self-hosted Inter as the primary readable face. Use White Rabbit sparingly for indices and technical metadata.
- Catalogue names approximately 14–16 px; metadata 11–12 px; description text approximately 14 px with a comfortable measure.
- Preview titles approximately 28–40 px where space allows, with tight but readable tracking.
- Reserve larger display typography for About and selected preview titles. No huge catalogue heading.
- Make surfaces translucent charcoal with a stable dark veil behind body copy. Let the scene appear through gutters, edges and a controlled preview zone.
- Avoid a uniform set of rounded glass cards. Use aligned planes, clipped apertures, subtle edge lighting, and few rules.
- Reuse the loader's small square endpoint as a restrained visual motif in artwork or controls, without adding a navbar icon.
- Keep green concentrated on selection, focus, active indicators and brief interaction highlights. No continuous glow on every item.

Contrast must hold while the brightest scene frame is behind the interface, not only on a static black screenshot.

## 6. Page-by-page redesign

### Pak List

- Start with a compact label and controls; retain the existing two-column browsing structure.
- Align name, author/date and file count in compact desktop columns. At narrow widths, reduce secondary columns while keeping the data in the preview.
- Use a quiet active-row tint, a small green selection cue, and a short masked roll on the hovered name. Row geometry and hit area remain fixed.
- Preserve hover intent, immediate focus preview and click selection. Downloads remain explicit links in the preview.
- Make the right panel feel like a carefully typeset document: title, short readable description/source post, source metadata, files, then discussion/update history where present.
- Present long discussion as a secondary disclosed section if necessary, retaining its contents and accessible controls. Do not fabricate summaries from incomplete data.
- Give missing descriptions, empty searches, loading and retry states the same composition.

### Pak Dump

- Remove the oversized intro and use the same compact control baseline as Pak List.
- Keep family/group structure, versions, prerelease labels, attribution and existing download URLs.
- Use the same row density, selection treatment, preview transition and green indicator mechanics.
- Make grouped files read as a compact aligned version list. Long filenames wrap within their area without pushing downloads offscreen.
- Preserve “View in Pak List” and existing description-source precedence. Fix any accidental suppression of useful description only after checking the intended data contract.

### Dependencies

- Keep the five actual entries and their working links: CD2, MEV, DEA, EEE and Enn's Biome Schmorp.
- Design a compact numbered dependency index, with aligned names, existing credits and direct download actions.
- Give hover/focus a clipped name or arrow transition consistent with the catalogue.
- Add a secondary explanatory panel only where descriptions or install relationships can be verified. Unknown dependencies must not become invented “required” steps.
- Use more visible background depth in the unused surrounding space; keep the download area calm.

### About

- Develop an editorial page with a clear statement of purpose, the verified maintainer credit, and a short explanation of browsing Pak List, Pak Dump and Dependencies.
- Use a larger typographic composition and the fullest version of the original spatial artwork here.
- A short scroll progression can unfold the artwork as the purpose and browsing explanation appear. Content length sets the scroll distance.
- Keep titles and text readable before animation runs. No blank pinned screens created to extend a short page.
- Add links back to the three functional pages. New biography, popularity statistics, community links and support/contact claims require real content.

## 7. Preview repair and defining animation

Implement the reliable content handoff before any shader effect.

1. Reproduce rapid A → B → C hover, repeated same-item selection, loading → ready, same-item refreshed data, and transition interruption.
2. Keep the panel shell, its position, background and scroll controls stable.
3. Animate only bounded inner layers. Maintain at most one incoming and one outgoing visual layer; keep exactly one layer interactive and accessible.
4. Mark outgoing content inert and hidden to accessibility APIs, while moving focus deliberately if it would otherwise be removed. Avoid noisy live announcements on every transient pointer movement.
5. Start the incoming preview behind a horizontal aperture at the visual focal point. Expand it to full height; introduce the title through a short text mask, with metadata following closely.
6. Keep the outgoing layer hidden when its animation finishes. Remove it on completion or cancellation. Old completion handlers cannot modify the latest preview.
7. Distinguish a new selected item from an update to the same item's data. Same-item updates should not replay the full entrance.
8. Retain useful current content during fetches, show honest loading state, ignore stale responses, and avoid loading/ready double flashes.
9. Preserve scroll position on same-item updates. On a new item, use a deliberate reset to its title; never move the outer catalogue scroll.
10. Never animate active download hitboxes away from the pointer or allow an outgoing link to remain clickable.

Start with DOM masks and transforms. They can reproduce the slice effect without WebGL. A later shader may enhance decorative backing only; text and links remain crisp DOM content.

## 8. Proposed motion inventory

These are **Pak Hub starting targets**, not claimed measurements of the references. Tune them against captured sequences and real use.

| Component | Trigger and treatment | Initial target | Interruption / mobile rule |
| --- | --- | --- | --- |
| Shared green indicator | Translate one marker and scale its width toward the chosen label; focus is equivalent to hover. | 320–420 ms, strong ease-out | Retarget from current position; reduced motion snaps. |
| Nav | Labels and navbar stay stationary; only indicator and subtle colour respond. | Colour 140–180 ms | No data-render entrance; active route remains clear. |
| Catalogue row | Small clipped name roll, 2–4 px inner nudge, quiet tint. | 180–260 ms | No row scaling/reflow; keyboard equivalent; touch selection only. |
| Right preview | Horizontal slice opens; old layer exits, title rolls, metadata follows. | Total 420–560 ms; stagger 25–40 ms | Latest target wins; first readable content appears early. |
| Sort/filter results | Indicator travels; changed visible rows settle. | 180–260 ms; total stagger capped around 180 ms | Preserve selection/focus where valid; do not animate the entire catalogue. |
| Search | Aperture expands from icon; stroke/close icon rotates; input line resolves. | 280–380 ms | Focus input; Escape returns focus; no placeholder; reversible mid-animation. |
| Download/source link | Arrow leaves its small mask and returns; line responds. | 220–360 ms | Fixed clickable bounds; no fake success before response. |
| More/results | Newly appended visible rows settle 4–8 px. | 220–300 ms | Existing rows stay still; no scroll jump. |
| Dependencies | Name/arrow microinteraction; brief initial group reveal. | 220–360 ms | Full keyboard/touch functionality. |
| About headings | Short line masks and measured scene progression. | 450–650 ms | Natural document scroll; static readable fallback. |
| Background | Damped pointer depth and a short selection response. | Settle 350–700 ms | Fine pointer only; pause when hidden/settled. |
| Loader | Thin white progress line, faint green glow, small endpoint. | Keep existing visual identity | Once per session; optional scene never extends content loading. |

Use a small easing vocabulary: brisk ease-out for controls, the observed `cubic-bezier(.22,1,.36,1)` family for opening motion, and a more symmetrical curve only for deliberate masks. Avoid bouncing/spring overshoot on a dense catalogue.

Green lines need different semantics: active markers travel within nav/sort/filter groups; a single action's underline grows/retracts within that action. A line should not jump between unrelated components.

## 9. Three.js proposal and tradeoffs

Recommend a small, original procedural scene: a few layered mineral-like planes or folded archive slabs, edge-lit in faint green and grey. Selection briefly changes their arrangement; pointer movement shifts depth gently; About can let the shape open more visibly with scroll.

This creates a spatial identity at the cost of optional JavaScript, GPU use, and another dependency. Compare a CSS/SVG prototype and a Three.js prototype at the same composition before choosing the final renderer. Use Three.js when the depth and surface movement are visibly better; DOM masks remain the preview foundation.

Implementation limits:

- One transparent canvas per document, behind content, with `pointer-events: none` and decorative accessibility treatment.
- Load the scene after the usable catalogue has rendered. Failure never blocks browsing or the loader's exit.
- Prefer procedural geometry and modest materials; no large purchased model, stolen reference scene, full-screen video, or texture-heavy environment.
- Cap internal resolution and pixel count; measure on the actual preview hardware and a representative phone.
- Render on input while easing settles; stop when idle and when the document is hidden. Release GPU resources on teardown and handle context loss with a static fallback.
- Disable spatial pointer movement for touch and reduced-motion production users; provide a visually intentional static composition.
- Use a locally pinned, documented dependency and license. Do not add a framework to host one canvas.

The Three.js documentation recommends avoiding continuous rendering for unchanged scenes and describes limiting drawing-buffer size to reduce GPU load. See [rendering on demand](https://threejs.org/manual/pages/rendering-on-demand.html) and [responsive rendering](https://threejs.org/manual/pages/responsive.html).

For high-frequency pointer easing, GSAP's [quickTo](https://gsap.com/docs/v3/GSAP/gsap.quickTo()/) reuses a tween rather than creating a new tween for every pointer event.

## 10. Implementation structure

- `public/styles.css`: consolidate touched shared shell, row, preview and control rules; introduce a small coherent set of colour, spacing and motion variables.
- `public/site-motion.js`: own shared indicators, preview policy, page-level coordination and loader. Keep initialization idempotent and clean up listeners/timelines.
- `public/app.js` and `public/dump.js`: retain data/rendering contracts. Use one narrowly scoped shared preview-transition helper because these two implementations already duplicate it.
- `public/index.html`, `dump.html`, `dependencies.html`, `about.html`: aligned semantics and component hooks; preserve routes and meaningful native links.
- Optional `public/scene.js` plus pinned assets: only if the scene prototype passes its quality/performance gate.
- `DESIGN.md`: replace stale direction with the delivered visual and motion specification.

Keep CSS responsible for simple hover states and GSAP responsible for sequences requiring cancellation/coordination. One system owns each animated property. If GSAP is added, its justification is the coordinated panel/control/scene timelines; load only core and genuinely used plugins.

Existing static navigation remains the baseline. Investigate progressive cross-document transitions only after the basic pages are excellent. If used, animate the content region and explicitly exclude the navbar from fading. Avoid a custom navigation/router layer solely to make the header appear persistent.

## 11. Phased execution and review gates

### Phase 1 — Complete the component evidence

- Record current pages at 1440 × 900, 1280 × 900 and 390 × 844, including actual data/error states.
- Capture Joshgrafik hover entry, replacement, exit and click outcome; isolate OFFFORM row rolls, switches and sticky navigation; capture Aengel scene progression.
- Recover Scroll Analyzer health and use it for the missing scroll ranges rather than recapturing everything.
- Inspect mobile references and one selected Awwwards component if still useful.
- Make a reference-to-component matrix and motion inventory with frame timestamps.

**Gate:** every adopted effect has visible evidence and an explicit adaptation. Unmeasured timing is labelled proposed.

### Phase 2 — Establish the visual composition

- Build the shared shell, translucent materials, typography, compact catalogue controls, dense rows and stable preview layout.
- Bring Pak Dump, Dependencies and About into the same system.
- Prepare clearly labelled 100/500/1,000-entry stress fixtures, including long names, many files and long descriptions. Keep mock downloads disabled.
- Update design documentation to the chosen composition.

**Gate:** all four pages look coherent as still screenshots, before motion or WebGL. Density, contrast and mobile layout meet the targets.

### Phase 3 — Repair preview state and add core motion

- Write focused regression checks for the reproducible ghost-layer/content-revision issues.
- Implement cancellation-safe preview handoff and slice opening.
- Unify active lines; keep nav still; refine search, row, file and pagination interactions.
- Preserve full-motion local previews and production accessibility behaviour.

**Gate:** 20 rapid hover changes leave one final actionable preview, no old-layer flash, no stale content, and no focus loss. Search can open/close mid-animation; marker motion retargets smoothly.

### Phase 4 — Add the spatial signature

- Compare CSS/SVG and Three.js prototypes.
- Integrate the strongest economical scene behind the shared composition.
- Give About a fuller scroll treatment; use quieter selection responses on the catalogue pages.
- Measure GPU/frame costs and static fallbacks.

**Gate:** scene improves the composition at rest and in motion, survives failure, and keeps browsing responsive. Reduce or remove effects that fail this gate.

### Phase 5 — Whole-site polish and verification

- Tune durations and choreography against recorded references, at matching viewports.
- Test all four pages with mouse, keyboard and touch; slow data, empty results, errors, pagination, many versions and browser back/forward.
- Run the relevant existing suites before and after implementation, preserving pre-existing failures in the report. Include meaningful frontend regressions for changed behaviour.
- Check downloads with a backend-capable environment. A static localhost preview cannot substantiate API success.
- Capture finished motion and compare component behaviour, rather than scoring the whole page as a clone of a portfolio.
- Use human review when credits are available; include direct questions about density, clarity and motion quality.

**Gate:** no unresolved critical interaction/accessibility issue, all four pages reviewed, explicit performance evidence, final screenshots and recordings saved.

## 12. Acceptance checklist

### Browsing

- [ ] Ordinary desktop rows meet the density target; touch rows remain comfortable.
- [ ] Long names, filenames, dates, versions and source credits remain available and accurate.
- [ ] Hover/focus/click selection behaves consistently; preview never covers the list.
- [ ] Search, sorting, pagination and existing download/source links preserve behaviour.
- [ ] Preview scrolling does not trap wheel/touch input or move the outer list unexpectedly.
- [ ] Filters and appended results do not replay a page-wide entrance.

### Motion and appearance

- [ ] Navbar remains centred and visible when scrolling, with no label nudge or fade.
- [ ] Green markers glide between controls without flashing or resetting from the origin.
- [ ] Slice transition is visible and polished; title/actions settle promptly.
- [ ] No ghost outgoing content, old click targets, skeleton overlap or stale async result.
- [ ] Loader stays a thin white line with faint green glow.
- [ ] All four pages share typography, surfaces, spacing and interactions.
- [ ] Scene remains subordinate to readable content on both bright and dark frames.

### Resilience and performance

- [ ] Preview defaults to full motion locally on every page and subsequent session.
- [ ] Production reduced motion, keyboard focus, zoom, screen readers and touch work.
- [ ] 100/500/1,000-entry fixtures remain responsive; animations are bounded to visible/active content.
- [ ] Initial targets: p95 interaction response below 200 ms; approximately 60 fps on the named desktop device during hover/scroll; mobile remains usable without spatial animation.
- [ ] Capture hardware, browser and fixture size alongside measurements. These are targets, not current benchmark results.
- [ ] Optional visual code does not meaningfully delay the first usable catalogue compared with baseline.
- [ ] No scene animation frames continue after settling/hidden state; no listener/timeline accumulation.
- [ ] Failed scene, fonts, API requests or interrupted transitions have intentional fallbacks.
- [ ] Current automated/browser results are reported separately from historical 36/36 results.

## 13. Research artifacts

Reference screenshots and motion frames remain outside `public/`. They are local analysis evidence and are not assets to publish.

Structured component measurements and capture metadata are saved in [redesign-evidence.json](C:/Users/seu/Documents/drgmodding/PakHub/docs/redesign-evidence.json).

- [OFFFORM full-page capture](C:/Users/seu/.awwwards-mcp/images/capture-c18486e0d92e.png) — includes unresolved lazy regions.
- [Aengel entry-screen capture](C:/Users/seu/.awwwards-mcp/images/capture-5377289d3a77.png) — entry only; live experience was subsequently inspected in the browser.
- [Gil Huybrecht capture](C:/Users/seu/.awwwards-mcp/images/capture-ff0e0ee655f6.png) — partial lazy content.
- [OFFFORM hover frame](C:/Users/seu/.codex/visualizations/2026/10/13/01a133fe-0bfc-73d1-b76f-7503c4a2af00/redesign-research/offform-row/motion-frame-8.jpg).
- [Joshgrafik early slice frame](C:/Users/seu/.codex/visualizations/2026/10/13/01a133fe-0bfc-73d1-b76f-7503c4a2af00/redesign-research/josh-index-long/motion-frame-2.jpg).
- [Joshgrafik settled preview frame](C:/Users/seu/.codex/visualizations/2026/10/13/01a133fe-0bfc-73d1-b76f-7503c4a2af00/redesign-research/josh-index-long/motion-frame-16.jpg).
- [Supplied recording contact sheet](C:/Users/seu/.codex/visualizations/2026/10/13/01a133fe-0bfc-73d1-b76f-7503c4a2af00/redesign-research/recording-contact-sheet.jpg) — black footage; unusable as motion evidence.

**Recommended build order:** coherent still composition across all pages → dependable slice preview and shared microinteractions → original spatial layer → measured whole-site polish. This preserves the catalogue's usefulness while giving it a distinctive visual identity.

