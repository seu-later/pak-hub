const SERIES_MIN_SIBLINGS = 3;

function trimSeparators(value) {
  return value.replace(/^[-_. ]+|[-_. ]+$/g, "");
}

function parseVersionToken(stem) {
  let match = stem.match(/[-_ ]?((?:beta|alpha|rc)[-_. ]?\d*[a-z]?)$/i);
  if (match) {
    const version = match[1].replace(/[-_. ]+/g, "-").replace(/^([a-z]+)(\d+)$/i, "$1-$2");
    return { version, prerelease: 1, cut: match.index };
  }

  match = stem.match(/[-_ ]+[vV](\d[\d.]*)$/) || stem.match(/([A-Za-z])[vV](\d[\d.]*)$/);
  if (match) {
    const version = match[match.length - 1];
    const cut = match.index + (match.length === 3 ? 1 : 0);
    return { version, prerelease: 0, cut };
  }

  match = stem.match(/[-_ ]v?(\d+(?:[._]\d+)+)$/i);
  if (match) return { version: match[1], prerelease: 0, cut: match.index };

  match = stem.match(/(\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{2})$/);
  if (match) return { version: match[1], prerelease: 0, cut: match.index };

  match = stem.match(/[-_ ](\d+(?:\.\d+)*)$/) || stem.match(/([A-Za-z_])(\d+(?:\.\d+)*)$/);
  if (match) {
    const version = match[match.length - 1];
    const cut = match.index + (match[0].startsWith(version) ? 0 : 1);
    return { version, prerelease: 0, cut, bare: true };
  }

  return null;
}

function parseExplicit(name) {
  const stem = name.replace(/\s*\(\d+\)$/, "").replace(/_patch$/i, "");
  if (/_P$/i.test(stem)) {
    const inner = trimSeparators(stem.replace(/_P$/i, ""));
    const probe = parseVersionToken(inner);
    if (probe && !probe.bare) {
      return { base: trimSeparators(inner.slice(0, probe.cut)), version: probe.version, prerelease: probe.prerelease };
    }
  }
  const found = parseVersionToken(stem);
  if (found && !found.bare) {
    return { base: trimSeparators(stem.slice(0, found.cut)), version: found.version, prerelease: found.prerelease };
  }
  if (found) {
    return { base: trimSeparators(stem.slice(0, found.cut)), version: found.version, prerelease: 0, bare: true };
  }
  return { base: stem, version: "", prerelease: 0 };
}

/* Resolve bare trailing numbers only when sibling evidence already identifies
 * a version family. This matches the loose-folder dump importer. */
export function groupDumpFiles(names) {
  const parsed = new Map();
  for (const name of names) {
    const explicit = parseExplicit(name);
    if (!explicit.bare) {
      parsed.set(name, { base: explicit.base, version: explicit.version, prerelease: explicit.prerelease });
    } else {
      parsed.set(name, { base: name, version: "", prerelease: 0, candidate: explicit });
    }
  }

  const baseKeys = new Set();
  for (const { base } of parsed.values()) baseKeys.add(base.toLowerCase());

  const series = new Map();
  for (const entry of parsed.values()) {
    if (!entry.candidate?.version) continue;
    const prefix = entry.candidate.base.toLowerCase();
    series.set(prefix, (series.get(prefix) || 0) + 1);
  }

  for (const [name, entry] of parsed) {
    if (!entry.candidate?.version) continue;
    const base = entry.candidate.base;
    const siblings = series.get(base.toLowerCase()) || 0;
    if (baseKeys.has(base.toLowerCase()) || siblings >= SERIES_MIN_SIBLINGS) {
      parsed.set(name, { base, version: entry.candidate.version, prerelease: 0 });
      baseKeys.add(base.toLowerCase());
    }
  }

  return parsed;
}
