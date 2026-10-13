# Matrix / Peripeteia implementation

Implemented locally on 13 October 2026. No deployment or commit was made by this task.

## Delivered

- Replaced fourteen abstract slabs with the supplied city's shallow Three.js environment: a cleaned skyline plate, transparent near architecture, batched sparse rain and restrained shader grain, haze and window lighting.
- Far/near layers respond to pointer by 4/10px horizontally and 3/7px vertically; normalized scroll contributes 18/26px. The city remains a panorama rather than a stretched fullscreen image.
- Accepted selections and search state influence local light. Same-item refreshes do not repeat selection pulses; optional scene loading does not block the catalogue.
- Desktop renders during input/settling and returns to idle. Mobile retains a deliberately cropped original city image. Hidden tabs/bfcache pause; teardown disposes resources and removes listeners/canvas. CSS preserves static recovery under production reduced motion.
- Introduced WhiteRabbit into navigation, controls, catalogue names, preview titles, metadata and Dependencies; longer descriptions retain Inter.
- Kept compact 43px desktop / 46px mobile rows, centred stationary sticky nav and the travelling green marker.
- Preview aperture is now 360ms with 140ms outgoing fade and no title nudge. Markers use 340ms GSAP movement; row rolls 250ms; search/icon reveal 280ms; links 200/220ms.
- Calmer dark preview surface; aligned files and source metadata; Dependencies entries reduced to 72px minimums.
- No heroes, helper headers, promotional copy, sidebars or footers were added. About retains only seu. The thin white loader/faint green glow remains.
- Local previews keep full motion; production selection scrolling reads the current preference rather than a startup snapshot.
- Updated DESIGN.md and the schema-v2 component sidecar to the delivered system, with nine actual component specimens.

## Asset provenance

The user supplied `C:/Users/seu/Desktop/background.png`, verified byte-identical to `public/assets/city-rain.png`. Built-in image generation produced a clean plate and isolated near architecture from that visual reference. The original file is unchanged.

`city-clean.webp`: 2171 × 724, RGB, 97,924 bytes. `city-foreground.webp`: 2171 × 724, RGBA, 94,606 bytes, alpha range 0–255 and center alpha 0. Combined added image payload: **192,530 bytes**. Compressed file size is not decoded/GPU memory size.

FFmpeg converted the generated PNGs to WebP without cropping or resizing. Exact prompts, reference provenance and Impeccable prompt sidecars sit beside the two assets. Pre-existing unrelated alpine assets and their metadata were preserved.

## Verification

- Baseline: 40/40 existing tests passed before this implementation.
- Final: **52/52 tests passed**. Added accepted-selection, scene lifecycle and runtime selection-scroll regressions. The three scroll-preference failures and pending-frame disposal failure were reproduced before their fixes.
- Syntax checks passed for scene, shared motion and both catalogue scripts; `git diff --check` passed.
- Captured and inspected all four pages at 1440 × 900 and 390 × 844, plus the user's 1625 × 884 viewport.
- 1,000-row Pak List fixture: 15 complete rows visible at the actual desktop viewport; no horizontal overflow; WhiteRabbit row typography confirmed.
- Twenty catalogue selections retained one accessible preview and at most two temporary visual layers; the settled preview had one layer.
- Empty search produced zero rows and the functional empty state. No search placeholder. Escape restored 1,000 rows; Name sorting began with entry 0001.
- Sticky nav remained y=0 and toolbar y=72 while browsing the desktop list.
- 500-entry phone-sized Pak Dump: no horizontal overflow or WebGL canvas; Back to list returned focus to the selected row (row y=398), nav y=0.
- Under browser media emulation, production-preference About (`?demo=0`) removed its canvas, removed scene-ready, set scene state static and showed fallback opacity 0.9 when reduced motion changed during both active and idle states.
- Normal localhost About under the same reduced-motion emulation retained its full-motion override and one canvas. Browser media and viewport overrides were restored.
- Final browser error/warning logs were empty.
- Independent finish reviewer initially requested current-preference scrolling and refreshed design records. The final verdict scored both fixes **resolved**, with disposition **ship** at that scoped verdict. The additional motion-loss disposal guard was also acknowledged. All nine final captures remained valid without visible regressions.

## Evidence and limits

Final evidence directory:

`C:/Users/seu/.codex/visualizations/2026/10/13/01a133fe-0bfc-73d1-b76f-7503c4a2af00/matrix-build/`

Captures: `final-{index,dump,dependencies,about}-{desktop,mobile}/motion-frame-8.jpg`, and `final-index-user/motion-frame-8.jpg`. Catalogue stress captures use synthetic entries; the user-size capture uses two sample entries. Demo downloads remain disabled.

Lifecycle tests use a Three.js resource stub and do not prove shader performance. Browser checks established rendering, interaction and active/idle preference teardown; they did not establish physical-phone performance, integrated-GPU frame-time targets, exhaustive numerical contrast, screen-reader use, 200% browser zoom or an actual GPU context-loss experiment. No live backend download was performed through the static preview server; API/download contract tests remain passing and URLs were preserved.

The original research references supplied inspiration, not a pixel-clone target. The source recording previously supplied by the user, the incomplete Scroll Analyzer run and unavailable Pingfusi credits were not treated as evidence of successful motion or external approval. No award outcome is claimed.
