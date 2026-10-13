(() => {
  let x = 0;
  let y = 0;
  try {
    const position = JSON.parse(sessionStorage.getItem("pak-hub-city-position"));
    if (Number.isFinite(position?.x)) x = Math.max(-1, Math.min(1, position.x));
    if (Number.isFinite(position?.y)) y = Math.max(-1, Math.min(1, position.y));
  } catch { /* Start at the neutral position if storage is unavailable. */ }
  // Apply before first paint so the fallback and live scene share the same position.
  document.documentElement.style.setProperty("--scene-x", `${x * 8}px`);
  document.documentElement.style.setProperty("--scene-y", `${y * 6}px`);
})();
