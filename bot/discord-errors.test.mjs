import assert from "node:assert/strict";
import test from "node:test";
import { ignoreUnknownMessage, isUnknownMessageError } from "./discord-errors.mjs";

test("recognizes Discord unknown-message errors", () => {
  assert.equal(isUnknownMessageError({ code: 10008 }), true);
  assert.equal(isUnknownMessageError({ rawError: { code: 10008 } }), true);
  assert.equal(isUnknownMessageError(new Error("Unknown Message")), true);
  assert.equal(isUnknownMessageError({ code: 50001, message: "Missing Access" }), false);
});

test("skips an unknown message and rethrows other errors", async () => {
  let skipped = null;
  assert.equal(await ignoreUnknownMessage("message 123", async () => {
    throw { code: 10008, message: "Unknown Message" };
  }, (error, label) => { skipped = { error, label }; }), null);
  assert.equal(skipped.label, "message 123");

  await assert.rejects(() => ignoreUnknownMessage("message 456", async () => {
    throw new Error("network failure");
  }), /network failure/);
});
