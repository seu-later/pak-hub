import { json, unavailable } from "../../_lib/http.js";

export async function onRequestGet({ env, params }) {
  if (!env.DB) return unavailable();
  const slug = String(params.slug || "").slice(0, 100);

  try {
    const mod = await env.DB.prepare(`
      SELECT id, slug, name, summary, category, creator_name, uploader_name
      FROM mods WHERE slug = ?
    `).bind(slug).first();

    if (!mod) return json({ error: "That mod is not in the catalog." }, 404);

    const { results: releases } = await env.DB.prepare(`
      SELECT id, version_label, channel, changelog, published_at, is_recommended,
        source_message_url, source_thread_url
      FROM releases
      WHERE mod_id = ?
      ORDER BY published_at DESC, id DESC
    `).bind(mod.id).all();

    const releaseRows = releases || [];
    const ids = releaseRows.map((release) => release.id);
    let filesByRelease = new Map();

    if (ids.length) {
      const placeholders = ids.map(() => "?").join(",");
      const { results: files } = await env.DB.prepare(`
        SELECT release_id, original_filename, variant_label, size_bytes, sha256, download_url
        FROM pak_files WHERE release_id IN (${placeholders})
        ORDER BY original_filename COLLATE NOCASE
      `).bind(...ids).all();
      filesByRelease = new Map(ids.map((id) => [id, []]));
      for (const file of files || []) filesByRelease.get(file.release_id)?.push(file);
    }

    return json({
      mod: {
        slug: mod.slug,
        name: mod.name,
        summary: mod.summary,
        category: mod.category,
        creator: mod.creator_name,
        uploader: mod.uploader_name,
      },
      releases: releaseRows.map((release) => ({
        version: release.version_label,
        channel: release.channel,
        changelog: release.changelog,
        publishedAt: release.published_at,
        recommended: Boolean(release.is_recommended),
        sourceUrl: release.source_message_url,
        threadUrl: release.source_thread_url,
        files: filesByRelease.get(release.id) || [],
      })),
    });
  } catch (error) {
    console.error("Pak Hub mod query failed", error);
    return json({ error: "This mod's release history could not be loaded." }, 503);
  }
}
