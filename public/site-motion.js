(() => {
  const desktopViewport = window.matchMedia("(min-width: 701px)");
  const loader = document.getElementById("site-loader");
  const loaderCount = document.getElementById("site-loader-count");
  const loaderLine = document.getElementById("site-loader-line");
  const loaderTrack = document.querySelector(".site-loader-track");
  const images = Array.from(document.images);
  let catalogReady = !document.querySelector("#mod-rows, #dump-rows");
  let fontsReady = !document.fonts;
  let lenis = null;
  const previews = new WeakMap();
  let sceneStarted = false;
  let sceneController = null;
  let sceneRevision = 0;
  let selectedKey = null;

  function motionEnabled() {
    // Motion is part of Pak Hub's identity on both previews and production.
    return true;
  }

  function moveIndicator(group, indicator, target, animate = true, duration = 0.34) {
    if (!group || !indicator || !target) return;
    const box = target.getBoundingClientRect();
    const parent = group.getBoundingClientRect();
    if (!box.width || !parent.width) return;
    const x = box.left - parent.left;
    const width = box.width;
    if (window.gsap) {
      indicator.style.transition = animate ? "opacity 160ms" : "none";
      window.gsap.killTweensOf(indicator);
      window.gsap.to(indicator, { x, scaleX: width, duration: animate && motionEnabled() ? duration : 0, ease: "power3.out", overwrite: true });
    } else {
      indicator.style.transition = animate && motionEnabled() ? "" : "none";
      indicator.style.transform = `translateX(${x}px) scaleX(${width})`;
      if (!animate) { void indicator.offsetWidth; indicator.style.transition = ""; }
    }
    indicator.classList.add("is-positioned");
  }

  /* A single accessible dossier, with at most two temporary visual layers. */
  function swapPreview(container, next, key) {
    const previousJob = previews.get(container);
    previousJob?.cancel();
    const previous = container.lastElementChild;
    const sameSelection = previousJob?.key === key;
    if (sameSelection && previous && previous.innerHTML === next.innerHTML && typeof next.innerHTML === "string") return;
    const savedScroll = container.parentElement?.scrollTop;
    let replacementFocus = null;
    if (previous?.contains(document.activeElement)) {
      const active = document.activeElement;
      if (sameSelection) {
        replacementFocus = Array.from(next.querySelectorAll("a, button")).find((target) =>
          target.tagName === active.tagName && target.getAttribute("href") === active.getAttribute("href") &&
          target.getAttribute("aria-label") === active.getAttribute("aria-label"));
      }
      const panel = container.closest?.(".detail-panel") || container;
      panel.setAttribute("tabindex", "-1");
      panel.focus?.({ preventScroll: true });
    }
    const job = { key, cancel() {} };
    previews.set(container, job);
    if (!previous || sameSelection || !motionEnabled() || !next.animate) {
      container.replaceChildren(next);
      if (sameSelection && container.parentElement) container.parentElement.scrollTop = savedScroll;
      replacementFocus?.focus({ preventScroll: true });
      return;
    }
    Array.from(container.children).slice(0, -1).forEach((child) => child.remove());
    previous.inert = true;
    previous.setAttribute("aria-hidden", "true");
    previous.style.position = "absolute";
    previous.style.inset = "0";
    previous.style.width = "100%";
    previous.style.pointerEvents = "none";
    previous.style.zIndex = "0";
    next.style.position = "relative";
    next.style.zIndex = "1";
    container.append(next);
    if (container.parentElement) container.parentElement.scrollTop = 0;
    const outgoing = previous.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: "ease-out", fill: "forwards" });
    let incoming;
    let timeline;
    function finish() {
      if (previews.get(container) !== job) return;
      previous.remove();
      outgoing.cancel();
      next.style.position = "";
      next.style.zIndex = "";
      next.style.clipPath = "";
      next.style.opacity = "";
      next.style.transform = "";
    }
    if (window.gsap) {
      timeline = window.gsap.timeline({ onComplete: finish });
      timeline.fromTo(next, { clipPath: "inset(46% 0 46% 0)", opacity: 0.65 }, { clipPath: "inset(0% 0 0% 0)", opacity: 1, duration: 0.36, ease: "power3.out" }, 0);
    } else {
      incoming = next.animate([{ clipPath: "inset(46% 0 46% 0)", opacity: 0.65 }, { clipPath: "inset(0)", opacity: 1 }], { duration: 360, easing: "cubic-bezier(.22,1,.36,1)" });
      incoming.finished.then(finish).catch(() => {});
    }
    job.cancel = () => {
      timeline?.kill();
      incoming?.cancel();
      outgoing.cancel();
      previous.remove();
      next.style.position = "";
      next.style.zIndex = "";
      next.style.clipPath = "";
      next.style.opacity = "";
      next.style.transform = "";
    };
  }

  function select(key) {
    if (selectedKey === key) return;
    selectedKey = key;
    document.dispatchEvent(new CustomEvent("pakhub:selection", { detail: { key } }));
  }

  function stopScene() {
    sceneRevision += 1;
    sceneController?.stop();
    sceneController = null;
    sceneStarted = false;
  }

  function startScene() {
    if (!motionEnabled() || !desktopViewport.matches) { stopScene(); return; }
    if (sceneStarted) return;
    const host = document.getElementById("scene-canvas");
    if (!host) return;
    sceneStarted = true;
    const revision = ++sceneRevision;
    const load = () => import("./scene.js?v=20261013city6").then((module) => {
      if (revision !== sceneRevision || !motionEnabled() || !desktopViewport.matches) return;
      sceneController = module.initializeScene(host, motionEnabled, () => {
        if (revision === sceneRevision) { sceneController = null; sceneStarted = false; }
      });
    }).catch(() => {
      // The supplied city stays visible if optional rendering fails.
      if (revision === sceneRevision) host.parentElement.classList.add("scene-static");
    });
    if (window.requestIdleCallback) window.requestIdleCallback(load, { timeout: 1500 });
    else window.setTimeout(load, 100);
  }

  document.querySelector(".preview-back")?.addEventListener("click", () => {
    const selected = document.querySelector(".ledger-row.is-selected .mod-select");
    selected?.scrollIntoView({ behavior: motionEnabled() ? "smooth" : "auto", block: "center" });
    selected?.focus({ preventScroll: true });
  });

  function syncLenis() {
    if (desktopViewport.matches && window.Lenis) {
      if (!lenis) {
        lenis = new window.Lenis({
          autoRaf: true,
          duration: 0.85,
          syncTouch: false,
          respectReducedMotion: false,
          anchors: true,
          prevent: (node) => Boolean(node.closest?.("[data-lenis-prevent]")),
        });
      }
      return;
    }
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
  }

  /* motion-dna: nav-underline-travel — keep one line attached to the current nav target. */
  function initializeNavIndicator() {
    const nav = document.querySelector(".primary-nav");
    const indicator = nav?.querySelector(".nav-indicator");
    const current = nav?.querySelector('a[aria-current="page"]') || nav?.querySelector("a");
    if (!nav || !indicator || !current) return;

    let target = current;
    let navigating = false;
    function positionIndicator(link, animate = true, duration = 0.34) {
      moveIndicator(nav, indicator, link, animate, duration);
      target = link;
    }

    positionIndicator(current, false);
    nav.addEventListener("pointerover", (event) => {
      if (navigating) return;
      const link = event.target.closest("a");
      if (link && nav.contains(link)) positionIndicator(link);
    });
    nav.addEventListener("pointerleave", () => { if (!navigating) positionIndicator(current); });
    nav.addEventListener("focusin", (event) => {
      if (navigating) return;
      const link = event.target.closest("a");
      if (link && nav.contains(link)) positionIndicator(link);
    });
    nav.addEventListener("focusout", (event) => {
      if (!navigating && !nav.contains(event.relatedTarget)) positionIndicator(current);
    });
    nav.addEventListener("pakhub:navigation", (event) => {
      navigating = true;
      positionIndicator(event.detail.link, true, 0.18);
    });
    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      navigating = false;
      positionIndicator(current, false);
    });
    window.addEventListener("resize", () => positionIndicator(target, false), { passive: true });
    document.fonts?.ready.then(() => positionIndicator(target, false));
  }

  function initializeSortIndicator() {
    const group = document.querySelector(".sort-controls");
    const indicator = group?.querySelector(".sort-indicator");
    if (!group || !indicator) return;
    const active = () => group.querySelector('.sort-button[aria-pressed="true"]');
    group.addEventListener("pointerover", (event) => {
      const button = event.target.closest(".sort-button");
      if (button && group.contains(button)) moveIndicator(group, indicator, button);
    });
    group.addEventListener("pointerleave", () => moveIndicator(group, indicator, active()));
    group.addEventListener("focusin", (event) => {
      const button = event.target.closest(".sort-button");
      if (button && group.contains(button)) moveIndicator(group, indicator, button);
    });
    group.addEventListener("focusout", (event) => {
      if (!group.contains(event.relatedTarget)) moveIndicator(group, indicator, active());
    });
  }

  function initializePageTransition() {
    const nav = document.querySelector(".primary-nav");
    const main = document.querySelector("main");
    if (!nav || !main || !window.gsap) return;
    const storageKey = "pak-hub-route-target";
    let navigating = false;
    let signal = null;
    function makeSignal() {
      signal = document.createElement("div");
      signal.className = "route-signal";
      signal.setAttribute("aria-hidden", "true");
      document.body.append(signal);
      return signal;
    }
    let arriving = false;
    try {
      const target = sessionStorage.getItem(storageKey);
      const routePath = (value) => new URL(value).pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
      arriving = Boolean(target) && new URL(target).origin === window.location.origin &&
        routePath(target) === routePath(window.location.href);
      sessionStorage.removeItem(storageKey);
    } catch { /* Storage may be unavailable. */ }
    if (arriving) {
      const effect = makeSignal();
      window.gsap.fromTo(main, { x: -5 }, { x: 0, duration: 0.22, ease: "power3.out", clearProps: "transform" });
      window.gsap.fromTo(effect, { y: -20, opacity: 0.8 }, { y: 24, opacity: 0, duration: 0.22, ease: "power2.out", onComplete: () => { effect.remove(); if (signal === effect) signal = null; } });
    }
    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link || !nav.contains(link) || link.hasAttribute("aria-current") || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || navigating) return;
      event.preventDefault();
      navigating = true;
      nav.dispatchEvent(new CustomEvent("pakhub:navigation", { detail: { link } }));
      sceneController?.suspend();
      const effect = makeSignal();
      try { sessionStorage.setItem(storageKey, destination.href); } catch { /* Navigation still works. */ }
      window.gsap.timeline({ onComplete: () => window.location.assign(destination.href) })
        .fromTo(effect, { y: -18, opacity: 0 }, { y: 0, opacity: 0.8, duration: 0.08, ease: "none" })
        .to(effect, { y: 16, opacity: 0.4, duration: 0.12, ease: "none" }, 0.08)
        .to(main, { x: -6, duration: 0.08, ease: "none" }, 0)
        .to(main, { x: 3, duration: 0.08, ease: "none" }, 0.08);
    });
    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      signal?.remove();
      signal = null;
      navigating = false;
      window.gsap.set(main, { clearProps: "transform" });
    });
  }

  syncLenis();
  initializeNavIndicator();
  initializeSortIndicator();
  initializePageTransition();
  desktopViewport.addEventListener?.("change", () => {
    syncLenis();
    if (catalogReady) startScene();
  });

  function finishImmediately() {
    if (!loader || !loader.isConnected) return;
    loader.remove();
    document.body.classList.remove("site-loading");
    document.body.classList.add("site-ready");
  }

  window.PakHubMotion = {
    swapPreview,
    moveIndicator,
    motionEnabled,
    select,
    get selectionKey() { return selectedKey; },
    catalogReady() {
      catalogReady = true;
      startScene();
    },
  };
  if (catalogReady) startScene();

  if (!loader) {
    document.body.classList.add("site-ready");
    return;
  }

  let seen = false;
  try {
    seen = sessionStorage.getItem("pak-hub-loader-seen") === "1";
    sessionStorage.setItem("pak-hub-loader-seen", "1");
  } catch {
    seen = false;
  }

  if (seen) {
    finishImmediately();
    return;
  }

  loader.hidden = false;
  document.body.classList.add("site-loading");

  const startedAt = performance.now();
  const assetCount = images.length + (document.fonts ? 1 : 0);
  let pageReady = document.readyState === "complete";
  let displayedProgress = 0;
  let forcedComplete = false;
  let exiting = false;

  if (document.fonts) {
    document.fonts.ready.then(() => {
      fontsReady = true;
    });
  }
  window.addEventListener("load", () => {
    pageReady = true;
  }, { once: true });

  function targetProgress() {
    const readyAssets = images.filter((image) => image.complete).length + (fontsReady && document.fonts ? 1 : 0);
    const assetProgress = assetCount ? readyAssets / assetCount * 90 : 90;
    const allReady = pageReady && catalogReady && readyAssets === assetCount;
    return { progress: forcedComplete || allReady ? 100 : Math.min(90, assetProgress), allReady };
  }

  function exitLoader() {
    if (exiting) return;
    exiting = true;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      document.body.classList.remove("site-loading");
      document.body.classList.add("site-ready");
      loader.classList.add("is-leaving");
      window.setTimeout(() => loader.remove(), 230);
    }));
  }

  function tick(now) {
    if (!loader.isConnected || exiting) return;
    if (now - startedAt >= 6000) forcedComplete = true;
    const target = targetProgress();
    displayedProgress += (target.progress - displayedProgress) * 0.12;
    const roundedProgress = Math.min(100, Math.round(displayedProgress));
    loaderCount.textContent = String(roundedProgress) + "%";
    loaderTrack.style.setProperty("--loader-progress", String(displayedProgress) + "%");
    loaderLine.style.width = String(displayedProgress) + "%";

    if ((target.allReady || forcedComplete) && displayedProgress >= 99.98 && now - startedAt >= 1500) {
      exitLoader();
      return;
    }
    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
})();
