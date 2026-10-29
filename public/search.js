// Keep naming separators flexible; punctuation such as version dots stays literal.
export function compactName(value) {
  return String(value || "").toLowerCase().replace(/[\s_-]+/g, "");
}

export function parseSearch(value) {
  const raw = String(value || "").trim().slice(0, 100);
  const terms = [];
  for (const part of raw.matchAll(/"([^"]*)"|"([^"]*)$|(\S+)/g)) {
    if (part[3] === undefined) {
      const text = (part[1] ?? part[2]).toLowerCase();
      if (text) terms.push({ text, literal: text, exact: true });
    } else {
      const literal = part[3].toLowerCase();
      terms.push({ text: compactName(literal) || literal, literal, exact: !compactName(literal) });
    }
  }
  return { raw: raw.replace(/"/g, "").toLowerCase(), terms };
}

export function matchesSearch(search, fields, names = []) {
  return search.terms.every((term) => fields.some((field) => String(field || "").toLowerCase().includes(term.literal)) ||
    names.some((field) => (term.exact ? String(field || "").toLowerCase() : compactName(field)).includes(term.text)));
}

export function searchRank(search, name, filenames = []) {
  if (!search.terms.length) return 0;
  const title = String(name || "").toLowerCase();
  if (title === search.raw) return 0;
  if (title.includes(search.raw)) return 1;
  if (compactName(search.raw) && compactName(title).includes(compactName(search.raw))) return 2;
  if (matchesSearch(search, [], [name])) return 3;
  if (matchesSearch(search, [], filenames)) return 4;
  return 5;
}
