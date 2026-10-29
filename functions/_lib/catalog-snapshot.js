import snapshot from "../_data/catalog-snapshot.js";
import { json } from "./http.js";
import { parseSearch, matchesSearch, searchRank } from "../../public/search.js";

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
  const search = parseSearch(query);
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
      return matchesSearch(search, [mod.name, mod.summary, mod.postedBy,
        ...[detail.initialPost, ...detail.threadPosts].flatMap((post) =>
          [post.content, post.postedBy, ...post.files.map((file) => file.filename)])],
        [mod.name, ...[detail.initialPost, ...detail.threadPosts].flatMap((post) => post.files.map((file) => file.filename))]);
    });
    rows.sort((left, right) => {
      if (query && (!sort || sort === "newest")) {
        const rank = (mod) => searchRank(search, mod.name,
          [snapshot.details[mod.slug].initialPost, ...snapshot.details[mod.slug].threadPosts].flatMap((post) => post.files.map((file) => file.filename)));
        const difference = rank(left) - rank(right);
        if (difference) return difference;
      }
      const names = compareNames(left, right);
      const slugs = left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0;
      if (sort === "name") return names || slugs;
      if (sort === "name-desc") return -names || slugs;
      if (sort === "most-files") return right.fileCount - left.fileCount || names || slugs;
      if (sort === "fewest-files") return left.fileCount - right.fileCount || names || slugs;
      const dates = left.postedAt < right.postedAt ? -1 : left.postedAt > right.postedAt ? 1 : 0;
      return (sort === "oldest" ? dates : -dates) || names || slugs;
    });
    return respond({ mods: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize });
  }
  if (path === "/api/dump") {
    const rows = snapshot.groups.filter((group) => !query ||
      matchesSearch(search, [group.name, group.description, ...group.files.flatMap((file) => [file.filename, file.postedBy])],
        [group.name, ...group.files.map((file) => file.filename)]));
    if (sort === "name") rows.sort(compareNames);
    else if (sort === "name-desc") rows.sort((left, right) => compareNames(right, left));
    else if (sort === "most-files") rows.sort((left, right) => right.fileCount - left.fileCount || compareNames(left, right));
    else if (sort === "fewest-files") rows.sort((left, right) => left.fileCount - right.fileCount || compareNames(left, right));
    else if (sort === "oldest") rows.reverse();
    if (query && (!sort || sort === "newest")) rows.sort((a, b) =>
      searchRank(search, a.name, a.files.map((file) => file.filename)) - searchRank(search, b.name, b.files.map((file) => file.filename)));
    return respond({ groups: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize });
  }
  return null;
}
