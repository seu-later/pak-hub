# Discord ingestion runbook

Pak Hub needs a Discord bot **account**, but no continuously hosted bot process. A Cloudflare cron Worker runs every 15 minutes and starts a GitHub Actions job. The job briefly connects to Discord, imports new pak attachments, saves its resume position in D1, and exits. The importer only reads Discord. New paks appear after the next trigger and job queue, rather than instantly.

This setup has not been connected to your accounts. The first job backfills the whole channel and its public threads, so confirm that the creators approve public redistribution before starting it.

## 1. Deploy the website and database

Follow [README.md](README.md#deploy-the-site-and-connect-d1). Use one **public** GitHub repository for this project and its Release assets. Apply both D1 migrations before starting the importer. Confirm `https://YOUR_DOMAIN/api/mods` returns an empty catalog. In the Cloudflare Pages project's production settings, set:

- D1 binding `DB` to the `pak-hub` database.
- Secret `PAK_HUB_IMPORT_TOKEN` to a long random value, such as 32 random bytes encoded as hex.
- Variable `GITHUB_RELEASE_REPO` to `OWNER/REPOSITORY`, the same public GitHub repository.

## 2. Create or reuse a Discord bot account

1. In the [Discord Developer Portal](https://discord.com/developers/applications), create a bot application or use one you control. Copy its token privately. The account will appear offline between jobs.
2. Enable **Message Content Intent** in the Bot settings so it can read post text and attachment metadata. Discord may require approval for this intent if the app is verified.
3. Have a server admin install the bot with the `bot` scope. Grant **View Channel** and **Read Message History** on the pak text channel. It needs no Administrator, Send Messages, Send Messages in Threads, Manage Messages, or Manage Threads permission. It reads public threads under that channel, including archived public threads.
4. Copy the server ID and pak text-channel ID using Discord Developer Mode.

No step requires sending a message into Discord.

## 3. Configure GitHub Actions

Push this project's `main` branch, including `.github/workflows/import-paks.yml` and `bot/package-lock.json`, to the **public** repository. In **Settings → Secrets and variables → Actions**, create repository **secrets**:

| Secret | Value |
| --- | --- |
| `DISCORD_BOT_TOKEN` | Token from your Discord bot application |
| `PAK_HUB_IMPORT_TOKEN` | Exact same token configured on Cloudflare Pages |

Create repository **variables**:

| Variable | Value |
| --- | --- |
| `DISCORD_GUILD_ID` | Discord server ID |
| `DISCORD_PAK_CHANNEL_ID` | Pak text-channel ID |
| `PAK_HUB_IMPORT_URL` | `https://YOUR_DOMAIN/api/import` |
| `PAK_HUB_STATE_URL` | `https://YOUR_DOMAIN/api/import-state` |

In **Settings → Actions → General**, allow Actions to run and confirm the workflow can receive `contents: write` permission. The job uses its short-lived `GITHUB_TOKEN` to create Releases and upload assets in the same repository. It needs no separate long-lived release token. Organization policy can restrict this permission.

The workflow runs on `workflow_dispatch`, one import at a time. It resumes from D1 if a job fails. GitHub can disable its own scheduled workflows in inactive public repositories after 60 days; the Cloudflare trigger starts a `workflow_dispatch` run instead.

## 4. Deploy the 15-minute trigger

Create a **fine-grained GitHub personal access token** restricted to this one public repository, with **Actions: Read and write** permission. Cloudflare uses it only to start the workflow. For unattended operation, choose **No expiration** if GitHub offers it for your repository; otherwise set a reminder to rotate the token before it expires. Edit `cron-dispatch/wrangler.toml` so `GITHUB_REPO` is `OWNER/REPOSITORY` and `GITHUB_BRANCH` is your default branch (normally `main`). Then run from the `PakHub` folder:

```sh
npx wrangler@latest login
npx wrangler@latest secret put GITHUB_DISPATCH_TOKEN --config cron-dispatch/wrangler.toml
npx wrangler@latest deploy --config cron-dispatch/wrangler.toml
```

Paste the token only at the interactive `secret put` prompt. Never commit it. In Cloudflare Workers, verify `pak-hub-dispatch` shows the cron trigger and the secret. Cron changes can take a few minutes to propagate. The Worker has no public HTTP endpoint.

## 5. Start and verify the first import

Once redistribution is approved, manually start **Actions → Import Discord paks → Run workflow**. Watch the log for `Backfill complete`, then check `https://YOUR_DOMAIN/api/mods` and the site. Check a top-level pak, a thread with versions, and a post with multiple pak attachments. Downloads should link to your public GitHub Releases. If a run fails, inspect its error and rerun it after fixing the cause; the D1 cursor resumes after the last successful message.

The initial backfill may take a long time if there are many or large paks. The job has a six-hour timeout; if it times out, run it again. A trigger may enqueue another run while one is active, but the workflow's concurrency group prevents simultaneous imports.

## How versions are grouped

One Discord message with one or more `.pak` attachments is one release. Multiple paks in that message are variants. A top-level post without a thread starts a standalone mod. When that post has a public thread, the root pak and later pak posts in the thread share one mod entry; the importer moves a previously standalone root release into the thread entry when it discovers the thread. It never groups unrelated posts just because their names look similar.

The importer uses an explicit `Version:`/`Ver:` field or a `v`-prefixed version in the post. Otherwise it shows `Unversioned` with the source timestamp. It keeps the original Discord link and contributor credit. Each message gets a stable GitHub Release tag; re-running the job updates the same catalog release.

## Operating notes

- The process reads the main channel, active public threads, and archived public threads. It ignores bot-authored posts, non-pak attachments, and private threads.
- D1 stores import cursors in `import_state`. `bot/state.json` is only for optional local runs. The job uploads each attachment to a public GitHub Release and deletes its temporary copy.
- If the bot loses channel access, a creator deletes an attachment before import, a token expires, or a service is down, the Actions run fails and the next run retries. Review failed runs or enable GitHub failure notifications.
- Public releases expose the pak files to anyone. Keep a takedown contact available and remove unauthorized uploads from both GitHub and D1.

Discord documents [Message Content Intent](https://docs.discord.com/developers/events/gateway#message-content-intent). Cloudflare documents [cron triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/), and GitHub documents [workflow dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch) and [Actions runner billing](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job).
