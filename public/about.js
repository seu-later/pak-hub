(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector(".site-header");
  const canvas = document.getElementById("signal-rain");
  const worldImg = document.getElementById("world-img");

  if (worldImg) {
    const fallbacks = ["assets/city-rain.png", "assets/halcyon-hero.jpg"];
    worldImg.addEventListener("error", function onError() {
      const next = fallbacks[fallbacks.indexOf(worldImg.getAttribute("src")) + 1];
      if (next) {
        worldImg.src = next;
        return;
      }
      worldImg.style.display = "none";
      worldImg.removeEventListener("error", onError);
    });
  }

  function initializeSignalRain() {
    if (!canvas || !("getContext" in canvas)) return;
    if (reducedMotion.matches) {
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
      if (document.hidden) {
        running = false;
        return;
      }
      if (!running) {
        running = true;
        window.requestAnimationFrame(frame);
      }
    });
    if ("IntersectionObserver" in window && header) {
      new IntersectionObserver((entries) => {
        const visible = entries[0]?.isIntersecting !== false;
        if (visible && !running) {
          running = true;
          window.requestAnimationFrame(frame);
        } else if (!visible) {
          running = false;
        }
      }, { threshold: 0 }).observe(header);
    }
    window.requestAnimationFrame(frame);
  }

  initializeSignalRain();
})();
