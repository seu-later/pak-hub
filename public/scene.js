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
        vec2 windowCell = floor(vUv * vec2(160.0, 90.0));
        float seed = fract(sin(dot(windowCell, vec2(42.17, 19.31))) * 15371.13);
        float occupied = step(0.996, seed) * (1.0 - smoothstep(0.6, 0.8, vUv.y));
        float lamp = smoothstep(0.35, 0.95, sin(clock * (0.08 + seed * 0.035) + seed * 40.0));
        city += vec3(0.006, 0.023, 0.012) * occupied * lamp * windowLight;
        float haze = (sin(vUv.x * 9.0 + clock * 0.15) + sin(vUv.x * 17.0 + clock * 0.07)) * 0.25 + 0.5;
        city += vec3(0.001, 0.0035, 0.0015) * haze * smoothstep(0.05, 0.35, vUv.y) * (1.0 - smoothstep(0.55, 0.9, vUv.y));
        float skyFade = 1.0 - smoothstep(0.78, 1.0, vUv.y);
        gl_FragColor = vec4(city, skyFade);
        #include <colorspace_fragment>
      }`,
  });
  const city = new THREE.Mesh(geometry, cityMaterial);
  scene.add(city);
  const foregroundUniforms = {
    map: { value: null }, tint: { value: new THREE.Color(0x91c59f) },
    clock: uniforms.clock, viewX: { value: 0 },
  };
  const foregroundMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: foregroundUniforms,
    vertexShader: cityMaterial.vertexShader,
    fragmentShader: `uniform sampler2D map;
      uniform vec3 tint;
      uniform float clock;
      uniform float viewX;
      varying vec2 vUv;
      void main() {
        vec4 surface = texture2D(map, vUv);
        vec3 metal = surface.rgb * tint;
        float edge = max(0.0, surface.a - texture2D(map, vUv + vec2(0.0014, 0.003)).a);
        float glint = 0.35 + 0.65 * exp(-pow((vUv.x - 0.1 - viewX * 0.035) * 8.0, 2.0));
        metal += vec3(0.016, 0.037, 0.029) * edge * glint;
        for (int i = 0; i < 3; i++) {
          float lane = 0.022 + float(i) * 0.021;
          float drip = 1.0 - fract(clock * (0.045 + float(i) * 0.008) + float(i) * 0.31);
          float streak = exp(-pow((vUv.x - lane) * 1100.0, 2.0)) * exp(-abs(vUv.y - drip) * 90.0);
          metal += vec3(0.022, 0.043, 0.033) * streak;
        }
        gl_FragColor = vec4(metal, surface.a * 0.7);
        #include <colorspace_fragment>
      }`,
  });
  const foreground = new THREE.Mesh(geometry, foregroundMaterial);
  foreground.position.z = 50;
  scene.add(foreground);

  // One batched weather draw; the texture itself contains no painted rain.
  const rainPositions = new Float32Array(160 * 6);
  const rainGeometry = new THREE.BufferGeometry();
  rainGeometry.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
  const rainUniforms = {
    foregroundMap: { value: null },
    foregroundSize: { value: new THREE.Vector2() },
    foregroundOffset: { value: new THREE.Vector2() },
    opacity: { value: 0.1 },
  };
  const rainMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: rainUniforms,
    vertexShader: `varying vec2 worldPosition;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        worldPosition = world.xy;
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: `uniform sampler2D foregroundMap;
      uniform vec2 foregroundSize;
      uniform vec2 foregroundOffset;
      uniform float opacity;
      varying vec2 worldPosition;
      void main() {
        vec2 uv = (worldPosition - foregroundOffset) / foregroundSize + 0.5;
        float alpha = opacity;
        if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
          alpha *= 1.0 - smoothstep(0.01, 0.1, texture2D(foregroundMap, uv).a);
        }
        if (alpha < 0.001) discard;
        gl_FragColor = vec4(0.28, 0.43, 0.34, alpha);
        #include <colorspace_fragment>
      }`,
  });
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial);
  rain.position.z = 25;
  scene.add(rain);
  const mistMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { ...rainUniforms, clock: uniforms.clock },
    vertexShader: `varying vec2 vUv;
      varying vec2 worldPosition;
      void main() {
        vUv = uv;
        vec4 world = modelMatrix * vec4(position, 1.0);
        worldPosition = world.xy;
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: `uniform sampler2D foregroundMap;
      uniform vec2 foregroundSize;
      uniform vec2 foregroundOffset;
      uniform float clock;
      varying vec2 vUv;
      varying vec2 worldPosition;
      void main() {
        float drift = sin(vUv.x * 7.0 + clock * 0.035) * 0.022;
        float lower = exp(-pow((vUv.y - 0.23 - drift) * 14.0, 2.0));
        float upper = exp(-pow((vUv.y - 0.39 + drift * 0.6) * 20.0, 2.0));
        float pockets = 0.55 + 0.45 * sin(vUv.x * 11.0 - clock * 0.026);
        float alpha = (lower * 0.025 + upper * 0.012) * pockets;
        vec2 wallUv = (worldPosition - foregroundOffset) / foregroundSize + 0.5;
        if (wallUv.x >= 0.0 && wallUv.x <= 1.0 && wallUv.y >= 0.0 && wallUv.y <= 1.0) {
          alpha *= 1.0 - smoothstep(0.01, 0.1, texture2D(foregroundMap, wallUv).a);
        }
        gl_FragColor = vec4(0.07, 0.14, 0.15, alpha);
        #include <colorspace_fragment>
      }`,
  });
  const mist = new THREE.Mesh(geometry, mistMaterial);
  mist.position.z = 12;
  scene.add(mist);
  const drops = Array.from({ length: 160 }, (_, index) => ({ x: 0, y: 0, depth: 0.4 + (index % 11) / 15 }));
  const rootStyle = document.documentElement.style;
  const target = {
    x: (parseFloat(rootStyle.getPropertyValue("--scene-x")) || 0) / 8,
    y: (parseFloat(rootStyle.getPropertyValue("--scene-y")) || 0) / 6,
    scroll: 0, light: 0.8, search: 0,
  };
  const current = { ...target };
  let atmosphereTime = parseFloat(rootStyle.getPropertyValue("--scene-clock")) || 0;
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
    for (const key of Object.keys(current)) {
      current[key] += (target[key] - current[key]) * amount;
    }
    // The fallback mirrors each layer's offset during the document handoff.
    rootStyle.setProperty("--scene-x", `${current.x * 8}px`);
    rootStyle.setProperty("--scene-y", `${current.y * 6}px`);
    city.position.set(current.x * 4, -height / 2 + cityHeight / 2 + current.y * 3 - 6, 0);
    foreground.position.set(current.x * 10 - 8, -height / 2 + cityHeight / 2 + current.y * 7 - 12, 50);
    rainUniforms.foregroundOffset.value.set(foreground.position.x, foreground.position.y);
    rainUniforms.foregroundSize.value.set(cityWidth + 32, cityHeight + 16);
    const elapsed = time - pulseStart;
    uniforms.pulse.value = elapsed >= 0 && elapsed < 680 ? (1 - Math.exp(-elapsed / 90)) * Math.exp(-elapsed / 190) * 1.8 : 0;
    uniforms.lightX.value = current.light;
    uniforms.search.value = current.search;
    atmosphereTime += delta / 1000;
    uniforms.clock.value = atmosphereTime;
    foregroundUniforms.viewX.value = current.x;
    const weather = Math.max(0, Math.min(1, (activeUntil - time) / 350));
    rainUniforms.opacity.value = 0.1 + weather * 0.025;
    drops.forEach((drop, index) => {
      drop.y -= delta * 0.28 * drop.depth;
      if (drop.y < -height / 2 - 40) drop.y = height / 2 + 40;
      const offset = index * 6;
      const x = drop.x + current.x * drop.depth * 8;
      const y = drop.y + current.scroll * drop.depth * 12;
      rainPositions.set([x, y, 0, x + drop.depth * 1.2, y + 24 * drop.depth, 0], offset);
    });
    rainGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    if (!frames) host.parentElement.classList.add("scene-ready");
    host.dataset.sceneFrames = String(++frames);
    host.dataset.sceneState = "active";
    frame = requestAnimationFrame(render);
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
    mist.scale.set(width, height, 1);
    drops.forEach((drop, index) => {
      drop.x = ((index * 0.61803398875) % 1 - 0.5) * width;
      drop.y = ((index * 0.41421356237) % 1 - 0.5) * height;
    });
    wake();
  }
  function pointer(event) {
    if (suspended || !motionEnabled() || !window.matchMedia("(pointer: fine)").matches) return;
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
    rootStyle.setProperty("--scene-clock", String(atmosphereTime));
    try {
      sessionStorage.setItem("pak-hub-city-position", JSON.stringify({ x: current.x, y: current.y, clock: atmosphereTime }));
    } catch { /* Pointer motion still works when storage is unavailable. */ }
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
    mistMaterial.dispose();
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
    foregroundUniforms.map.value = near;
    rainUniforms.foregroundMap.value = near;
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
