import { compactName } from "../../public/search.js";

function compactSql(column) {
  let value = `lower(COALESCE(${column}, ''))`;
  for (const separator of ["' '", "'_'", "'-'", "char(9)", "char(10)", "char(13)"]) value = `replace(${value}, ${separator}, '')`;
  return value;
}

// JSON binds the entire term list once, staying below D1's parameter limit.
export function searchCondition(search, fields) {
  return {
    sql: `NOT EXISTS (SELECT 1 FROM json_each(?) AS search_term WHERE NOT (${fields((column, naming = false) =>
      `instr(${naming ? `CASE WHEN json_extract(search_term.value, '$.exact') THEN lower(COALESCE(${column}, '')) ELSE ${compactSql(column)} END` : `lower(COALESCE(${column}, ''))`}, ${naming ? `json_extract(search_term.value, '$.text')` : `json_extract(search_term.value, '$.literal')`}) > 0`,
    )}))`,
    values: [JSON.stringify(search.terms)],
  };
}

export function searchOrder(search, title, filenames) {
  const titleMatch = searchCondition(search, (match) => match(title, true));
  const fileMatch = searchCondition(search, filenames);
  return {
    sql: `CASE WHEN lower(${title}) = ? THEN 0 WHEN instr(lower(${title}), ?) > 0 THEN 1
      WHEN instr(${compactSql(title)}, ?) > 0 THEN 2 WHEN ${titleMatch.sql} THEN 3
      WHEN ${fileMatch.sql} THEN 4 ELSE 5 END`,
    values: [search.raw, search.raw, compactName(search.raw), ...titleMatch.values, ...fileMatch.values],
  };
}
