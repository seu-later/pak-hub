function cleanText(value) {
  return String(value || "")
    .replace(/<@!?\d+>/g, "")
    .replace(/@everyone|@here/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[`*_~]/g, "")
    .trim();
}

function readField(content, names) {
  const pattern = new RegExp(`^\\s*(?:${names.join("|")})\\s*:\\s*(.+)$`, "im");
  return cleanText(content.match(pattern)?.[1] || "");
}

function titleFrom(content) {
  const fieldLine = /^\s*(?:creator|author|category|summary|description|version|ver|channel)\s*:/i;
  const line = String(content || "").split(/\r?\n/).map(cleanText).find((value) => value && !fieldLine.test(value));
  return (line || "").replace(/^#+\s*/, "").slice(0, 100).trim();
}

export function slugify(name, rootId) {
  const base = cleanText(name).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "pak-mod";
  return `${base}-${BigInt(rootId).toString(36)}`;
}

export function parseReleaseMetadata(message, rootMessage, threadName = "") {
  const rootContent = rootMessage?.content || "";
  const name = titleFrom(rootContent) || cleanText(threadName).slice(0, 100) ||
    cleanText(rootMessage?.embeds?.[0]?.title) ||
    String(rootMessage?.attachments?.first()?.name || "pak-mod.pak").replace(/\.pak$/i, "").slice(0, 100);
  const postContent = String(message.content || "").trim();
  const labeledVersion = postContent.match(/^\s*(?:version|ver)\s*:\s*(.+)$/im)?.[1];
  const prefixedVersion = postContent.match(/(?:^|[\s([{])((?:v|V)\d+(?:[._+-][\w]+)*)\b/)?.[1];
  const channelInput = readField(postContent, ["channel"]).toLowerCase();
  const channel = ["stable", "beta", "untested"].includes(channelInput) ? channelInput : "unknown";

  return {
    name: name || "Pak mod",
    summary: readField(rootContent, ["summary", "description"]).slice(0, 500),
    category: readField(rootContent, ["category"]).slice(0, 40) || "Other",
    creator: readField(rootContent, ["creator", "author"]).slice(0, 80) || "Unknown",
    version: cleanText(labeledVersion || prefixedVersion) || "Unversioned",
    channel,
    changelog: cleanText(postContent).slice(0, 1500),
  };
}

export function pakAttachments(message) {
  return [...message.attachments.values()].filter((attachment) =>
    typeof attachment.name === "string" && attachment.name.toLowerCase().endsWith(".pak"));
}

export function uniqueAssetName(filename, index, digest, existingNames) {
  const dot = filename.toLowerCase().lastIndexOf(".pak");
  const stem = (dot >= 0 ? filename.slice(0, dot) : filename).normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "pak-file";
  const suffix = index > 0 ? `-${index + 1}` : "";
  let candidate = `${stem}${suffix}.pak`;
  if (existingNames.has(candidate)) candidate = `${stem}${suffix}-${digest.slice(0, 10)}.pak`;
  return candidate;
}

export function selectReleaseAsset(filename, index, digest, existingAssets) {
  const existingNames = new Set(existingAssets.map((asset) => asset.name));
  const preferredName = uniqueAssetName(filename, index, digest, new Set());
  let asset = existingAssets.find((item) => item.name === preferredName &&
    String(item.digest || "").replace(/^sha256:/i, "").toLowerCase() === digest);
  if (asset) return { uploadName: preferredName, asset };

  const uploadName = existingNames.has(preferredName)
    ? uniqueAssetName(filename, index, digest, existingNames)
    : preferredName;
  asset = existingAssets.find((item) => item.name === uploadName);
  if (asset && String(asset.digest || "").replace(/^sha256:/i, "").toLowerCase() !== digest) {
    throw new Error(`GitHub already has a different file named ${uploadName}; resolve that release manually.`);
  }
  return { uploadName, asset: asset || null };
}
