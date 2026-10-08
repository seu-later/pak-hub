# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: static HTML/CSS/JavaScript with Cloudflare Pages Functions and D1, plus public GitHub Release assets for pak binaries. This keeps hosting within the requested free tier and avoids building a larger framework stack.

## Users

Players publicly browse the library to find and download DRG pak mods. Pak contributors post pak attachments in one Discord text channel and may use its occasional threads to share follow-up versions or variants. A site operator connects the catalog and storage workflow.

## Product Purpose

Pak Hub turns the server's pak-sharing channel into a public, searchable library where players can find the right mod release and download its pak file.

## Positioning

The catalog is sourced from the Discord channel's pak posts and follow-up threads, preserving their release and variant relationships while making files easier to discover outside Discord.

## Operating Context

The source is a normal Discord text channel with occasional threads. A post can include one or more pak attachments; later versions or variants may appear in a thread, filenames can repeat across distinct files, and not every post supplies a parseable version label. The public website is for browsing and downloading. Discord ingestion must be read-only and must not post, react, edit, or delete messages.

## Capabilities and Constraints

- Public browsing, search, filtering, mod detail pages, release history, file variants, and direct downloads.
- Keep each release and attachment distinct. Use an author's explicit version label when available; do not infer a version from filename alone. When no version is supplied, identify the release as unversioned and retain its source date and Discord link.
- The website should be buildable and deployable at no recurring hosting cost using Cloudflare's free services and public GitHub Releases for pak assets. GitHub asset visibility is public.
- A read-only Discord importer runs briefly in GitHub Actions when a Cloudflare cron Worker dispatches it every 15 minutes. It reads the pak channel and its public threads, uploads binary assets to GitHub Releases, and submits catalog metadata to the website API. D1 holds its resume position. No continuously hosted bot process or Discord send/moderation permission is required. No Discord messages or server configuration have been changed by this website project.
- Pak files and attribution require the uploader/creator to have permission for public redistribution. Preserve source links, creator/uploader attribution, and a way to report or remove an unauthorized file.
- The bot must never expose its Discord token, GitHub credential, or import token in client-side code.

## Brand Commitments

The product is named Pak Hub. The user chose a Deep Rock Galactic-inspired mining-terminal direction and the White Rabbit typeface.

## Evidence on Hand

The Discord source channel was viewed read-only to understand its post/thread structure. No real Discord messages, attachments, or mod listings are copied into this project. The workspace includes `WhiteRabbit.ttf` and its license; the font may be distributed with its license notice. Demo catalog entries must be clearly labeled synthetic and must not pretend to be downloadable pak files.

## Product Principles

- Make it quick for players to locate a mod and the release they need.
- Keep versions, variants, and source attribution visible and distinct.
- Preserve the original Discord post as provenance without making Discord the only way to browse.
- Prefer honest, recoverable metadata to guessed version or compatibility claims.
- Keep the public website simple to operate within the user's zero-spend constraint.
