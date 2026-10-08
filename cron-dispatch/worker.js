export default {
  async scheduled(_event, env) {
    if (!/^[-\w.]+\/[-\w.]+$/.test(env.GITHUB_REPO || "") || !env.GITHUB_BRANCH || !env.GITHUB_DISPATCH_TOKEN) {
      throw new Error("Set GITHUB_REPO, GITHUB_BRANCH, and GITHUB_DISPATCH_TOKEN for the scheduled importer.");
    }

    const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/actions/workflows/import-paks.yml/dispatches`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_DISPATCH_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "PakHub-Cron-Dispatch",
        "X-GitHub-Api-Version": "2026-03-10",
      },
      body: JSON.stringify({ ref: env.GITHUB_BRANCH }),
    });
    if (response.status !== 204) {
      const body = await response.text();
      throw new Error(`Could not start the pak import workflow (${response.status}): ${body.slice(0, 300)}`);
    }
  },
};
