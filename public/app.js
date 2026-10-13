const demoMods = [
  {
    slug: "revolver-sound-demo",
    name: "Revolver sound replacement with FAMAS shooting sfx",
    postedBy: "seu",
    postedAt: "2026-10-08T15:12:00.000Z",
    fileCount: 2,
    threadFileCount: 1,
    initialPost: {
      postedBy: "seu",
      postedAt: "2026-10-08T15:12:00.000Z",
      content: "Revolver sound replacement with FAMAS shooting sfx",
      sourceUrl: "",
      files: [demoFile("revolverSound.pak", 69632)],
    },
    threadPosts: [{
      postedBy: "seu",
      postedAt: "2026-10-08T15:13:00.000Z",
      content: "v2 of the original mod",
      sourceUrl: "",
      files: [demoFile("revolverSoundV2.pak", 69632)],
    }],
  },
  {
    slug: "shield-c4-count-demo",
    name: "Mod that displays shield and c4 count",
    postedBy: "broccoli2",
    postedAt: "2026-10-08T15:20:00.000Z",
    fileCount: 2,
    threadFileCount: 2,
    initialPost: {
      postedBy: "broccoli2",
      postedAt: "2026-10-08T15:20:00.000Z",
      content: "Displays your teammates’ shield and C4 counts. Counter position, scale, color, and opacity can be customized.",
      sourceUrl: "",
      files: [],
    },
    threadPosts: [
      {
        postedBy: "seu",
        postedAt: "2026-10-08T15:22:00.000Z",
        content: "Initial pak upload",
        sourceUrl: "",
        files: [demoFile("shieldc4count.pak", 234441)],
      },
      {
        postedBy: "seu",
        postedAt: "2026-10-08T15:29:00.000Z",
        content: "Updated file with tighter spacing",
        sourceUrl: "",
        files: [demoFile("shieldc4countV2.pak", 239002)],
      },
    ],
  },
];

function demoFile(filename, sizeBytes) {
  return { filename, sizeBytes, downloadUrl: "" };
}

const catalogDemoMods = window.PakHubPreview?.mods || demoMods;

const previewMode = new URLSearchParams(window.location.search).get("demo");
const linkedModSlug = new URLSearchParams(window.location.search).get("mod");
const localPreview = window.location.protocol === "file:" ||
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const previewMotion = previewMode === "1" || (localPreview && previewMode !== "0");

const state = {
  demo: previewMode === "1" || (localPreview && previewMode !== "0"),
  query: "",
  sort: "newest",
  page: 1,
  total: 0,
  mods: [],
  selectedSlug: null,
  linkedModSlug: linkedModSlug ? linkedModSlug.slice(0, 100) : "",
  detail: null,
  detailStatus: "idle",
  loading: false,
  searchOpen: false,
  error: "",
  moreError: false,
  hasMore: false,
  catalogController: null,
  catalogRequest: 0,
  detailRequest: 0,
  detailController: null,
  autoPages: 0,
};

/* Hover must linger before it steals the preview, so a diagonal sweep toward
 * the detail panel crosses rows without triggering each one. Focus and click
 * stay instant. Auto-appended catalog pages are capped per result set; the
 * More button remains as the explicit fallback. */
const HOVER_PREVIEW_DELAY = 150;
const AUTO_PAGE_CAP = 3;

const elements = {
  archiveToolbar: document.getElementById("archive-toolbar"),
  searchForm: document.getElementById("search-form"),
  searchToggle: document.getElementById("search-toggle"),
  search: document.getElementById("search-field"),
  clearSearch: document.getElementById("clear-search"),
  detailPanel: document.getElementById("detail-panel"),
  detailPanelContent: document.getElementById("detail-panel-content"),
  resultCount: document.getElementById("result-count"),
  rows: document.getElementById("mod-rows"),
  archiveState: document.getElementById("archive-state"),
  loadMore: document.getElementById("load-more"),
  sentinel: document.getElementById("load-sentinel"),
  liveStatus: document.getElementById("live-status"),
};

const visitedSlugs = new Set();
try {
  (JSON.parse(localStorage.getItem("pakhub-seen") || "[]") || []).forEach((s) => visitedSlugs.add(String(s)));
} catch { /* offline private mode: skip persistence */ }
function markSeen(slug) {
  if (!slug || visitedSlugs.has(slug)) return;
  visitedSlugs.add(slug);
  try { localStorage.setItem("pakhub-seen", JSON.stringify([...visitedSlugs].slice(-200))); } catch { /* ignore */ }
}

function node(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function announce(message) {
  elements.liveStatus.textContent = message;
}

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatTimestamp(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : timestampFormatter.format(date);
}

function isoDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function normalizeMod(mod) {
  return {
    slug: String(mod.slug || ""),
    name: String(mod.name || "Untitled pak post"),
    summary: String(mod.summary || ""),
    postedBy: String(mod.postedBy || mod.posted_by || "Unknown"),
    postedAt: mod.postedAt || mod.posted_at || "",
    fileCount: Number(mod.fileCount ?? mod.file_count ?? 0),
    threadFileCount: Number(mod.threadFileCount ?? mod.thread_file_count ?? 0),
  };
}

function normalizePost(post) {
  return {
    postedBy: String(post.postedBy || "Unknown"),
    postedAt: post.postedAt || "",
    content: String(post.content || ""),
    sourceUrl: String(post.sourceUrl || ""),
    threadUrl: String(post.threadUrl || ""),
    files: (Array.isArray(post.files) ? post.files : []).map((file) => ({
      filename: String(file.filename || "pak-file.pak"),
      sizeBytes: Number(file.sizeBytes ?? 0),
      downloadUrl: String(file.downloadUrl || ""),
    })),
  };
}

function discordTag(value) {
  const username = String(value || "Unknown");
  return username === "Unknown" ? username : username.startsWith("@") ? username : `@${username}`;
}

function compareByDate(left, right) {
  const leftDate = new Date(left.postedAt || 0).getTime();
  const rightDate = new Date(right.postedAt || 0).getTime();
  return (Number.isFinite(leftDate) ? leftDate : 0) - (Number.isFinite(rightDate) ? rightDate : 0);
}


function cancelDetailRequest() {
  if (state.detailController) state.detailController.abort();
  state.detailController = null;
  state.detailRequest += 1;
}

function ensureSelection() {
  if (state.mods.some((mod) => mod.slug === state.selectedSlug)) return false;
  const previousSlug = state.selectedSlug;
  state.selectedSlug = state.mods[0]?.slug || null;
  state.detail = null;
  state.detailStatus = state.selectedSlug ? "loading" : "idle";
  if (previousSlug !== state.selectedSlug) cancelDetailRequest();
  return previousSlug !== state.selectedSlug;
}

function renderArchiveState() {
  const shouldShow = Boolean(state.error || state.mods.length === 0);
  elements.archiveState.hidden = !shouldShow;
  if (!shouldShow) {
    elements.archiveState.replaceChildren();
    return;
  }

  const content = node("div", "archive-state-content");
  if (state.loading && !state.error) {
    const skeleton = node("div", "loading-skeleton");
    skeleton.setAttribute("aria-label", "Loading");
    for (let index = 0; index < 3; index += 1) skeleton.append(node("span", "skeleton-row"));
    content.append(skeleton);
  } else {
    content.append(node("h2", "", state.error ? "Unavailable" : "Empty"));
    if (state.error) {
      const retry = node("button", "retry-button", "Retry");
      retry.type = "button";
      retry.addEventListener("click", () => loadCatalog());
      content.append(retry);
    }
  }
  elements.archiveState.replaceChildren(content);
}

function renderSortState() {
  document.querySelectorAll(".sort-button").forEach((button) => {
    const isActive = button.dataset.sort === state.sort ||
      (button.dataset.sort === "newest" && state.sort === "oldest");
    button.setAttribute("aria-pressed", String(isActive));
    if (button.dataset.sort === "newest") {
      const label = button.querySelector(".sort-label");
      const caret = button.querySelector(".sort-caret");
      const oldest = state.sort === "oldest";
      if (label) label.textContent = oldest ? "Oldest" : "Newest";
      if (caret) caret.dataset.direction = oldest ? "oldest" : "newest";
      button.setAttribute("aria-label", `Sort by ${oldest ? "oldest" : "newest"} post`);
    }
    const header = button.closest("th");
    if (header) header.setAttribute("aria-sort", isActive
      ? state.sort === "oldest" ? "ascending" : "descending"
      : "none");
  });
  updateSortIndicator(sortIndicatorPlaced);
  sortIndicatorPlaced = true;
}

/* Sliding active-tab bar: glide the indicator under the pressed sort button
 * (300ms ease-in-out, same motion contract as the reference). */
let sortIndicatorPlaced = false;
function updateSortIndicator(animate = true) {
  const bar = document.querySelector(".sort-indicator");
  const active = document.querySelector('.sort-button[aria-pressed="true"]');
  const group = document.querySelector(".sort-controls");
  if (!bar || !active || !group) return;
  window.PakHubMotion.moveIndicator(group, bar, active, animate);
}

function rowButton(mod, className, label) {
  const button = node("button", className);
  button.type = "button";
  button.dataset.action = "select-mod";
  button.dataset.slug = mod.slug;
  button.setAttribute("aria-current", String(state.selectedSlug === mod.slug));
  button.setAttribute("aria-label", label);
  return button;
}

function renderModRow(mod, index) {
  const selected = state.selectedSlug === mod.slug;
  const seen = visitedSlugs.has(mod.slug);
  const row = node("tr", `ledger-row${selected ? " is-selected" : ""}${seen && !selected ? " is-visited" : ""}`);
  row.style.setProperty("--entry-order", String(index % 12));
  const button = rowButton(mod, "mod-select", `Preview ${mod.name}`);
  let hoverTimer = 0;
  button.addEventListener("pointerenter", () => {
    window.clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(() => previewMod(mod.slug), HOVER_PREVIEW_DELAY);
  });
  button.addEventListener("pointerleave", () => window.clearTimeout(hoverTimer));
  button.addEventListener("focus", () => previewMod(mod.slug));
  button.append(node("span", "row-index", String(index + 1).padStart(2, "0")));
  const nameWrap = node("span", "mod-name-wrap");
  const name = node("span", "mod-name");
  name.append(node("span", "mod-name-face", mod.name));
  const duplicate = node("span", "mod-name-face", mod.name);
  duplicate.setAttribute("aria-hidden", "true");
  name.append(duplicate);
  nameWrap.append(name);
  const metadata = node("span", "mod-meta");
  metadata.append(node("span", "meta-poster", discordTag(mod.postedBy)));
  const date = formatTimestamp(mod.postedAt);
  if (date) {
    const time = node("time", "meta-date", date);
    time.dateTime = isoDateTime(mod.postedAt);
    metadata.append(time);
  }
  nameWrap.append(metadata);
  button.append(nameWrap);
  button.append(node("span", "file-count", `${mod.fileCount} ${mod.fileCount === 1 ? "file" : "files"}`));
  const cell = node("td", "column-name");
  cell.append(button);
  row.append(cell);
  return row;
}

function isSafeDownload(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com" &&
      /\.(?:pak|zip)$/i.test(url.pathname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function appendDownloadIcon(link) {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M5 20h14v-2H5v2zm7-18a1 1 0 0 0-1 1v8.17L8.41 8.6 7 10.01l5 5 5-5-1.41-1.41L13 11.17V3a1 1 0 0 0-1-1z");
  icon.append(path);
  link.prepend(icon);
}

function renderFiles(post) {
  const list = node("ul", "pak-list");
  for (const file of post.files) {
    const item = node("li", "pak-item");
    const label = node("span", "pak-file-copy");
    label.append(node("span", "pak-file-name", file.filename));
    const size = formatBytes(file.sizeBytes);
    if (size) label.append(node("span", "pak-file-size", size));
    item.append(label);

    if (state.demo || !isSafeDownload(file.downloadUrl)) {
      const unavailable = node("span", "pak-download-unavailable", "—");
      unavailable.setAttribute("aria-label", "Unavailable");
      item.append(unavailable);
    } else {
      const download = node("a", "pak-download", "Download");
      download.href = file.downloadUrl;
      download.target = "_blank";
      download.rel = "noopener noreferrer";
      download.setAttribute("aria-label", `Download ${file.filename}`);
      appendDownloadIcon(download);
      item.append(download);
    }
    list.append(item);
  }
  return list;
}

function renderTopicPost(post, modName) {
  const block = node("div", "source-post topic-post");
  const meta = node("p", "source-post-meta topic-meta");
  meta.append(node("span", "source-post-author", discordTag(post.postedBy)));
  const date = formatTimestamp(post.postedAt);
  if (date) {
    meta.append(document.createTextNode(" · "));
    const time = node("time", "source-post-time", date);
    time.dateTime = isoDateTime(post.postedAt);
    meta.append(time);
  }
  block.append(meta);
  const sameAsName = post.content.trim().toLowerCase() === String(modName || "").trim().toLowerCase();
  if (post.content && !sameAsName) block.append(node("p", "topic-content", post.content));
  if (post.files.length) block.append(renderFiles(post));

  if (post.sourceUrl && isAllowedHost(post.sourceUrl, "discord.com")) {
    const source = node("a", "post-source-link topic-source", "Open Discord post");
    source.href = post.sourceUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    block.append(source);
  }
  return block;
}

function renderPost(post, heading, className) {
  const article = node("article", `source-post ${className}`);
  const header = node("header", "source-post-header");
  header.append(node("h4", "source-post-title", heading));
  const meta = node("p", "source-post-meta");
  meta.append(node("span", "source-post-author", discordTag(post.postedBy)));
  const date = formatTimestamp(post.postedAt);
  if (date) {
    meta.append(document.createTextNode(" · "));
    const time = node("time", "source-post-time", date);
    time.dateTime = isoDateTime(post.postedAt);
    meta.append(time);
  }
  header.append(meta);
  article.append(header);
  if (post.content) article.append(node("p", "source-post-content", post.content));
  if (post.files.length) article.append(renderFiles(post));

  if (post.sourceUrl && isAllowedHost(post.sourceUrl, "discord.com")) {
    const source = node("a", "post-source-link", "Open Discord post");
    source.href = post.sourceUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    article.append(source);
  }
  return article;
}

function renderThreadList(posts) {
  const section = node("section", "thread-posts");
  section.append(node("h3", "thread-posts-heading", `Thread posts (${posts.length})`));
  const list = node("ul", "thread-list");
  posts.forEach((raw) => {
    const post = normalizePost(raw);
    const item = node("li", "thread-item");
    const meta = node("p", "thread-item-meta");
    meta.append(node("span", "thread-item-author", discordTag(post.postedBy)));
    const date = formatTimestamp(post.postedAt);
    if (date) {
      meta.append(document.createTextNode(" · "));
      const time = node("time", "thread-item-time", date);
      time.dateTime = isoDateTime(post.postedAt);
      meta.append(time);
    }
    if (post.files.length) {
      meta.append(document.createTextNode(" · "));
      meta.append(node("span", "thread-item-count",
        `${post.files.length} ${post.files.length === 1 ? "file" : "files"}`));
    }
    item.append(meta);
    if (post.content) item.append(node("p", "thread-item-content", post.content));
    if (post.files.length) item.append(renderFiles(post));
    if (post.sourceUrl && isAllowedHost(post.sourceUrl, "discord.com")) {
      const source = node("a", "post-source-link thread-item-source", "Open Discord post");
      source.href = post.sourceUrl;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      item.append(source);
    }
    list.append(item);
  });
  section.append(list);
  return section;
}

function isAllowedHost(value, host) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === host && !url.username && !url.password;
  } catch {
    return false;
  }
}

function renderDossierContent(mod, className = "mod-dossier") {
  const dossier = node("article", className);
  dossier.setAttribute("aria-label", `${mod.name} pak post details`);
  if (state.detailStatus === "ready") dossier.classList.add("dossier-ready");

  if (state.detailStatus === "loading") {
    const skeleton = node("div", "loading-skeleton");
    skeleton.setAttribute("aria-label", "Loading");
    for (let index = 0; index < 2; index += 1) skeleton.append(node("span", "skeleton-row"));
    dossier.append(skeleton);
  } else if (state.detailStatus === "error") {
    const error = node("div", "dossier-error");
    error.append(node("p", "", "Unavailable"));
    const retry = node("button", "retry-button", "Retry");
    retry.type = "button";
    retry.dataset.action = "retry-detail";
    retry.dataset.slug = mod.slug;
    error.append(retry);
    dossier.append(error);
  } else {
    const detail = state.detail || { initialPost: {}, threadPosts: [] };
    const initialPost = normalizePost(detail.initialPost || {});
    dossier.append(renderTopicPost(initialPost, mod.name));

    if (detail.threadPosts?.length) {
      dossier.append(renderThreadList(detail.threadPosts));
    }
  }
  return dossier;
}

function renderSelectionState() {
  elements.rows.querySelectorAll(".ledger-row").forEach((row) => {
    const button = row.querySelector(".mod-select");
    const selected = button?.dataset.slug === state.selectedSlug;
    row.classList.toggle("is-selected", selected);
    row.classList.toggle("is-visited", Boolean(button && visitedSlugs.has(button.dataset.slug) && !selected));
    button?.setAttribute("aria-current", String(selected));
  });
}

function renderPreviewPanel() {
  const mod = state.mods.find((item) => item.slug === state.selectedSlug);
  window.PakHubMotion.select(mod?.slug || null);
  elements.detailPanel.setAttribute("aria-busy", String(Boolean(mod && state.detailStatus === "loading")));
  elements.detailPanelContent.inert = Boolean(mod && state.detailStatus === "loading");
  if (mod && state.detailStatus === "loading" && elements.detailPanelContent.lastElementChild) return;
  const dossier = mod
    ? renderDossierContent(mod, "mod-dossier preview-dossier-content")
    : node("article", "mod-dossier preview-dossier-content");

  if (mod) {
    dossier.prepend(node("h3", "preview-dossier-title", mod.name));
    if (state.error) {
      const notice = node("div", "preview-error");
      notice.append(node("p", "", "Catalog refresh failed. Showing the current results."));
      const retry = node("button", "retry-button", "Retry catalog");
      retry.type = "button";
      retry.dataset.action = "retry-catalog";
      notice.append(retry);
      dossier.prepend(notice);
    }
  } else if (state.loading && !state.error) {
    const skeleton = node("div", "loading-skeleton");
    skeleton.setAttribute("aria-label", "Loading");
    for (let index = 0; index < 3; index += 1) skeleton.append(node("span", "skeleton-row"));
    dossier.append(skeleton);
  } else if (state.error) {
    dossier.append(node("p", "preview-empty-detail", "The archive could not be loaded."));
    const retry = node("button", "retry-button", "Retry catalog");
    retry.type = "button";
    retry.dataset.action = "retry-catalog";
    dossier.append(retry);
  } else if (!state.mods.length) {
    dossier.append(node("p", "preview-empty-detail", "No pak posts match this search."));
  }

  window.PakHubMotion.swapPreview(elements.detailPanelContent, dossier, state.selectedSlug || "empty");
}

function renderCatalog() {
  const focusedButton = document.activeElement?.matches(".mod-select")
    ? document.activeElement : null;
  const focusedSlug = focusedButton?.dataset.slug;
  renderSortState();
  const count = state.loading && state.mods.length === 0
    ? "Loading" : `${state.mods.length} / ${state.total || state.mods.length}`;
  elements.resultCount.textContent = count;
  elements.resultCount.setAttribute("aria-label", state.loading && state.mods.length === 0
    ? "Loading results" : `${state.mods.length} of ${state.total || state.mods.length} results`);
  elements.clearSearch.hidden = !state.query;
  elements.search.value = state.query;
  elements.loadMore.hidden = !state.hasMore;
  elements.loadMore.textContent = state.moreError ? "Retry" : "More";
  if (elements.sentinel) {
    elements.sentinel.hidden = !state.hasMore || Boolean(state.error) ||
      state.moreError || state.autoPages >= AUTO_PAGE_CAP;
  }
  const fragment = document.createDocumentFragment();
  state.mods.forEach((mod, index) => {
    const modRow = renderModRow(mod, index);
    fragment.append(modRow);
  });
  elements.rows.replaceChildren(fragment);
  renderPreviewPanel();
  renderArchiveState();
  if (focusedSlug) {
    const buttons = elements.rows.querySelectorAll(".mod-select");
    Array.from(buttons).find((button) => button.dataset.slug === focusedSlug)?.focus({ preventScroll: true });
  }
}

async function loadDetails(slug) {
  const mod = state.mods.find((item) => item.slug === slug);
  if (!mod) return;
  if (state.detailController) state.detailController.abort();
  state.detailController = null;
  const request = ++state.detailRequest;
  state.detail = null;
  state.detailStatus = "loading";
  renderSelectionState();
  renderPreviewPanel();

  if (state.demo) {
    const demo = catalogDemoMods.find((item) => item.slug === slug);
    state.detail = demo ? {
      initialPost: demo.initialPost,
      threadPosts: demo.threadPosts,
    } : { initialPost: {}, threadPosts: [] };
    state.detailStatus = "ready";
    renderPreviewPanel();
    return;
  }

  const controller = new AbortController();
  state.detailController = controller;
  try {
    const response = await fetch(`/api/mods/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not load this pak post.");
    if (request !== state.detailRequest || state.selectedSlug !== slug) return;
    state.detail = {
      initialPost: normalizePost(payload.initialPost || {}),
      threadPosts: (payload.threadPosts || []).map(normalizePost),
    };
    state.detailStatus = "ready";
    state.detailController = null;
    renderPreviewPanel();
  } catch (error) {
    if (error.name === "AbortError" || request !== state.detailRequest || state.selectedSlug !== slug) return;
    state.detailController = null;
    state.detailStatus = "error";
    renderPreviewPanel();
  }
}

function previewMod(slug, { scroll = false } = {}) {
  const mod = state.mods.find((item) => item.slug === slug);
  if (!mod) return;
  if (state.selectedSlug === slug && state.detailStatus !== "error") {
    if (scroll) elements.detailPanel.scrollIntoView({ behavior: window.PakHubMotion.motionEnabled() ? "smooth" : "auto", block: "nearest" });
    return;
  }
  const modName = state.mods.find((mod) => mod.slug === slug)?.name || "Pak post";
  state.selectedSlug = slug;
  state.detail = null;
  state.detailStatus = "loading";
  markSeen(slug);
  renderSelectionState();
  loadDetails(slug);
  if (scroll) elements.detailPanel.scrollIntoView({ behavior: window.PakHubMotion.motionEnabled() ? "smooth" : "auto", block: "nearest" });
  announce(`${modName} preview selected.`);
}

let loadObserver = null;
function observeLoadSentinel() {
  if (!elements.sentinel || typeof IntersectionObserver === "undefined") return;
  if (loadObserver) return;
  loadObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    if (state.demo || state.loading || state.error || state.moreError || !state.hasMore) return;
    if (state.autoPages >= AUTO_PAGE_CAP) return;
    state.autoPages += 1;
    loadCatalog({ append: true, auto: true });
  }, { rootMargin: "600px 0px" });
  loadObserver.observe(elements.sentinel);
}

async function loadCatalog({ append = false, auto = false } = {}) {
  if (!append) state.autoPages = 0;
  if (state.demo) {
    const query = state.query.toLocaleLowerCase();
    let mods = catalogDemoMods.filter((mod) => !query ||
      [mod.name, mod.postedBy, mod.initialPost.content, ...mod.initialPost.files.map((file) => file.filename),
        ...mod.threadPosts.flatMap((post) => [post.content, ...post.files.map((file) => file.filename)])]
        .some((value) => value.toLocaleLowerCase().includes(query))).map(normalizeMod);
    if (state.sort === "name") mods.sort((a, b) => a.name.localeCompare(b.name));
    else if (state.sort === "oldest") mods.sort(compareByDate);
    else mods.sort((a, b) => compareByDate(b, a));

    state.mods = mods;
    state.total = mods.length;
    state.page = 1;
    state.hasMore = false;
    state.loading = false;
    state.error = "";
    state.moreError = false;
    const selectionChanged = ensureSelection();
    renderCatalog();
    if (selectionChanged && state.selectedSlug) loadDetails(state.selectedSlug);
    window.PakHubMotion?.catalogReady();
    return;
  }

  if (state.catalogController) state.catalogController.abort();
  state.catalogController = new AbortController();
  const request = ++state.catalogRequest;
  const page = append ? state.page + 1 : 1;
  state.loading = true;
  state.error = "";
  if (!append) state.moreError = false;
  renderCatalog();

  const params = new URLSearchParams({ sort: state.sort, page: String(page) });
  if (state.query) params.set("q", state.query);
  if (!append && !state.query && state.linkedModSlug) params.set("slug", state.linkedModSlug);

  try {
    const response = await fetch(`/api/mods?${params}`, {
      headers: { Accept: "application/json" },
      signal: state.catalogController.signal,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "The catalog could not be loaded.");
    if (request !== state.catalogRequest) return;
    const newMods = (payload.mods || []).map(normalizeMod);
    state.mods = append ? [...state.mods, ...newMods] : newMods;
    state.total = Number(payload.total || 0);
    state.page = Number(payload.page || page);
    state.hasMore = state.page * Number(payload.pageSize || 48) < state.total;
    state.loading = false;
    state.error = "";
    state.moreError = false;
    state.linkedModSlug = "";
    const selectionChanged = ensureSelection();
    renderCatalog();
    if (!append) window.PakHubMotion?.catalogReady();
    if (append && auto) announce(`${newMods.length} more pak posts loaded.`);
    if (selectionChanged && state.selectedSlug) loadDetails(state.selectedSlug);
  } catch (error) {
    if (error.name === "AbortError" || request !== state.catalogRequest) return;
    state.loading = false;
    if (append) state.moreError = true;
    else state.error = error.message || "The catalog could not be loaded. Try again shortly.";
    renderCatalog();
    if (!append) window.PakHubMotion?.catalogReady();
  }
}

function updateSort(sort) {
  state.sort = sort === "newest" ? state.sort === "newest" ? "oldest" : "newest" : sort;
  state.page = 1;
  loadCatalog();
}

let searchTimer = 0;
function setSearchOpen(open) {
  state.searchOpen = open;
  elements.archiveToolbar.classList.toggle("search-open", open);
  elements.searchToggle.setAttribute("aria-expanded", String(open));
  elements.searchToggle.setAttribute("aria-label", open ? "Close search" : "Open search");
  elements.searchForm.setAttribute("aria-hidden", String(!open));
  elements.search.tabIndex = open ? 0 : -1;
  elements.clearSearch.tabIndex = open ? 0 : -1;
  if (open) window.requestAnimationFrame(() => elements.search.focus());
}

function closeSearch() {
  setSearchOpen(false);
  window.clearTimeout(searchTimer);
  if (state.query) {
    state.query = "";
    elements.search.value = "";
    elements.clearSearch.hidden = true;
    state.page = 1;
    loadCatalog();
  }
  elements.searchToggle.focus();
}

elements.searchToggle.addEventListener("click", () => {
  if (state.searchOpen) closeSearch();
  else setSearchOpen(true);
});

elements.searchForm.addEventListener("submit", (event) => event.preventDefault());
elements.search.addEventListener("input", () => {
  state.query = elements.search.value.trim();
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.page = 1;
    loadCatalog();
  }, 180);
  elements.clearSearch.hidden = !state.query;
});

elements.clearSearch.addEventListener("click", () => {
  window.clearTimeout(searchTimer);
  state.query = "";
  elements.search.value = "";
  elements.clearSearch.hidden = true;
  state.page = 1;
  loadCatalog();
  elements.search.focus();
});

elements.search.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  closeSearch();
});

document.querySelectorAll(".sort-button").forEach((button) => {
  button.addEventListener("click", () => updateSort(button.dataset.sort));
});

elements.detailPanel.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action]");
  if (!target) return;
  if (target.dataset.action === "retry-detail") loadDetails(target.dataset.slug);
  else if (target.dataset.action === "retry-catalog") loadCatalog();
});

elements.rows.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action]");
  if (!target) return;
  if (target.dataset.action === "select-mod") {
    previewMod(target.dataset.slug, { scroll: window.matchMedia("(max-width: 700px)").matches });
  }
  else if (target.dataset.action === "retry-detail") loadDetails(target.dataset.slug);
});

elements.loadMore.addEventListener("click", () => loadCatalog({ append: true }));
window.addEventListener("resize", () => {
  updateSortIndicator(false);
});
observeLoadSentinel();
loadCatalog();
