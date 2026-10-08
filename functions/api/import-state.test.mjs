import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestGet, onRequestPut } from "./import-state.js";

test("import state is private, persistent, and rejects invalid cursors", async () => {
  const database = new DatabaseSync(":memory:");
  database.exec(readFileSync(new URL("../../migrations/0002_import_state.sql", import.meta.url), "utf8"));
  const env = {
    PAK_HUB_IMPORT_TOKEN: "test-secret",
    DB: {
      prepare(sql) {
        const statement = database.prepare(sql);
        let values = [];
        return {
          bind(...args) { values = args; return this; },
          async first() { return statement.get(...values) || null; },
          async run() { return statement.run(...values); },
        };
      },
    },
  };
  const url = "https://example.com/api/import-state";
  const headers = { authorization: "Bearer test-secret", "content-type": "application/json" };

  assert.equal((await onRequestGet({ request: new Request(url), env })).status, 401);
  const empty = await onRequestGet({ request: new Request(url, { headers }), env });
  assert.deepEqual(await empty.json(), { state: { channelCursor: null, threadCursors: {} } });
  assert.equal(empty.headers.get("cache-control"), "no-store");

  const state = {
    channelCursor: "123456789012345678",
    threadCursors: { "123456789012345679": "123456789012345680" },
  };
  const put = (value) => onRequestPut({ request: new Request(url, {
    method: "PUT", headers, body: JSON.stringify(value),
  }), env });
  assert.equal((await put(state)).status, 200);
  assert.equal((await put({ ...state, threadCursors: { bad: "123456789012345680" } })).status, 400);
  const saved = await onRequestGet({ request: new Request(url, { headers }), env });
  assert.deepEqual((await saved.json()).state, state);
  database.close();
});
