# Pak Hub

Pak Hub is a public DRG pak catalog. Players can search mods, inspect their release and variant history, and download the original pak file. The frontend is static HTML/CSS/JavaScript; Cloudflare Pages Functions provide the API; D1 stores catalog metadata; public GitHub Releases store the pak binaries.

The local preview uses clearly labeled synthetic catalog data with disabled downloads. Production reads from D1 and ignores the demo flag. No Discord messages or pak files have been copied into this project, no accounts have been connected, and no live site or bot has been deployed. The read-only Discord importer runs briefly in GitHub Actions when a Cloudflare cron trigger starts it; no bot host needs to remain online.

## Cost and storage choices

The website, database, and 15-minute trigger can run on Cloudflare's Free plan, and the pak files can be public GitHub Release assets. A public GitHub repository gets free standard GitHub-hosted Actions minutes for the brief imports. Cloudflare's current Free allowance includes 5 million D1 rows read per day, 100,000 rows written per day, and 5 GB of total D1 storage. Pages Functions share the Workers Free allowance of 100,000 requests per day. Exceeding a daily D1 or Functions limit makes those queries/requests fail until the reset rather than billing overage. Keep the account on Free and check current usage in Cloudflare before enabling a paid plan. The domain's renewal is still paid to its registrar.

GitHub's current release limits allow up to 1,000 assets per release and require each asset to be under 2 GiB. GitHub documents no total release-size or bandwidth limit. Because the asset repository is public, anyone can access the pak files and see release metadata. This is the tradeoff for avoiding metered object storage.

Author/uploader permission for public redistribution should be confirmed before importing a pak. Keep credits and a source link in the catalog and remove a file from public releases if its creator requests a valid takedown.

## Version and variant rules

- A release is one Discord message with one or more <code>.pak</code> attachments. Multiple attachments on that message are file variants within the same release.
- Keep the version text exactly as the post supplies it, such as <code>v7.1</code>. Do not infer semantic versions from filenames or compare version strings lexically.
- If a message has no explicit version, label it <code>Unversioned</code>; display its source date alongside the label.
- A pak post in a thread belongs to that thread's mod. The root post establishes the mod identity; later pak attachments in that thread become releases under the same mod. For a top-level message without a thread, create a standalone mod entry until a person or bot rule explicitly links it elsewhere.
- Do not merge mods based only on matching filenames or similar names. Preserve distinct files even when filenames repeat; use GitHub asset IDs and SHA-256 checksums for idempotency and integrity metadata.
- Sort the release history by source date. The newest upload is the default download unless a release has <code>is_recommended: true</code>; a recommendation is an explicit curation choice, not an automatic claim that the highest-looking version is best.
- Do not overwrite older GitHub release assets when a new release arrives. Use a stable unique GitHub tag per source message, with all variants from that message attached to the same release.

## Local preview

Open a terminal in the <code>PakHub</code> folder and run:

<pre><code>py -m http.server 8787 --directory public</code></pre>

Open <a href="http://localhost:8787/">http://localhost:8787/</a>. Local previews use clearly labeled synthetic records with disabled downloads; use <code>?demo=0</code> when testing against a local Functions/D1 API. Production ignores the demo flag. Stop the local server with Ctrl+C.

## Deploy the site and connect D1

1. Create a **public** GitHub repository for this <code>PakHub</code> folder. The included Actions workflow uploads pak assets to releases in that same repository; the public repository also keeps its standard Actions runs free. From the <code>PakHub</code> folder, initialize Git, commit the files, add the repository as <code>origin</code>, and push the <code>main</code> branch. Check that <code>.env</code> files and tokens are absent before pushing.
2. Create a Cloudflare account and stay on the Free plan. Install Node.js 20.6 or newer for Wrangler. In <strong>Workers &amp; Pages → D1 SQL Database</strong>, create a database named <code>pak-hub</code> and copy its database ID.
3. Replace <code>REPLACE_WITH_CLOUDFLARE_D1_ID</code> in <code>wrangler.toml</code> with that ID. Set <code>GITHUB_RELEASE_REPO</code> to your public GitHub repository's exact <code>owner/repository</code>. Commit and push this configuration; it contains no secret.
4. From the <code>PakHub</code> folder, authenticate Wrangler and apply the schema:

   <pre><code>npx wrangler@latest login
npx wrangler@latest d1 migrations apply pak-hub --remote</code></pre>

5. In <strong>Workers &amp; Pages</strong>, create a Pages project connected to the website repository. The Wrangler config sets the static output directory to <code>public</code>; leave the build command empty. Ensure the D1 database is attached to the Pages project as a D1 binding named <code>DB</code> in production, then redeploy. The Functions under <code>functions/</code> are deployed with the Pages project.
6. Add the secret <code>PAK_HUB_IMPORT_TOKEN</code> in the Pages project's <strong>Settings → Variables and Secrets</strong>. Generate a long random token and store the same value in GitHub Actions secrets. Never commit it or put it in frontend code. Set <code>GITHUB_RELEASE_REPO</code> in the Pages project variables to the same <code>owner/repository</code> value as <code>wrangler.toml</code>.
7. Add the purchased domain under the Pages project's <strong>Custom domains</strong>. If the domain is not already using Cloudflare DNS, add the domain to Cloudflare and update its nameservers at the registrar. The domain renewal remains a separate cost.
8. Visit <code>/api/mods</code>. An empty <code>mods</code> array means the site and D1 binding are connected and awaiting imports. <code>?demo=1</code> is only a local preview mode; it never seeds demo rows in D1.

Use Wrangler for future schema changes. Add a new numbered file under <code>migrations/</code>, run <code>npx wrangler@latest d1 migrations apply pak-hub --remote</code>, then deploy the website. Do not edit an already-applied migration in production.

<code>public/_routes.json</code> limits Pages Function execution to <code>/api/*</code>, keeping the static site files outside the daily Functions request quota. Cloudflare documents the binding setup in [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/); free-tier limits and over-limit behavior are in [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) and [Pages Function pricing](https://developers.cloudflare.com/pages/functions/pricing/).

## API used by the Discord importer

<code>GET /api/mods?q=&amp;category=&amp;sort=newest&amp;page=1</code> returns catalog summaries, the available categories, counts, and the newest release. <code>sort</code> may be <code>newest</code>, <code>oldest</code>, or <code>name</code>; page size is 48. Release history is returned newest-first, with an explicit recommended badge when a release has been curated.

<code>GET /api/mods/:slug</code> returns the mod's release history and every file variant, including its GitHub download URL and source link.

<code>POST /api/import</code> accepts one source message and its <code>.pak</code> attachments. Authenticate with <code>Authorization: Bearer &lt;PAK_HUB_IMPORT_TOKEN&gt;</code>. It accepts at most 64 KB and ten attachments per request. The <code>download_url</code> must point to a release asset in the configured <code>GITHUB_RELEASE_REPO</code>; the server rejects other hosts and repositories.

Example payload (synthetic values):

<pre><code>{
  "slug": "sample-mod-root-key",
  "mod_source_id": "123456789012345678",
  "name": "Sample Mod",
  "summary": "Synthetic example; replace with the creator's description.",
  "category": "Interface",
  "creator": "Creator name",
  "uploader": "Uploader name",
  "version": "v1.2",
  "channel": "unknown",
  "changelog": "Optional release notes.",
  "published_at": "2026-01-20T12:00:00.000Z",
  "is_recommended": false,
  "source_channel_id": "123456789012345678",
  "source_message_id": "123456789012345679",
  "source_message_url": "https://discord.com/channels/123456789012345678/123456789012345678/123456789012345679",
  "source_thread_id": "123456789012345680",
  "source_thread_url": "https://discord.com/channels/123456789012345678/123456789012345680",
  "files": [
    {
      "filename": "sample-mod.pak",
      "variant": "Default build",
      "size_bytes": 524288,
      "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "github_asset_id": "987654321",
      "github_tag": "pakhub-discord-123456789012345679",
      "download_url": "https://github.com/owner/pak-hub/releases/download/pakhub-discord-123456789012345679/sample-mod.pak"
    }
  ]
}</code></pre>

<code>mod_source_id</code> is the stable root key for that mod (prefer the thread ID for a thread-backed mod). Keep the same <code>slug</code> for later releases. Use the actual Discord message ID for each release's <code>source_message_id</code>; repeated imports of that source update the same database release. For an unversioned post, send <code>"version": "Unversioned"</code> and the original message timestamp.

The import endpoint is a trusted-server endpoint. Do not call it directly from the browser. The Actions job receives its short-lived GitHub credential automatically; store the Discord bot token and import token in GitHub Actions secrets. The job creates the release, uploads bytes, calculates SHA-256, then sends the resulting asset metadata to this endpoint. <code>GET/PUT /api/import-state</code> stores its private resume cursors in D1, protected by the same import token.

## Discord setup

See [BOT_SETUP.md](BOT_SETUP.md) for the read-only permissions, scheduled import setup, thread/version rules, and secrets. This project has not sent a message, installed a bot, or changed a server setting.
