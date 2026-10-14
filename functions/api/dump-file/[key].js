import { json } from "../../_lib/http.js";
import { snapshotDumpFile } from "../../_lib/catalog-snapshot.js";

const KEY_PATTERN = /^[a-f0-9]{64}\.(pak|zip)$/;

export async function onRequestGet({ env, params }) {
  const key = String(params.key || "");
  if (!KEY_PATTERN.test(key)) return json({ error: "That dump file was not found." }, 404);
  if (!env.DB || !env.DUMP) return json({ error: "The pack dump is not connected yet." }, 503);

  try {
    let row;
    try {
      row = await env.DB.prepare(
        "SELECT filename, size_bytes FROM dump_files WHERE r2_key = ?",
      ).bind(key).first();
    } catch (error) {
      row = snapshotDumpFile(key);
      if (!row) throw error;
    }
    if (!row) return json({ error: "That dump file was not found." }, 404);

    const object = await env.DUMP.get(key);
    if (!object) return json({ error: "That dump file was not found." }, 404);

    const filename = String(row.filename || "download.pak").replace(/["\r\n]/g, "");
    return new Response(object.body, {
      headers: {
        "content-type": "application/octet-stream",
        "content-length": String(row.size_bytes || object.size || 0),
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "public, max-age=31536000, immutable",
        etag: object.httpEtag || key,
      },
    });
  } catch (error) {
    console.error("Pak Hub dump download failed", error);
    return json({ error: "That dump file could not be downloaded." }, 503);
  }
}
