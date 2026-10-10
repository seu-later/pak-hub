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

const previewMode = new URLSearchParams(window.location.search).get("demo");
const localPreview = window.location.protocol === "file:" ||
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const state = {
  demo: previewMode === "1" || (localPreview && previewMode !== "0"),
  view: "browse",
  query: "",
  sort: "newest",
  page: 1,
  total: 0,
  mods: [],
  selectedSlug: null,
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
  wheelRemainder: 0,
  collapseTimer: 0,
  leavingSlug: null,
};

const elements = {
  stage: document.querySelector(".catalog-stage"),
  header: document.querySelector(".site-header"),
  heroTitle: document.querySelector(".hero-title"),
  heroStatus: document.getElementById("hero-status"),
  signalText: document.getElementById("signal-text"),
  rain: document.getElementById("signal-rain"),
  worldImg: document.getElementById("world-img"),
  cursor: document.getElementById("cursor"),
  cursorLabel: document.getElementById("cursor-label"),
  progressBar: document.getElementById("scroll-progress-bar"),
  tickerTrack: document.getElementById("ticker-track"),
  archiveToolbar: document.getElementById("archive-toolbar"),
  searchForm: document.getElementById("search-form"),
  searchToggle: document.getElementById("search-toggle"),
  search: document.getElementById("search-field"),
  clearSearch: document.getElementById("clear-search"),
  browseView: document.getElementById("browse-view"),
  browseTitles: document.getElementById("browse-titles"),
  browseDossier: document.getElementById("browse-dossier"),
  listView: document.getElementById("list-view"),
  resultCount: document.getElementById("result-count"),
  browseViewButton: document.getElementById("browse-view-button"),
  listViewButton: document.getElementById("list-view-button"),
  rows: document.getElementById("mod-rows"),
  archiveState: document.getElementById("archive-state"),
  loadMore: document.getElementById("load-more"),
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

function compareByDate(left, right) {
  const leftDate = new Date(left.postedAt || 0).getTime();
  const rightDate = new Date(right.postedAt || 0).getTime();
  return (Number.isFinite(leftDate) ? leftDate : 0) - (Number.isFinite(rightDate) ? rightDate : 0);
}

function updateHeroStatus() {
  if (!elements.heroStatus) return;
  if (state.loading && state.mods.length === 0) {
    elements.heroStatus.textContent = "TUNING SIGNAL_";
    return;
  }
  if (state.error) {
    elements.heroStatus.textContent = "SIGNAL INTERRUPTED — RETRY_";
    if (elements.signalText) elements.signalText.textContent = "SIGNAL DOWN";
    return;
  }
  if (elements.signalText) elements.signalText.textContent = "SIGNAL LIVE";
  const total = state.total || state.mods.length;
  const shown = state.mods.length;
  const scope = state.query ? ` // FILTER "${state.query.toUpperCase().slice(0, 24)}"` : "";
  elements.heroStatus.textContent = total
    ? `${shown}/${total} PAKS DECODED${scope}_`
    : `CHANNEL OPEN${scope}_`;
}

function initializeSignalRain() {
  const canvas = elements.rain;
  if (!canvas || !("getContext" in canvas)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.style.display = "none";
    return;
  }
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  const glyphs = "アイカサタナ0123456789ABCDEF<>+#*:.".split("");
  let columns = 0;
  let drops = [];
  let width = 0;
  let height = 0;
  let running = true;
  let last = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, Math.floor(rect.width * dpr));
    height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.width = width;
    canvas.height = height;
    const fontSize = 15 * dpr;
    ctx.font = `${fontSize}px ui-monospace, Menlo, Consolas, monospace`;
    columns = Math.floor(width / (fontSize * 0.72));
    drops = Array.from({ length: columns }, () => Math.random() * -40);
  }

  function frame(now) {
    if (!running) return;
    window.requestAnimationFrame(frame);
    if (now - last < 66) return;
    last = now;
    ctx.fillStyle = "rgba(4, 7, 5, 0.12)";
    ctx.fillRect(0, 0, width, height);
    const fontSize = 15 * Math.min(window.devicePixelRatio || 1, 1.5);
    for (let i = 0; i < drops.length; i += 1) {
      const ch = glyphs[(Math.random() * glyphs.length) | 0];
      const head = Math.random() < 0.06;
      ctx.fillStyle = head ? "rgba(232, 255, 238, 0.85)" : "rgba(51, 255, 119, 0.55)";
      ctx.fillText(ch, i * fontSize * 0.72, drops[i] * fontSize);
      if (drops[i] * fontSize > height && Math.random() > 0.976) drops[i] = 0;
      drops[i] += 1;
    }
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    const hidden = document.hidden;
    if (hidden) { running = false; return; }
    if (!running) { running = true; window.requestAnimationFrame(frame); }
  });
  if ("IntersectionObserver" in window && elements.header) {
    new IntersectionObserver((entries) => {
      const visible = entries[0]?.isIntersecting !== false;
      if (visible && !running) { running = true; window.requestAnimationFrame(frame); }
      else if (!visible) running = false;
    }, { threshold: 0 }).observe(elements.header);
  }
  window.requestAnimationFrame(frame);
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function initializeWorldImage() {
  const img = elements.worldImg;
  if (!img) return;
  const fallbacks = ["assets/city-rain.png", "assets/halcyon-hero.jpg"];
  img.addEventListener("error", function onError() {
    const next = fallbacks[fallbacks.indexOf(img.getAttribute("src")) + 1];
    if (next) img.src = next;
    else { img.style.display = "none"; img.removeEventListener("error", onError); }
  });
}

/* Shift-style masked char split for hero + section titles. */
function initializeSplitText() {
  const targets = document.querySelectorAll("[data-split]");
  if (!targets.length) return;
  targets.forEach((el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.replaceChildren();
    let i = 0;
    for (const ch of text) {
      const mask = document.createElement("span");
      mask.className = "split-mask";
      mask.setAttribute("aria-hidden", "true");
      const c = document.createElement("span");
      c.className = "split-char";
      c.style.setProperty("--i", String(i += 1));
      c.textContent = ch === " " ? " " : ch;
      mask.append(c);
      el.append(mask);
    }
  });
  if (reducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-inview"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-inview");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  targets.forEach((el) => observer.observe(el));
}

function initializeTicker() {
  const track = elements.tickerTrack;
  if (!track || reducedMotion) return;
  const chunk = track.querySelector(".ticker-chunk");
  if (!chunk) return;
  for (let n = 0; n < 3; n += 1) {
    const copy = chunk.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.append(copy);
  }
}

/* Shift-style cursor follower: OPEN on rows, VIEW on links, SEND on buttons. */
function initializeCursor() {
  const cursor = elements.cursor;
  if (!cursor || !finePointer || reducedMotion) return;
  cursor.classList.add("is-armed");
  let x = -100, y = -100, tx = x, ty = y, visible = false, hot = false, raf = 0;
  function loop() {
    raf = 0;
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    cursor.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${hot ? 1.35 : 1})`;
    if (Math.abs(tx - x) + Math.abs(ty - y) > 0.5 || visible) raf = window.requestAnimationFrame(loop);
  }
  function wake() { if (!raf) raf = window.requestAnimationFrame(loop); }
  document.addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!visible) { visible = true; cursor.classList.add("is-on"); }
    const row = e.target.closest?.(".mod-select");
    const link = e.target.closest?.("a, .pak-download");
    const btn = e.target.closest?.("button");
    hot = Boolean(row || link || btn);
    cursor.classList.toggle("is-hot", hot);
    if (elements.cursorLabel) {
      elements.cursorLabel.textContent = row
        ? (row.getAttribute("aria-expanded") === "true" ? "CLOSE" : "OPEN")
        : link ? "VIEW" : btn ? "PRESS" : "OPEN";
    }
    wake();
  }, { passive: true });
  document.addEventListener("pointerleave", () => {
    visible = false; cursor.classList.remove("is-on");
  });
}

/* Magnetic nudge on nav + download controls. */
function initializeMagnetic() {
  if (!finePointer || reducedMotion) return;
  document.querySelectorAll(".primary-nav a, .signal-status, .pak-download, .retry-button, .load-more").forEach((el) => {
    el.classList.add("magnetic");
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.setProperty("--mx", `${(dx * 0.12).toFixed(1)}px`);
      el.style.setProperty("--my", `${(dy * 0.18).toFixed(1)}px`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    });
  });
}

function initializeScrollFx() {
  if (reducedMotion) return;
  let ticking = false;
  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    document.documentElement.style.setProperty("--scroll", String(y));
    if (elements.progressBar) {
      elements.progressBar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1).toFixed(3) : 0})`;
    }
  }
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });
  update();
}

function updateStageHeight() {
  if (!elements.stage || window.matchMedia("(max-width: 900px)").matches) return;
  const width = elements.stage.clientWidth;
  const extraRows = Math.max(0, state.mods.length - 8);
  elements.stage.style.setProperty("--catalog-extra", `${extraRows * width * 0.029}px`);
}

function initializeScrollReveals() {
  const shell = document.querySelector(".archive-shell");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!shell || reducedMotion || !("IntersectionObserver" in window)) {
    shell?.classList.add("motion-visible");
    return;
  }
  shell.classList.add("motion-ready");
  const shellObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("motion-visible", entry.isIntersecting);
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -4% 0px" });
  shellObserver.observe(shell);

  rowObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("in-view", entry.isIntersecting);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -4% 0px" });

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      const shift = Math.min(window.scrollY * 0.12, 120);
      elements.heroTitle?.style.setProperty("--hero-shift", `${shift}px`);
      elements.header?.style.setProperty("--hero-fade", String(Math.max(0, 1 - window.scrollY / 700)));
    });
  }, { passive: true });
}

let rowObserver = null;

function observeRows() {
  const rows = elements.rows.querySelectorAll(".ledger-row, .detail-row");
  if (!rowObserver) {
    rows.forEach((row) => row.classList.add("in-view"));
    return;
  }
  rows.forEach((row) => rowObserver.observe(row));
}

function cancelDetailRequest() {
  if (state.detailController) state.detailController.abort();
  state.detailController = null;
  state.detailRequest += 1;
}

function ensureSelection() {
  if (state.mods.some((mod) => mod.slug === state.selectedSlug)) return false;
  const previousSlug = state.selectedSlug;
  state.selectedSlug = state.view === "browse" ? state.mods[0]?.slug || null : null;
  state.detail = null;
  state.detailStatus = state.selectedSlug ? "loading" : "idle";
  if (previousSlug !== state.selectedSlug) cancelDetailRequest();
  return previousSlug !== state.selectedSlug;
}

function renderArchiveState() {
  const shouldShow = state.view === "list" && Boolean(state.error || state.mods.length === 0);
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

function renderBrowseTitles() {
  const selectedIndex = state.mods.findIndex((mod) => mod.slug === state.selectedSlug);
  const spatial = !reducedMotion && !window.matchMedia("(max-width: 700px)").matches;
  const fragment = document.createDocumentFragment();
  state.mods.forEach((mod, index) => {
    const offset = index - selectedIndex;
    const distance = Math.abs(offset);
    const title = node("button", `browse-title${distance === 0 ? " is-selected" : ""}`, mod.name);
    title.type = "button";
    title.dataset.action = "select-mod";
    title.dataset.slug = mod.slug;
    title.setAttribute("aria-label", `Select ${mod.name}`);
    title.setAttribute("aria-pressed", String(distance === 0));
    title.setAttribute("aria-hidden", String(spatial && distance > 6));
    title.tabIndex = spatial ? distance === 0 ? 0 : -1 : 0;
    title.style.setProperty("--title-offset-y", `${offset * 50}px`);
    title.style.setProperty("--title-offset-x", `${Math.sign(offset) * Math.min(28, distance * 6)}px`);
    title.style.setProperty("--title-size", distance === 0 ? "22px"
      : distance === 1 ? "17px"
        : distance === 2 ? "15.6px" : `${Math.max(10, 15.6 - (distance - 2) * 1.4)}px`);
    title.style.setProperty("--title-opacity", distance === 0 ? "1"
      : String(Math.max(0.059, 0.537 - (distance - 1) * 0.053)));
    title.style.setProperty("--title-depth", String(100 - distance));
    fragment.append(title);
  });
  elements.browseTitles.replaceChildren(fragment);
  if (spatial && selectedIndex >= 0) {
    const titles = Array.from(elements.browseTitles.querySelectorAll(".browse-title"));
    for (const direction of [-1, 1]) {
      let offset = 0;
      let previous = titles[selectedIndex];
      for (let index = selectedIndex + direction; index >= 0 && index < titles.length; index += direction) {
        const current = titles[index];
        offset += 50 + Math.max(0, Math.max(previous.offsetHeight, current.offsetHeight) - 34);
        current.style.setProperty("--title-offset-y", `${direction * offset}px`);
        previous = current;
      }
    }
  }
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
  const box = active.getBoundingClientRect();
  const parent = group.getBoundingClientRect();
  if (!box.width || !parent.width) return;
  if (!animate || reducedMotion) bar.style.transition = "none";
  bar.style.left = `${box.left - parent.left}px`;
  bar.style.width = `${box.width}px`;
  if (!animate || reducedMotion) {
    void bar.offsetWidth;
    bar.style.transition = "";
  }
}

function rowButton(mod, className, label) {
  const button = node("button", className);
  button.type = "button";
  button.dataset.action = "select-mod";
  button.dataset.slug = mod.slug;
  button.setAttribute("aria-expanded", String(state.selectedSlug === mod.slug));
  button.setAttribute("aria-label", label);
  return button;
}

function renderModRow(mod, index) {
  const selected = state.selectedSlug === mod.slug;
  const seen = visitedSlugs.has(mod.slug);
  const row = node("tr", `ledger-row${selected ? " is-selected" : ""}${seen && !selected ? " is-visited" : ""}`);
  row.style.setProperty("--entry-order", String(index % 12));
  const button = rowButton(mod, "mod-select", `${selected ? "Collapse" : "Expand"} ${mod.name}`);
  const nameWrap = node("span", "mod-name-wrap");
  nameWrap.append(node("span", "mod-name", mod.name));
  const metadata = node("span", "mod-meta");
  metadata.append(node("span", "meta-poster", mod.postedBy));
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
  meta.append(node("span", "topic-tag", "Topic"));
  meta.append(document.createTextNode("  ·  "));
  meta.append(node("span", "source-post-author", post.postedBy));
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
  meta.append(node("span", "source-post-author", post.postedBy));
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
    meta.append(node("span", "thread-item-author", post.postedBy));
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
  if (state.leavingSlug === mod.slug) dossier.classList.add("is-leaving");

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

function renderDossier(mod) {
  const row = node("tr", "detail-row");
  const cell = node("td", "");
  cell.append(renderDossierContent(mod));
  row.append(cell);
  return row;
}

function renderBrowseDossier() {
  const mod = state.mods.find((item) => item.slug === state.selectedSlug);
  elements.browseDossier.setAttribute("aria-busy", String(Boolean(mod && state.detailStatus === "loading")));
  const dossier = mod
    ? renderDossierContent(mod, "mod-dossier browse-dossier-content")
    : node("article", "mod-dossier browse-dossier-content");

  if (mod) {
    dossier.prepend(node("h3", "browse-dossier-title", mod.name));
    if (state.error) {
      const notice = node("div", "browse-error");
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
    dossier.append(node("p", "browse-empty-detail", "The archive could not be loaded."));
    const retry = node("button", "retry-button", "Retry catalog");
    retry.type = "button";
    retry.dataset.action = "retry-catalog";
    dossier.append(retry);
  } else {
    dossier.append(node("p", "browse-empty-detail", state.mods.length
      ? "No pak post is selected." : "No pak posts match this search."));
  }

  elements.browseDossier.replaceChildren(dossier);
}

function renderCatalog() {
  const focusedButton = document.activeElement?.matches(".mod-select, .browse-title")
    ? document.activeElement : null;
  const focusedSlug = focusedButton?.dataset.slug;
  document.body.classList.toggle("view-browse", state.view === "browse");
  document.body.classList.toggle("view-list", state.view === "list");
  elements.browseView.hidden = state.view !== "browse";
  elements.listView.hidden = state.view !== "list";
  renderSortState();
  elements.browseViewButton.setAttribute("aria-pressed", String(state.view === "browse"));
  elements.listViewButton.setAttribute("aria-pressed", String(state.view === "list"));
  const count = state.loading && state.mods.length === 0
    ? "Loading" : `${state.mods.length} / ${state.total || state.mods.length}`;
  elements.resultCount.textContent = count;
  elements.resultCount.setAttribute("aria-label", state.loading && state.mods.length === 0
    ? "Loading results" : `${state.mods.length} of ${state.total || state.mods.length} results`);
  elements.clearSearch.hidden = !state.query;
  elements.search.value = state.query;
  elements.loadMore.hidden = !state.hasMore;
  elements.loadMore.textContent = state.moreError ? "Retry" : "More";
  updateHeroStatus();

  const fragment = document.createDocumentFragment();
  state.mods.forEach((mod, index) => {
    const modRow = renderModRow(mod, index);
    fragment.append(modRow);
    if (state.selectedSlug === mod.slug) fragment.append(renderDossier(mod));
  });
  elements.rows.replaceChildren(fragment);
  renderBrowseTitles();
  renderBrowseDossier();
  observeRows();
  renderArchiveState();
  updateStageHeight();
  if (focusedSlug) {
    const buttons = state.view === "browse"
      ? elements.browseTitles.querySelectorAll(".browse-title")
      : elements.rows.querySelectorAll(".mod-select");
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
  renderCatalog();

  if (state.demo) {
    const demo = demoMods.find((item) => item.slug === slug);
    state.detail = demo ? {
      initialPost: demo.initialPost,
      threadPosts: demo.threadPosts,
    } : { initialPost: {}, threadPosts: [] };
    state.detailStatus = "ready";
    renderCatalog();
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
    renderCatalog();
  } catch (error) {
    if (error.name === "AbortError" || request !== state.detailRequest || state.selectedSlug !== slug) return;
    state.detailController = null;
    state.detailStatus = "error";
    renderCatalog();
  }
}

function selectMod(slug) {
  if (state.selectedSlug === slug) {
    if (state.view === "browse") return;
    const modName = state.mods.find((mod) => mod.slug === slug)?.name || "Pak post";
    cancelDetailRequest();
    state.wheelRemainder = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.selectedSlug = null;
      state.detail = null;
      state.detailStatus = "idle";
      renderCatalog();
    } else {
      state.leavingSlug = slug;
      renderCatalog();
      state.collapseTimer = window.setTimeout(() => {
        state.selectedSlug = null;
        state.detail = null;
        state.detailStatus = "idle";
        state.leavingSlug = null;
        state.collapseTimer = 0;
        renderCatalog();
      }, 180);
    }
    announce(`${modName} collapsed.`);
    return;
  }
  window.clearTimeout(state.collapseTimer);
  state.collapseTimer = 0;
  state.leavingSlug = null;
  const modName = state.mods.find((mod) => mod.slug === slug)?.name || "Pak post";
  state.selectedSlug = slug;
  state.detail = null;
  state.detailStatus = "loading";
  markSeen(slug);
  loadDetails(slug);
  announce(`${modName} opened.`);
}

async function loadCatalog({ append = false } = {}) {
  if (state.demo) {
    const query = state.query.toLocaleLowerCase();
    let mods = demoMods.filter((mod) => !query ||
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
    const selectionChanged = ensureSelection();
    renderCatalog();
    if (selectionChanged && state.selectedSlug) loadDetails(state.selectedSlug);
  } catch (error) {
    if (error.name === "AbortError" || request !== state.catalogRequest) return;
    state.loading = false;
    if (append) state.moreError = true;
    else state.error = error.message || "The catalog could not be loaded. Try again shortly.";
    renderCatalog();
  }
}

function updateSort(sort) {
  state.sort = sort === "newest" ? state.sort === "newest" ? "oldest" : "newest" : sort;
  state.page = 1;
  loadCatalog();
}

function setView(view) {
  if (view === state.view) return;
  state.view = view;
  state.wheelRemainder = 0;
  const selectionChanged = ensureSelection();
  renderCatalog();
  if (selectionChanged && state.selectedSlug) loadDetails(state.selectedSlug);
}

function focusBrowseTitle(slug) {
  const title = Array.from(elements.browseTitles.querySelectorAll(".browse-title"))
    .find((button) => button.dataset.slug === slug);
  title?.focus({ preventScroll: true });
}

function handleBrowseKeydown(event) {
  const selectedIndex = state.mods.findIndex((mod) => mod.slug === state.selectedSlug);
  let nextIndex = selectedIndex;
  if (event.key === "ArrowDown") nextIndex = Math.min(state.mods.length - 1, selectedIndex + 1);
  else if (event.key === "ArrowUp") nextIndex = Math.max(0, selectedIndex - 1);
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = state.mods.length - 1;
  else return;

  event.preventDefault();
  if (nextIndex === selectedIndex || nextIndex < 0) return;
  const slug = state.mods[nextIndex].slug;
  selectMod(slug);
  window.requestAnimationFrame(() => focusBrowseTitle(slug));
}

function handleBrowseWheel(event) {
  if (state.view !== "browse" || window.matchMedia("(max-width: 700px)").matches || !event.deltaY) return;
  event.preventDefault();
  const delta = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * 40
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? event.deltaY * window.innerHeight
      : event.deltaY;
  state.wheelRemainder += delta;
  const steps = Math.trunc(state.wheelRemainder / 60);
  if (!steps) return;
  state.wheelRemainder -= steps * 60;
  const selectedIndex = state.mods.findIndex((mod) => mod.slug === state.selectedSlug);
  const nextIndex = Math.max(0, Math.min(state.mods.length - 1, selectedIndex + steps));
  if (nextIndex === selectedIndex) {
    state.wheelRemainder = 0;
    return;
  }
  const slug = state.mods[nextIndex].slug;
  const shouldRefocus = elements.browseTitles.contains(document.activeElement);
  selectMod(slug);
  if (shouldRefocus) window.requestAnimationFrame(() => focusBrowseTitle(slug));
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

elements.browseViewButton.addEventListener("click", () => setView("browse"));
elements.listViewButton.addEventListener("click", () => setView("list"));
elements.browseTitles.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action]");
  if (target?.dataset.action === "select-mod") selectMod(target.dataset.slug);
});
elements.browseTitles.addEventListener("keydown", handleBrowseKeydown);
elements.browseTitles.addEventListener("wheel", handleBrowseWheel, { passive: false });
elements.browseDossier.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action]");
  if (!target) return;
  if (target.dataset.action === "retry-detail") loadDetails(target.dataset.slug);
  else if (target.dataset.action === "retry-catalog") loadCatalog();
});

elements.rows.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action]");
  if (!target) return;
  if (target.dataset.action === "select-mod") selectMod(target.dataset.slug);
  else if (target.dataset.action === "retry-detail") loadDetails(target.dataset.slug);
});

elements.loadMore.addEventListener("click", () => loadCatalog({ append: true }));
window.addEventListener("resize", () => {
  const focusedSlug = elements.browseTitles.contains(document.activeElement)
    ? document.activeElement.dataset.slug : null;
  renderBrowseTitles();
  if (focusedSlug) focusBrowseTitle(focusedSlug);
  updateStageHeight();
  updateSortIndicator(false);
});
initializeWorldImage();
initializeSplitText();
initializeTicker();
initializeCursor();
initializeMagnetic();
initializeScrollFx();
initializeScrollReveals();
initializeSignalRain();
loadCatalog();
