# Catalog search

Local implementation, October 17, 2026. Not deployed.

- Every query term must match somewhere in the same mod/group. Terms can match different fields.
- Names and filenames ignore case, whitespace, underscores and hyphens; joined names are supported. Other punctuation, including version dots and percent signs, stays literal.
- Descriptions, posts and author handles use literal case-insensitive substrings, preserving specific handle searches.
- Double quotes preserve literal spelling, spacing, punctuation and word order within a field. Quoted phrases can be combined with other terms.
- Default searches rank exact titles, literal title phrases, formatting variants, all terms in a title, filenames, then other fields. Existing date/name/file-count order breaks ties. Explicit name, oldest and file-count sorts take priority over relevance.
- Live SQLite queries, the recovery snapshot, and browser preview data share the parser and matching rules. Filtering and ranking precede pagination.

Test locally with Wrangler Pages on port 8788 and `/dump.html?demo=0` or `/index.html?demo=0`. An unseeded local database uses the saved recovery catalog through the existing middleware. This catalog can lag production; no production database or deployment is needed for testing.

Examples: `unified weapon balance`, `balance weapon unified`, `unified balance`, `"Unified_Weapon_Balance"`.

Regression checks: `node --test tools/search.test.mjs functions/api/search.test.mjs functions/api/mods.test.mjs functions/api/dump.test.mjs functions/api/catalog-recovery.test.mjs tools/catalog-sort.test.mjs` (32 passing).
