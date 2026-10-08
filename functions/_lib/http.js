export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200 ? "public, max-age=30" : "no-store",
      ...headers,
    },
  });
}

export function unavailable() {
  return json({ error: "The catalog database is not connected yet." }, 503);
}

export function equalSecret(actual, expected) {
  const encoder = new TextEncoder();
  const left = encoder.encode(actual || "");
  const right = encoder.encode(expected || "");
  if (!left.length || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}
