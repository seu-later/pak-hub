import assert from "node:assert/strict";
import test from "node:test";
import worker from "./worker.js";

test("cron dispatches the importer workflow on the configured branch", async () => {
  const previousFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(null, { status: 204 });
  };
  try {
    await worker.scheduled(null, {
      GITHUB_REPO: "owner/pak-hub",
      GITHUB_BRANCH: "main",
      GITHUB_DISPATCH_TOKEN: "secret",
    });
    assert.equal(request.url, "https://api.github.com/repos/owner/pak-hub/actions/workflows/import-paks.yml/dispatches");
    assert.equal(request.options.method, "POST");
    assert.deepEqual(JSON.parse(request.options.body), { ref: "main" });
    assert.equal(request.options.headers.Authorization, "Bearer secret");
  } finally {
    globalThis.fetch = previousFetch;
  }
});
