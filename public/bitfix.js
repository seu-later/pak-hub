(() => {
  const rows = document.getElementById("bitfix-rows");
  if (!rows) return;
  const panel = document.getElementById("detail-panel");
  const content = document.getElementById("detail-panel-content");
  const status = document.getElementById("bitfix-status");
  const toolbar = document.getElementById("archive-toolbar");
  const searchToggle = document.getElementById("search-toggle");
  const searchForm = document.getElementById("search-form");
  const searchField = document.getElementById("search-field");
  const clearSearch = document.getElementById("clear-search");
  const resultCount = document.getElementById("result-count");
  const sortButtons = Array.from(toolbar.querySelectorAll(".sort-button"));
  const desktopHover = window.matchMedia("(min-width: 701px) and (hover: hover) and (pointer: fine)");
  const mods = [
    {
      key: "aggro-cap",
      name: "Aggro Cap",
      filename: "aggro_cap.lua",
      description: "Raises the per-player attacker cap to 64 and fixes enemy positioning above 32 attackers. The cap is configurable from 32 to 128.",
      postedBy: "67",
      sourceUrl: "https://discord.com/channels/878318716801155233/1545533105522348092/1545886589912227932",
    },
    {
      key: "camera-origin-weapon-fire",
      name: "Camera-Origin Weapon Fire",
      filename: "camera_shot_origin.lua",
      description: "Aligns weapon projectiles, beams and ziplines with the camera, keeping shots on the crosshair when weapon-model FOV is changed.",
      postedBy: "seu",
      sourceUrl: "https://discord.com/channels/878318716801155233/1550256972924850226/1552891890913902653",
    },
    {
      key: "critter-cull-crash-fix",
      name: "Critter Cull Crash Fix",
      filename: "critter_cull_crash_fix.lua",
      description: "Prevents crashes when excess critters are culled after their spawn cap is exceeded.",
      postedBy: "67",
      sourceUrl: "https://discord.com/channels/878318716801155233/1545533105522348092/1545534051967041647",
    },
    {
      key: "large-lobby-crash-fix",
      name: "Large Lobby Crash Fix",
      filename: "increased_players_fix.lua",
      description: "Fixes the large-lobby crash when loading a mission from the Space Rig.",
      postedBy: "Nad",
      sourceUrl: "https://discord.com/channels/878318716801155233/1277798700764237895/1283090623628316733",
    },
    {
      key: "normal-terrain-scanner-materials",
      name: "Normal Terrain Scanner Materials",
      filename: "normal_terrain_scanner_mat.lua",
      description: "Shows terrain and minerals in their normal colours on the terrain scanner, making nitra and morkite easier to spot.",
      postedBy: "Nad",
      sourceUrl: "https://discord.com/channels/878318716801155233/1277798700764237895/1283090623628316733",
    },
    {
      key: "non-flare-devouring-drop-pod",
      name: "Non-Flare-Devouring Drop Pod",
      filename: "non_flare_devouring_drop_pod.lua",
      description: "Stops the drop pod from removing flares thrown inside it.",
      postedBy: "donnie danko",
      sourceUrl: "https://discord.com/channels/878318716801155233/1277798700764237895/1277798700764237895",
    },
    {
      key: "stickier-flame-ice",
      name: "Stickier Flame / Ice",
      filename: "stickier_flame.lua",
      description: "Lets flame and ice patches stick to machinery, including the drop pod, Minehead and refinery.",
      postedBy: "seu",
      sourceUrl: "https://discord.com/channels/878318716801155233/1553092661974663239/1553355725286154250",
    },
  ];
  let selectedKey = null;
  let sort = "newest";
  const rowByKey = new Map();

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function downloadIcon() {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M5 20h14v-2H5v2zm7-18a1 1 0 0 0-1 1v8.17L8.41 8.6 7 10.01l5 5 5-5-1.41-1.41L13 11.17V3a1 1 0 0 0-1-1z");
    icon.append(path);
    return icon;
  }

  function previewMod(mod) {
    if (selectedKey === mod.key) return;
    selectedKey = mod.key;
    rows.querySelectorAll(".ledger-row").forEach((row) => {
      const button = row.querySelector(".mod-select");
      const selected = button.dataset.key === mod.key;
      row.classList.toggle("is-selected", selected);
      button.setAttribute("aria-current", String(selected));
    });

    const dossier = node("article", "mod-dossier preview-dossier-content");
    const header = node("header", "preview-dossier-header");
    header.append(node("h3", "preview-dossier-title", mod.name));
    dossier.append(header, node("p", "preview-dossier-description", mod.description));
    const files = node("ul", "pak-list");
    const file = node("li", "pak-item");
    const label = node("span", "pak-file-copy");
    label.append(node("span", "pak-file-name", mod.filename));
    const credit = node("span", "pak-credit", "@");
    const source = node("a", "pak-credit-link", mod.postedBy);
    source.href = mod.sourceUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.setAttribute("aria-label", `Open the Discord post by ${mod.postedBy}`);
    credit.append(source);
    label.append(credit);
    const download = node("a", "pak-download");
    download.href = `downloads/bitfix/${mod.filename}`;
    download.download = mod.filename;
    download.setAttribute("aria-label", `Download ${mod.filename}`);
    download.append(downloadIcon(), node("span", "", "Download"));
    file.append(label, download);
    files.append(file);
    dossier.append(files);
    window.PakHubMotion.select(`bitfix:${mod.key}`);
    window.PakHubMotion.swapPreview(content, dossier, mod.key);
    status.textContent = `${mod.name} preview selected.`;
  }

  function sourceId(mod) {
    return mod.sourceUrl.slice(mod.sourceUrl.lastIndexOf("/") + 1);
  }

  function orderedMods() {
    const ordered = [...mods];
    ordered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "oldest") return sourceId(a).localeCompare(sourceId(b));
      if (sort === "most-files" || sort === "fewest-files") return 0;
      return sourceId(b).localeCompare(sourceId(a));
    });
    return ordered;
  }

  function renderRows() {
    const terms = searchField.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const ordered = orderedMods();
    const visible = ordered.filter((mod) => {
      const row = rowByKey.get(mod.key);
      const searchable = `${mod.name} ${mod.filename} ${mod.description} ${mod.postedBy}`.toLocaleLowerCase();
      const matches = terms.every((term) => searchable.includes(term));
      row.hidden = !matches;
      return matches;
    });
    ordered.forEach((mod, index) => {
      const row = rowByKey.get(mod.key);
      row.querySelector(".row-index").textContent = String(index + 1).padStart(2, "0");
      rows.append(row);
    });
    resultCount.textContent = `${visible.length} / ${mods.length}`;
    clearSearch.hidden = !searchField.value;
    if (selectedKey && !visible.some((mod) => mod.key === selectedKey)) {
      selectedKey = null;
      rows.querySelectorAll(".ledger-row").forEach((row) => {
        row.classList.remove("is-selected");
        row.querySelector(".mod-select").setAttribute("aria-current", "false");
      });
    }
    if (visible.length && !selectedKey) previewMod(visible[0]);
    if (!visible.length) {
      content.replaceChildren(node("p", "preview-dossier-description", "No mods match this search."));
      status.textContent = "No matching Bitfix mods.";
    }
  }

  function setSort(nextSort) {
    const active = sortButtons.find((button) => button.getAttribute("aria-pressed") === "true");
    sort = active?.dataset.sort === nextSort
      ? nextSort === "name" ? sort === "name" ? "name-desc" : "name" : nextSort === "newest" ? sort === "newest" ? "oldest" : "newest" : sort === "most-files" ? "fewest-files" : "most-files"
      : nextSort;
    sortButtons.forEach((button) => {
      const selected = button.dataset.sort === nextSort;
      button.setAttribute("aria-pressed", String(selected));
      const caret = button.querySelector(".sort-caret");
      caret.removeAttribute("data-direction");
      if (selected && (sort === "name" || sort === "oldest" || sort === "fewest-files")) caret.dataset.direction = "oldest";
    });
    renderRows();
  }

  sortButtons.forEach((button) => button.addEventListener("click", () => setSort(button.dataset.sort)));
  function closeSearch() {
    toolbar.classList.remove("search-open");
    searchToggle.setAttribute("aria-expanded", "false");
    searchToggle.setAttribute("aria-label", "Open search");
    searchForm.setAttribute("aria-hidden", "true");
    searchField.tabIndex = -1;
    clearSearch.tabIndex = -1;
    if (searchField.value) {
      searchField.value = "";
      renderRows();
    }
    searchToggle.focus();
  }
  searchToggle.addEventListener("click", () => {
    if (searchToggle.getAttribute("aria-expanded") === "true") {
      closeSearch();
      return;
    }
    const open = true;
    toolbar.classList.toggle("search-open", open);
    searchToggle.setAttribute("aria-expanded", String(open));
    searchToggle.setAttribute("aria-label", open ? "Close search" : "Open search");
    searchForm.setAttribute("aria-hidden", String(!open));
    searchField.tabIndex = open ? 0 : -1;
    clearSearch.tabIndex = open ? 0 : -1;
    if (open) searchField.focus();
    else searchToggle.focus();
  });
  searchForm.addEventListener("submit", (event) => event.preventDefault());
  searchField.addEventListener("input", renderRows);
  clearSearch.addEventListener("click", () => {
    searchField.value = "";
    renderRows();
    searchField.focus();
  });
  searchField.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeSearch();
  });

  mods.forEach((mod, index) => {
    const row = node("tr", "ledger-row");
    const cell = node("td", "column-name");
    const button = node("button", "mod-select");
    button.type = "button";
    button.dataset.key = mod.key;
    button.setAttribute("aria-label", `Preview ${mod.name}`);
    button.setAttribute("aria-controls", "detail-panel");
    button.setAttribute("aria-current", "false");
    button.append(node("span", "row-index", String(index + 1).padStart(2, "0")));
    const nameWrap = node("span", "mod-name-wrap");
    const name = node("span", "mod-name");
    name.append(node("span", "mod-name-face", mod.name));
    const duplicate = node("span", "mod-name-face", mod.name);
    duplicate.setAttribute("aria-hidden", "true");
    name.append(duplicate);
    nameWrap.append(name);
    button.append(nameWrap, node("span", "file-count", "1 file"));
    let hoverTimer = 0;
    button.addEventListener("pointerenter", () => {
      window.clearTimeout(hoverTimer);
      if (!desktopHover.matches) return;
      hoverTimer = window.setTimeout(() => {
        if (button.isConnected) previewMod(mod);
      }, 150);
    });
    button.addEventListener("pointerleave", () => window.clearTimeout(hoverTimer));
    button.addEventListener("focus", () => previewMod(mod));
    button.addEventListener("click", () => {
      window.clearTimeout(hoverTimer);
      previewMod(mod);
      if (window.matchMedia("(max-width: 700px)").matches) {
        panel.scrollIntoView({ behavior: window.PakHubMotion.motionEnabled() ? "smooth" : "auto", block: "start" });
      }
    });
    cell.append(button);
    row.append(cell);
    rowByKey.set(mod.key, row);
  });
  sortButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.sort === "newest")));
  renderRows();
  document.addEventListener("pakhub:route-ready", () => {
    if (rows.isConnected) window.PakHubMotion.select(`bitfix:${selectedKey}`);
  });
})();
