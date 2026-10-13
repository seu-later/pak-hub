(() => {
  let x = 0;
  let y = 0;
  let clock = 0;
  try {
    const position = JSON.parse(sessionStorage.getItem("pak-hub-city-position"));
    if (Number.isFinite(position?.x)) x = Math.max(-1, Math.min(1, position.x));
    if (Number.isFinite(position?.y)) y = Math.max(-1, Math.min(1, position.y));
    if (Number.isFinite(position?.clock)) clock = Math.max(0, position.clock);
  } catch { /* Start at the neutral position if storage is unavailable. */ }
  // Apply before first paint so the fallback and live scene share the same position.
  document.documentElement.style.setProperty("--scene-x", `${x * 8}px`);
  document.documentElement.style.setProperty("--scene-y", `${y * 6}px`);
  document.documentElement.style.setProperty("--scene-clock", String(clock));
  try {
    const frame = JSON.parse(sessionStorage.getItem("pak-hub-city-frame"));
    sessionStorage.removeItem("pak-hub-city-frame");
    if (frame?.width === window.innerWidth && frame?.height === window.innerHeight &&
        /^data:image\/(webp|png);base64,/.test(frame.image)) {
      document.documentElement.style.setProperty("--scene-frame", `url("${frame.image}")`);
      document.documentElement.style.setProperty("--scene-frame-visible", "1");
    }
  } catch { /* The layered fallback remains available if a frame cannot be restored. */ }
})();
