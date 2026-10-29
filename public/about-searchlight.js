(() => {
  let x = 0.42;
  let y = 0.46;
  let introBounds;
  let intro;
  let introSource;
  let introLayer;
  let introText = "";
  let revealed = false;
  let scrambleFrame = 0;
  const style = document.documentElement.style;

  function revealIntro(next) {
    if (!introLayer || next === revealed) return;
    revealed = next;
    cancelAnimationFrame(scrambleFrame);
    const target = next ? "thanks for using the site." : introText;
    const padded = target.padStart(Math.floor((introText.length + target.length) / 2)).padEnd(introText.length);
    const started = performance.now();
    const symbols = "01/#%_<>[]{}";
    let lastPaint = -Infinity;
    intro.classList.toggle("intro-revealed", next);
    introLayer.classList.add("is-decoding");
    function decode(time) {
      const progress = Math.min(1, (time - started) / 520);
      if (progress === 1 || document.hidden) {
        introLayer.textContent = target;
        introLayer.classList.remove("is-decoding");
        scrambleFrame = 0;
        return;
      }
      if (time - lastPaint >= 40) {
        introLayer.textContent = [...padded].map((letter, index) =>
          progress > 0.18 + index / padded.length * 0.65 ? letter
            : symbols[Math.floor(Math.random() * symbols.length)],
        ).join("");
        lastPaint = time;
      }
      scrambleFrame = requestAnimationFrame(decode);
    }
    scrambleFrame = requestAnimationFrame(decode);
  }

  function sync() {
    const on = Boolean(document.getElementById("about-city"));
    style.setProperty("--searchlight-x", `${x * 100}%`);
    style.setProperty("--searchlight-y", `${y * 100}%`);
    style.setProperty("--searchlight-on", on ? "1" : "0");
    const host = document.getElementById("scene-canvas");
    const width = host?.clientWidth || window.innerWidth;
    const height = host?.clientHeight || window.innerHeight;
    const distance = introBounds ? Math.hypot(
      Math.max(introBounds.left - x * width, 0, x * width - introBounds.right),
      Math.max(introBounds.top - y * height, 0, y * height - introBounds.bottom),
    ) : Infinity;
    revealIntro(on && distance < (revealed ? 76 : 28));
    const angle = Math.atan2((x - 0.5) * width, (1.01 - y) * height) * 180 / Math.PI;
    style.setProperty("--searchlight-angle", `${angle - 10}deg`);
    document.dispatchEvent(new CustomEvent("pakhub:searchlight", { detail: { x, y, on } }));
  }

  function aim(event) {
    if (!document.getElementById("about")) return;
    const host = document.getElementById("scene-canvas");
    x = Math.max(0.04, Math.min(0.96, event.clientX / (host?.clientWidth || window.innerWidth)));
    y = Math.max(0.04, Math.min(0.86, event.clientY / (host?.clientHeight || window.innerHeight)));
    sync();
  }

  function measureIntro() {
    const nextIntro = document.querySelector(".about-author");
    if (nextIntro !== intro) {
      cancelAnimationFrame(scrambleFrame);
      scrambleFrame = 0;
      revealed = false;
      intro = nextIntro;
      introSource = null;
      introLayer = null;
      if (intro) {
        introSource = intro.querySelector(".about-intro-source");
        introText = introSource?.textContent || intro.textContent;
        introSource = introSource || document.createElement("span");
        introSource.className = "about-intro-source";
        introSource.textContent = introText;
        introLayer = document.createElement("span");
        introLayer.className = "about-intro-layer";
        introLayer.setAttribute("aria-hidden", "true");
        introLayer.textContent = introText;
        intro.replaceChildren(introSource, introLayer);
        intro.classList.remove("intro-revealed");
      }
    }
    const range = document.createRange();
    if (introSource) range.selectNodeContents(introSource);
    introBounds = intro ? range.getBoundingClientRect() : null;
    sync();
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "touch" || event.buttons) aim(event);
  }, { passive: true });
  document.addEventListener("pointerdown", aim, { passive: true });
  document.addEventListener("pakhub:route-ready", measureIntro);
  window.addEventListener("resize", measureIntro, { passive: true });
  document.fonts.ready.then(measureIntro);
  measureIntro();
})();
