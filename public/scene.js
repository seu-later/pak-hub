import * as THREE from "./assets/three.module.min.js";

/* The supplied city, with shallow architectural depth and input-driven weather. */
export function initializeScene(host, motionEnabled, onStop = () => {}) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.append(renderer.domElement);
  host.dataset.sceneState = "loading";
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2000);
  camera.position.z = 1000;
  const geometry = new THREE.PlaneGeometry(1, 1);
  const textures = [];
  const uniforms = { map: { value: null }, pulse: { value: 0 }, lightX: { value: 0.8 }, search: { value: 0 }, clock: { value: 0 } };
  const cityMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D map;
      uniform float pulse;
      uniform float lightX;
      uniform float search;
      uniform float clock;
      varying vec2 vUv;
      void main() {
        vec3 city = texture2D(map, vUv).rgb * vec3(0.68, 1.02, 0.72);
        float windowLight = smoothstep(0.012, 0.15, dot(city, vec3(0.2126, 0.7152, 0.0722)));
        float band = exp(-pow((vUv.x - lightX) * 12.0, 2.0));
        city += vec3(0.012, 0.09, 0.032) * band * pulse * windowLight;
        city += vec3(0.002, 0.009, 0.003) * search * (1.0 - vUv.x) * windowLight;
        float grain = fract(sin(dot(floor(vUv * vec2(2171.0, 724.0)), vec2(12.9898, 78.233))) * 43758.5453);
        city += (grain - 0.5) * 0.002;
        float haze = (sin(vUv.x * 9.0 + clock * 0.15) + sin(vUv.x * 17.0 + clock * 0.07)) * 0.25 + 0.5;
        city += vec3(0.001, 0.0035, 0.0015) * haze * smoothstep(0.05, 0.35, vUv.y) * (1.0 - smoothstep(0.55, 0.9, vUv.y));
        float skyFade = 1.0 - smoothstep(0.78, 1.0, vUv.y);
        gl_FragColor = vec4(city, skyFade);
        #include <colorspace_fragment>
      }`,
  });
  const city = new THREE.Mesh(geometry, cityMaterial);
  scene.add(city);
  const foregroundMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.7, depthWrite: false, color: 0x91c59f });
  const foreground = new THREE.Mesh(geometry, foregroundMaterial);
  foreground.position.z = 50;
  scene.add(foreground);

  // One batched weather draw; the texture itself contains no painted rain.
  const rainPositions = new Float32Array(72 * 6);
  const rainGeometry = new THREE.BufferGeometry();
  rainGeometry.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
  const rainMaterial = new THREE.LineBasicMaterial({ color: 0x7fab8b, transparent: true, opacity: 0.04, depthWrite: false });
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial);
  rain.position.z = 25;
  scene.add(rain);
  const drops = Array.from({ length: 72 }, (_, index) => ({ x: 0, y: 0, depth: 0.35 + (index % 11) / 17 }));
  const target = { x: 0, y: 0, scroll: 0, light: 0.8, search: 0 };
  const current = { ...target };
  let width = 1;
  let height = 1;
  let cityWidth = 1;
  let cityHeight = 1;
  let frame = 0;
  let frames = 0;
  let lastTime = 0;
  let activeUntil = 0;
  let pulseStart = -Infinity;
  let disposed = false;
  let ready = false;
  let suspended = false;

  function render(time) {
    frame = 0;
    if (disposed || suspended || document.hidden) return;
    if (!motionEnabled()) { stop(); return; }
    const delta = Math.min(Math.max(time - lastTime, 0), 32);
    lastTime = time;
    const amount = 1 - Math.exp(-delta / 85);
    let unsettled = false;
    for (const key of Object.keys(current)) {
      current[key] += (target[key] - current[key]) * amount;
      if (Math.abs(target[key] - current[key]) > 0.0005) unsettled = true;
    }
    city.position.set(0, -height / 2 + cityHeight / 2 - 6, 0);
    foreground.position.set(-8, -height / 2 + cityHeight / 2 - 12, 50);
    const elapsed = time - pulseStart;
    uniforms.pulse.value = elapsed >= 0 && elapsed < 680 ? (1 - Math.exp(-elapsed / 90)) * Math.exp(-elapsed / 190) * 1.8 : 0;
    uniforms.lightX.value = current.light;
    uniforms.search.value = current.search;
    uniforms.clock.value = time / 1000;
    const weather = Math.max(0, Math.min(1, (activeUntil - time) / 350));
    rainMaterial.opacity = 0.018 + weather * 0.035;
    drops.forEach((drop, index) => {
      drop.y -= delta * 0.045 * drop.depth * weather;
      if (drop.y < -height / 2 - 20) drop.y = height / 2 + 20;
      const offset = index * 6;
      const x = drop.x + current.x * drop.depth * 8;
      const y = drop.y + current.scroll * drop.depth * 12;
      rainPositions.set([x, y, 0, x + drop.depth * 0.8, y + 9 * drop.depth, 0], offset);
    });
    rainGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    if (!frames) host.parentElement.classList.add("scene-ready");
    host.dataset.sceneFrames = String(++frames);
    const animate = unsettled || time < activeUntil || elapsed < 680;
    host.dataset.sceneState = animate ? "active" : "idle";
    if (animate) frame = requestAnimationFrame(render);
  }

  function wake(weather = false) {
    if (disposed || suspended || !ready || document.hidden || !motionEnabled()) return;
    const now = performance.now();
    if (weather) activeUntil = now + 700;
    if (!frame) { lastTime = now - 16; frame = requestAnimationFrame(render); }
  }

  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    if (!width || !height || disposed) return;
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1, Math.sqrt(2400000 / (width * height))));
    renderer.setSize(width, height, false);
    camera.left = -width / 2; camera.right = width / 2;
    camera.top = height / 2; camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    cityWidth = Math.max(width + 32, Math.min(height * 1.65, 1500));
    cityHeight = cityWidth / (2171 / 724);
    city.scale.set(cityWidth, cityHeight, 1);
    foreground.scale.set(cityWidth + 32, cityHeight + 16, 1);
    drops.forEach((drop, index) => {
      drop.x = ((index * 0.61803398875) % 1 - 0.5) * width;
      drop.y = ((index * 0.41421356237) % 1 - 0.5) * height;
    });
    wake();
  }
  function pointer(event) {
    if (!motionEnabled() || !window.matchMedia("(pointer: fine)").matches) return;
    target.x = event.clientX / width * 2 - 1;
    target.y = event.clientY / height * 2 - 1;
    wake(true);
  }
  function scroll() {
    target.scroll = Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight - height)));
    wake(true);
  }
  function select(event) {
    const key = event.detail.key;
    if (!key) return;
    target.light = 0.55 + [...String(key)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 17 / 40;
    pulseStart = performance.now();
    wake(true);
  }
  function pause() {
    cancelAnimationFrame(frame); frame = 0;
    host.dataset.sceneState = "paused";
  }
  function visibility() {
    if (document.hidden) pause();
    else wake();
  }
  function suspend() {
    // Keep the last frame painted while the next document takes over.
    suspended = true;
    pause();
  }
  function pagehide() { suspend(); }
  function pageshow() { suspended = false; wake(); }
  const toolbar = document.getElementById("archive-toolbar");
  const searchObserver = toolbar ? new MutationObserver(() => {
    const value = toolbar.classList.contains("search-open") ? 1 : 0;
    if (target.search !== value) { target.search = value; wake(); }
  }) : null;
  searchObserver?.observe(toolbar, { attributes: true, attributeFilter: ["class"] });

  function stop() {
    if (disposed) return;
    disposed = true;
    pause();
    searchObserver?.disconnect();
    window.removeEventListener("pointermove", pointer);
    window.removeEventListener("scroll", scroll);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pagehide", pagehide);
    window.removeEventListener("pageshow", pageshow);
    document.removeEventListener("pakhub:selection", select);
    document.removeEventListener("visibilitychange", visibility);
    renderer.domElement.removeEventListener("webglcontextlost", contextLost);
    geometry.dispose(); rainGeometry.dispose();
    cityMaterial.dispose(); foregroundMaterial.dispose(); rainMaterial.dispose();
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    host.parentElement.classList.remove("scene-ready");
    host.dataset.sceneState = "static";
    onStop();
  }
  function contextLost(event) { event.preventDefault(); stop(); }
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  window.addEventListener("pointermove", pointer, { passive: true });
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pagehide", pagehide);
  window.addEventListener("pageshow", pageshow);
  document.addEventListener("pakhub:selection", select);
  document.addEventListener("visibilitychange", visibility);
  const loader = new THREE.TextureLoader();
  function texture(path) {
    return loader.loadAsync(path).then((loaded) => {
      if (disposed) { loaded.dispose(); return null; }
      loaded.colorSpace = THREE.SRGBColorSpace;
      textures.push(loaded);
      return loaded;
    });
  }
  Promise.all([texture("./assets/city-clean.webp"), texture("./assets/city-foreground.webp")]).then(([far, near]) => {
    if (disposed) return;
    if (!motionEnabled()) { stop(); return; }
    uniforms.map.value = far;
    foregroundMaterial.map = near;
    foregroundMaterial.needsUpdate = true;
    ready = true;
    const selection = window.PakHubMotion?.selectionKey;
    if (selection) target.light = 0.55 + [...String(selection)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 17 / 40;
    current.light = target.light;
    scroll(); resize();
  }).catch(stop);
  resize();
  return { stop, suspend };
}
