# Pak Hub: Matrix / Peripeteia direction

Prepared 13 October 2026. **Research and implementation plan; no application code changed in this pass.** This supersedes the generic archive-plane art direction in the earlier redesign plan. DESIGN.md still describes the implemented site until this proposal is built.

**Implementation status:** subsequently implemented locally at the user's request. See [the implementation report](C:/Users/seu/Documents/drgmodding/PakHub/docs/matrix-peripeteia-implementation.md) for delivered work, verification and limits. DESIGN.md now records the delivered city/terminal system. The research and proposed targets below remain an historical plan, not retroactive benchmark results.

## 1. Brief and success

Pak Hub is a working catalogue for the server's Deep Rock Galactic community. Its primary job remains scanning a long list, seeing a description immediately, and finding the right file. The visual identity should feel like a green terminal operating inside a rain-soaked, decaying industrial city.

The user confirmed **Peripeteia by Ninth Exodus** and supplied `C:/Users/seu/Desktop/background.png`. It is byte-identical to the project's `public/assets/city-rain.png` (SHA256 `C765E1919562F5769D9EF5F2FBADB9B4B201D9FCD73C5933251D54E2EDB53942`). This image is the visual authority: rough masonry, green window grids, darkness, rain and dense urban silhouettes. Matrix supplies the green-black palette, terminal typography and signal-like interaction language. Peripeteia supplies the environmental material and mood.

Success means a visitor remembers the atmospheric green city and the responsive terminal, while finding a pak as easily as before. Award-level craft is an ambition, not an outcome this plan can certify.

Binding constraints:

- Keep the left list / right description relationship, short rows, search, sorting, real posts, credits and download contracts.
- No heroes, slogans, helper microcopy, invented system messages, fake server activity, promotional sidebars or repeated footers on any page.
- Centred stationary sticky nav; its green indicator travels. No nav entrance fade or moving labels.
- Retain the thin white loader with faint green glow and the horizontal preview reveal.
- Local previews keep full motion by default. Production reduced motion remains functional.
- No decorative animation may alter actual pak names, filenames, metadata, link destinations or task semantics.

## 2. What the inspection found

`public/scene.js` creates fourteen copies of one 4.4 × 3.2 × 0.055 box, metallic materials and edge lines. Pointer and scroll rotate the stack; selection hashes change its separation. The code already caps resolution, suspends hidden-tab rendering and settles between inputs. Those behaviours are useful, but the object conveys little of the requested world.

`public/styles.css` repeats this motif in a CSS fallback and veils it behind green-black gradients. The UI largely uses Inter; WhiteRabbit currently appears mainly in technical data. This reduces the terminal identity even though the palette is close.

`public/about.js` still contains the older signal-rain implementation, but the current About page does not load it. It is a source of project history, not evidence that digital rain is currently running. The alpine `halcyon-hero.jpg` fallback is unrelated to this direction and should not return.

The current preview uses a 500 ms horizontal opening, a 180 ms outgoing fade and a 12 px title movement. Hover intent is 150 ms on both lists. There is already cancellation and one accessible document; refine these mechanisms instead of introducing a second preview system.

One integration gap: the background selection event is emitted by the animated swap branch. Initial selections, immediate replacements and some same-item updates bypass it. Move scene notification to the accepted selection path so the background follows the actual selected item consistently.

## 3. Research: what transfers

| Reference | Evidence reviewed | Contribution to Pak Hub |
|---|---|---|
| User's city image | Original file viewed; dimensions 1520 × 460; hash matched the existing asset | Material, silhouette, restrained green illumination and rain. This is the main art reference. |
| [Peripeteia official press kit](https://90s.graphics/presskit/) | Developer's description and screenshot links | Confirms the cyberpunk / post-Soviet environmental direction. No game UI or character branding needs to be copied. |
| [Nahiyan Khan](https://nahiyan.codes/) / [Awwwards listing](https://www.awwwards.com/sites/nahiyan-khan-personal-site) | Full-page live capture; 21.48 s live recording; 8–11 s passage tiled at 3 fps; Picasso body/noise inspection; Motion DNA | A grain layer at 0.03 opacity, monospace reading and a slowly changing halftone background show how atmosphere can coexist with stable content. Listed as a **nominee**, not an award winner. |
| [OFFFORM](https://offform.net/) | Existing component and motion evidence in `docs/redesign-evidence.json` | Compact alignment, bounded text rolls and clear interaction hierarchy. Its visual identity does not replace Pak Hub's theme. |
| [Joshgrafik](https://www.joshgrafik.com/) | Existing preview capture and CSS evidence in `docs/redesign-evidence.json` | The preview opening from a thin horizontal slice. Retain this recognisable interaction. |

The Nahiyan passage shows the field changing while the text stays in place, with a brief title glitch in an early frame. Its exact background shader easing and pointer mapping were not recovered. Motion DNA detected Three/WebGL and no captured pin/scrub instances; it does not prove the absence of every custom scroll effect. Borrow the separation of ambient motion from reading. Its blue/RGB accents, title glitches, startup gate, music player and portfolio structure do not transfer.

Other Awwwards search results were colourful game experiences or oversized editorial portfolios; they were screened out. No claim is made about their motion. The earlier local MP4 is not evidence for this direction. Scroll Analyzer's previous incomplete run and unavailable Pingfusi credits provide no approval or measurements.

## 4. Recommended background: animate the city

### Composition

Replace the rotating stack with a shallow scene based on the supplied image. Looking past the terminal, the visitor sees a green-lit district, foreground industrial edges, rain and darkness. It should read as a place even when frozen.

Use four restrained layers:

1. **Distant city:** the supplied skyline and window pattern, predominantly stationary.
2. **Near architecture:** one or two believable concrete/metal facades, a sill or structural edge, with rough surfaces and small depth offsets. Perspective belongs to architecture, not floating rectangles.
3. **Weather and light:** sparse rain at different depths, slow haze near the lower skyline, a few dim window/emissive details.
4. **Display texture:** very faint green grain or halftone in open background areas. It suggests a terminal display without covering readable text.

The provided image already contains painted rain. Do not simply add many bright drops over it. First produce a clean city plate plus a near-architecture layer, keeping the composition and palette faithful to the source. If that asset pass does not look convincing, keep the intact image and limit enhancement to shallow parallax and sparse light; do not ship doubled rain or smeared buildings.

The source is very wide. Stretching it into a portrait background will distort the architecture; a fullscreen `cover` crop can discard most of the city. Desktop should preserve its panoramic skyline near the lower background with darkness above. Mobile needs a deliberate crop and natural black sky above, or a separately authored portrait composition from the same source. Verify both before treating them as finished assets.

### Input behaviour

- Pointer changes the view by only a few pixels of depth. Initial tuning limits: distant plane 2–4 px, foreground 6–12 px at full pointer travel; camera rotation within roughly 1 degree. These are proposed starting values, not reference measurements.
- Scroll changes the vertical relationship between the skyline and foreground slowly, bounded to about 16–28 px across the document. No camera flight, pinned scene chapter or added scroll distance. Small pages still respond to pointer and selection.
- An accepted new pak briefly raises a narrow window/light band near the preview side, then settles. The scene follows the latest selection and coalesces rapid changes. It never flashes the whole screen or shows invented download/network activity.
- Search opening can quietly raise the nearest terminal edge light. It must not alter the city composition or throw light across the text.
- Keep the default pointer. Avoid cursor replacement, magnetic targets and position changes to controls.

### Technology choice

| Approach | Benefit | Tradeoff | Decision |
|---|---|---|---|
| Shallow textured Three.js scene with selective real geometry | Preserves the supplied world's identity, gives depth and input response, fits the existing implementation | Requires well-authored layers; depth must remain small to prevent seams | **Recommended** |
| Fully modelled industrial district | More camera freedom and genuinely volumetric structures | Larger art/texture/lighting workload; easy to drift away from the supplied image and overwhelm the catalogue | Reserve for a later art pass if the shallow scene cannot reach the desired quality |
| One flat image with CSS parallax | Cheap, immediate, strong theme | Little dimensional richness | Static/failure fallback |

Reuse the locally served Three.js, GSAP and Lenis. No framework migration, new scene engine, animation package or postprocessing stack is justified initially. Use a small shared texture atlas, batched rain and simple light/material uniforms. Prototype custom shader detail only when it solves an observed visual gap.

## 5. Palette, typography and material

Starting palette: black-green `#030806`, recessed surface `#07130d`, raised surface `#0a1810`, dim mineral green `#31513e`, muted text `#98bfa5`, pale text `#dcefe0`, and the existing phosphor `#33ff77`. Final values are chosen against the rendered city and checked for contrast. Green accents stay concentrated on selection, focus, search and interaction feedback.

Bring the existing **WhiteRabbit** into navigation, toolbar controls, short page labels, row names and file data. Preserve title case and real strings. Use roughly 13 px controls, 14 px row names and a compact 20–26 px preview title, with measured wrapping. Keep Inter for long mod descriptions if WhiteRabbit slows reading; compare with real long descriptions before fixing that choice. No new font dependency initially.

Use flat dark translucent surfaces, squared corners and precise hairlines. The background supplies wear and grit; the interface itself stays clean. Avoid chrome bevels on every control, large bloom, blurred reading text and full-page scanline overlays. Optional texture remains behind text, at very low opacity and out of input hit areas.

## 6. Component improvements across all pages

| Component | Proposed change | Motion / interaction |
|---|---|---|
| Navigation | WhiteRabbit labels; stable centred composition and constant opacity | Retain one travelling line, roughly 320–380 ms. Only the indicator moves. |
| Catalogue rows | Maintain 43 px desktop / at least 44 px touch targets; tighten column alignment and distinguish selected from hovered rows | Keep the bounded roll, tune towards 220–280 ms. Full title remains readable in the preview and accessible name. No scrolling marquee. |
| Sort controls | Same typography and marker grammar as nav; no extra pills or decoration | Same interruptible line motion. No simultaneous CSS and GSAP transform ownership. |
| Search | Compact terminal field; no placeholder; clear icon morph and visible keyboard focus | Open through a short horizontal reveal around 240–300 ms. The input remains fixed once open; Escape and clearing preserve existing behaviour. |
| Description panel | Remove the large generic gradient in favour of a calmer black-green surface and precise border detail; make the title less oversized | Retain horizontal slice, tune towards 320–380 ms and reduce/remove title translation. Keep frame size, scroll and actions stable. Hover intent stays near 150 ms pending real-use checks. |
| Files / thread posts | Align filenames, versions, sizes and actual actions; preserve source ownership and order | Small underline/arrow response, roughly 160–220 ms. Never animate filename text or invent a success state on link click. Keep downloads near their corresponding files rather than duplicating an ambiguous global download button. |
| Dependencies | Same terminal type and compact index rhythm; reduce current 94 px entries towards 64–72 px where actual content allows | Small hover light and existing link motion. Five entries and their URLs remain exact. |
| About | Keep the verified maintainer name small and direct | Shared city atmosphere; no headline, hero, directory, promotional copy or special entry sequence. |
| Loader / errors / empty state | Keep current functional meaning and the approved loader | No boot transcript or added waiting ritual. Loading actual catalogue content never waits for optional scene assets. |

On mobile, keep native scrolling and the current Back to list focus behaviour. Reduce the scene to a still city treatment or one inexpensive parallax layer. A detail drawer is not part of this pass: improve selection proximity using the existing flow first, and change that navigation model only if browser checks show it is still a problem.

## 7. Motion inventory and limits

The durations above are **proposed tuning values**. OFFFORM/Joshgrafik observations are recorded separately in the existing evidence file; no exact-clone claim applies to the city effect.

| Element | Trigger | Property | Initial proposed timing | Interruption / fallback |
|---|---|---|---|---|
| City depth | Pointer / scroll | Bounded transforms / camera offset | Settle about 250–450 ms; frame-rate-independent interpolation | Latest target wins; static image when motion unavailable |
| Rain / haze | Active page interaction | Particle positions / low-amplitude opacity | Render during interaction and a short settling tail; stop in idle mode | Hidden tabs stop immediately; no idle GPU loop initially |
| Window response | Accepted selection | Local emissive strength | 120–180 ms rise, 350–500 ms settle | Coalesce bursts; no whole-screen strobe |
| Preview | Intentional hover / focus / click | Horizontal clip, outgoing opacity | 320–380 ms reveal; about 120–160 ms exit | Cancel stale layers, one accessible document; immediate same-item update |
| Markers | Nav hover/focus or sort change | Translation and width scale | 320–380 ms, smooth ease out | One owner and latest target wins |
| Search | Open / close | Clip and icon rotation | 240–300 ms | Correct focus, aria state and Escape behaviour throughout |
| Links | Hover / keyboard focus | Underline / small arrow transform | 160–220 ms | No movement of the hit target |

Atmospheric rain that continues indefinitely would require ongoing frames and additional battery use. Start with input-driven life and settling, preserving the current scene's useful idle policy. Add a low-rate continuous ambient mode only if measured hardware performance and the visual comparison justify that tradeoff.

## 8. Implementation sequence and file boundaries

1. **Art prototype:** build the scene alone beside representative existing catalogue content, with real long names/descriptions. Prepare the city layers and static crop. Judge it frozen first, then moving. Reject the prototype if it still reads as an abstract stack or if the art looks stretched.
2. **Scene replacement:** replace the slab creation in `public/scene.js`; keep lazy initialization, resolution caps, resource disposal, hidden-tab suspension and static recovery. Replace the CSS slab fallback in `public/styles.css`. Consolidate the same city scene across all four pages.
3. **State integration:** put accepted selection notifications in the common browsing path in `public/app.js` / `public/dump.js`, with `public/site-motion.js` coordinating the shared response. Initial and same-item paths remain correct. On production reduced-motion changes, stop active scene rendering and show the static image; do not leave pointer/scroll wake handlers rendering a moving scene.
4. **Component pass:** apply the palette, type roles, row alignment, file layout, quieter preview frame and calibrated motion. Make one shared change per component, avoiding page-specific overrides that drift.
5. **All-page/mobile pass:** confirm the same visual system on Pak List, Pak Dump, Dependencies and About; preserve actual content, source URLs and download contracts. Update stylesheet/script cache versions.
6. **Verification and documentation:** perform the checks below, batch fixes once, and update DESIGN.md plus its component sidecar to the implementation. Record evidence and unresolved limits. The supplied image and this plan remain the theme authority.

Asset files should live under `public/assets/` with source/provenance noted. Keep reference screenshots and recordings outside served assets. Do not touch APIs, migrations, importer behaviour or the unrelated dirty workspace files as part of this visual pass.

## 9. Usability, performance and acceptance gates

These are gates for a future implementation, **not results already achieved**:

- At 1440 × 900, retain at least 14 ordinary catalogue rows without scrolling; no oversized title or scene region consumes list space. Check 100, 500 and 1000 fixture entries, then representative real catalogue content.
- Verify desktop at 1280, 1440, the user's actual viewport, and phone widths 390/430; check 200% zoom, long names, long filenames, many thread posts, no results, pending detail and network failure.
- Check text contrast against the brightest background/light state, not only the static dark frame; normal text at least 4.5:1 and relevant controls/focus boundaries at least 3:1. No moving grit over small text.
- Run the existing 40 tests before and after implementation. Add focused regressions only for changed behaviours: selection notification coverage, rapid preview changes, reduced-motion runtime changes and scene teardown.
- Test keyboard browsing, visible focus, search Escape, sort updates, mobile Back to list and live download/source links on the actual backend. Static demo links do not prove live downloads work.
- Twenty rapid selections must finish on the latest item, with one accessible preview, at most two temporary visual layers and no stale window/light response.
- Scene is optional: missing assets, blocked WebGL, context loss and disabled JavaScript must leave readable content and the static city treatment. Repeated initialization, navigation and bfcache recovery must not multiply listeners or canvases.
- Start with one canvas, no realtime shadow maps or fullscreen bloom, pixel ratio at most 1.5, and a drawing buffer capped near the existing 2.4 million pixels. Aim for additional compressed art below 1.5 MB, then measure real decode/GPU memory rather than inferring it from file size.
- Measure interaction frame times with and without the scene on a representative integrated-GPU laptop and a physical phone. Target smooth 60 Hz interaction on the laptop without recurring long tasks; reduce quality or choose static rendering if measurements fail. No FPS claim from screenshots or cumulative scripting metrics.
- No scene frames after input/animation has settled; no hidden-tab frames. Readiness of catalogue/search is independent of scene import or texture decode.
- Local previews still use full motion under OS reduced-motion settings; explicit production-preference preview and real production honour reduced motion.
- Compare reference and build recordings for the actual interaction passages. Use PicassoWeb / Motion DNA for targeted evidence; use Scroll Analyzer only after a bounded health check succeeds. If it hangs, use the working capture tools and record that limitation.
- One desktop/mobile review round, one batched correction round, then independent review of the finished implementation. Pingfusi is optional external judgment only when credits become available; this plan carries no human-review approval.

## 10. Technical basis and remaining decisions

[Three.js rendering on demand](https://threejs.org/manual/pages/rendering-on-demand.html) supports the existing input-driven strategy. [Three.js responsive rendering](https://threejs.org/manual/pages/responsive.html) distinguishes CSS display size from drawing-buffer size. [MDN WebGL guidance](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) supports bounded buffers, batching and explicit resource management. The budgets here are project proposals, not limits prescribed by those sources.

The world and layout are settled by the user's brief. The remaining visual decisions are the quality of the city-layer asset pass and how much WhiteRabbit can be used without harming long-form reading. Resolve those through the representative prototype and actual text, without adding pages, heroes or explanatory copy.

**Recommended first implementation:** faithful shallow city depth, a restrained local light response on selection, terminal typography in the controls/list, and a calmer faster description reveal. Evaluate that complete combination before funding a fully modelled city.
