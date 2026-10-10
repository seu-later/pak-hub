import { json, unavailable } from "../_lib/http.js";

export async function onRequestGet({ request, env }) {
  if (!env.DB) return unavailable();

  const url = new URL(request.url);
  const search = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const requestedSort = url.searchParams.get("sort");
  const sort = ["name", "oldest"].includes(requestedSort) ? requestedSort : "newest";
  const page = Math.max(1, Math.min(500, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
  const pageSize = 48;
  const where = [];
  const values = [];

  if (search) {
    const escaped = search.replace(/[\\%_]/g, "\\$&");
    where.push(`(
      m.name LIKE ? ESCAPE '\\' OR m.summary LIKE ? ESCAPE '\\' OR
      m.root_post_content LIKE ? ESCAPE '\\' OR m.uploader_name LIKE ? ESCAPE '\\' OR
      EXISTS (
        SELECT 1 FROM releases r JOIN pak_files f ON f.release_id = r.id
        WHERE r.mod_id = m.id AND (
          f.original_filename LIKE ? ESCAPE '\\' OR r.posted_by LIKE ? ESCAPE '\\' OR
          r.post_content LIKE ? ESCAPE '\\'
        )
      )
    )`);
    values.push(...Array(7).fill(`%${escaped}%`));
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderBy = sort === "name" ? "m.name COLLATE NOCASE ASC"
    : sort === "oldest" ? "m.root_posted_at ASC, m.name COLLATE NOCASE ASC"
      : "m.root_posted_at DESC, m.name COLLATE NOCASE ASC";
  const offset = (page - 1) * pageSize;

  try {
    const [countResult, modsResult] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) AS total FROM mods m ${clause}`).bind(...values).first(),
      env.DB.prepare(`
        SELECT
          m.slug, m.name, m.summary, m.uploader_name AS posted_by,
          m.root_posted_at AS posted_at,
          (SELECT COUNT(*) FROM releases r JOIN pak_files f ON f.release_id = r.id WHERE r.mod_id = m.id) AS file_count,
          (SELECT COUNT(*) FROM releases r JOIN pak_files f ON f.release_id = r.id
            WHERE r.mod_id = m.id AND r.source_message_id != COALESCE(m.root_message_id, '')) AS thread_file_count
        FROM mods m
        ${clause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `).bind(...values, pageSize, offset).all(),
    ]);

    return json({
      mods: (modsResult.results || []).map((mod) => ({
        slug: mod.slug,
        name: mod.name,
        summary: mod.summary,
        postedBy: mod.posted_by || "Unknown",
        postedAt: mod.posted_at || "",
        fileCount: Number(mod.file_count || 0),
        threadFileCount: Number(mod.thread_file_count || 0),
      })),
      total: countResult?.total || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Pak Hub catalog query failed", error);
    return json({ error: "The catalog could not be loaded. Try again shortly." }, 503);
  }
}
