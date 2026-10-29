# Atmosphere and About searchlight

Pak Hub keeps its Matrix / Peripeteia city, full About introduction and broad, moderately dense fog. Far/near cursor parallax reaches 14/9px and 36/22px with 60ms smoothing. Existing palette and typography remain authoritative.

At the user's request, the visible rooftop lamp, bracket, rotating housing and roof spill were removed. The searchlight now originates just below the bottom middle of the screen, behind the foreground wall. The city and fog share its lighting; the wall masks the fog beam and receives no added searchlight illumination. The CSS fallback uses the same bottom-center origin and fades the beam before the foreground edge.

The searchlight is always on in About, with mouse/touch aiming and no button, instructions or keyboard aiming. Hidden-tab suspension and route lifecycle remain intact. All four pages load the About script for content-only navigation. Asset queries use `20261015centerlight1`. No dependencies or raster assets were added. Deployed from the current workspace on 15 October 2026 as production release `174a4261-68c4-44cb-95e0-ea2c3b1e6049`. The deployment label references Git commit `3dbd788`, but its uploaded content includes the current uncommitted workspace changes. Live About retains the full introduction and references `20261015centerlight1`; the live scene uses the bottom-center source.

Validation: all 33 scene/navigation tests pass after removing the tests specific to the discarded lamp hardware. Earlier rooftop-lamp review results apply only to that discarded version. Physical touch gestures and device performance remain unvalidated.

Local refinement (`20261015skyclear1`, not yet deployed): the About spotlight now clears the dark overlay around its target and reveals drifting cloud detail in the upper sky. Aiming covers the introduction as well as the city and reaches 4% from the top. Desktop WebGL and the mobile CSS fallback were inspected; all 33 scene/navigation checks pass. Preview: `.impeccable/review/fog-searchlight/sky-clearing.png`.

The simple introduction glow was replaced with an encrypted-message interaction. Aiming within 28px scrambles the introduction over 520ms into “thanks for using the site.”; moving more than 76px away restores the introduction through the same decoding effect. A fixed overlay preserves the original layout and accessible text, and cached route returns reuse the original source copy. Text bounds refresh after fonts load, resizing and route changes. CSS and About-script queries use `20261015blueabout1` (local only).

About alone applies a cooler blue color grade to the complete scene, including the beam and fallback, with reduced saturation and 78% brightness for dimmer city lighting. The hidden message uses a matching pale blue. Preview: `.impeccable/review/fog-searchlight/blue-about.png`.

Navigation now has a transparent background without backdrop blur, allowing the scene and beam to remain visible behind the links. About aiming also covers the header. Current CSS and About-script queries use `20261015clearnav1` (local only).

The scene color grade transitions over 900ms in both directions when switching About routes. Both filter states use the same function order, including brightness, so the browser interpolates them. Navbar links and the active underline shift to pale blue on About over the same 900ms and return to green on other routes. All four pages reference CSS `20261015navblue1`; navbar transparency is shared across all routes.

Local follow-up (`site-motion.js?v=20261015navclip1`): scrolling page content is clipped below the transparent navbar using its current viewport overlap. The clip updates on scroll, resize and route changes, while the separate scene stays visible behind the links. A short viewport scrolling check confirmed the clip edge stays at the header bottom; the 33 scene/navigation checks pass. Preview: `.impeccable/review/fog-searchlight/nav-content-clipping.png`.
