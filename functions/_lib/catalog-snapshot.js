import snapshot from "../_data/catalog-snapshot.json" with { type: "json" };
import { json } from "./http.js";

const dumpFiles = new Map(snapshot.groups.flatMap((group) => group.files.map((file) => [
  file.downloadUrl.replace("/api/dump-file/", ""), { filename: file.filename, size_bytes: file.sizeBytes },
])));

export function snapshotDumpFile(key) {
  return dumpFiles.get(key) || null;
}

function compareNames(left, right) {
  const a = left.name.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
  const b = right.name.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
  return a < b ? -1 : a > b ? 1 : 0;
}

export function snapshotResponse(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");
  const query = (url.searchParams.get("q") || "").trim().slice(0, 100).toLowerCase();
  const sort = url.searchParams.get("sort");
  const page = Math.max(1, Math.min(500, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
  const pageSize = 48;
  const includes = (value) => String(value || "").toLowerCase().includes(query);
  const respond = (data) => json(data, 200, {
    "x-pakhub-catalog-source": "snapshot",
    "x-pakhub-snapshot-at": snapshot.generatedAt,
  });

  if (path.startsWith("/api/mods/")) {
    let slug;
    try { slug = decodeURIComponent(path.slice("/api/mods/".length)); } catch { return null; }
    return Object.hasOwn(snapshot.details, slug) ? respond(snapshot.details[slug]) : null;
  }
  if (path === "/api/mods") {
    const slug = (url.searchParams.get("slug") || "").trim().slice(0, 100);
    const rows = snapshot.mods.filter((mod) => {
      if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && mod.slug !== slug) return false;
      if (!query) return true;
      const detail = snapshot.details[mod.slug];
      return [mod.name, mod.summary, mod.postedBy].some(includes) ||
        [detail.initialPost, ...detail.threadPosts].some((post) =>
          [post.content, post.postedBy, ...post.files.map((file) => file.filename)].some(includes));
    });
    rows.sort(sort === "name" ? compareNames : (left, right) => {
      const dates = left.postedAt < right.postedAt ? -1 : left.postedAt > right.postedAt ? 1 : 0;
      return (sort === "oldest" ? dates : -dates) || compareNames(left, right);
    });
    return respond({ mods: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize });
  }
  if (path === "/api/dump") {
    const rows = snapshot.groups.filter((group) => !query ||
      [group.name, ...group.files.map((file) => file.filename)].some(includes));
    if (sort === "name") rows.sort(compareNames);
    else if (sort === "oldest") rows.reverse();
    return respond({ groups: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize });
  }
  return null;
}
