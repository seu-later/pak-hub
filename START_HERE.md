# Pak Hub: setup from zero

This guide starts with a private Discord test server. The importer runs for a few minutes when GitHub Actions starts it, then exits. Cloudflare's free cron Worker triggers it every 15 minutes after you finish testing. The project has not been connected to your accounts or deployed.

The test site and GitHub Release files are public URLs. Test only with dummy files or paks you are allowed to redistribute publicly. Do not point the test importer at the real server until the test records have been removed.

## 1. Check your computer

On Windows, install Node.js LTS and Git if you do not already have them. Open PowerShell and confirm:

```powershell
node --version
git --version
```

Node must be version 20.6 or later. The project is at `C:\Users\seu\Documents\drgmodding\PakHub`.

## 2. Preview the site locally

In PowerShell:

```powershell
cd C:\Users\seu\Documents\drgmodding\PakHub
py -m http.server 8787 --directory public
```

Open `http://localhost:8787/`. The sample catalog is synthetic and the download buttons are disabled. Stop the preview with Ctrl+C. This checks the visual site; it does not connect a database or Discord.

## 3. Make a private Discord test server

In Discord, create a new server just for testing (or use a private test server you already control). Create a normal **text channel** such as `pak-hub-test`. Do not use a forum channel. Enable Developer Mode in Discord's Advanced settings, then copy the test server ID and test channel ID for later.

Create test posts only after the bot has access. A useful test set is:

1. A top-level message with a title, `Version: v1.0`, and one temporary file ending in `.pak`.
2. Create a public thread from that message. In the thread, post `Version: v1.1` with a second `.pak` file.
3. A separate top-level message with a different name, `Version: v2.0`, and a `.pak` file, with no thread.

You can make a harmless test attachment in the project folder with:

```powershell
node -e "require('node:fs').writeFileSync('PakHub-test-only.pak', Buffer.from('PAK HUB TEST ONLY'))"
```

That file is only a pipeline test and is not a valid game mod. It will be publicly downloadable while testing, so delete its GitHub Release and clear the test catalog afterward. Better still, use a tiny real pak you have permission to publish.

## 4. Create the Discord bot account

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and create an application named `Pak Hub Test`.
2. Open **Bot**, create the bot user if prompted, and copy its token. Treat it like a password; do not paste it into chat, GitHub files, or the website.
3. On the **Bot** page, enable **Message Content Intent** and save.
4. In **Installation** (or OAuth2 URL Generator), select the `bot` scope. Grant only **View Channels** and **Read Message History**. Use the generated install link to add the bot to the test server.
5. In the test channel's permissions, make sure the bot role can view the channel and read message history. It does not need Administrator or any send, thread management, or moderation permissions.

The bot will show offline between imports. It only connects during each GitHub Actions run. You do not need to send it a Discord message.

## 5. Create a public GitHub repository and push this project

Pak files are stored as public GitHub Release assets. For this free setup, the simplest arrangement is one public repository for the site code, importer, and release assets. This also makes the standard hosted GitHub Actions runner free. The source code will be public, so check that no secrets are in the folder. The project's `.gitignore` excludes the bot `.env` file, local state, and common database files.

On GitHub, create a new **Public** repository called `pak-hub`. Leave the README, `.gitignore`, and license options unchecked because this folder already has project files. Then push from PowerShell:

```powershell
cd C:\Users\seu\Documents\drgmodding\PakHub
git init -b main
git add .
git status --short
git commit -m "Initial Pak Hub site and importer"
git remote add origin https://github.com/YOUR_GITHUB_NAME/pak-hub.git
git push -u origin main
```

Replace `YOUR_GITHUB_NAME` with your GitHub username. Before `git commit`, inspect `git status --short` and confirm there are no `.env` files, tokens, or private pak files. If Git asks for your name and email, set them with `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`, then retry the commit.

## 6. Create the Cloudflare database and connect the site

1. Create or sign in to Cloudflare and stay on its Free plan.
2. In **Workers & Pages → D1 SQL Database**, create a database named `pak-hub`. Copy its database ID.
3. In the project, open `wrangler.toml`. Replace `REPLACE_WITH_CLOUDFLARE_D1_ID` with the copied database ID. Replace `REPLACE_WITH_OWNER/PAK-ASSETS-REPO` with `YOUR_GITHUB_NAME/pak-hub`.
4. Save, then push the changes:

   ```powershell
   git add wrangler.toml
   git commit -m "Configure Pak Hub database and release repository"
   git push
   ```

5. From the project folder, connect Wrangler and apply the database tables:

   ```powershell
   npx wrangler@latest login
   npx wrangler@latest d1 migrations apply pak-hub --remote
   ```

   Confirm Wrangler reports both migrations applied. This creates the catalog tables and private importer resume-state table.

6. In Cloudflare **Workers & Pages**, create a **Pages** project and connect it to the `pak-hub` GitHub repository. Use no framework, no build command, and `public` as the output directory. Deploy the `main` branch.
7. Open the Pages project **Settings → Bindings → Add → D1 database binding**. Set the variable name to `DB`, select the `pak-hub` database, save, and redeploy. The Pages Function needs this binding to read and write catalog data.
8. In Pages **Settings → Variables and Secrets** for Production, add variable `GITHUB_RELEASE_REPO` = `YOUR_GITHUB_NAME/pak-hub`.
9. Generate an import secret in PowerShell:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   Copy the output temporarily. Add it as a **Secret** named `PAK_HUB_IMPORT_TOKEN` in Cloudflare Pages Production. You will enter the same value in GitHub Actions in the next step. Never save it in the repository.

10. Open the site's `https://YOUR-PROJECT.pages.dev/api/mods` address. It should return JSON with an empty `mods` array. Keep this `pages.dev` address; it is the test site and can also be used as the production API address until you attach your own domain.

## 7. Configure GitHub Actions for the test server

In GitHub, open the repository **Settings → Secrets and variables → Actions**.

Add these **repository secrets**:

| Secret name | Value |
| --- | --- |
| `DISCORD_BOT_TOKEN` | The test bot token from Step 4 |
| `PAK_HUB_IMPORT_TOKEN` | The same value entered in Cloudflare Pages |

Add these **repository variables**:

| Variable name | Value |
| --- | --- |
| `DISCORD_GUILD_ID` | Test server ID from Step 3 |
| `DISCORD_PAK_CHANNEL_ID` | Test channel ID from Step 3 |
| `PAK_HUB_IMPORT_URL` | `https://YOUR-PROJECT.pages.dev/api/import` |
| `PAK_HUB_STATE_URL` | `https://YOUR-PROJECT.pages.dev/api/import-state` |

Replace `YOUR-PROJECT` with the Pages project's actual name. Under **Settings → Actions → General**, allow Actions and choose **Read and write permissions** for `GITHUB_TOKEN` if the repository settings expose that choice. The workflow already requests `contents: write` so it can create Releases in this same repository.

## 8. Run the first test import manually

1. Post the three test examples from Step 3 to the test channel. Put the first `.pak` on the top-level message before creating its public thread. Use a version string in each post.
2. In GitHub, open **Actions → Import Discord paks → Run workflow → Run workflow** on branch `main`.
3. Open the run and wait for it to finish. A successful run logs `Backfill complete. Scheduled importer is exiting.`
4. Open the Pages site. The threaded test should appear as one mod with releases `v1.0` and `v1.1`; the separate top-level post should appear as another mod. Verify that each file downloads from a GitHub Release and the source links point to the test server.
5. If the workflow fails, read the failed step. Check the Discord IDs and channel permissions, Message Content Intent, all four GitHub variables, both secrets, the Pages D1 binding, and that both database migrations were applied. Fix the cause, then run the workflow again; its cursor is saved in D1.

Do not continue until this test passes. The workflow reads only the configured server and channel, and it imports the historical messages on the first run.

## 9. Remove the test data before production

While the database contains only test data, open Cloudflare **D1 → pak-hub → Console** and run these statements one at a time:

```sql
DELETE FROM pak_files;
DELETE FROM releases;
DELETE FROM mods;
DELETE FROM import_state;
```

In GitHub, open the repository **Releases** page and delete the test releases created by this test. This removes the public dummy files. Leave your code and migrations in place. Confirm `/api/mods` is empty again.

## 10. Switch the importer to your real Discord source

1. In Discord, enable Developer Mode if needed and copy the real server ID and the ID of the normal text pak channel.
2. Add the same bot application to the real server. Give it **View Channel** and **Read Message History** on the pak channel. Verify the Message Content Intent remains enabled.
3. In GitHub **Settings → Secrets and variables → Actions**, change `DISCORD_GUILD_ID` and `DISCORD_PAK_CHANNEL_ID` from the test values to the real server and channel IDs.
4. Make sure the creators permit public redistribution of the existing files. The first production run backfills the channel and its public archived threads; each imported pak becomes publicly downloadable from GitHub Releases.
5. Manually run **Actions → Import Discord paks** once more. Inspect the website, release versions, source links, and downloads before enabling the timer.

## 11. Turn on the 15-minute automatic importer

Create a GitHub fine-grained personal access token for only the `pak-hub` repository with **Actions: Read and write** permission. It lets Cloudflare start the workflow and cannot read Discord or upload releases. Choose no expiration if GitHub allows it for the repository; otherwise set a reminder to rotate it.

1. Open `cron-dispatch/wrangler.toml`. Set `GITHUB_REPO` to `YOUR_GITHUB_NAME/pak-hub` and `GITHUB_BRANCH` to `main`.
2. Temporarily set `crons = []` in that file, then from the project folder deploy the Worker with no timer yet:

   ```powershell
   npx wrangler@latest login
   npx wrangler@latest deploy --config cron-dispatch/wrangler.toml
   ```

3. Add the PAT as a Cloudflare Worker secret. Wrangler will prompt for its value; paste it at the prompt:

   ```powershell
   npx wrangler@latest secret put GITHUB_DISPATCH_TOKEN --config cron-dispatch/wrangler.toml
   ```

4. Reopen `cron-dispatch/wrangler.toml`, set `crons = ["*/15 * * * *"]`, save and deploy again:

   ```powershell
   npx wrangler@latest deploy --config cron-dispatch/wrangler.toml
   ```

5. In Cloudflare **Workers & Pages**, open `pak-hub-dispatch`. Confirm the cron trigger is shown. The schedule uses UTC and may take a few minutes to activate. New pak posts should appear after a trigger and the GitHub Actions queue, usually within about 15–20 minutes.

## 12. Attach your domain

After the real-server import works, open the Cloudflare Pages project **Custom domains → Set up a domain**, enter the domain you bought, and follow Cloudflare's DNS instructions. For an apex domain such as `example.com`, Cloudflare requires the domain's nameservers to use Cloudflare. If you already use email or other services on that domain, copy their existing DNS records into Cloudflare before changing nameservers. The domain renewal still goes to your registrar.

Keep an eye on failed GitHub Actions runs occasionally. A revoked Discord bot, expired GitHub token, missing permissions, or a service outage needs attention; successful runs continue on their own.

## How a pak version appears

Each Discord message with pak attachments is one release. If the message has multiple `.pak` files, they are variants of that release. The root post and pak replies in its public thread belong to one mod. A top-level pak post without a thread becomes its own standalone mod. The importer uses an explicit `Version:`/`Ver:` or `v`-prefixed version; without one, the site shows `Unversioned` and the Discord post date. It does not guess that unrelated top-level posts are updates to one another.

For the detailed permission and troubleshooting notes, see [BOT_SETUP.md](BOT_SETUP.md). The source repository must be public for this zero-cost Actions setup; public GitHub Releases mean anyone can download the imported pak assets. GitHub's standard runners are [free and unlimited on public repositories](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job). Cloudflare documents [Pages D1 bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/), and [Worker cron triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/).
