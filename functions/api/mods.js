import { json, unavailable } from "../_lib/http.js";

export async function onRequestGet({ request, env }) {
  if (!env.DB) return unavailable();

  const url = new URL(request.url);
  const search = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const category = (url.searchParams.get("category") || "").trim().slice(0, 40);
  const requestedSort = url.searchParams.get("sort");
  const sort = ["name", "oldest"].includes(requestedSort) ? requestedSort : "newest";
  const page = Math.max(1, Math.min(500, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
  const pageSize = 48;
  const where = [];
  const values = [];

  if (search) {
    const escaped = search.replace(/[\\%_]/g, "\\$&");
    where.push("(m.name LIKE ? ESCAPE '\\' OR m.summary LIKE ? ESCAPE '\\' OR m.creator_name LIKE ? ESCAPE '\\')");
    values.push(`%${escaped}%`, `%${escaped}%`, `%${escaped}%`);
  }
  if (category) {
    where.push("m.category = ?");
    values.push(category);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderBy = sort === "name" ? "m.name COLLATE NOCASE ASC"
    : sort === "oldest" ? "latest.published_at ASC, m.name COLLATE NOCASE ASC"
      : "latest.published_at DESC, m.name COLLATE NOCASE ASC";
  const offset = (page - 1) * pageSize;

  try {
    const [countResult, modsResult, categoriesResult] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) AS total FROM mods m ${clause}`).bind(...values).first(),
      env.DB.prepare(`
        SELECT
          m.slug, m.name, m.summary, m.category, m.creator_name, m.uploader_name,
          latest.version_label AS latest_version,
          latest.channel AS latest_channel,
          latest.published_at AS latest_published_at,
          latest.is_recommended AS latest_recommended,
          (SELECT COUNT(*) FROM releases r WHERE r.mod_id = m.id) AS release_count,
          (SELECT COUNT(*) FROM releases r JOIN pak_files f ON f.release_id = r.id WHERE r.mod_id = m.id) AS file_count
        FROM mods m
        LEFT JOIN releases latest ON latest.id = (
          SELECT r.id FROM releases r
          WHERE r.mod_id = m.id
          ORDER BY r.published_at DESC, r.id DESC
          LIMIT 1
        )
        ${clause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `).bind(...values, pageSize, offset).all(),
      env.DB.prepare("SELECT DISTINCT category FROM mods ORDER BY category COLLATE NOCASE").all(),
    ]);

    return json({
      mods: modsResult.results || [],
      categories: (categoriesResult.results || []).map((row) => row.category),
      total: countResult?.total || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Pak Hub catalog query failed", error);
    return json({ error: "The catalog could not be loaded. Try again shortly." }, 503);
  }
}
