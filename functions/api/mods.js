import { json, unavailable } from "../_lib/http.js";
import { parseSearch } from "../../public/search.js";
import { searchCondition, searchOrder } from "../_lib/search.js";

export async function onRequestGet({ request, env }) {
  if (!env.DB) return unavailable();

  const url = new URL(request.url);
  const search = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const requestedSlug = (url.searchParams.get("slug") || "").trim().slice(0, 100);
  const requestedSort = url.searchParams.get("sort");
  const sort = ["name", "name-desc", "oldest", "most-files", "fewest-files"].includes(requestedSort) ? requestedSort : "newest";
  const page = Math.max(1, Math.min(500, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
  const pageSize = 48;
  const where = [];
  const values = [];

  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedSlug)) {
    where.push("m.slug = ?");
    values.push(requestedSlug);
  }

  if (search) {
    const match = searchCondition(parseSearch(search), (field) => `
      ${field("m.name", true)} OR ${field("m.summary")} OR ${field("m.root_post_content")} OR ${field("m.uploader_name")}
      OR EXISTS (SELECT 1 FROM releases r WHERE r.mod_id = m.id AND (
        ${field("r.posted_by")} OR ${field("r.post_content")} OR EXISTS (
          SELECT 1 FROM pak_files f WHERE f.release_id = r.id AND ${field("f.original_filename", true)}
        )))`);
    where.push(match.sql);
    values.push(...match.values);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderBy = {
    name: "m.name COLLATE NOCASE ASC, m.slug ASC",
    "name-desc": "m.name COLLATE NOCASE DESC, m.slug ASC",
    "most-files": "file_count DESC, m.name COLLATE NOCASE ASC, m.slug ASC",
    "fewest-files": "file_count ASC, m.name COLLATE NOCASE ASC, m.slug ASC",
    oldest: "m.root_posted_at ASC, m.name COLLATE NOCASE ASC, m.slug ASC",
    newest: "m.root_posted_at DESC, m.name COLLATE NOCASE ASC, m.slug ASC",
  }[sort];
  const offset = (page - 1) * pageSize;
  const relevance = search && sort === "newest" ? searchOrder(parseSearch(search), "m.name", (field) =>
    `EXISTS (SELECT 1 FROM releases r JOIN pak_files f ON f.release_id = r.id WHERE r.mod_id = m.id AND ${field("f.original_filename", true)})`) : null;

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
        ORDER BY ${relevance ? `${relevance.sql}, ` : ""}${orderBy}
        LIMIT ? OFFSET ?
      `).bind(...values, ...(relevance?.values || []), pageSize, offset).all(),
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
