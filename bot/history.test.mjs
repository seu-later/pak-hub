import assert from "node:assert/strict";
import test from "node:test";
import { messagesSince } from "./history.mjs";

function channelWithMessages(count) {
  const all = Array.from({ length: count }, (_, index) => ({ id: String(index + 1) }));
  return {
    messages: {
      async fetch({ limit, before }) {
        const available = all.filter((message) => !before || BigInt(message.id) < BigInt(before));
        const batch = available.slice(-limit).reverse();
        return new Map(batch.map((message) => [message.id, message]));
      },
    },
  };
}

test("backfill includes every page in chronological order", async () => {
  const messages = await messagesSince(channelWithMessages(250), null);
  assert.deepEqual(messages.map((message) => Number(message.id)), Array.from({ length: 250 }, (_, index) => index + 1));
});

test("resuming after a cursor includes more than the newest 100 messages", async () => {
  const messages = await messagesSince(channelWithMessages(300), "125");
  assert.deepEqual(messages.map((message) => Number(message.id)), Array.from({ length: 175 }, (_, index) => index + 126));
});
