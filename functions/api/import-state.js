import { equalSecret, json, unavailable } from "../_lib/http.js";

const MAX_BODY_BYTES = 262144;
const EMPTY_STATE = { channelCursor: null, threadCursors: {} };

function accessError(request, env) {
  if (!env.DB) return unavailable();
  if (!env.PAK_HUB_IMPORT_TOKEN) return json({ error: "The import endpoint is not configured." }, 503);
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!equalSecret(token, env.PAK_HUB_IMPORT_TOKEN)) return json({ error: "Unauthorized." }, 401);
  return null;
}

function validSnowflake(value) {
  return typeof value === "string" && /^\d{16,22}$/.test(value);
}

function validState(state) {
  return state && typeof state === "object" && !Array.isArray(state) &&
    (state.channelCursor === null || validSnowflake(state.channelCursor)) &&
    state.threadCursors && typeof state.threadCursors === "object" && !Array.isArray(state.threadCursors) &&
    Object.entries(state.threadCursors).every(([threadId, cursor]) => validSnowflake(threadId) && validSnowflake(cursor));
}

export async function onRequestGet({ request, env }) {
  const error = accessError(request, env);
  if (error) return error;
  try {
    const row = await env.DB.prepare("SELECT state_json FROM import_state WHERE id = 1").first();
    return json({ state: row ? JSON.parse(row.state_json) : EMPTY_STATE }, 200, { "cache-control": "no-store" });
  } catch (cause) {
    console.error("Pak Hub import state read failed", cause);
    return json({ error: "Import state is unavailable." }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  const error = accessError(request, env);
  if (error) return error;
  if (Number(request.headers.get("content-length") || "0") > MAX_BODY_BYTES) {
    return json({ error: "Import state is larger than 256 KB." }, 413);
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_BODY_BYTES) return json({ error: "Import state is larger than 256 KB." }, 413);
  let state;
  try {
    state = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return json({ error: "Send a JSON import state object." }, 400);
  }
  if (!validState(state)) return json({ error: "Import state cursors are invalid." }, 400);

  try {
    await env.DB.prepare(`
      INSERT INTO import_state (id, state_json) VALUES (1, ?)
      ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = CURRENT_TIMESTAMP
    `).bind(JSON.stringify(state)).run();
    return json({ ok: true }, 200, { "cache-control": "no-store" });
  } catch (cause) {
    console.error("Pak Hub import state write failed", cause);
    return json({ error: "Import state could not be saved." }, 500);
  }
}
