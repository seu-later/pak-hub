import { json, unavailable } from "../_lib/http.js";

/* Message links are emitted only for the allowlisted public server. Private
 * rows carry the handle with no URL, and guild ids never leave the server. */
const PUBLIC_DUMP_GUILD = "878318716801155233";

/* Finals first, then prereleases, unversioned last; versions newest-first. */
function dumpRank(file) {
  if (file.version) return file.prerelease ? 1 : 0;
  return 2;
}

export function compareDumpFiles(left, right) {
  const rank = dumpRank(left) - dumpRank(right);
  if (rank !== 0) return rank;
  if (!left.version && !right.version) return compareNames(left.filename, right.filename);
  const leftTokens = String(left.version).split(/[._-]+/);
  const rightTokens = String(right.version).split(/[._-]+/);
  const length = Math.max(leftTokens.length, rightTokens.length);
  for (let index = 0; index < length; index += 1) {
    const leftToken = leftTokens[index];
    const rightToken = rightTokens[index];
    if (leftToken === undefined) return 1;
    if (rightToken === undefined) return -1;
    const leftNumber = /^\d+$/.test(leftToken) ? Number(leftToken) : null;
    const rightNumber = /^\d+$/.test(rightToken) ? Number(rightToken) : null;
    if (leftNumber !== null && rightNumber !== null) {
      if (leftNumber !== rightNumber) return rightNumber - leftNumber;
    } else if (leftToken !== rightToken) {
      return rightToken.localeCompare(leftToken);
    }
  }
  return compareNames(left.filename, right.filename);
}

function compareNames(left, right) {
  return String(left).localeCompare(String(right), undefined, { sensitivity: "base" });
}

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
      d.base_name LIKE ? ESCAPE '\\' OR EXISTS (
        SELECT 1 FROM dump_files g
        WHERE g.base_key = d.base_key AND g.filename LIKE ? ESCAPE '\\'
      )
    )`);
    values.push(`%${escaped}%`, `%${escaped}%`);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderBy = sort === "name"
    ? "MIN(d.base_name) COLLATE NOCASE ASC"
    : sort === "oldest"
      ? "MAX(d.id) ASC, MIN(d.base_name) COLLATE NOCASE ASC"
      : "MAX(d.id) DESC, MIN(d.base_name) COLLATE NOCASE ASC";
  const offset = (page - 1) * pageSize;

  try {
    const [countResult, groupResult] = await Promise.all([
      env.DB.prepare(
        `SELECT COUNT(DISTINCT d.base_key) AS total FROM dump_files d ${clause}`,
      ).bind(...values).first(),
      env.DB.prepare(`
        SELECT d.base_key AS base_key, MIN(d.base_name) AS base_name, COUNT(*) AS file_count
        FROM dump_files d
        ${clause}
        GROUP BY d.base_key
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `).bind(...values, pageSize, offset).all(),
    ]);

    const groups = groupResult.results || [];
    let filesByBase = new Map();
    const keys = groups.map((group) => group.base_key);
    if (keys.length) {
      const placeholders = keys.map(() => "?").join(",");
      const { results: files } = await env.DB.prepare(`
        SELECT base_key, base_name, version, prerelease, filename, size_bytes, r2_key,
          posted_by, source_message_url, source_guild
        FROM dump_files WHERE base_key IN (${placeholders})
      `).bind(...keys).all();
      filesByBase = new Map(keys.map((key) => [key, []]));
      for (const file of files || []) {
        filesByBase.get(file.base_key)?.push({
          filename: file.filename,
          version: file.version || "",
          prerelease: Number(file.prerelease || 0),
          sizeBytes: Number(file.size_bytes || 0),
          downloadUrl: `/api/dump-file/${file.r2_key}`,
          postedBy: file.posted_by || "Unknown",
          sourceUrl: file.source_guild === PUBLIC_DUMP_GUILD ? (file.source_message_url || "") : "",
        });
      }
    }

    return json({
      groups: groups.map((group) => ({
        name: group.base_name,
        fileCount: Number(group.file_count || 0),
        files: (filesByBase.get(group.base_key) || []).sort(compareDumpFiles),
      })),
      total: countResult?.total || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Pak Hub dump query failed", error);
    return json({ error: "The pak dump could not be loaded. Try again shortly." }, 503);
  }
}
