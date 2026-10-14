import { snapshotResponse } from "../_lib/catalog-snapshot.js";

// Only the public catalog reads are cached. Import/state and downloads bypass this.
export async function onRequest(context) {
  const { request } = context;
  const path = new URL(request.url).pathname;
  if (request.method !== "GET" || !/^\/api\/(?:mods(?:\/[^/]+)?|dump)\/?$/.test(path)) return context.next();

  const cache = globalThis.caches?.default;
  const key = new Request(request.url);
  if (cache) {
    try {
      const cached = await cache.match(key);
      if (cached) return cached;
    } catch (error) { console.warn("Catalog cache read failed", error); }
  }

  const response = await context.next();
  const result = response.status >= 500 ? snapshotResponse(request) || response : response;
  if (result.status !== 200) return result;
  const headers = new Headers(result.headers);
  headers.set("cache-control", "public, max-age=300");
  const output = new Response(result.body, { status: result.status, headers });
  if (cache) {
    const save = cache.put(key, output.clone()).catch((error) => console.warn("Catalog cache write failed", error));
    if (context.waitUntil) context.waitUntil(save);
    else await save;
  }
  return output;
}
