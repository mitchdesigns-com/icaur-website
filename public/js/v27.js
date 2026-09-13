/* ═══════════════════════════════════════════════════════════
   iCAUR V27 — 3D Landing Page (vanilla JS module)
   Three.js via importmap  +  GSAP / ScrollTrigger via CDN
   ═══════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'meshopt_decoder';

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
/* Mostly front view with just a hint of the left side (very slight
   angle), centered in the hero over the road's speed lines;
   pushed up to close the gap below the text */
const HERO_POSE     = { rotY: -0.30, posX:  0.35, posY:  1.35, scale: 1.42 };
/* 360 stage: front-left quarter — same angle as the color swatch
   thumbnails — sitting lower, closer to the swatch row */
const SIDE_POSE     = { rotY: -0.78, posX:  0.2,  posY:  1.55, scale: 1.12 };

const isNarrow  = () => window.innerWidth <= 768;
const sidePose  = () => isNarrow()
  ? { rotY: SIDE_POSE.rotY, posX: 0.25, posY: 1.85, scale: 0.72 }
  : SIDE_POSE;

/* Smooth scroll-driven rotation target (drag is additive on top) */
let scrollBaseRotY  = HERO_POSE.rotY;
let dragExtraRot    = 0;
let smoothRotY      = HERO_POSE.rotY; /* what the render loop lerps toward */

const CAM = { fov: 50, x: 0.2, y: 3.8, z: 9.2 };

/* Yaw the car is baked at inside the GLB (radians, world-frame when the
   group's own rotation is 0). Measured off the wheel hubs in prepModel. */
let modelYaw = 0;

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
let refBox = null;       /* first-loaded bbox — variants are normalized to it */
let activeColor = 'carbon-black';
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
  const wheels = [];
  scene.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; }
    if (CLOSE_PANELS.has(o.name)) {
      o.position.set(0, 0, 0);
      o.quaternion.set(0, 0, 0, 1);
      o.scale.set(1, 1, 1);
    }
    if (/^Wheel_(FL|FR|BL|BR)$/.test(o.name)) wheels.push(o);
  });

  /* Wheels: the Wheel_* groups pivot at the model ORIGIN, so rotating
     them swings the tires around the car. Instead, wrap each rim/tire
     part in a pivot at its own hub center and spin that (calipers and
     other wheel hardware stay still). The thin bbox axis is the axle. */
  scene.updateMatrixWorld(true);
  const spinners = [];
  wheels.forEach((grp) => {
    [...grp.children].forEach((part) => {
      if (!/tire|rim/i.test(part.name)) return;
      const box = new THREE.Box3().setFromObject(part);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const pivot = new THREE.Object3D();
      pivot.userData.axis = size.x < size.z ? 'x' : 'z';
      grp.add(pivot);
      pivot.position.copy(grp.worldToLocal(center.clone()));
      pivot.updateMatrixWorld(true);
      pivot.attach(part);
      spinners.push(pivot);
    });
  });

  scene.userData.spinners = spinners;

  /* Longitudinal axis of the model, measured from the wheel hubs. The GLB
     is authored at its own baked yaw, so this is the only honest way to
     know which way the car actually points — the road layer needs it to
     lay its lanes parallel to the car instead of to the world axes. */
  const hubMid = (re) => {
    const g = wheels.filter((w) => re.test(w.name));
    if (!g.length) return null;
    const c = new THREE.Vector3();
    g.forEach((w) => c.add(new THREE.Box3().setFromObject(w).getCenter(new THREE.Vector3())));
    return c.divideScalar(g.length);
  };
  const front = hubMid(/^Wheel_F/), back = hubMid(/^Wheel_B/);
  if (front && back) modelYaw = Math.atan2(front.x - back.x, front.z - back.z);
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

  const camera = new THREE.PerspectiveCamera(CAM.fov, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(CAM.x, CAM.y, CAM.z);

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

  loadGlb(CAR_COLORS[activeColor]).then((body) => {
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
       page) so swaps are instant. A short delay lets the DEFAULT model
       paint first before the ~5MB variants compete for bandwidth. */
    setTimeout(() => {
      Object.keys(CAR_COLORS).forEach((k) => { if (k !== activeColor) loadGlb(CAR_COLORS[k]); });
    }, 600);
  }).catch((err) => console.warn('GLB load error:', err));

  /* Resize */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* Render loop — smooth lerp rotation so drag and scroll never snap */
  let lastFrameT = performance.now();
  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - lastFrameT) / 1000, 0.05);
    lastFrameT = now;
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

  /* The Overview owns no car any more (it is a photo scene). The canvas
     bows out while that scene is on stage and returns for the 360: fade
     out across the scene's arrival, fade back in as the 360 arrives with
     the model rising into its side pose. The ranges cannot overlap — the
     fade-out ends before the overview pins, the fade-in starts where the
     overview's runway ends. */
  const wrap = $('#v27-canvas-wrap');
  ScrollTrigger.create({
    trigger: '#v27-overview', start: 'top 85%', end: 'top 25%', scrub: true,
    onUpdate(self) { if (wrap) wrap.style.opacity = (1 - self.progress).toFixed(3); },
  });
  ScrollTrigger.create({
    trigger: '#v27-exterior', start: 'top bottom', end: 'top 35%', scrub: 1.2,
    onUpdate(self) {
      const p = self.progress;
      if (wrap) wrap.style.opacity = p.toFixed(3);
      if (!car) return;
      const B = sidePose();
      scrollBaseRotY = B.rotY + (1 - p) * 0.9;      /* settles with a small turn */
      car.position.x = B.posX;
      car.position.y = B.posY - (1 - p) * 3.4;      /* rises up into the stage */
      car.scale.setScalar(B.scale * (0.85 + 0.15 * p));
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

  /* Past the 360 stage: the car scrolls OUT with the section instead of
     staying fixed over the next content. Measured live on every scroll
     frame against the sticky's real unpin point — the car holds still
     while the section is pinned, then rides up in exact lockstep with
     it (immune to stale cached trigger positions from layout shifts). */
  const extSection = document.querySelector('#v27-exterior');
  const extSticky  = extSection && extSection.querySelector('.v27-ext-sticky');
  if (extSection && extSticky) {
    let riding = false;
    const ride = () => {
      riding = false;
      const wrap = $('#v27-canvas-wrap');
      if (!wrap) return;
      const off = Math.min(0, extSection.getBoundingClientRect().bottom - extSticky.offsetHeight);
      wrap.style.transform = `translateY(calc(-9vh + ${off.toFixed(1)}px))`;
    };
    const queueRide = () => { if (!riding) { riding = true; requestAnimationFrame(ride); } };
    window.addEventListener('scroll', queueRide, { passive: true });
    window.addEventListener('resize', queueRide, { passive: true });
    ride();
  }
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
  /* The brand arrow is the cursor everywhere, so this surface no longer
     swaps in native grab/grabbing — those would replace it on hover. */
  const extWin = $('.v27-ext-window');
  if (extWin) extWin.style.cursor = 'none';
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
   3.  360 EXPERIENCE — swatches + drag setup
══════════════════════════════════════════════════════════ */
function initExterior() {
  /* DotGrid — fixed behind the 3D car; visible only during the 360 stage.
     Toggled from live geometry each scroll frame (not cached trigger px,
     which drift when the injected nav / late assets shift the layout). */
  const dotWrap = document.querySelector('.eg-dotgrid-wrap');
  const dotExt  = document.querySelector('#v27-exterior');
  if (dotWrap && dotExt) {
    initDotGrid(dotWrap);
    let dotQueued = false;
    const dotUpdate = () => {
      dotQueued = false;
      const r = dotExt.getBoundingClientRect();
      const on = r.top < window.innerHeight * 0.55 && r.bottom > window.innerHeight * 0.45;
      dotWrap.classList.toggle('is-on', on);
    };
    const dotQueue = () => { if (!dotQueued) { dotQueued = true; requestAnimationFrame(dotUpdate); } };
    window.addEventListener('scroll', dotQueue, { passive: true });
    window.addEventListener('resize', dotQueue, { passive: true });
    dotUpdate();
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
    /* The ribbon is set in text-transform: uppercase, which would flatten the
       brand's lowercase i — so the name is wrapped to opt out of the transform
       and keep its lockup casing (see .brand-name in css/styles.css). */
    track.innerHTML = doubled
      .map(t => `<span class="v27-marquee-item">${t.replace(/iCAUR/g, '<span class="brand-name">iCAUR</span>')}</span>`)
      .join('');
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
/* ── Annotation popups ────────────────────────────────────────────────
   Every card registers a controller here so the section can drive them
   as a guided tour: one popup at a time, each holding for ANNOT_DWELL
   before the next opens (opening the next closes the current one).
   Registry is keyed by slide so only the visible slide's tour runs. */
const ANNOT_DWELL = 5000;          /* ms each popup stays open */
const annots      = [];            /* { slide, setOpen(bool) } */
let annotTimer    = null;
let annotAuto     = true;          /* a manual hotspot click hands over control */
let sectionInView = false;

function closeAllAnnots() { annots.forEach(a => a.setOpen(false)); }
function stopAnnotCycle() { clearTimeout(annotTimer); annotTimer = null; }

/* Open the i-th popup of the current slide and queue the next one */
function showAnnot(i) {
  const list = annots.filter(a => a.slide === carouselCur);
  if (!list.length) return;
  const idx = ((i % list.length) + list.length) % list.length;
  list.forEach((a, k) => a.setOpen(k === idx));
  annotTimer = setTimeout(() => showAnnot(idx + 1), ANNOT_DWELL);
}

/* Restart the tour for whatever slide is showing. Only runs while the
   section is actually on screen, so an off-screen carousel stays idle. */
function startAnnotCycle(delay = 700) {
  stopAnnotCycle();
  if (!annotAuto || !sectionInView) return;
  annotTimer = setTimeout(() => showAnnot(0), delay);
}

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
        const card = buildAnnotCard(hs, dot, dotBtn, i);
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

  /* ── Section entrance ──────────────────────────────────────────
     Replays on EVERY entry (both directions), so the section always
     arrives animated rather than only the first time: the header
     lifts, the carousel wipes up while the photo settles out of a
     slow zoom, then the tags and hotspots pop in behind it.
     Nothing here touches slide opacity/scale or the track's x —
     those belong to goTo(), and fighting them would jitter. */
  const enterTl = gsap.timeline({
    paused: true,
    /* the guided tour picks up once everything has landed */
    onComplete: () => startAnnotCycle(400),
  });
  enterTl
    .fromTo('#v27-interior-head',
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: .7, ease: 'power3.out' })
    /* Photo opens as a mask splitting from the centre line — the top and
       bottom halves part together */
    .fromTo('#v27-carousel-outer',
      { clipPath: 'inset(50% 0 50% 0)' },
      { clipPath: 'inset(0% 0 0% 0)', duration: 1.2, ease: 'power3.inOut' }, '-=.42')
    /* img scale is free — goTo() animates the SLIDE's scale, not the photo's */
    .fromTo('#v27-carousel-track img',
      { scale: 1.18 },
      { scale: 1, duration: 1.5, ease: 'power3.out' }, '<')
    .fromTo('.v27-carousel-slide-label',
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: .5, ease: 'power2.out', stagger: .06 }, '-=.75')
    /* xPercent/yPercent restate the CSS translate(-50%,-50%) so GSAP owns
       the whole transform and the dots stay centred on their hotspot */
    .fromTo('.v27-hotspot',
      { opacity: 0, scale: 0, xPercent: -50, yPercent: -50 },
      { opacity: 1, scale: 1, xPercent: -50, yPercent: -50,
        duration: .55, ease: 'back.out(2.2)', stagger: .09 }, '-=.5');

  /* IntersectionObserver rather than ScrollTrigger: this is a plain
     "is the section on screen" toggle, and IO measures live. ScrollTrigger
     caches start/end at refresh time, which on this page (sticky hero +
     pinned 360 stage + late-loading images above) can leave the section
     stuck hidden. Fires on every entry, both directions. */
  const section = $('#v27-interior');
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      sectionInView = e.isIntersecting;
      stopAnnotCycle();
      closeAllAnnots();
      if (e.isIntersecting) {
        annotAuto = true;          /* a fresh visit restarts the tour */
        enterTl.restart();         /* its onComplete starts the cycle */
      } else {
        enterTl.pause(0);
      }
    });
  }, { threshold: 0.15 }).observe(section);
}

function buildAnnotCard(hs, dotWrap, dotBtn, slideIndex) {
  const card = document.createElement('div');
  card.className = 'v27-annot-card';
  card.style.pointerEvents = 'none';

  /* Position: alongside the hotspot — right of it unless near the right
     edge. `top` is the hotspot's own y and yPercent:-50 (kept on every
     tween below) centres the card on the dot, so it sits beside the dot
     rather than hanging below it. */
  const pctX = parseFloat(hs.x);
  const GAP_PCT = 1.5;                 /* horizontal breathing room, % of slide */
  card.style.top = hs.y;
  if (pctX > 65) {
    card.style.right = (100 - pctX + GAP_PCT) + '%';
  } else {
    card.style.left = (pctX + GAP_PCT) + '%';
  }
  gsap.set(card, { opacity: 0, scale: .6, yPercent: -50 });

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

  /* Grow out of the edge nearest its hotspot, so the card reads as
     springing from the dot rather than inflating in place */
  card.style.transformOrigin = pctX > 65 ? 'right center' : 'left center';

  let open = false;
  function setOpen(v) {
    if (v === open) return;
    open = v;
    dotBtn.classList.toggle('active', open);
    card.style.pointerEvents = open ? 'all' : 'none';
    /* yPercent:-50 is restated on every tween so the card stays vertically
       centred on its dot while GSAP owns the transform */
    if (open) {
      gsap.fromTo(card,
        { opacity: 0, scale: .6, y: 8, yPercent: -50 },
        { opacity: 1, scale: 1, y: 0, yPercent: -50, duration: .52, ease: 'back.out(1.9)' });
    } else {
      gsap.to(card, { opacity: 0, scale: .72, y: 6, yPercent: -50, duration: .28, ease: 'power2.in' });
    }
  }

  annots.push({ slide: slideIndex, setOpen });

  /* Any manual interaction hands control to the visitor — the auto tour
     stops rather than yanking their card shut mid-read */
  const manual = () => {
    annotAuto = false;
    stopAnnotCycle();
    if (!open) annots.filter(a => a.slide === slideIndex).forEach(a => a.setOpen(false));
    setOpen(!open);
  };

  dotBtn.addEventListener('click', (e) => { e.stopPropagation(); manual(); });
  dotBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); manual(); } });
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); if (open) manual(); });

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

  /* New slide gets its own tour. startAnnotCycle() no-ops when the section
     is off screen or the visitor has taken manual control. */
  stopAnnotCycle();
  closeAllAnnots();
  startAnnotCycle(600);
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

  /* ── Headline depth scrub: LARGE while the intro is on screen, then
     scales down and blurs over the section's first viewport of scroll,
     so the tech cards sweep over a receding headline. Driven from live
     geometry each scroll frame → perfectly reversible on scroll-up. ── */
  const ctHead = $('#v27-ct-head');
  if (ctHead) {
    ctHead.style.willChange = 'transform, filter';
    let headQueued = false;
    const headScrub = () => {
      headQueued = false;
      const top = section.getBoundingClientRect().top;
      const p = Math.min(Math.max(-top / window.innerHeight, 0), 1);
      const e = 1 - (1 - p) * (1 - p);            /* ease-out: recedes early */
      ctHead.style.transform = `scale(${(1.6 - 0.6 * e).toFixed(4)})`;
      ctHead.style.filter = e > 0.02 ? `blur(${(e * 9).toFixed(2)}px)` : 'none';
    };
    const headQueue = () => { if (!headQueued) { headQueued = true; requestAnimationFrame(headScrub); } };
    window.addEventListener('scroll', headQueue, { passive: true });
    window.addEventListener('resize', headQueue, { passive: true });
    headScrub();
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

  /* ── MOBILE: scroll opens the rows ──────────────────────────────
     No hover on touch, so the row nearest the viewport centre is the
     open one — its copy expands and its own picture slides in beside
     the title (the floating crossfade panel is desktop-only). Row 1
     starts open so the section never reads as a plain list. */
  rows.forEach((row) => {
    const idx = parseInt(row.dataset.idx, 10);
    const src = featImgs[idx] && featImgs[idx].getAttribute('src');
    if (src) row.style.setProperty('--sf-img', `url("${src}")`);
  });
  let sfRaf = null;
  function sfSpot() {
    sfRaf = null;
    if (window.innerWidth > 767) { rows.forEach(r => r.classList.remove('is-scroll-on')); return; }
    const mid = window.innerHeight / 2;
    let best = null, bd = Infinity;
    rows.forEach(r => {
      const c = r.getBoundingClientRect();
      const d = Math.abs(c.top + c.height / 2 - mid);
      if (d < bd) { bd = d; best = r; }
    });
    // nothing near the middle yet → keep the FIRST row open as the default
    if (!best || bd > window.innerHeight * 0.55) best = rows[0];
    rows.forEach(r => r.classList.toggle('is-scroll-on', r === best));
  }
  const onSf = () => { if (!sfRaf) sfRaf = requestAnimationFrame(sfSpot); };
  window.addEventListener('scroll', onSf, { passive: true });
  window.addEventListener('resize', onSf, { passive: true });
  sfSpot();
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

/* 13. RESERVE SECTION — removed. The CTA is now the shared .cta-video
   component (id="cta", same as every other page), so it animates in via
   the site-wide `.reveal reveal--up` observer in main.js like everywhere
   else. The old initReserve() ScrollTrigger here was staggering
   `#v27-reserve .btn` with gsap.from(), which left inline
   translate/rotate/scale/opacity on the buttons and gave this one page a
   visibly different entrance — plus it targeted `.cta-split__h`, a class
   from an older CTA structure that no longer exists in the markup. */

/* ══════════════════════════════════════════════════════════
   OVERVIEW — pinned photo scene (Figma 675-2018 / Scout style)
   One scrub over the section's 430vh runway drives four things:
   1 · the FRAME: a small rounded card centred on the page that
       expands to full bleed (the reference video's entrance)
   2 · the PHOTO: drifts vertically against its frame and eases
       its scale off — the parallax lives the whole ride
   3 · the LEAD copy: eyebrow, then the paragraph opening word by
       word through bottom-up crop masks, then the rule drawing
       and the V27 mark arriving; the block drifts up slowly so
       the type is always moving with the scroll
   4 · the CLOSING copy: same masked open, late, bottom-right —
       the "keep scrolling on the big image" beat — with the
       price and the brochure CTA fading up under it.
   Pure function of progress → fully reversible.
══════════════════════════════════════════════════════════ */
function initOverviewScene() {
  const sec   = document.getElementById('v27-overview');
  const frame = document.getElementById('ovxFrame');
  if (!sec || !frame) return;

  /* LINE masks: measure the paragraph's REAL wrapping (word offsetTop),
     then rebuild it as one overflow-hidden strip per rendered line.

     Two things make this reliable rather than fragile:
       · the copy's max-width is in vw, NOT a % of .ovx-frame — the frame
         animates from (100vw-200px) to 100vw, so a %-based width made the
         measured breaks re-wrap mid-scroll and stacked the paragraph into
         broken half-lines (what the public link showed).
       · measuring waits for document.fonts.ready: measuring against the
         fallback face gives line breaks that are wrong for the real one.
     A ResizeObserver re-measures on any genuine width change. */
  const buildLines = (el) => {
    const text = el.dataset.ovxText || (el.dataset.ovxText = el.textContent.trim());
    el.textContent = '';
    const probes = text.split(/\s+/).map((w, i, arr) => {
      const sp = document.createElement('span');
      sp.textContent = w + (i < arr.length - 1 ? ' ' : '');
      el.appendChild(sp);
      return sp;
    });
    const lines = [];
    let top = null, cur = [];
    probes.forEach((sp) => {
      const t = sp.offsetTop;
      if (top === null) top = t;
      if (Math.abs(t - top) < 3) cur.push(sp.textContent);
      else { lines.push(cur.join('')); cur = [sp.textContent]; top = t; }
    });
    if (cur.length) lines.push(cur.join(''));
    el.textContent = '';
    return lines.map((l) => {
      const m = document.createElement('span'); m.className = 'ovx-line';
      const t = document.createElement('span'); t.className = 'ovx-line__t';
      t.textContent = l.trim(); m.appendChild(t); el.appendChild(m);
      return t;
    });
  };

  const paras = $$('#v27-overview [data-ovx-split]');
  let leadWords  = [];
  let closeWords = [];
  const remeasure = () => {
    if (paras[0]) leadWords  = buildLines(paras[0]);
    if (paras[1]) closeWords = buildLines(paras[1]);
    ScrollTrigger.refresh();
  };
  remeasure();
  /* the real font changes the breaks — rebuild once it is in */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);

  /* width-driven rebuilds only: observing the paragraph itself would fire
     on every reveal (its height changes), so watch a stable ancestor */
  let lastW = window.innerWidth, rebuildT = null;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(rebuildT);
    rebuildT = setTimeout(remeasure, 160);
  }, { passive: true });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const eyebrow = $('.ovx-eyebrow', sec);
  const leadEl  = document.getElementById('ovxLead');
  const closeEl = document.getElementById('ovxClose');
  const late    = [$('.ovx-price', sec), $('.ovx-cta', sec)].filter(Boolean);
  const fs      = frame.style;

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const smooth  = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
  const seg     = (p, a, b) => clamp01((p - a) / (b - a));

  /* one bottom-up masked open for a word list, staggered inside its own
     window — writes only when the value changes */
  const openWords = (words, t) => {
    const n = words.length || 1;
    words.forEach((w, i) => {
      const q = smooth(seg(t, (i / n) * 0.6, (i / n) * 0.6 + 0.4));
      const y = ((1 - q) * 112).toFixed(1);
      if (w.dataset.y !== y) { w.dataset.y = y; w.style.transform = `translateY(${y}%)`; }
    });
  };

  /* ENTRANCE — begins the moment the image first shows at the bottom of
     the screen and completes exactly as the section pins: the big rounded
     card closes its ~100px margins into full bleed on the way UP. */
  ScrollTrigger.create({
    trigger: sec, start: 'top bottom', end: 'top top', scrub: true,
    onUpdate(self) {
      const mob = isNarrow();
      const vhU = mob ? 'dvh' : 'vh';
      const e = smooth(self.progress);
      fs.setProperty('--ovxw', `calc(100vw - ${((1 - e) * (mob ? 32 : 200)).toFixed(1)}px)`);
      fs.setProperty('--ovxh', `calc(100${vhU} - ${((1 - e) * (mob ? 110 : 180)).toFixed(1)}px)`);
      fs.setProperty('--ovxr', ((1 - e) * 16).toFixed(1) + 'px');
    },
  });

  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate(self) {
      const p = self.progress;
      const mob = isNarrow();
      const vhU = mob ? 'dvh' : 'vh';

      /* 1 · THE RIDE — the photo sits at its NATURAL height (no crop);
         the scroll travels through its real overflow, top to bottom, so
         the entire picture is seen by the section's end */
      const ride = seg(p, 0.2, 0.96);            /* deliberately linear */
      const bgImg = document.getElementById('ovxBgImg');
      const over = Math.max(0, bgImg.getBoundingClientRect().height - frame.clientHeight);
      fs.setProperty('--ovxpar', (-(ride * over)).toFixed(1) + 'px');

      /* 3 · LEAD copy: eyebrow → masked words → rule → mark, then the
         whole block rides UP and out with the climb */
      if (eyebrow) {
        const q = smooth(seg(p, 0, 0.08));
        eyebrow.style.opacity = q.toFixed(3);
        eyebrow.style.transform = `translateY(${((1 - q) * 14).toFixed(1)}px)`;
      }
      openWords(leadWords, seg(p, 0.02, 0.22));
      fs.setProperty('--ovxrule', smooth(seg(p, 0.18, 0.26)).toFixed(3));
      fs.setProperty('--ovxmark', seg(p, 0.22, 0.3).toFixed(3));
      const leadExit = smooth(seg(p, 0.4, 0.72));
      leadEl.style.transform =
        `translateY(${(-(leadExit * 120)).toFixed(2)}${vhU})`;

      /* 4 · CLOSING copy rises from under the frame near the ride's end */
      const rise = smooth(seg(p, 0.66, 0.88));
      closeEl.style.transform =
        `translateY(${((1 - rise) * 130).toFixed(2)}${vhU})`;
      openWords(closeWords, seg(p, 0.7, 0.88));
      const lq = smooth(seg(p, 0.82, 0.94));
      late.forEach((el) => {
        el.style.opacity = lq.toFixed(3);
        el.style.transform = `translateY(${((1 - lq) * 22).toFixed(1)}px)`;
      });
    },
  });
}


/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
function init() {
  initScene();
  initHeroEntrance();
  initOverviewScene();
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
