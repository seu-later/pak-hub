import test from "node:test";
import assert from "node:assert/strict";
import { recordsFromExport } from "./dump-credit.mjs";

test("export records prefer usernames and build public links", () => {
  const payload = {
    channel: { id: "111" },
    messages: [
      {
        id: "100",
        author: { username: "miner_x", globalName: "Miner X" },
        attachments: [{ filename: "CoolMod.pak", fileSizeBytes: 10 }],
      },
      {
        id: "200",
        author: { name: "legacy_name" },
        attachments: [{ fileName: "CoolMod (1).pak", size: 10 }],
      },
    ],
  };
  const { channelId, records } = recordsFromExport(payload, "999", true);
  assert.equal(channelId, "111");
  assert.equal(records.length, 2);
  assert.equal(records[0].username, "miner_x");
  assert.equal(records[0].key, "coolmod.pak");
  assert.equal(records[0].url, "https://discord.com/channels/999/111/100");
  assert.equal(records[1].username, "legacy_name");
  assert.equal(records[1].key, "coolmod.pak");
});

test("export records omit links without a public guild", () => {
  const payload = {
    channel: { id: "222" },
    messages: [
      { id: "300", author: { username: "quiet_miner" }, attachments: [{ filename: "Secret.pak" }] },
    ],
  };
  const { records } = recordsFromExport(payload, "", false);
  assert.equal(records[0].username, "quiet_miner");
  assert.equal(records[0].url, null);
});
