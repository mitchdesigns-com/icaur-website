/* ═══════════════════════════════════════════════════════════
   iCAUR V27 — 3D Landing Page (vanilla JS module)
   Three.js via importmap  +  GSAP / ScrollTrigger via CDN
   ═══════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'meshopt_decoder';
import { Renderer as OglRenderer, Camera as OglCamera, Geometry as OglGeometry, Program as OglProgram, Mesh as OglMesh } from 'ogl';

const gsap   = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
if (window.InertiaPlugin) gsap.registerPlugin(window.InertiaPlugin);

/* ─── Helpers ─────────────────────────────────────────────── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ══════════════════════════════════════════════════════════
   1.  THREE.JS SCENE
══════════════════════════════════════════════════════════ */
/* Front-left quarter angle, car pushed up to close gap below text */
const HERO_POSE     = { rotY: -0.78, posX:  0.38, posY:  1.10, scale: 1.42 };
const OVERVIEW_POSE = { rotY:  0.06, posX:  1.55, posY:  0.85, scale: 1.55 };
const SIDE_POSE     = { rotY:  1.57, posX:  0.2,  posY:  1.90, scale: 1.08 };

/* Smooth scroll-driven rotation target (drag is additive on top) */
let scrollBaseRotY  = HERO_POSE.rotY;
let dragExtraRot    = 0;
let smoothRotY      = HERO_POSE.rotY; /* what the render loop lerps toward */

/* ─── Car colors — one GLB per paint (same sources as the landing page) ── */
const R2 = 'https://pub-835dbefa2ea84f599cef0519f76de888.r2.dev';
const CAR_COLORS = {
  'camel':          '/assets/images/car-v27.glb',
  'carbon-black':   `${R2}/car-v27-carbon-black.glb`,
  'gold-sand':      `${R2}/car-v27-gold-sand.glb`,
  'khaki-white':    `${R2}/car-v27-khaki-white.glb`,
  'porcelain-gray': `${R2}/car-v27-porcelain-gray.glb`,
  'star-silver':    `${R2}/car-v27-star-silver.glb`,
  'tactical-green': `${R2}/car-v27-tactical-green.glb`,
};

let car = null;          /* pose group — poses/rotation applied here */
let carBody = null;      /* current color GLB scene inside the group */
let refBox = null;       /* camel bbox — variants are normalized to it */
let activeColor = 'camel';
const glbCache = new Map();   /* url → Promise<THREE.Group> */
const glbReady = new Set();   /* urls whose model is decoded & ready (instant swap) */
let isDragging  = false;
let dragEnabled = false;
let dragStartX  = 0;
let dragVelX    = 0;
let lastDragX   = 0;
let inertiaTween = null;

/* Close any opened panels so every color variant looks identical,
   and let every mesh cast the ground shadow */
const CLOSE_PANELS = new Set(['Door_FL', 'Door_FR', 'Door_BL', 'Door_BR', 'Trunk', 'Bonnet']);
function prepModel(scene) {
  scene.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; }
    if (CLOSE_PANELS.has(o.name)) {
      o.position.set(0, 0, 0);
      o.quaternion.set(0, 0, 0, 1);
      o.scale.set(1, 1, 1);
    }
  });
  /* Normalize every variant to the camel reference so poses,
     shadow and scale stay identical across color swaps */
  const box = new THREE.Box3().setFromObject(scene);
  if (!refBox) {
    refBox = { size: box.getSize(new THREE.Vector3()), center: box.getCenter(new THREE.Vector3()) };
    return scene;
  }
  const size = box.getSize(new THREE.Vector3());
  const fit  = Math.max(refBox.size.x, refBox.size.y, refBox.size.z) /
               Math.max(size.x, size.y, size.z);
  scene.scale.setScalar(fit);
  const c = box.getCenter(new THREE.Vector3()).multiplyScalar(fit);
  scene.position.set(refBox.center.x - c.x, refBox.center.y - c.y, refBox.center.z - c.z);
  return scene;
}

function initScene() {
  const canvas = $('#v27-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();

  /* Environment reflections — vanilla stand-in for the landing
     page's <Environment preset="city"> (lifts and enriches paint) */
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0.2, 3.8, 9.2);

  /* Lights — ported from the landing page rig */
  scene.add(new THREE.AmbientLight(0xd8ccc5, 0.55));
  const d1 = new THREE.DirectionalLight(0xfff5ee, 3.8);
  d1.position.set(5, 9, 6);
  d1.castShadow = true;
  d1.shadow.mapSize.set(2048, 2048);
  d1.shadow.camera.near = 0.5;  d1.shadow.camera.far = 40;
  d1.shadow.camera.left = -9;   d1.shadow.camera.right = 9;
  d1.shadow.camera.top  = 9;    d1.shadow.camera.bottom = -9;
  d1.shadow.bias = -0.0005;     d1.shadow.normalBias = 0.02;
  scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x555859, 2.2);
  d2.position.set(-6, 5, -8); scene.add(d2);
  const d3 = new THREE.DirectionalLight(0x015699, 1.0);
  d3.position.set(0, -4, 4); scene.add(d3);
  const p1 = new THREE.PointLight(0xffffff, 1.8);
  p1.position.set(4, 8, 2); scene.add(p1);
  const p2 = new THREE.PointLight(0x555859, 1.2);
  p2.position.set(-3, 3, 6); scene.add(p2);

  /* GLTF loader */
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);

  /* Cached GLB loading — each color variant loads once */
  function loadGlb(url) {
    if (!glbCache.has(url)) {
      glbCache.set(url, new Promise((resolve, reject) => {
        loader.load(url, (gltf) => { glbReady.add(url); resolve(prepModel(gltf.scene)); }, undefined, reject);
      }));
    }
    return glbCache.get(url);
  }

  /* Warm a paint's GLB into cache (hover/focus preload) */
  window.__warmCarColor = function (key) {
    if (CAR_COLORS[key]) loadGlb(CAR_COLORS[key]);
  };

  /* Swap the car body to another paint (called by the swatches).
     Instant when the GLB is already decoded; otherwise shows a
     loading spinner on the swatch and swaps the moment it arrives. */
  window.__setCarColor = function (key, btn) {
    if (!CAR_COLORS[key] || key === activeColor) return;
    activeColor = key;
    const url = CAR_COLORS[key];
    const swap = (body) => {
      if (activeColor !== key || !car) return;   /* a newer pick won */
      if (carBody) car.remove(carBody);
      carBody = body;
      car.add(carBody);
      if (btn) btn.classList.remove('is-loading');
    };
    if (glbReady.has(url)) {
      glbCache.get(url).then(swap);              /* cached → instant */
    } else {
      if (btn) btn.classList.add('is-loading');  /* network wait → feedback */
      loadGlb(url).then(swap).catch((err) => {
        if (btn) btn.classList.remove('is-loading');
        console.warn('GLB color load error:', err);
      });
    }
  };

  loadGlb(CAR_COLORS.camel).then((body) => {
    car = new THREE.Group();
    carBody = body;
    car.add(carBody);
    car.rotation.y = HERO_POSE.rotY;
    car.position.set(HERO_POSE.posX, HERO_POSE.posY, 0);
    car.scale.setScalar(HERO_POSE.scale);

    /* Real ground shadow cast by the main light (landing page style) */
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ transparent: true, opacity: 0.42, color: 0x1a0f08 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.02;
    shadowPlane.receiveShadow = true;
    car.add(shadowPlane);

    scene.add(car);
    setupCarScrollAnim();

    /* Eagerly preload every other paint in parallel (like the landing
       page) so swaps are instant. A short delay lets the camel model
       paint first before the ~5MB variants compete for bandwidth. */
    setTimeout(() => {
      Object.keys(CAR_COLORS).forEach((k) => { if (k !== 'camel') loadGlb(CAR_COLORS[k]); });
    }, 600);
  }).catch((err) => console.warn('GLB load error:', err));

  /* Resize */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* Render loop — smooth lerp rotation so drag and scroll never snap */
  function animate() {
    requestAnimationFrame(animate);
    if (car) {
      const target = scrollBaseRotY + dragExtraRot;
      smoothRotY = lerp(smoothRotY, target, 0.10);
      car.rotation.y = smoothRotY;
    }
    renderer.render(scene, camera);
  }
  animate();
}

function setupCarScrollAnim() {
  if (!car) return;

  /* Overview: car rotates to front view as section enters */
  ScrollTrigger.create({
    trigger: '#v27-overview',
    start: 'top 90%', end: 'top top', scrub: 1.5,
    onUpdate(self) {
      if (!car) return;
      const p = self.progress;
      scrollBaseRotY = lerp(HERO_POSE.rotY, OVERVIEW_POSE.rotY, p);
      car.position.x  = lerp(HERO_POSE.posX,  OVERVIEW_POSE.posX,  p);
      car.position.y  = lerp(HERO_POSE.posY,  OVERVIEW_POSE.posY,  p);
      car.scale.setScalar(lerp(HERO_POSE.scale, OVERVIEW_POSE.scale, p));
    },
  });

  /* Exterior: car sweeps from front view to side profile */
  ScrollTrigger.create({
    trigger: '#v27-exterior',
    start: 'top 80%', end: 'top top', scrub: 1.5,
    onUpdate(self) {
      if (!car) return;
      const p = self.progress;
      scrollBaseRotY = lerp(OVERVIEW_POSE.rotY, SIDE_POSE.rotY,  p);
      car.position.x  = lerp(OVERVIEW_POSE.posX,  SIDE_POSE.posX,  p);
      car.position.y  = lerp(OVERVIEW_POSE.posY,  SIDE_POSE.posY,  p);
      car.scale.setScalar(lerp(OVERVIEW_POSE.scale, SIDE_POSE.scale, p));
    },
  });

  /* Exterior: enable drag while pinned; smoothly reset drag offset on leave */
  ScrollTrigger.create({
    trigger: '#v27-exterior',
    start: 'top top', end: 'bottom top',
    onEnter()     { dragEnabled = true;  showDragHint(true); },
    onLeave()     { dragEnabled = false; showDragHint(false); resetDragOffset(); },
    onEnterBack() { dragEnabled = true;  showDragHint(true); },
    onLeaveBack() { dragEnabled = false; showDragHint(false); resetDragOffset(); },
  });

  /* Hide canvas when past all 3D sections */
  ScrollTrigger.create({
    trigger: '#exterior-gallery',
    start: 'top top',
    end: 'bottom top',
    onUpdate(self) {
      const wrap = $('#v27-canvas-wrap');
      if (wrap) wrap.style.opacity = self.progress > 0.8 ? '0' : '1';
    },
  });
}


function lerp(a, b, t) { return a + (b - a) * t; }

/* ─── Drag helpers ───────────────────────────────────────── */
function showDragHint(visible) {
  const extWin = $('.v27-ext-window');
  if (!extWin) return;
  extWin.style.cursor = visible ? 'grab' : 'default';
  if (!visible) setDragCursor('none');
}

function setDragCursor(state) {
  const extWin = $('.v27-ext-window');
  if (extWin) {
    if (state === 'grabbing') extWin.style.cursor = 'grabbing';
    else if (state === 'hover') extWin.style.cursor = 'grab';
    else extWin.style.cursor = 'default';
  }
  /* Custom cursor label (if element exists) */
  const cursor = $('#cursor');
  const label  = $('#cursorLabel');
  if (!cursor) return;
  if (state === 'none') {
    cursor.classList.remove('is-label', 'is-drag');
    if (label) label.textContent = '';
  } else {
    cursor.classList.add('is-label', 'is-drag');
    if (label) label.textContent = state === 'grabbing' ? '360°' : 'Drag';
  }
}

function resetDragOffset() {
  if (inertiaTween) { inertiaTween.kill(); inertiaTween = null; }
  /* Tween only the drag offset to 0 — scroll base handles the rest */
  const state = { v: dragExtraRot };
  gsap.to(state, {
    v: 0, duration: 0.9, ease: 'power2.inOut',
    onUpdate() { dragExtraRot = state.v; },
  });
}

function setupDrag() {
  const extWin = $('.v27-ext-window');
  if (!extWin) return;

  function onDown(e) {
    if (!dragEnabled) return;
    isDragging = true;
    const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    dragStartX = cx; lastDragX = cx; dragVelX = 0;
    if (inertiaTween) { inertiaTween.kill(); inertiaTween = null; }
    setDragCursor('grabbing');
  }
  function onMove(e) {
    if (!isDragging || !car) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? lastDragX;
    dragVelX = x - lastDragX; lastDragX = x;
    dragExtraRot += dragVelX * 0.006;
  }
  function onUp() {
    if (!isDragging) return;
    isDragging = false;
    setDragCursor(dragEnabled ? 'hover' : 'none');
    if (Math.abs(dragVelX) > 0.5) {
      const state = { v: dragExtraRot };
      const target = dragExtraRot + dragVelX * 0.3;
      inertiaTween = gsap.to(state, {
        v: target, duration: 1.2, ease: 'power3.out',
        onUpdate()   { dragExtraRot = state.v; },
        onComplete() { inertiaTween = null; },
      });
    }
    dragVelX = 0;
  }

  /* Attach to .v27-ext-window — the transparent overlay that sits above the fixed canvas */
  extWin.addEventListener('mousedown',  onDown);
  extWin.addEventListener('touchstart', onDown, { passive: true });
  window.addEventListener('mousemove',  onMove);
  window.addEventListener('touchmove',  onMove, { passive: true });
  window.addEventListener('mouseup',    onUp);
  window.addEventListener('touchend',   onUp);

  extWin.addEventListener('mouseenter', () => { if (dragEnabled) setDragCursor('hover'); });
  extWin.addEventListener('mouseleave', () => { if (!isDragging) setDragCursor('none'); });
}

/* ══════════════════════════════════════════════════════════
   2.  HERO ENTRANCE
══════════════════════════════════════════════════════════ */
function initHeroEntrance() {
  const tl = gsap.timeline({ delay: .25 });

  tl.from('#v27-hero-h1',   { opacity: 0, y: 24, duration: .8, ease: 'power3.out' }, .2)
    .to('#v27-hero-sub',    { opacity: 1, y: 0,  duration: .7, ease: 'power3.out' }, .55)
    .to('#v27-hero-bottom', { opacity: 1, y: 0,  duration: .7, ease: 'power3.out' }, .72);
}

/* ══════════════════════════════════════════════════════════
   HERO PARTICLES — vanilla port of React Bits <Particles />
   (ogl point cloud drifting behind the hero content)
══════════════════════════════════════════════════════════ */
function initHeroParticles() {
  const container = $('#v27-particles');
  if (!container) return;

  const CFG = {
    particleCount: 260,
    particleSpread: 10,
    speed: 0.1,
    particleColors: ['#F37021', '#B9AB9C', '#555859'],
    moveParticlesOnHover: true,
    particleHoverFactor: 1,
    alphaParticles: true,
    particleBaseSize: 90,
    sizeRandomness: 1,
    cameraDistance: 20,
    disableRotation: false,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
  };

  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const int = parseInt(hex, 16);
    return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
  };

  const vertex = /* glsl */ `
    attribute vec3 position;
    attribute vec4 random;
    attribute vec3 color;
    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;
    uniform float uTime;
    uniform float uSpread;
    uniform float uBaseSize;
    uniform float uSizeRandomness;
    varying vec4 vRandom;
    varying vec3 vColor;
    void main() {
      vRandom = random;
      vColor = color;
      vec3 pos = position * uSpread;
      pos.z *= 10.0;
      vec4 mPos = modelMatrix * vec4(pos, 1.0);
      float t = uTime;
      mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
      mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
      mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
      vec4 mvPos = viewMatrix * mPos;
      if (uSizeRandomness == 0.0) {
        gl_PointSize = uBaseSize;
      } else {
        gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
      }
      gl_Position = projectionMatrix * mvPos;
    }
  `;

  const fragment = /* glsl */ `
    precision highp float;
    uniform float uTime;
    uniform float uAlphaParticles;
    varying vec4 vRandom;
    varying vec3 vColor;
    void main() {
      vec2 uv = gl_PointCoord.xy;
      float d = length(uv - vec2(0.5));
      if (uAlphaParticles < 0.5) {
        if (d > 0.5) { discard; }
        gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
      } else {
        float circle = smoothstep(0.5, 0.4, d) * 0.8;
        gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
      }
    }
  `;

  const renderer = new OglRenderer({ dpr: CFG.pixelRatio, depth: false, alpha: true });
  const gl = renderer.gl;
  container.appendChild(gl.canvas);
  gl.clearColor(0, 0, 0, 0);

  const camera = new OglCamera(gl, { fov: 15 });
  camera.position.set(0, 0, CFG.cameraDistance);

  function resize() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
  }
  window.addEventListener('resize', resize, false);
  resize();

  /* container is pointer-events:none — track the mouse on window */
  const mouse = { x: 0, y: 0 };
  if (CFG.moveParticlesOnHover) {
    window.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }, { passive: true });
  }

  const count = CFG.particleCount;
  const positions = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 4);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    let x, y, z, len;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
      len = x * x + y * y + z * z;
    } while (len > 1 || len === 0);
    const r = Math.cbrt(Math.random());
    positions.set([x * r, y * r, z * r], i * 3);
    randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    colors.set(hexToRgb(CFG.particleColors[Math.floor(Math.random() * CFG.particleColors.length)]), i * 3);
  }

  const geometry = new OglGeometry(gl, {
    position: { size: 3, data: positions },
    random:   { size: 4, data: randoms },
    color:    { size: 3, data: colors },
  });

  const program = new OglProgram(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime:           { value: 0 },
      uSpread:         { value: CFG.particleSpread },
      uBaseSize:       { value: CFG.particleBaseSize * CFG.pixelRatio },
      uSizeRandomness: { value: CFG.sizeRandomness },
      uAlphaParticles: { value: CFG.alphaParticles ? 1 : 0 },
    },
    transparent: true,
    depthTest: false,
  });

  const particles = new OglMesh(gl, { mode: gl.POINTS, geometry, program });

  let lastTime = performance.now();
  let elapsed = 0;
  (function update(t) {
    requestAnimationFrame(update);
    const delta = (t || performance.now()) - lastTime;
    lastTime = t || performance.now();
    elapsed += delta * CFG.speed;

    program.uniforms.uTime.value = elapsed * 0.001;

    if (CFG.moveParticlesOnHover) {
      particles.position.x = -mouse.x * CFG.particleHoverFactor;
      particles.position.y = -mouse.y * CFG.particleHoverFactor;
    }

    if (!CFG.disableRotation) {
      particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
      particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
      particles.rotation.z += 0.01 * CFG.speed;
    }

    renderer.render({ scene: particles, camera });
  })(performance.now());
}

/* ══════════════════════════════════════════════════════════
   3.  360 EXPERIENCE — swatches + drag setup
══════════════════════════════════════════════════════════ */
function initExterior() {
  /* DotGrid — fixed behind the 3D car; visible only during the 360 stage */
  const dotWrap = document.querySelector('.eg-dotgrid-wrap');
  if (dotWrap) {
    initDotGrid(dotWrap);
    ScrollTrigger.create({
      trigger: '#v27-exterior',
      start: 'top 55%', end: 'bottom 45%',
      onToggle(self) { dotWrap.classList.toggle('is-on', self.isActive); },
    });
  }

  /* Swatch click → swap the car GLB to that paint.
     Hover warms the GLB so a click right after is already cached. */
  const warm = (key) => { if (window.__warmCarColor) window.__warmCarColor(key); };
  $$('.v27-swatch').forEach(btn => {
    btn.addEventListener('mouseenter', () => warm(btn.dataset.color));
    btn.addEventListener('focus',      () => warm(btn.dataset.color));
    btn.addEventListener('click', () => {
      $$('.v27-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (window.__setCarColor) window.__setCarColor(btn.dataset.color, btn);
    });
  });

  /* Entrance animations */
  ScrollTrigger.create({
    trigger: '#v27-exterior',
    start: 'top 80%', once: true,
    onEnter() {
      gsap.to('#v27-ext-eyebrow', { opacity: 1, duration: .5, delay: .2 });
      gsap.from('#v27-ext-h2', { opacity: 0, y: 24, duration: .8, ease: 'power3.out', delay: .1 });
      gsap.to('.v27-swatch', { opacity: 1, stagger: .08, duration: .5, ease: 'power2.out', delay: .4 });
    }
  });

  setupDrag();
}

/* ══════════════════════════════════════════════════════════
   4.  EXTERIOR DESIGN — photo carousel
══════════════════════════════════════════════════════════ */
const EXT_SLIDES = [
  { src: '/assets/images/v27/v27-01.webp',  label: 'Front View' },
  { src: '/assets/images/v27/v27-02.webp',  label: 'Profile' },
  { src: '/assets/images/v27/v27-03.webp',  label: 'Exterior' },
  { src: '/assets/images/v27/v27-12.webp',  label: 'Detail' },
  { src: '/assets/images/v27/v27-17.webp',  label: 'Side' },
  { src: '/assets/images/v27/v27-20.webp',  label: 'Dynamic' },
];

/* ─── Lightbox state ─────────────────────────────────── */
let lbItems  = [];
let lbIndex  = 0;
let lbOrigin = { x: 50, y: 50 }; /* click origin as viewport % */
let lbIsOpen = false;
let lbAnimating = false;

function openLightbox(idx, clientX, clientY) {
  const lb      = $('#v27-lightbox');
  const lbImg   = $('#v27-lightbox-img');
  const lbCap   = $('#v27-lb-caption');
  const lbStage = $('#v27-lb-stage');
  if (!lb || !lbImg || !lbItems.length) return;

  lbIndex = ((idx % lbItems.length) + lbItems.length) % lbItems.length;
  const item = lbItems[lbIndex];

  /* capture click origin in % of viewport */
  if (clientX !== undefined && clientY !== undefined) {
    lbOrigin.x = (clientX / window.innerWidth)  * 100;
    lbOrigin.y = (clientY / window.innerHeight) * 100;
  }
  const ox = lbOrigin.x.toFixed(2) + '%';
  const oy = lbOrigin.y.toFixed(2) + '%';

  lbImg.src = item.image;
  lbImg.alt = item.text || '';
  if (lbCap) lbCap.textContent = item.text || '';

  if (!lbIsOpen) {
    /* first open — clip-path expand from click origin */
    lbIsOpen = true;
    lb.classList.add('lb-open');
    document.body.style.overflow = 'hidden';

    gsap.fromTo(lb,
      { clipPath: `circle(0% at ${ox} ${oy})` },
      { clipPath: `circle(150% at ${ox} ${oy})`, duration: .6, ease: 'power3.out' }
    );
    if (lbStage) {
      gsap.fromTo(lbStage,
        { opacity: 0, scale: .94 },
        { opacity: 1, scale: 1, duration: .5, delay: .1, ease: 'power2.out' }
      );
    }
  } else {
    /* already open — slide transition */
    _lbSlide(item, idx > lbIndex - 1 ? 1 : -1);
  }
}

function _lbSlide(item, direction) {
  const lbImg = $('#v27-lightbox-img');
  const lbCap = $('#v27-lb-caption');
  if (!lbImg) return;

  const outX = -108 * direction;
  const inX  =  108 * direction;

  gsap.to(lbImg,   { xPercent: outX, opacity: 0, duration: .26, ease: 'power2.in' });
  if (lbCap) gsap.to(lbCap, { opacity: 0, duration: .2 });

  gsap.delayedCall(.28, () => {
    lbImg.src = item.image;
    lbImg.alt = item.text || '';
    if (lbCap) { lbCap.textContent = item.text || ''; }
    gsap.fromTo(lbImg,
      { xPercent: inX, opacity: 0 },
      { xPercent: 0, opacity: 1, duration: .32, ease: 'power2.out' }
    );
    if (lbCap) gsap.to(lbCap, { opacity: 1, duration: .28, delay: .1 });
  });
}

function _slideTo(newIdx) {
  if (!lbItems.length || !lbIsOpen) return;
  const oldIdx = lbIndex;
  lbIndex = ((newIdx % lbItems.length) + lbItems.length) % lbItems.length;
  const direction = newIdx > oldIdx || (oldIdx === lbItems.length - 1 && newIdx === 0) ? 1 : -1;
  _lbSlide(lbItems[lbIndex], direction);
  const lbCap = $('#v27-lb-caption');
  if (lbCap) lbCap.textContent = lbItems[lbIndex].text || '';
}

function closeLightbox() {
  if (!lbIsOpen) return;
  const lb    = $('#v27-lightbox');
  const ox    = lbOrigin.x.toFixed(2) + '%';
  const oy    = lbOrigin.y.toFixed(2) + '%';
  const stage = $('#v27-lb-stage');

  lbIsOpen = false;
  if (stage) gsap.to(stage, { opacity: 0, scale: .94, duration: .22, ease: 'power2.in' });
  gsap.to(lb, {
    clipPath: `circle(0% at ${ox} ${oy})`,
    duration: .48, delay: .05, ease: 'power3.in',
    onComplete() {
      lb.classList.remove('lb-open');
      document.body.style.overflow = '';
      /* reset for next open */
      gsap.set(lb, { clipPath: 'circle(0% at 50% 50%)' });
      const lbImg = $('#v27-lightbox-img');
      const lbStage = $('#v27-lb-stage');
      if (lbImg) { gsap.set(lbImg, { xPercent: 0, opacity: 1 }); }
      if (lbStage) { gsap.set(lbStage, { opacity: 1, scale: 1 }); }
    }
  });
}

function initLightbox() {
  const lb      = $('#v27-lightbox');
  const lbClose = $('#v27-lightbox-close');
  const lbPrev  = $('#v27-lb-prev');
  const lbNext  = $('#v27-lb-next');
  if (!lb) return;

  /* close on backdrop click */
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });
  lbClose && lbClose.addEventListener('click', closeLightbox);

  lbPrev && lbPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    _slideTo(lbIndex - 1);
  });
  lbNext && lbNext.addEventListener('click', (e) => {
    e.stopPropagation();
    _slideTo(lbIndex + 1);
  });

  /* keyboard */
  document.addEventListener('keydown', (e) => {
    if (!lbIsOpen) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  _slideTo(lbIndex - 1);
    if (e.key === 'ArrowRight') _slideTo(lbIndex + 1);
  });

  /* touch swipe */
  let touchStartX = 0;
  lb.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 60) _slideTo(lbIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

/* Vanilla port of React Bits <DotGrid /> — proximity color shift,
   inertia push on fast mouse moves, click shockwave, elastic return */
function initDotGrid(wrap) {
  const CFG = {
    dotSize: 4,
    gap: 22,
    baseColor: '#C8BCAE',
    activeColor: '#A8906E',
    proximity: 100,
    speedTrigger: 80,
    shockRadius: 220,
    shockStrength: 4,
    maxSpeed: 5000,
    resistance: 850,
    returnDuration: 1.4,
  };
  const hasInertia = !!(window.InertiaPlugin);

  const hexToRgb = (hex) => {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 0, g: 0, b: 0 };
  };
  const baseRgb = hexToRgb(CFG.baseColor);
  const activeRgb = hexToRgb(CFG.activeColor);

  const canvas = document.createElement('canvas');
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const circlePath = new Path2D();
  circlePath.arc(0, 0, CFG.dotSize / 2, 0, Math.PI * 2);

  let dots = [];
  const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, speed: 0, lastTime: 0, lastX: 0, lastY: 0 };

  function buildGrid() {
    const { width, height } = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cell = CFG.dotSize + CFG.gap;
    const cols = Math.floor((width + CFG.gap) / cell);
    const rows = Math.floor((height + CFG.gap) / cell);
    const startX = (width - (cell * cols - CFG.gap)) / 2 + CFG.dotSize / 2;
    const startY = (height - (cell * rows - CFG.gap)) / 2 + CFG.dotSize / 2;

    dots = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        dots.push({ cx: startX + x * cell, cy: startY + y * cell, xOffset: 0, yOffset: 0, _inertiaApplied: false });
  }

  const proxSq = CFG.proximity * CFG.proximity;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { x: px, y: py } = pointer;
    for (const dot of dots) {
      const ox = dot.cx + dot.xOffset;
      const oy = dot.cy + dot.yOffset;
      const dx = dot.cx - px;
      const dy = dot.cy - py;
      const dsq = dx * dx + dy * dy;

      let fill = CFG.baseColor;
      if (dsq <= proxSq) {
        const t = 1 - Math.sqrt(dsq) / CFG.proximity;
        const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
        const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
        const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
        fill = `rgb(${r},${g},${b})`;
      }

      ctx.save();
      ctx.translate(ox, oy);
      ctx.fillStyle = fill;
      ctx.fill(circlePath);
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }

  /* spring the dot back home after a push */
  const springBack = (dot) => {
    gsap.to(dot, {
      xOffset: 0, yOffset: 0,
      duration: CFG.returnDuration, ease: 'elastic.out(1,0.75)',
      onComplete: () => { dot._inertiaApplied = false; },
    });
  };
  const push = (dot, pushX, pushY) => {
    dot._inertiaApplied = true;
    gsap.killTweensOf(dot);
    if (hasInertia) {
      gsap.to(dot, {
        inertia: { xOffset: pushX, yOffset: pushY, resistance: CFG.resistance },
        onComplete: () => springBack(dot),
      });
    } else {
      gsap.to(dot, {
        xOffset: pushX * 0.4, yOffset: pushY * 0.4,
        duration: .25, ease: 'power2.out',
        onComplete: () => springBack(dot),
      });
    }
  };

  const throttle = (fn, limit) => {
    let last = 0;
    return function (...args) {
      const now = performance.now();
      if (now - last >= limit) { last = now; fn.apply(this, args); }
    };
  };

  const onMove = (e) => {
    const now = performance.now();
    const dt = pointer.lastTime ? now - pointer.lastTime : 16;
    let vx = ((e.clientX - pointer.lastX) / dt) * 1000;
    let vy = ((e.clientY - pointer.lastY) / dt) * 1000;
    let speed = Math.hypot(vx, vy);
    if (speed > CFG.maxSpeed) {
      const s = CFG.maxSpeed / speed;
      vx *= s; vy *= s; speed = CFG.maxSpeed;
    }
    pointer.lastTime = now; pointer.lastX = e.clientX; pointer.lastY = e.clientY;
    pointer.vx = vx; pointer.vy = vy; pointer.speed = speed;

    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;

    for (const dot of dots) {
      const dist = Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y);
      if (speed > CFG.speedTrigger && dist < CFG.proximity && !dot._inertiaApplied) {
        push(dot, dot.cx - pointer.x + vx * 0.005, dot.cy - pointer.y + vy * 0.005);
      }
    }
  };

  const onClick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    for (const dot of dots) {
      const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
      if (dist < CFG.shockRadius && !dot._inertiaApplied) {
        const falloff = Math.max(0, 1 - dist / CFG.shockRadius);
        push(dot, (dot.cx - cx) * CFG.shockStrength * falloff, (dot.cy - cy) * CFG.shockStrength * falloff);
      }
    }
  };

  window.addEventListener('mousemove', throttle(onMove, 50), { passive: true });
  window.addEventListener('click', onClick);
  window.addEventListener('resize', buildGrid);
  buildGrid();
  draw();   /* paints immediately, then self-schedules via rAF */
}

function initBrand() {
  const grid = $('#v27-eg-grid');
  if (!grid) return;

  const items = EXT_SLIDES.map(s => ({ image: s.src, text: s.label }));
  lbItems = items;

  ScrollTrigger.create({
    trigger: '#exterior-gallery', start: 'top 85%', once: true,
    onEnter() {
      gsap.from('#eg-h2', { opacity: 0, y: 24, duration: .8, ease: 'power3.out' });
      gsap.from('.eg-eyebrow', { opacity: 0, y: 12, duration: .6, ease: 'power2.out' });
    }
  });

  /* Edge gallery — 2-col grid, cards sweep in from alternating sides
     while the photo settles from a slight zoom (landing page style) */
  items.forEach((it, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'v27-eg-card';
    card.setAttribute('aria-label', it.text);
    card.dataset.cursorLabel = 'View';

    const img = document.createElement('img');
    img.src = it.image;
    img.alt = it.text;
    img.draggable = false;
    card.appendChild(img);

    const tag = document.createElement('span');
    tag.className = 'v27-eg-tag';
    tag.textContent = it.text;
    card.appendChild(tag);

    card.addEventListener('click', (e) => openLightbox(i, e.clientX, e.clientY));
    grid.appendChild(card);

    const fromLeft = i % 2 === 0;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: 'top 85%', once: true },
    });
    tl.fromTo(card,
      { xPercent: fromLeft ? -46 : 46, rotation: fromLeft ? -7 : 7, opacity: 0, transformOrigin: '50% 50%' },
      { xPercent: 0, rotation: 0, opacity: 1, duration: 1.3, ease: 'power3.out' },
      0
    );
    tl.fromTo(img,
      { scale: 1.16 },
      { scale: 1, duration: 1.4, ease: 'power3.out', onComplete: () => gsap.set(img, { clearProps: 'transform' }) },
      0
    );
  });
}

/* ══════════════════════════════════════════════════════════
   5.  ABOUT VIDEO SECTION
══════════════════════════════════════════════════════════ */
function initAbout() {
  const card = $('#v27-video-card');
  if (!card) return;

  /* Initial small state (pill) */
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const startW  = Math.min(360, vw * .5);
  const startH  = startW * .62;
  const startTop  = vh * .08;
  const startLeft = vw * .5 - startW / 2;

  card.style.cssText = `width:${startW}px;height:${startH}px;top:${startTop}px;left:${startLeft}px;border-radius:24px`;

  ScrollTrigger.create({
    trigger: '#v27-about',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate(self) {
      const p = self.progress;
      const w  = lerp(startW, vw, p);
      const h  = lerp(startH, vh, p);
      const t  = lerp(startTop, 0, p);
      const l  = lerp(startLeft, 0, p);
      const br = lerp(24, 0, p);
      card.style.width        = w + 'px';
      card.style.height       = h + 'px';
      card.style.top          = t + 'px';
      card.style.left         = l + 'px';
      card.style.borderRadius = br + 'px';
    }
  });

  /* Text reveal */
  ScrollTrigger.create({
    trigger: '#v27-about',
    start: 'top 60%',
    once: true,
    onEnter() {
      gsap.from('#v27-about-h2 .line-inner', { yPercent: 100, stagger: .1, duration: .9, ease: 'power3.out' });
      gsap.from('#v27-about-stats > div', { opacity: 0, y: 20, stagger: .12, duration: .7, delay: .4 });
    }
  });
}

/* ══════════════════════════════════════════════════════════
   6.  GALLERY LIGHTBOX
══════════════════════════════════════════════════════════ */
function initGallery() {
  if (!document.querySelector('.v27-gallery-item')) return;
  /* Gallery images feed into the shared lightbox */
  const galleryImgs = $$('.v27-gallery-item img').map(img => ({ image: img.src, text: img.alt }));

  $$('.v27-gallery-item').forEach((item, i) => {
    item.addEventListener('click', () => {
      lbItems = galleryImgs;
      openLightbox(i);
    });
  });

  /* Gallery items reveal */
  ScrollTrigger.create({
    trigger: '#v27-gallery',
    start: 'top 75%',
    once: true,
    onEnter() {
      gsap.from('.v27-gallery-item', { opacity: 0, y: 30, stagger: .08, duration: .7, ease: 'power2.out' });
    }
  });
}

/* ══════════════════════════════════════════════════════════
   7.  MARQUEE
══════════════════════════════════════════════════════════ */
function initMarquee() {
  const itemsA = ['iCAUR V27', '·', '500km Range', '·', 'Ultra-Fast Charge', '·', '5.9s 0-100', '·', 'Level 3 Autonomy', '·'];
  const itemsB = ['Flagship EV', '·', 'Made in UAE', '·', 'Flagship Design', '·', '9 Airbags', '·', 'OTA Updates', '·'];
  const itemsC = ["Egypt's First EV", '·', 'iCAUR V27', '·', '449 HP', '·', '500 KM Range', '·', '5.9s 0-100', '·'];
  const itemsD = ['iCAUR V27', '·', '449 HP', '·', '500 KM Range', '·', '5.9s 0-100', '·', 'All-Wheel Drive', '·'];

  function fillTrack(id, items) {
    const track = $(`#${id}`);
    if (!track) return;
    const doubled = [...items, ...items];
    track.innerHTML = doubled.map(t => `<span class="v27-marquee-item">${t}</span>`).join('');
  }

  fillTrack('v27-mq-a', itemsA);
  fillTrack('v27-mq-b', itemsB);
  fillTrack('v27-mq-c', itemsC);
  fillTrack('v27-mq-d', itemsD);
}

/* ══════════════════════════════════════════════════════════
   8.  INTERIOR CAROUSEL
══════════════════════════════════════════════════════════ */
const SLIDES = [
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam025.webp', label: 'Overview',
    hotspots: [
      { x: '38%', y: '22%', title: 'Panoramic Sunroof', desc: 'Tinted electrochromic glass dims on demand.', img: '/assets/images/v27/interior-sunroof.webp' },
      { x: '52%', y: '44%', title: 'Central Display',  desc: '34" curved AMOLED, 2880×1080 resolution.',  img: '/assets/images/v27/interior-display.webp' },
      { x: '30%', y: '62%', title: 'Centre Console',   desc: 'Floating console with wireless charging.',    img: '/assets/images/v27/interior-console.webp' },
      { x: '18%', y: '54%', title: 'Nappa Leather',    desc: 'Perforated semi-aniline hide with massage.', img: '/assets/images/v27/interior-leather.webp' },
    ]
  },
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam026 copy.webp', label: 'Front Cabin' },
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam027 copy.webp', label: 'Rear Seats' },
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam028 copy.webp', label: 'Console' },
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam033 copy.webp', label: 'Rear Cabin' },
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam0301 copy.webp', label: 'Detailing' },
  { src: '/assets/images/v27/interior-display.webp', label: 'Central Display' },
  { src: '/assets/images/v27/interior-leather.webp', label: 'Nappa Leather' },
  { src: '/assets/images/v27/interior-sunroof.webp', label: 'Panoramic Roof' },
  { src: '/assets/images/v27/interior-console.webp', label: 'Wireless Charging' },
  { src: '/assets/images/v27/interior-01.webp', label: 'Cabin Ambience' },
];

const PEEK = 72;
const GAP  = 10;

let carouselCur  = 0;
let carouselTrackEl = null;

function initCarousel() {
  const track   = $('#v27-carousel-track');
  const outer   = $('#v27-carousel-outer');
  if (!track || !outer) return;
  carouselTrackEl = track;

  SLIDES.forEach((slide, i) => {
    const el = document.createElement('div');
    el.className = 'v27-carousel-slide';
    el.dataset.index = i;

    const img = document.createElement('img');
    img.src = slide.src;
    img.alt = slide.label;
    img.loading = i === 0 ? 'eager' : 'lazy';
    el.appendChild(img);

    const vign = document.createElement('div');
    vign.className = 'v27-carousel-vignette';
    el.appendChild(vign);

    const lbl = document.createElement('div');
    lbl.className = 'v27-carousel-slide-label';
    lbl.textContent = slide.label;
    el.appendChild(lbl);

    /* Hotspots */
    if (slide.hotspots) {
      slide.hotspots.forEach((hs, hi) => {
        const dot = document.createElement('div');
        dot.className = 'v27-hotspot';
        dot.style.left = hs.x;
        dot.style.top  = hs.y;

        const ping = document.createElement('div');
        ping.className = 'v27-hotspot-ping';
        const dotBtn = document.createElement('div');
        dotBtn.className = 'v27-hotspot-dot';
        dotBtn.setAttribute('role', 'button');
        dotBtn.setAttribute('tabindex', '0');
        dotBtn.setAttribute('aria-label', hs.title);

        dot.appendChild(ping);
        dot.appendChild(dotBtn);
        el.appendChild(dot);

        /* Annotation card */
        const card = buildAnnotCard(hs, dot, dotBtn);
        el.appendChild(card);
      });
    }

    track.appendChild(el);
  });

  setSlideWidths();
  goTo(0, false);

  $('#v27-arrow-prev').addEventListener('click', () => goTo(carouselCur - 1));
  $('#v27-arrow-next').addEventListener('click', () => goTo(carouselCur + 1));

  window.addEventListener('resize', setSlideWidths);

  /* Head reveal */
  ScrollTrigger.create({
    trigger: '#v27-interior', start: 'top 75%', once: true,
    onEnter() { gsap.to('#v27-interior-head', { opacity: 1, y: 0, duration: .7 }); }
  });
}

function buildAnnotCard(hs, dotWrap, dotBtn) {
  const card = document.createElement('div');
  card.className = 'v27-annot-card';
  card.style.cssText = 'opacity:0;transform:scale(.88);pointer-events:none;';

  /* Position: right of hotspot unless near right edge */
  const pctX = parseFloat(hs.x);
  card.style.top = hs.y;
  if (pctX > 65) {
    card.style.right = (100 - pctX + 2) + '%';
  } else {
    card.style.left = (pctX + 3) + '%';
  }

  const img = document.createElement('img');
  img.src = hs.img || '';
  img.alt = hs.title;
  card.appendChild(img);

  const body = document.createElement('div');
  body.className = 'v27-annot-body';
  body.innerHTML = `<div class="v27-annot-title">${hs.title}</div><div class="v27-annot-desc">${hs.desc}</div>`;
  card.appendChild(body);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'v27-annot-close';
  closeBtn.innerHTML = '&#x2715;';
  card.appendChild(closeBtn);

  let open = false;
  function toggleCard() {
    open = !open;
    dotBtn.classList.toggle('active', open);
    gsap.to(card, { opacity: open ? 1 : 0, scale: open ? 1 : .88, duration: .32, ease: 'back.out(1.4)' });
    card.style.pointerEvents = open ? 'all' : 'none';
  }

  dotBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleCard(); });
  dotBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(); } });
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); if (open) toggleCard(); });

  return card;
}

function setSlideWidths() {
  const outer = $('#v27-carousel-outer');
  if (!outer || !carouselTrackEl) return;
  const outerW = outer.offsetWidth;
  const slideW = outerW - 2 * (PEEK + GAP);
  $$('#v27-carousel-track .v27-carousel-slide').forEach(s => {
    s.style.width = slideW + 'px';
    s.style.flexShrink = '0';
  });
  goTo(carouselCur, false);
}

function goTo(idx, animate = true) {
  const n = SLIDES.length;
  carouselCur = Math.max(0, Math.min(idx, n - 1));
  const outer  = $('#v27-carousel-outer');
  if (!outer || !carouselTrackEl) return;
  const outerW = outer.offsetWidth;
  const slideW = outerW - 2 * (PEEK + GAP);
  const offsetX = PEEK + GAP - carouselCur * (slideW + GAP);

  if (animate) {
    gsap.to(carouselTrackEl, { x: offsetX, duration: .6, ease: 'power3.out' });
  } else {
    gsap.set(carouselTrackEl, { x: offsetX });
  }

  $$('#v27-carousel-track .v27-carousel-slide').forEach((s, i) => {
    const isCur  = i === carouselCur;
    gsap.to(s, { opacity: isCur ? 1 : 0.55, scale: isCur ? 1 : 0.93, duration: .4, ease: 'power2.out' });
  });
}

/* ══════════════════════════════════════════════════════════
   9.  TECH — CarTechSection port (sticky fluid bg + scroll items)
══════════════════════════════════════════════════════════ */
function initTech() {
  const section = $('#v27-tech');
  if (!section) return;

  /* ── LiquidEther fluid background (lazy-loaded) ── */
  const liquidBg = $('#v27-ct-liquid-bg');
  if (liquidBg) {
    import('/js/liquid-ether.js').then(({ createLiquidEther }) => {
      createLiquidEther(liquidBg, {
        colors: ['#2A1810', '#231815', '#015699', '#555859', '#E8D5CC'],
        mouseForce: 20,
        cursorSize: 150,
        resolution: 0.4,
        iterationsPoisson: 16,
        iterationsViscous: 16,
        dt: 0.012,
        autoDemo: true,
        autoSpeed: 0.2,
        autoIntensity: 1.6,
        autoResumeDelay: 2500,
        autoRampDuration: 1.4,
        takeoverDuration: 0.5,
      });
    }).catch(() => { /* WebGL not supported — silently skip */ });
  }

  /* ── Headline mask-reveal animation ── */
  const headEl = $('#v27-ct-head');
  if (headEl) {
    gsap.set(['#v27-ct-line1', '#v27-ct-line2', '#v27-ct-sub'], { opacity: 0 });
    gsap.set('#v27-ct-mask1', { x: '-101%', background: '#0D0B09' });
    gsap.set('#v27-ct-mask2', { x: '101%',  background: '#555859' });

    ScrollTrigger.create({
      trigger: headEl, start: 'top 80%', once: true,
      onEnter() {
        const tl = gsap.timeline();
        tl.from('#v27-ct-eyebrow', { opacity: 0, y: 10, duration: .3, ease: 'power2.out' })
          .to('#v27-ct-mask1',  { x: '0%',    duration: .28, ease: 'power2.in' }, '-=0.05')
          .set('#v27-ct-line1', { opacity: 1 })
          .to('#v27-ct-mask1',  { x: '101%',  duration: .28, ease: 'power2.out' })
          .to('#v27-ct-mask2',  { x: '0%',    duration: .28, ease: 'power2.in' }, '-=0.18')
          .set('#v27-ct-line2', { opacity: 1 })
          .to('#v27-ct-mask2',  { x: '-101%', duration: .28, ease: 'power2.out' })
          .to('#v27-ct-sub',    { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, '-=0.1');
      }
    });
  }

  /* ── Per-item scroll animations ── */
  $$('.v27-ct-item').forEach((item) => {
    const img   = item.querySelector('.v27-ct-img');
    const left  = item.querySelector('.v27-ct-left');
    const right = item.querySelector('.v27-ct-right');
    const rotate = parseFloat(item.dataset.rotate) || 0;
    if (!img) return;

    /* Image: rotate + parallax across full scroll span */
    ScrollTrigger.create({
      trigger: item, start: 'top bottom', end: 'bottom top', scrub: 1.2,
      onUpdate({ progress: p }) {
        const ep = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
        const rot = rotate * (1 - ep * 2);
        const scl = Math.min(0.88 + ep * (1 - ep) * 0.48 + (p > 0.5 ? 0.12 : 0), 1.02);
        const yShift = (0.5 - p) * 80;
        gsap.set(img, { rotate: rot, scale: scl, y: yShift });
      }
    });

    /* Text panels: slide in as image reaches center */
    if (left && right) {
      gsap.timeline({
        scrollTrigger: {
          trigger: item, start: 'top 70%', end: 'center 40%', scrub: 0.9,
        }
      }).fromTo([left, right],
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, stagger: 0.05 }
      );
    }
  });
}

/* ══════════════════════════════════════════════════════════
   10. SAFETY — hover-image list (port of SafetySection.jsx)
══════════════════════════════════════════════════════════ */
function initSafety() {
  const section    = $('#v27-safety');
  const imgWrap    = $('#v27-sf-img-wrap');
  const defaultImg = $('#v27-sf-default-img');
  const featImgs   = $$('.v27-sf-feat-img');
  const rows       = $$('.v27-sf-row');
  const list       = $('#v27-sf-list');
  const main       = $('#v27-sf-main');
  const h2         = $('#v27-sf-h2');
  if (!section) return;

  let activeIdx = -1; // -1 = default showing

  /* ── Scroll: rows stagger in + h2 line-reveal ── */
  ScrollTrigger.create({
    trigger: section, start: 'top 72%', once: true,
    onEnter() {
      /* Heading line-clip reveal */
      if (h2) {
        gsap.fromTo(h2.querySelectorAll('.line-inner'),
          { yPercent: 108, skewX: 3 },
          { yPercent: 0, skewX: 0, duration: .95, ease: 'power4.out', stagger: .10 }
        );
      }
      /* Row stagger */
      gsap.to(rows, { opacity: 1, y: 0, duration: .65, ease: 'power3.out', stagger: .07, delay: .1 });
    }
  });

  /* ── Hover helpers ── */
  function showFeature(idx) {
    if (activeIdx === idx) return;

    /* Fade out default if it's showing */
    if (activeIdx === -1 && defaultImg) {
      gsap.to(defaultImg, { opacity: 0, duration: .28, ease: 'power2.in' });
    }
    /* Fade out previous feature */
    if (activeIdx >= 0 && featImgs[activeIdx]) {
      gsap.to(featImgs[activeIdx], { opacity: 0, duration: .28, ease: 'power2.in' });
    }
    /* Fade in new feature */
    if (featImgs[idx]) {
      gsap.fromTo(featImgs[idx],
        { opacity: 0, scale: 1.08 },
        { opacity: 1, scale: 1, duration: .55, ease: 'power3.out' }
      );
    }
    activeIdx = idx;
  }

  function showDefault() {
    if (activeIdx >= 0 && featImgs[activeIdx]) {
      gsap.to(featImgs[activeIdx], { opacity: 0, duration: .32, ease: 'power2.in' });
    }
    if (defaultImg) {
      gsap.fromTo(defaultImg,
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: .55, ease: 'power3.out' }
      );
    }
    if (imgWrap) gsap.to(imgWrap, { y: 0, duration: .5, ease: 'power3.out' });
    activeIdx = -1;
  }

  /* ── Row mouse events ── */
  rows.forEach((row) => {
    const idx = parseInt(row.dataset.idx, 10);

    row.addEventListener('mouseenter', () => {
      /* Nudge image wrap to align with this row */
      if (imgWrap && main) {
        const rowR  = row.getBoundingClientRect();
        const mainR = main.getBoundingClientRect();
        const rowCenterY = rowR.top + rowR.height / 2 - mainR.top;
        const targetY = Math.max(0, Math.min(
          rowCenterY - imgWrap.offsetHeight / 2,
          mainR.height - imgWrap.offsetHeight
        ));
        gsap.to(imgWrap, { y: targetY, duration: .5, ease: 'power3.out' });
      }
      showFeature(idx);
      row.classList.add('is-on');
    });

    row.addEventListener('mouseleave', () => {
      row.classList.remove('is-on');
    });
  });

  /* Reset when cursor leaves the whole list */
  if (list) list.addEventListener('mouseleave', showDefault);
}

/* ══════════════════════════════════════════════════════════
   11. CHARGING SLIDER
══════════════════════════════════════════════════════════ */
function initCharging() {
  const track   = $('#v27-charge-track');
  const fill    = $('#v27-charge-fill');
  const thumb   = $('#v27-charge-thumb');
  const tooltip = $('#v27-charge-tooltip');
  const timeEl  = $('#v27-charge-time');
  const rangeEl = $('#v27-charge-range');
  const section = $('#v27-charging');
  if (!track) return;

  let pct = 20;
  let dragging = false;

  /* Background: white immediately on entry, complete by 80% scroll progress */
  const setChargingColors = (t) => {
    const bg = interpolateColor('#1A1A1A', '#FFFFFF', Math.min(t / 0.8, 1));
    section.style.background = bg;
    const dark = t >= 0.8;
    section.style.setProperty('--charge-fg', dark ? '#0A0A0A' : '#FFFFFF');
    /* eyebrow stays brand orange in both themes */
    $$('.v27-charging-intro, .v27-charge-stat-label', section).forEach(el => {
      el.style.color = dark ? 'rgba(10,10,10,.55)' : 'rgba(255,255,255,.55)';
    });
    $$('.v27-charge-stat-val', section).forEach(el => {
      el.style.color = dark ? '#0A0A0A' : '#FFFFFF';
    });
    $$('.v27-charging-h2', section).forEach(el => {
      el.style.color = dark ? '#0A0A0A' : '#FFFFFF';
    });
  };

  /* Initialise to white immediately */
  setChargingColors(1);

  ScrollTrigger.create({
    trigger: section,
    start: 'top 80%',
    end: 'top 20%',
    scrub: .5,
    onUpdate(self) { setChargingColors(self.progress); },
    onEnter()      { setChargingColors(1); },
    onEnterBack()  { setChargingColors(1); },
  });

  function updateSlider(newPct) {
    pct = Math.max(1, Math.min(100, newPct));
    fill.style.width  = pct + '%';
    thumb.style.left  = pct + '%';
    tooltip.style.left = pct + '%';
    tooltip.textContent = Math.round(pct) + '%';

    const time  = pct <= 80 ? Math.round((pct / 80) * 30) : 30;
    const range = Math.round(pct * 4.5);
    timeEl.innerHTML  = time  + '<span class="v27-charge-stat-unit">min</span>';
    rangeEl.innerHTML = range + '<span class="v27-charge-stat-unit">km</span>';
  }

  function getPct(e) {
    const rect = track.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return Math.max(1, Math.min(100, (x / rect.width) * 100));
  }

  track.addEventListener('mousedown',  e => { dragging = true; updateSlider(getPct(e)); });
  track.addEventListener('touchstart', e => { dragging = true; updateSlider(getPct(e)); }, { passive: true });
  window.addEventListener('mousemove',  e => { if (dragging) updateSlider(getPct(e)); });
  window.addEventListener('touchmove',  e => { if (dragging) updateSlider(getPct(e)); }, { passive: true });
  window.addEventListener('mouseup',   () => { dragging = false; });
  window.addEventListener('touchend',  () => { dragging = false; });

  updateSlider(20);

  /* Animate to 80% when section enters viewport */
  ScrollTrigger.create({
    trigger: section,
    start: 'top 75%',
    once: true,
    onEnter() {
      const proxy = { val: 20 };
      gsap.to(proxy, {
        val: 80,
        duration: 1.8,
        ease: 'power2.out',
        delay: 0.2,
        onUpdate() { updateSlider(proxy.val); },
      });
    },
  });
}

function interpolateColor(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1,3),16), g1 = parseInt(hex1.slice(3,5),16), b1 = parseInt(hex1.slice(5,7),16);
  const r2 = parseInt(hex2.slice(1,3),16), g2 = parseInt(hex2.slice(3,5),16), b2 = parseInt(hex2.slice(5,7),16);
  const r = Math.round(r1 + (r2-r1)*t);
  const g = Math.round(g1 + (g2-g1)*t);
  const b = Math.round(b1 + (b2-b1)*t);
  return `rgb(${r},${g},${b})`;
}

/* Trims section removed (hidden on the landing page too) */

/* ══════════════════════════════════════════════════════════
   13. RESERVE SECTION
══════════════════════════════════════════════════════════ */
function initReserve() {
  if (!document.getElementById('v27-reserve')) return;
  ScrollTrigger.create({
    trigger: '#v27-reserve', start: 'top 70%', once: true,
    onEnter() {
      gsap.from('#v27-reserve .cta-split__h', { opacity: 0, y: 30, duration: .8, stagger: .1, ease: 'power3.out' });
      gsap.from('#v27-reserve .btn', { opacity: 0, y: 20, duration: .6, stagger: .1, delay: .35 });
    }
  });
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
function init() {
  initScene();
  initHeroEntrance();
  initHeroParticles();
  initExterior();
  initLightbox();
  initBrand();
  initAbout();
  initGallery();
  initMarquee();
  initCarousel();
  initTech();
  initSafety();
  initCharging();
  initReserve();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
