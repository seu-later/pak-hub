/* Pak Dump: searchable list of loose pak/zip files grouped by base mod name.
 * Group payloads ship with the list response, so selecting a row only swaps
 * the side box to that group's description and version files. */

const state = {
  query: "",
  sort: "newest",
  page: 1,
  total: 0,
  groups: [],
  selectedKey: null,
  loading: false,
  searchOpen: false,
  error: "",
  moreError: false,
  hasMore: false,
  autoPages: 0,
  catalogController: null,
  catalogRequest: 0,
};

const previewMode = new URLSearchParams(window.location.search).get("demo");
const localPreview = window.location.protocol === "file:" || ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const demo = previewMode === "1" || (localPreview && previewMode !== "0");
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
  rows: document.getElementById("dump-rows"),
  archiveState: document.getElementById("archive-state"),
  loadMore: document.getElementById("load-more"),
  sentinel: document.getElementById("load-sentinel"),
  liveStatus: document.getElementById("live-status"),
};

function node(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function announce(message) {
  elements.liveStatus.textContent = message;
}

function groupKey(group) {
  return group.name.toLowerCase();
}

function ensureSelection() {
  if (state.groups.some((group) => groupKey(group) === state.selectedKey)) return false;
  const previousKey = state.selectedKey;
  state.selectedKey = state.groups[0] ? groupKey(state.groups[0]) : null;
  return previousKey !== state.selectedKey;
}

function renderArchiveState() {
  const shouldShow = Boolean(state.error || state.groups.length === 0);
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
      retry.addEventListener("click", () => loadGroups());
      content.append(retry);
    }
  }
  elements.archiveState.replaceChildren(content);
}

function renderSortState() {
  elements.archiveToolbar.querySelectorAll(".sort-button").forEach((button) => {
    const isActive = button.dataset.sort === state.sort ||
      (button.dataset.sort === "newest" && state.sort === "oldest");
    button.setAttribute("aria-pressed", String(isActive));
    if (button.dataset.sort === "newest") {
      const label = button.querySelector(".sort-label");
      const caret = button.querySelector(".sort-caret");
      const oldest = state.sort === "oldest";
      if (label) label.textContent = oldest ? "Oldest" : "Newest";
      if (caret) caret.dataset.direction = oldest ? "oldest" : "newest";
      button.setAttribute("aria-label", `Sort by ${oldest ? "oldest" : "newest"} file`);
    }
  });
  updateSortIndicator();
}

let sortIndicatorPlaced = false;
function updateSortIndicator(animate = sortIndicatorPlaced) {
  const bar = elements.archiveToolbar.querySelector(".sort-indicator");
  const active = elements.archiveToolbar.querySelector('.sort-button[aria-pressed="true"]');
  const group = elements.archiveToolbar.querySelector(".sort-controls");
  if (!bar || !active || !group) return;
  window.PakHubMotion.moveIndicator(group, bar, active, animate);
  sortIndicatorPlaced = true;
}

function renderGroupRow(group, index) {
  const selected = groupKey(group) === state.selectedKey;
  const row = node("tr", `ledger-row${selected ? " is-selected" : ""}`);
  row.style.setProperty("--entry-order", String(index % 12));
  const button = node("button", "mod-select");
  button.type = "button";
  button.dataset.action = "select-group";
  button.dataset.key = groupKey(group);
  button.setAttribute("aria-current", String(selected));
  button.setAttribute("aria-label", `Preview ${group.name}`);
  let hoverTimer = 0;
  button.addEventListener("pointerenter", () => {
    window.clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(() => previewGroup(groupKey(group)), HOVER_PREVIEW_DELAY);
  });
  button.addEventListener("pointerleave", () => window.clearTimeout(hoverTimer));
  button.addEventListener("focus", () => previewGroup(groupKey(group)));
  button.append(node("span", "row-index", String(index + 1).padStart(2, "0")));
  const nameWrap = node("span", "mod-name-wrap");
  const name = node("span", "mod-name");
  name.append(node("span", "mod-name-face", group.name));
  const duplicate = node("span", "mod-name-face", group.name);
  duplicate.setAttribute("aria-hidden", "true");
  name.append(duplicate);
  nameWrap.append(name);
  button.append(nameWrap);
  button.append(node("span", "file-count", `${group.fileCount} ${group.fileCount === 1 ? "file" : "files"}`));
  const cell = node("td", "column-name");
  cell.append(button);
  row.append(cell);
  return row;
}

function renderVersionFile(file) {
  const item = node("li", "pak-item");
  const label = node("span", "pak-file-copy");
  label.append(node("span", "pak-file-name", file.filename));
  /* Version rides in the mono measurement slot; prereleases show raw. */
  if (file.version) label.append(node("span", "pak-file-size", file.prerelease ? file.version : `v${file.version}`));
  if (file.postedBy && file.postedBy !== "Unknown") {
    const credit = node("span", "pak-credit", "@");
    if (file.sourceUrl) {
      const link = node("a", "pak-credit-link", file.postedBy);
      link.href = file.sourceUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Open the Discord post by ${file.postedBy}`);
      credit.append(link);
    } else {
      credit.append(document.createTextNode(file.postedBy));
    }
    label.append(credit);
  }
  item.append(label);

  if (demo) {
    const unavailable = node("span", "pak-download-unavailable", "Preview");
    unavailable.setAttribute("aria-label", "Downloads disabled in preview");
    item.append(unavailable);
    return item;
  }
  const download = node("a", "pak-download");
  download.href = file.downloadUrl;
  download.setAttribute("aria-label", `Download ${file.filename}`);
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M5 20h14v-2H5v2zm7-18a1 1 0 0 0-1 1v8.17L8.41 8.6 7 10.01l5 5 5-5-1.41-1.41L13 11.17V3a1 1 0 0 0-1-1z");
  icon.append(path);
  download.append(icon);
  download.append(node("span", "", "Download"));
  item.append(download);
  return item;
}

function renderPreviewPanel() {
  const group = state.groups.find((item) => groupKey(item) === state.selectedKey);
  if (elements.rows.isConnected !== false) window.PakHubMotion.select(group ? groupKey(group) : null);
  const dossier = node("article", "mod-dossier preview-dossier-content");

  if (group) {
    const header = node("header", "preview-dossier-header");
    header.append(node("h3", "preview-dossier-title", group.name));
    dossier.prepend(header);
    if (group.pakListUrl) {
      const pakListLink = node("a", "pak-download preview-dossier-pak-link", "View in Pak List");
      pakListLink.href = group.pakListUrl;
      pakListLink.setAttribute("aria-label", `View ${group.name} in Pak List`);
      dossier.append(pakListLink);
    }
    if (group.description) {
      dossier.append(window.PakHubPostFormat.render(group.description, "preview-dossier-description"));
    }
    const list = node("ul", "pak-list");
    for (const file of group.files) list.append(renderVersionFile(file));
    dossier.append(list);
  } else if (state.loading && !state.error) {
    const skeleton = node("div", "loading-skeleton");
    skeleton.setAttribute("aria-label", "Loading");
    for (let index = 0; index < 3; index += 1) skeleton.append(node("span", "skeleton-row"));
    dossier.append(skeleton);
  } else if (state.error) {
    dossier.append(node("p", "preview-empty-detail", "The pak dump could not be loaded."));
    const retry = node("button", "retry-button", "Retry");
    retry.type = "button";
    retry.dataset.action = "retry-catalog";
    dossier.append(retry);
  } else {
    dossier.append(node("p", "preview-empty-detail", "No dump files match this search."));
  }

  window.PakHubMotion.swapPreview(elements.detailPanelContent, dossier, state.selectedKey || "empty");
}

function renderGroups() {
  const focusedButton = document.activeElement?.matches(".mod-select")
    ? document.activeElement : null;
  const focusedKey = focusedButton?.dataset.key;
  const count = state.loading && state.groups.length === 0
    ? "Loading" : `${state.groups.length} / ${state.total || state.groups.length}`;
  elements.resultCount.textContent = count;
  elements.resultCount.setAttribute("aria-label", state.loading && state.groups.length === 0
    ? "Loading results" : `${state.groups.length} of ${state.total || state.groups.length} results`);
  renderSortState();
  elements.clearSearch.hidden = !state.query.trim();
  if (document.activeElement !== elements.search) {
    elements.search.value = state.query;
  }
  elements.loadMore.hidden = !state.hasMore;
  elements.loadMore.textContent = state.moreError ? "Retry" : "More";
  if (elements.sentinel) {
    elements.sentinel.hidden = !state.hasMore || Boolean(state.error) ||
      state.moreError || state.autoPages >= AUTO_PAGE_CAP;
  }
  const fragment = document.createDocumentFragment();
  state.groups.forEach((group, index) => fragment.append(renderGroupRow(group, index)));
  elements.rows.replaceChildren(fragment);
  renderPreviewPanel();
  renderArchiveState();
  if (focusedKey) {
    const buttons = elements.rows.querySelectorAll(".mod-select");
    Array.from(buttons).find((button) => button.dataset.key === focusedKey)?.focus({ preventScroll: true });
  }
}

function previewGroup(key) {
  if (state.selectedKey === key) return;
  if (!state.groups.some((group) => groupKey(group) === key)) return;
  state.selectedKey = key;
  renderPreviewPanel();
  elements.rows.querySelectorAll(".ledger-row").forEach((row) => {
    const selected = row.querySelector(".mod-select")?.dataset.key === key;
    row.classList.toggle("is-selected", selected);
    row.querySelector(".mod-select")?.setAttribute("aria-current", String(selected));
  });
  const group = state.groups.find((item) => groupKey(item) === key);
  if (group) announce(`${group.name} preview selected.`);
}

let loadObserver = null;
function observeLoadSentinel() {
  if (!elements.sentinel || typeof IntersectionObserver === "undefined") return;
  if (loadObserver) return;
  loadObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    if (state.loading || state.error || state.moreError || !state.hasMore) return;
    if (state.autoPages >= AUTO_PAGE_CAP) return;
    state.autoPages += 1;
    loadGroups({ append: true, auto: true });
  }, { rootMargin: "600px 0px" });
  loadObserver.observe(elements.sentinel);
}

async function loadGroups({ append = false, auto = false } = {}) {
  if (demo) {
    const trimmedQuery = state.query.trim().toLowerCase();
    let groups = window.PakHubPreview.groups.filter((group) => !trimmedQuery ||
      [group.name, group.description, ...group.files.map((file) => file.filename)].some((value) => value.toLowerCase().includes(trimmedQuery)));
    groups = [...groups].sort(state.sort === "name" ? (a, b) => a.name.localeCompare(b.name) :
      state.sort === "oldest" ? (a, b) => a.postedAt.localeCompare(b.postedAt) : (a, b) => b.postedAt.localeCompare(a.postedAt));
    state.groups = groups;
    state.total = groups.length;
    state.hasMore = false;
    state.loading = false;
    state.error = "";
    state.moreError = false;
    ensureSelection();
    renderGroups();
    window.PakHubMotion.catalogReady();
    return;
  }
  if (!append) state.autoPages = 0;
  if (state.catalogController) state.catalogController.abort();
  state.catalogController = new AbortController();
  const request = ++state.catalogRequest;
  const page = append ? state.page + 1 : 1;
  state.loading = true;
  state.error = "";
  if (!append) state.moreError = false;
  renderGroups();

  const params = new URLSearchParams({ sort: state.sort, page: String(page) });
  const trimmedQuery = state.query.trim();
  if (trimmedQuery) params.set("q", trimmedQuery);

  try {
    const response = await fetch(`/api/dump?${params}`, {
      headers: { Accept: "application/json" },
      signal: state.catalogController.signal,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "The pak dump could not be loaded.");
    if (request !== state.catalogRequest) return;
    const newGroups = payload.groups || [];
    state.groups = append ? [...state.groups, ...newGroups] : newGroups;
    state.total = Number(payload.total || 0);
    state.page = Number(payload.page || page);
    state.hasMore = state.page * Number(payload.pageSize || 48) < state.total;
    state.loading = false;
    state.error = "";
    state.moreError = false;
    ensureSelection();
    renderGroups();
    if (!append) window.PakHubMotion?.catalogReady();
    if (append && auto) announce(`${newGroups.length} more pack groups loaded.`);
  } catch (error) {
    if (error.name === "AbortError" || request !== state.catalogRequest) return;
    state.loading = false;
    if (append) state.moreError = true;
    else state.error = error.message || "The pak dump could not be loaded. Try again shortly.";
    renderGroups();
    if (!append) window.PakHubMotion?.catalogReady();
  }
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
  if (state.query.trim()) {
    state.query = "";
    elements.search.value = "";
    elements.clearSearch.hidden = true;
    state.page = 1;
    loadGroups();
  }
  elements.searchToggle.focus();
}

elements.searchToggle.addEventListener("click", () => {
  if (state.searchOpen) closeSearch();
  else setSearchOpen(true);
});

elements.searchForm.addEventListener("submit", (event) => event.preventDefault());
elements.search.addEventListener("input", () => {
  state.query = elements.search.value.slice(0, 100);
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.page = 1;
    loadGroups();
  }, 180);
  elements.clearSearch.hidden = !state.query.trim();
});

elements.clearSearch.addEventListener("click", () => {
  window.clearTimeout(searchTimer);
  state.query = "";
  elements.search.value = "";
  elements.clearSearch.hidden = true;
  state.page = 1;
  loadGroups();
  elements.search.focus();
});

elements.search.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  closeSearch();
});

function updateSort(sort) {
  state.sort = sort === "newest" ? state.sort === "newest" ? "oldest" : "newest" : sort;
  state.page = 1;
  loadGroups();
}

document.querySelectorAll(".sort-button").forEach((button) => {
  button.addEventListener("click", () => updateSort(button.dataset.sort));
});
window.addEventListener("resize", () => { if (elements.rows.isConnected !== false) updateSortIndicator(false); }, { passive: true });

elements.detailPanel.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action]");
  if (target?.dataset.action === "retry-catalog") loadGroups();
});

elements.rows.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action]");
  if (target?.dataset.action === "select-group") {
    previewGroup(target.dataset.key);
    if (window.matchMedia("(max-width: 700px)").matches) elements.detailPanel.scrollIntoView({ behavior: window.PakHubMotion.motionEnabled() ? "smooth" : "auto", block: "start" });
  }
});

elements.loadMore.addEventListener("click", () => loadGroups({ append: true }));
observeLoadSentinel();
loadGroups();
