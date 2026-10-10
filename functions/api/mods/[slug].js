import { json, unavailable } from "../../_lib/http.js";

export async function onRequestGet({ env, params }) {
  if (!env.DB) return unavailable();
  const slug = String(params.slug || "").slice(0, 100);

  try {
    const mod = await env.DB.prepare(`
      SELECT id, slug, name, summary, uploader_name, root_message_id,
        root_posted_at, root_message_url, root_post_content
      FROM mods WHERE slug = ?
    `).bind(slug).first();

    if (!mod) return json({ error: "That pak post is not in the catalog." }, 404);

    const { results: postRows } = await env.DB.prepare(`
      SELECT id, source_message_id, posted_by, post_content, published_at,
        source_message_url, source_thread_url
      FROM releases
      WHERE mod_id = ?
      ORDER BY published_at ASC, id ASC
    `).bind(mod.id).all();

    const posts = postRows || [];
    const ids = posts.map((post) => post.id);
    let filesByPost = new Map();

    if (ids.length) {
      const placeholders = ids.map(() => "?").join(",");
      const { results: files } = await env.DB.prepare(`
        SELECT release_id, original_filename, size_bytes, download_url
        FROM pak_files WHERE release_id IN (${placeholders})
        ORDER BY original_filename COLLATE NOCASE
      `).bind(...ids).all();
      filesByPost = new Map(ids.map((id) => [id, []]));
      for (const file of files || []) {
        filesByPost.get(file.release_id)?.push({
          filename: file.original_filename,
          sizeBytes: Number(file.size_bytes || 0),
          downloadUrl: file.download_url,
        });
      }
    }

    const toPost = (post) => ({
      postedBy: post.posted_by || "Unknown",
      postedAt: post.published_at || "",
      content: post.post_content || "",
      sourceUrl: post.source_message_url || "",
      threadUrl: post.source_thread_url || "",
      files: filesByPost.get(post.id) || [],
    });
    const rootPost = posts.find((post) => post.source_message_id === mod.root_message_id);
    const initialPost = rootPost ? toPost(rootPost) : {
      postedBy: mod.uploader_name || "Unknown",
      postedAt: mod.root_posted_at || "",
      content: mod.root_post_content || "",
      sourceUrl: mod.root_message_url || "",
      threadUrl: "",
      files: [],
    };

    return json({
      mod: {
        slug: mod.slug,
        name: mod.name,
        summary: mod.summary,
        postedBy: mod.uploader_name || "Unknown",
        postedAt: mod.root_posted_at || "",
        sourceUrl: mod.root_message_url || "",
      },
      initialPost,
      threadPosts: posts
        .filter((post) => post.source_message_id !== mod.root_message_id)
        .map(toPost),
    });
  } catch (error) {
    console.error("Pak Hub mod query failed", error);
    return json({ error: "This pak post could not be loaded." }, 503);
  }
}
