const demoCategories = [
  "Gameplay",
  "Visuals",
  "Audio",
  "UI",
  "Tools",
  "Quality of Life",
  "Cosmetics",
  "Missions",
  "Misc",
];

const demoMods = [
  {
    slug: "cleaner-flares-demo",
    name: "Cleaner Flares",
    summary: "Illustrative preview record. This is not a real mod listing.",
    category: "Visuals",
    creator_name: "TorchFox",
    uploader_name: "TorchFox",
    latest_version: "v1.3.0",
    latest_channel: "stable",
    latest_published_at: "2024-11-02T00:00:00.000Z",
    release_count: 1,
    file_count: 1,
    demoReleases: [demoRelease("v1.3.0", "2024-11-02", "Synthetic preview release.", [demoFile("CleanerFlares_v1.3.0.pak", "Standard build")])],
  },
  {
    slug: "terrain-readability-pack-demo",
    name: "Terrain Readability Pack",
    summary: "Illustrative preview record. This is not a real mod listing.",
    category: "Visuals",
    creator_name: "GneissWorks",
    uploader_name: "GneissWorks",
    latest_version: "v2.0.0",
    latest_channel: "stable",
    latest_published_at: "2024-10-18T00:00:00.000Z",
    release_count: 1,
    file_count: 1,
    demoReleases: [demoRelease("v2.0.0", "2024-10-18", "Synthetic preview release.", [demoFile("TerrainReadabilityPack_v2.0.0.pak", "Standard build")])],
  },
  {
    slug: "mission-control-lines-expanded-demo",
    name: "Mission Control Lines Expanded",
    summary: "Illustrative preview record. This is not a real mod listing.",
    category: "Audio",
    creator_name: "RivetAudio",
    uploader_name: "RivetAudio",
    latest_version: "v1.1.0",
    latest_channel: "stable",
    latest_published_at: "2024-09-21T00:00:00.000Z",
    release_count: 1,
    file_count: 1,
    demoReleases: [demoRelease("v1.1.0", "2024-09-21", "Synthetic preview release.", [demoFile("MissionControlLines_v1.1.0.pak", "Standard build")])],
  },
  {
    slug: "equipment-terminal-qol-demo",
    name: "Equipment Terminal QoL",
    summary: "Streamlines the equipment terminal with faster navigation, remembered filters, and a few small quality of life tweaks. Designed to reduce time in menus so you can get back to the mission.",
    category: "Quality of Life",
    creator_name: "StaticKernel",
    uploader_name: "StaticKernel",
    latest_version: "v1.2.0",
    latest_channel: "stable",
    latest_published_at: "2024-08-14T00:00:00.000Z",
    release_count: 3,
    file_count: 5,
    demoReleases: [
      demoRelease("v1.2.0", "2024-08-14", "Minor improvements and fixes", [
        demoFile("EquipmentTerminalQoL_v1.2.0.pak", "Standard edition", 524288),
        demoFile("EquipmentTerminalQoL_v1.2.0_Lite.pak", "Lite edition (fewer assets)", 327680),
      ], true),
      demoRelease("v1.1.0", "2024-07-03", "Added filter remembrance", [
        demoFile("EquipmentTerminalQoL_v1.1.0.pak", "Standard edition", 516096),
        demoFile("EquipmentTerminalQoL_v1.1.0_Lite.pak", "Lite edition (fewer assets)", 319488),
      ]),
      demoRelease("v1.0.0", "2024-05-19", "Initial release", [
        demoFile("EquipmentTerminalQoL_v1.0.0.pak", "Standard edition", 507904),
      ]),
    ],
  },
  {
    slug: "custom-music-framework-demo",
    name: "Custom Music Framework",
    summary: "Illustrative preview record. This is not a real mod listing.",
    category: "Audio",
    creator_name: "HexaBloom",
    uploader_name: "HexaBloom",
    latest_version: "v1.0.0",
    latest_channel: "unknown",
    latest_published_at: "2024-07-30T00:00:00.000Z",
    release_count: 1,
    file_count: 1,
    demoReleases: [demoRelease("v1.0.0", "2024-07-30", "Synthetic preview release.", [demoFile("CustomMusicFramework_v1.0.0.pak", "Standard build")])],
  },
  {
    slug: "cave-variety-project-demo",
    name: "Cave Variety Project",
    summary: "Illustrative preview record. This is not a real mod listing.",
    category: "Missions",
    creator_name: "Stonepatch",
    uploader_name: "Stonepatch",
    latest_version: "v1.2.0",
    latest_channel: "unknown",
    latest_published_at: "2024-06-11T00:00:00.000Z",
    release_count: 1,
    file_count: 1,
    demoReleases: [demoRelease("v1.2.0", "2024-06-11", "Synthetic preview release.", [demoFile("CaveVarietyProject_v1.2.0.pak", "Standard build")])],
  },
  {
    slug: "minimal-hud-demo",
    name: "Minimal HUD",
    summary: "Illustrative preview record. This is not a real mod listing.",
    category: "UI",
    creator_name: "Lumenite",
    uploader_name: "Lumenite",
    latest_version: "v1.0.0",
    latest_channel: "unknown",
    latest_published_at: "2024-05-27T00:00:00.000Z",
    release_count: 1,
    file_count: 1,
    demoReleases: [demoRelease("v1.0.0", "2024-05-27", "Synthetic preview release.", [demoFile("MinimalHUD_v1.0.0.pak", "Standard build")])],
  },
  {
    slug: "miner-gear-recolors-demo",
    name: "Miner Gear Recolors",
    summary: "Illustrative preview record. This is not a real mod listing.",
    category: "Cosmetics",
    creator_name: "Chromaforge",
    uploader_name: "Chromaforge",
    latest_version: "v1.0.0",
    latest_channel: "unknown",
    latest_published_at: "2024-04-03T00:00:00.000Z",
    release_count: 1,
    file_count: 1,
    demoReleases: [demoRelease("v1.0.0", "2024-04-03", "Synthetic preview release.", [demoFile("MinerGearRecolors_v1.0.0.pak", "Standard build")])],
  },
];

function demoRelease(version, date, changelog, files, recommended = false) {
  return {
    version,
    channel: "stable",
    changelog,
    publishedAt: `${date}T00:00:00.000Z`,
    recommended,
    sourceUrl: "",
    threadUrl: "",
    files,
  };
}

function demoFile(filename, variant, sizeBytes = 491520) {
  return {
    filename,
    variant,
    sizeBytes,
    sha256: "",
    downloadUrl: "",
  };
}

const state = {
  demo: (window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)) &&
    new URLSearchParams(window.location.search).get("demo") !== "0",
  query: "",
  category: "All",
  sort: "newest",
  page: 1,
  total: 0,
  mods: [],
  categories: [],
  selectedSlug: null,
  detail: null,
  detailStatus: "idle",
  selectedReleaseIndex: 0,
  selectedFileKey: "",
  loading: false,
  error: "",
  moreError: false,
  hasMore: false,
  catalogController: null,
  catalogRequest: 0,
  detailRequest: 0,
};

const elements = {
  appShell: document.getElementById("app-shell"),
  stage: document.querySelector(".catalog-stage"),
  demoNotice: document.getElementById("demo-notice"),
  search: document.getElementById("search-field"),
  clearSearch: document.getElementById("clear-search"),
  categories: document.getElementById("category-filters"),
  rows: document.getElementById("mod-rows"),
  archiveState: document.getElementById("archive-state"),
  resultCount: document.getElementById("result-count"),
  loadMore: document.getElementById("load-more"),
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

function safeDate(value) {
  if (!value) return "Unversioned";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unversioned";
  return date.toISOString().slice(0, 10);
}

function isoDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function normalizeMod(mod) {
  return {
    slug: String(mod.slug || ""),
    name: String(mod.name || "Untitled mod"),
    summary: String(mod.summary || ""),
    category: String(mod.category || "Other"),
    creator: String(mod.creator_name || mod.creator || "Unknown"),
    uploader: String(mod.uploader_name || mod.uploader || "Unknown"),
    latestVersion: String(mod.latest_version || "Unversioned"),
    latestChannel: String(mod.latest_channel || "unknown"),
    latestPublishedAt: mod.latest_published_at || mod.publishedAt || "",
    latestRecommended: Boolean(mod.latest_recommended),
    releaseCount: Number(mod.release_count || 0),
    fileCount: Number(mod.file_count || 0),
  };
}

function normalizeRelease(release) {
  const files = Array.isArray(release.files) ? release.files : [];
  return {
    version: String(release.version || release.version_label || "Unversioned"),
    channel: String(release.channel || "unknown"),
    changelog: String(release.changelog || ""),
    publishedAt: release.publishedAt || release.published_at || "",
    recommended: Boolean(release.recommended || release.is_recommended),
    sourceUrl: String(release.sourceUrl || release.source_message_url || ""),
    threadUrl: String(release.threadUrl || release.source_thread_url || ""),
    files: files.map((file) => ({
      filename: String(file.filename || file.original_filename || "pak-file.pak"),
      variant: String(file.variant || file.variant_label || "Default build"),
      sizeBytes: Number(file.sizeBytes ?? file.size_bytes ?? 0),
      sha256: String(file.sha256 || ""),
      downloadUrl: String(file.downloadUrl || file.download_url || ""),
    })),
  };
}

function demoDetail(mod) {
  return {
    mod: {
      slug: mod.slug,
      name: mod.name,
      summary: mod.summary,
      category: mod.category,
      creator: mod.creator_name,
      uploader: mod.uploader_name,
    },
    releases: mod.demoReleases.map(normalizeRelease),
  };
}

function compareByDate(left, right) {
  const leftDate = new Date(left.latestPublishedAt || 0).getTime();
  const rightDate = new Date(right.latestPublishedAt || 0).getTime();
  return (Number.isFinite(leftDate) ? leftDate : 0) - (Number.isFinite(rightDate) ? rightDate : 0);
}

function updateStageHeight() {
  if (!elements.stage || window.matchMedia("(max-width: 900px)").matches) return;
  const width = elements.stage.clientWidth;
  const extraRows = Math.max(0, state.mods.length - 8);
  const extra = extraRows * width * 0.029;
  elements.stage.style.setProperty("--catalog-extra", `${extra}px`);
}

function normalizeForDetail(mod) {
  return {
    slug: mod.slug,
    name: mod.name,
    summary: mod.summary,
    category: mod.category,
    creator: mod.creator,
    uploader: mod.uploader,
  };
}

function ensureSelection() {
  const selectedIsVisible = state.mods.some((mod) => mod.slug === state.selectedSlug);
  if (selectedIsVisible) return false;
  const nextMod = state.mods.find((mod) => mod.slug === state.selectedSlug) || state.mods[0] || null;
  state.selectedSlug = nextMod?.slug || null;
  state.detail = nextMod ? { mod: normalizeForDetail(nextMod), releases: [] } : null;
  state.detailStatus = nextMod ? "loading" : "idle";
  state.selectedReleaseIndex = 0;
  state.selectedFileKey = "";
  return Boolean(nextMod);
}

function renderCategories() {
  const fragment = document.createDocumentFragment();
  const categories = state.demo ? demoCategories : state.categories;
  const allCategories = ["All", ...categories.filter((category) => category !== "All")];

  for (const category of allCategories) {
    const button = node("button", "category-button", category.toUpperCase());
    button.type = "button";
    button.dataset.category = category;
    button.setAttribute("aria-pressed", String(state.category === category));
    fragment.append(button);
  }

  elements.categories.replaceChildren(fragment);
}

function renderArchiveState() {
  const shouldShow = Boolean(state.error || state.mods.length === 0);
  elements.archiveState.hidden = !shouldShow;
  if (!shouldShow) {
    elements.archiveState.replaceChildren();
    return;
  }

  const content = node("div", "archive-state-content");
  const heading = node("h2", "", state.loading && !state.error ? "CONNECTING TO ARCHIVE" : state.error ? "ARCHIVE LINK UNAVAILABLE" : "ARCHIVE INDEX EMPTY");
  const message = node("p", "", state.loading && !state.error
    ? "Establishing a link to the public catalog."
    : state.error || (state.demo
      ? "No synthetic preview records match those filters. Clear the search or choose another category."
      : "No pak releases are in the catalog yet. Entries will appear here after the read-only Discord import is connected."));
  content.append(heading, message);

  if (state.error) {
    const retry = node("button", "retry-button", "RETRY CONNECTION");
    retry.type = "button";
    retry.addEventListener("click", () => loadCatalog());
    content.append(retry);
  }

  elements.archiveState.replaceChildren(content);
}

function renderResultCount() {
  if (state.loading && state.mods.length === 0) {
    elements.resultCount.textContent = "CONNECTING TO ARCHIVE...";
    return;
  }
  if (state.error && state.mods.length === 0) {
    elements.resultCount.textContent = "CATALOG OFFLINE";
    return;
  }
  if (state.demo) {
    elements.resultCount.textContent = `${state.total} SAMPLE ${state.total === 1 ? "RECORD" : "RECORDS"}`;
    return;
  }
  const visibleEnd = Math.min(state.mods.length, state.total);
  elements.resultCount.textContent = state.total
    ? `SHOWING ${Math.min(visibleEnd, state.total)} OF ${state.total} MODS`
    : "0 MODS IN ARCHIVE";
}

function renderSortState() {
  document.querySelectorAll(".sort-button").forEach((button) => {
    const isActive = button.dataset.sort === state.sort ||
      (button.dataset.sort === "newest" && state.sort === "oldest");
    button.setAttribute("aria-pressed", String(isActive));
    const header = button.closest("th");
    if (header) header.setAttribute("aria-sort", isActive
      ? state.sort === "oldest" ? "ascending" : "descending"
      : "none");
  });
}

function addCell(row, className, content) {
  const cell = node("td", className);
  if (content) cell.append(content);
  row.append(cell);
  return cell;
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

function renderModRow(mod) {
  const selected = state.selectedSlug === mod.slug;
  const row = node("tr", `ledger-row${selected ? " is-selected" : ""}`);
  row.dataset.slug = mod.slug;

  const date = safeDate(mod.latestPublishedAt);
  const nameButton = rowButton(mod, "mod-select", `${selected ? "Collapse" : "Open"} details for ${mod.name}`);
  const nameWrap = node("span", "mod-name-wrap");
  nameWrap.append(node("span", "mod-name", mod.name), node("span", "mobile-category", mod.category));
  nameButton.append(nameWrap);
  addCell(row, "column-name", nameButton);
  addCell(row, "column-category", node("span", "category-label", mod.category));
  addCell(row, "column-creator", node("span", "creator-label", mod.creator));
  addCell(row, "column-release", node("span", "version-label", mod.latestVersion));
  const added = node("time", "date-label", date);
  added.dateTime = isoDateTime(mod.latestPublishedAt);
  addCell(row, "column-added", added);

  const openCell = node("td", "column-open");
  const chevron = rowButton(mod, "row-chevron", `${selected ? "Collapse" : "Open"} ${mod.name}`);
  chevron.append(document.createTextNode("›"));
  openCell.append(chevron);
  row.append(openCell);

  return row;
}

function createReleaseButton(release, index) {
  const button = node("button", "release-choice");
  button.type = "button";
  button.dataset.action = "select-release";
  button.dataset.index = String(index);
  button.setAttribute("aria-pressed", String(index === state.selectedReleaseIndex));

  const time = node("time", "", safeDate(release.publishedAt));
  time.dateTime = isoDateTime(release.publishedAt);
  const version = node("span", "release-version", release.version);
  if (release.recommended) version.append(node("span", "release-badge", "REC"));
  const note = node("span", "release-note", release.changelog || release.channel.toUpperCase());
  button.append(time, version, note);
  return button;
}

function isSafeDownload(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com" && url.pathname.toLowerCase().endsWith(".pak") && !url.username && !url.password;
  } catch {
    return false;
  }
}

function appendDownloadIcon(button) {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M5 20h14v-2H5v2zm7-18a1 1 0 0 0-1 1v8.17L8.41 8.6 7 10.01l5 5 5-5-1.41-1.41L13 11.17V3a1 1 0 0 0-1-1z");
  icon.append(path);
  const label = document.createElement("span");
  label.className = "download-label";
  label.textContent = button.textContent;
  button.textContent = "";
  button.append(label);
  button.prepend(icon);
}

function renderDossier(mod) {
  const detailRow = node("tr", "detail-row");
  const detailCell = node("td", "");
  detailCell.colSpan = 6;
  const dossier = node("article", "mod-dossier");
  dossier.setAttribute("aria-label", `${mod.name} release details`);

  if (state.detailStatus === "loading") {
    const loading = node("p", "dossier-loading", "Loading release history...");
    dossier.append(loading);
    detailCell.append(dossier);
    detailRow.append(detailCell);
    return detailRow;
  }
  if (state.detailStatus === "error") {
    const error = node("div", "dossier-error");
    error.append(node("p", "", "Release history is unavailable right now."));
    const retry = node("button", "retry-button", "RETRY RELEASE HISTORY");
    retry.type = "button";
    retry.dataset.action = "retry-detail";
    retry.dataset.slug = mod.slug;
    error.append(retry);
    dossier.append(error);
    detailCell.append(dossier);
    detailRow.append(detailCell);
    return detailRow;
  }

  const detail = state.detail || { mod: normalizeForDetail(mod), releases: [] };
  const detailMod = detail.mod || {};
  const releases = detail.releases || [];
  const release = releases[state.selectedReleaseIndex] || releases[0] || null;

  const summaryColumn = node("section", "dossier-column summary-column");
  const sample = node("span", "dossier-sample", state.demo ? "SAMPLE DATA" : "PAK RECORD");
  const title = node("h2", "dossier-title", detailMod.name || mod.name);
  const meta = node("p", "dossier-meta");
  const creator = node("span", "", `By ${detailMod.creator || mod.creator}`);
  const category = node("span", "", `Category: ${detailMod.category || mod.category}`);
  const dateText = release ? safeDate(release.publishedAt) : safeDate(mod.latestPublishedAt);
  const released = node("span", "", `Released: ${dateText}`);
  const added = node("span", "", `Added: ${safeDate(mod.latestPublishedAt)}`);
  meta.append(creator, category, released, added);
  const summaryHeading = node("h3", "r-summary-heading", "MOD SUMMARY");
  const summaryCopy = node("p", "summary-copy r-summary-copy", detailMod.summary || mod.summary || "No description was included with this release.");
  summaryColumn.append(sample, title, meta, summaryHeading, summaryCopy);

  const releaseColumn = node("section", "dossier-column releases-column");
  releaseColumn.append(node("h3", "r-release-heading", "RELEASES (NEWEST FIRST)"));
  const releaseList = node("div", "release-list");
  if (releases.length) {
    releases.forEach((entry, index) => releaseList.append(createReleaseButton(entry, index)));
  } else {
    releaseList.append(node("p", "no-files", "No release history is available."));
  }
  releaseColumn.append(releaseList);

  const downloadColumn = node("section", "dossier-column download-column");
  downloadColumn.append(node("h3", "r-download-heading", "PAK DOWNLOADS"));
  const choices = node("div", "download-choices");
  const files = release?.files || [];
  if (files.length) {
    files.forEach((file, index) => {
      const key = file.sha256 || `${file.filename}-${index}`;
      const button = node("button", "file-choice");
      button.type = "button";
      button.dataset.action = "select-file";
      button.dataset.key = key;
      button.dataset.index = String(index);
      button.setAttribute("aria-pressed", String(key === state.selectedFileKey));
      button.setAttribute("aria-label", `${file.filename}, ${file.variant}${file.sizeBytes && !state.demo ? `, ${formatBytes(file.sizeBytes)}` : ""}`);
      const radio = node("span", "radio-mark");
      radio.setAttribute("aria-hidden", "true");
      const copy = node("span", "file-copy");
      copy.append(node("span", "file-name", file.filename));
      const variant = node("span", "file-variant", file.variant);
      if (file.sizeBytes && !state.demo) variant.append(document.createTextNode(` · ${formatBytes(file.sizeBytes)}`));
      copy.append(variant);
      button.append(radio, copy);
      choices.append(button);
    });
  } else {
    choices.append(node("p", "no-files", "No pak files are attached to this release."));
  }
  downloadColumn.append(choices);

  const selectedFile = files.find((file, index) => (file.sha256 || `${file.filename}-${index}`) === state.selectedFileKey) || files[0];
  let downloadAction;
  if (state.demo || !selectedFile || !isSafeDownload(selectedFile.downloadUrl)) {
    downloadAction = node("button", "download-action", state.demo ? "DOWNLOAD PAK" : selectedFile ? "DOWNLOAD UNAVAILABLE" : "NO PAK FILE");
    downloadAction.type = "button";
    downloadAction.disabled = true;
    downloadAction.title = state.demo ? "Synthetic preview files are not downloadable." : "A verified GitHub release file is not available.";
  } else {
    downloadAction = node("a", "download-action", "DOWNLOAD PAK");
    downloadAction.href = selectedFile.downloadUrl;
    downloadAction.target = "_blank";
    downloadAction.rel = "noopener noreferrer";
  }
  appendDownloadIcon(downloadAction);
  downloadColumn.append(downloadAction);

  const hint = node("p", "download-hint", state.demo
    ? "Synthetic preview files are disabled."
    : selectedFile && isSafeDownload(selectedFile.downloadUrl)
      ? "Direct public GitHub release asset."
      : "This release has no verified download link.");
  downloadColumn.append(hint);

  const sourceLinks = node("div", "source-links");
  if (release?.sourceUrl && isAllowedHost(release.sourceUrl, "discord.com")) {
    const source = node("a", "", "SOURCE POST");
    source.href = release.sourceUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    sourceLinks.append(source);
  }
  if (release?.threadUrl && isAllowedHost(release.threadUrl, "discord.com")) {
    const thread = node("a", "", "VERSION THREAD");
    thread.href = release.threadUrl;
    thread.target = "_blank";
    thread.rel = "noopener noreferrer";
    sourceLinks.append(thread);
  }
  if (sourceLinks.childElementCount) summaryColumn.append(sourceLinks);

  dossier.append(summaryColumn, releaseColumn, downloadColumn);
  detailCell.append(dossier);
  detailRow.append(detailCell);
  return detailRow;
}

function isAllowedHost(value, host) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === host && !url.username && !url.password;
  } catch {
    return false;
  }
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function renderCatalog() {
  elements.demoNotice.hidden = !state.demo;
  renderCategories();
  renderSortState();
  elements.clearSearch.hidden = !state.query;
  elements.search.value = state.query;
  elements.loadMore.hidden = !state.hasMore;
  elements.loadMore.textContent = state.moreError ? "RETRY LOAD MORE" : "LOAD MORE ↓";

  const fragment = document.createDocumentFragment();
  for (const mod of state.mods) {
    fragment.append(renderModRow(mod));
    if (state.selectedSlug === mod.slug) {
      const rowMod = mod;
      if (state.detailStatus === "idle") {
        state.detail = { mod: normalizeForDetail(rowMod), releases: [] };
        state.detailStatus = "loading";
      }
      fragment.append(renderDossier(rowMod));
    }
  }
  elements.rows.replaceChildren(fragment);
  renderArchiveState();
  renderResultCount();
  updateStageHeight();
}

function setSelectedFile(release, index) {
  const file = release?.files?.[index];
  if (!file) return;
  state.selectedFileKey = file.sha256 || `${file.filename}-${index}`;
}

async function loadDetails(slug) {
  const mod = state.mods.find((item) => item.slug === slug);
  if (!mod) return;
  const request = ++state.detailRequest;
  state.detail = { mod: normalizeForDetail(mod), releases: [] };
  state.detailStatus = "loading";
  renderCatalog();

  if (state.demo) {
    const demo = demoMods.find((item) => item.slug === slug);
    state.detail = demo ? demoDetail(demo) : { mod: normalizeForDetail(mod), releases: [] };
    state.detailStatus = "ready";
    state.selectedReleaseIndex = state.detail.releases.findIndex((release) => release.recommended);
    if (state.selectedReleaseIndex < 0) state.selectedReleaseIndex = 0;
    setSelectedFile(state.detail.releases[state.selectedReleaseIndex], 0);
    renderCatalog();
    return;
  }

  try {
    const response = await fetch(`/api/mods/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not load release history.");
    if (request !== state.detailRequest || state.selectedSlug !== slug) return;

    state.detail = {
      mod: payload.mod || normalizeForDetail(mod),
      releases: (payload.releases || []).map(normalizeRelease),
    };
    state.detailStatus = "ready";
    state.selectedReleaseIndex = state.detail.releases.findIndex((release) => release.recommended);
    if (state.selectedReleaseIndex < 0) state.selectedReleaseIndex = 0;
    setSelectedFile(state.detail.releases[state.selectedReleaseIndex], 0);
    renderCatalog();
  } catch (error) {
    if (request !== state.detailRequest || state.selectedSlug !== slug) return;
    state.detailStatus = "error";
    renderCatalog();
  }
}

function selectMod(slug) {
  if (state.selectedSlug === slug) {
    const modName = state.mods.find((mod) => mod.slug === slug)?.name || "Mod";
    state.selectedSlug = null;
    state.detail = null;
    state.detailStatus = "idle";
    state.detailRequest += 1;
    renderCatalog();
    announce(`${modName} details collapsed.`);
    return;
  }
  const modName = state.mods.find((mod) => mod.slug === slug)?.name || "Mod";
  state.selectedSlug = slug;
  state.selectedReleaseIndex = 0;
  state.selectedFileKey = "";
  state.detail = null;
  state.detailStatus = "loading";
  renderCatalog();
  announce(`${modName} details opened.`);
  loadDetails(slug);
}

async function loadCatalog({ append = false } = {}) {
  if (state.demo) {
    const query = state.query.toLocaleLowerCase();
    let mods = demoMods.filter((mod) => {
      const matchesCategory = state.category === "All" || mod.category === state.category;
      const matchesQuery = !query || [mod.name, mod.category, mod.creator_name, mod.summary]
        .some((value) => value.toLocaleLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    }).map(normalizeMod);

    if (state.sort === "name") mods.sort((a, b) => a.name.localeCompare(b.name));
    else if (state.sort === "oldest") mods.sort(compareByDate);
    else mods.sort((a, b) => compareByDate(b, a));

    state.mods = mods;
    state.categories = demoCategories;
    state.total = mods.length;
    state.page = 1;
    state.hasMore = false;
    state.loading = false;
    state.error = "";
    state.moreError = false;
    const selectionChanged = ensureSelection();
    renderCatalog();
    if (state.selectedSlug && (selectionChanged || state.detailStatus !== "ready" || !state.detail)) loadDetails(state.selectedSlug);
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

  const params = new URLSearchParams({
    sort: state.sort,
    page: String(page),
  });
  if (state.query) params.set("q", state.query);
  if (state.category !== "All") params.set("category", state.category);

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
    state.categories = Array.isArray(payload.categories) ? payload.categories.map(String) : [];
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
  if (sort === "newest") {
    state.sort = state.sort === "newest" ? "oldest" : "newest";
  } else {
    state.sort = sort;
  }
  state.page = 1;
  loadCatalog();
}

let searchTimer = 0;
document.querySelector(".search-bar").addEventListener("submit", (event) => event.preventDefault());
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
  state.query = "";
  elements.search.value = "";
  elements.clearSearch.hidden = true;
  state.page = 1;
  loadCatalog();
  elements.search.focus();
});

elements.categories.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  state.page = 1;
  loadCatalog();
});

document.querySelectorAll(".sort-button").forEach((button) => {
  button.addEventListener("click", () => updateSort(button.dataset.sort));
});

elements.rows.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "select-mod") {
    selectMod(target.dataset.slug);
  } else if (action === "select-release") {
    state.selectedReleaseIndex = Number(target.dataset.index) || 0;
    setSelectedFile(state.detail?.releases?.[state.selectedReleaseIndex], 0);
    const release = state.detail?.releases?.[state.selectedReleaseIndex];
    if (release) announce(`Selected release ${release.version}.`);
    renderCatalog();
  } else if (action === "select-file") {
    const release = state.detail?.releases?.[state.selectedReleaseIndex];
    setSelectedFile(release, Number(target.dataset.index));
    const file = release?.files?.[Number(target.dataset.index)];
    if (file) announce(`Selected ${file.variant}.`);
    renderCatalog();
  } else if (action === "retry-detail") {
    loadDetails(target.dataset.slug);
  }
});

elements.loadMore.addEventListener("click", () => loadCatalog({ append: true }));
window.addEventListener("resize", updateStageHeight);

if (state.demo) {
  state.selectedSlug = "equipment-terminal-qol-demo";
}
loadCatalog();
