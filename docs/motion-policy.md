# Full-motion policy

On 13 October 2026 the user explicitly required full motion in production and previews regardless of the browser or OS reduced-motion preference. This supersedes the earlier reduced-motion policy described in the redesign research and implementation records.

The shared JavaScript policy always enables motion. CSS no longer suppresses transitions, row rolls, the loader or the city canvas under prefers-reduced-motion. Desktop Lenis explicitly sets respectReducedMotion: false, including its own internal preference handling. All four pages use fresh CSS and shared-script version URLs.

Responsive behavior, hidden-tab suspension, scene resource cleanup and hardware failure fallbacks remain in place. This policy overrides reported reduced-motion preferences; it cannot make unavailable browser APIs or disabled WebGL available.

Three old-policy assertions failed before the change. The updated full-motion regression checks and existing suite pass: 53/53 tests.
