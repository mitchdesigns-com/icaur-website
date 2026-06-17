/* ═══════════════════════════════════════════════════════════
   iCAUR V27 — 3D Landing Page (vanilla JS module)
   Three.js via importmap  +  GSAP / ScrollTrigger via CDN
   ═══════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'meshopt_decoder';
import { CircularGallery } from '/js/circular-gallery.js';

const gsap   = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

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

let car = null;
let isDragging  = false;
let dragEnabled = false;
let dragStartX  = 0;
let dragVelX    = 0;
let lastDragX   = 0;
let inertiaTween = null;

function initScene() {
  const canvas = $('#v27-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0.2, 2.8, 7.5);

  /* Lights */
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const d1 = new THREE.DirectionalLight(0xffffff, 3.8);
  d1.position.set(5, 9, 6); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0xffffff, 2.2);
  d2.position.set(-6, 5, -8); scene.add(d2);
  /* blue under-light removed per design */
  const p1 = new THREE.PointLight(0xffffff, 1.2, 18);
  p1.position.set(3, 4, 5); scene.add(p1);
  const p2 = new THREE.PointLight(0xffeedd, 0.8, 14);
  p2.position.set(-4, 3, -3); scene.add(p2);

  /* GLTF loader */
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);

  loader.load('/assets/images/car-v27.glb', (gltf) => {
    car = gltf.scene;
    car.rotation.y = HERO_POSE.rotY;
    car.position.set(HERO_POSE.posX, HERO_POSE.posY, 0);
    car.scale.setScalar(HERO_POSE.scale);
    scene.add(car);
    setupCarScrollAnim();
  }, undefined, (err) => {
    console.warn('GLB load error:', err);
  });

  /* Resize */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* Render loop */
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

function setupCarScrollAnim() {
  if (!car) return;

  /* Overview: car rotates to front view as section enters; stays at OVERVIEW_POSE while pinned */
  ScrollTrigger.create({
    trigger: '#v27-overview',
    start: 'top 90%',
    end: 'top top',
    scrub: 1.2,
    onUpdate(self) {
      if (!car || isDragging) return;
      const p = self.progress;
      car.rotation.y = lerp(HERO_POSE.rotY, OVERVIEW_POSE.rotY, p);
      car.position.x = lerp(HERO_POSE.posX, OVERVIEW_POSE.posX, p);
      car.position.y = lerp(HERO_POSE.posY, OVERVIEW_POSE.posY, p);
      car.scale.setScalar(lerp(HERO_POSE.scale, OVERVIEW_POSE.scale, p));
    },
  });

  /* Exterior: car sweeps from front view to side profile as section enters */
  ScrollTrigger.create({
    trigger: '#v27-exterior',
    start: 'top 80%', end: 'top top', scrub: 1.8,
    onUpdate(self) {
      if (!car || isDragging) return;
      const p = self.progress;
      car.rotation.y = lerp(OVERVIEW_POSE.rotY, SIDE_POSE.rotY, p);
      car.position.x  = lerp(OVERVIEW_POSE.posX,  SIDE_POSE.posX,  p);
      car.position.y  = lerp(OVERVIEW_POSE.posY,  SIDE_POSE.posY,  p);
      car.scale.setScalar(lerp(OVERVIEW_POSE.scale, SIDE_POSE.scale, p));
    },
  });

  /* Exterior: enable drag while section is pinned; snap back on leave */
  ScrollTrigger.create({
    trigger: '#v27-exterior',
    start: 'top top', end: 'bottom top',
    onEnter()     { dragEnabled = true;  showDragHint(true); },
    onLeave()     { dragEnabled = false; showDragHint(false); resetCarToSidePose(); },
    onEnterBack() { dragEnabled = true;  showDragHint(true); },
    onLeaveBack() { dragEnabled = false; showDragHint(false); resetCarToSidePose(); },
  });

  /* Hide canvas when past all 3D sections */
  ScrollTrigger.create({
    trigger: '#v27-brand',
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

function resetCarToSidePose() {
  if (!car) return;
  if (inertiaTween) { inertiaTween.kill(); inertiaTween = null; }
  gsap.to(car.rotation, { y: SIDE_POSE.rotY, duration: 0.8, ease: 'power2.inOut' });
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
    car.rotation.y += dragVelX * 0.006;
  }
  function onUp() {
    if (!isDragging) return;
    isDragging = false;
    setDragCursor(dragEnabled ? 'hover' : 'none');
    if (Math.abs(dragVelX) > 0.5 && car) {
      inertiaTween = gsap.to(car.rotation, {
        y: car.rotation.y + dragVelX * 0.3,
        duration: 1.2, ease: 'power3.out',
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

  tl.to('#v27-model-badge', { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, 0)
    .from('#v27-hero-h1',   { opacity: 0, y: 24, duration: .8, ease: 'power3.out' }, .2)
    .to('#v27-hero-sub',    { opacity: 1, y: 0,  duration: .7, ease: 'power3.out' }, .55)
    .to('#v27-hero-bottom', { opacity: 1, y: 0,  duration: .7, ease: 'power3.out' }, .72);
}

/* ══════════════════════════════════════════════════════════
   3.  360 EXPERIENCE — swatches + drag setup
══════════════════════════════════════════════════════════ */
function initExterior() {
  /* Swatch click → toggle active */
  $$('.v27-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.v27-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
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
  { src: '/assets/images/ICUAR V27 brochure 03 20.png',  label: 'Desert Run' },
  { src: '/assets/images/v27/v27-01.png',                label: 'Front View' },
  { src: '/assets/images/v27-19.png',                    label: 'Dynamic' },
  { src: '/assets/images/v27/v27-17.png',                label: 'Side' },
  { src: '/assets/images/v27/v27-02.png',                label: 'Profile' },
  { src: '/assets/images/v27/car-side.jpg',              label: 'Side Profile' },
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

function initBrand() {
  const container = $('#v27-cg-container');
  if (!container) return;

  const items = EXT_SLIDES.map(s => ({ image: s.src, text: s.label }));
  lbItems = items;

  ScrollTrigger.create({
    trigger: '#v27-brand', start: 'top 75%', once: true,
    onEnter() {
      gsap.from('#v27-brand-h2', { opacity: 0, y: 24, duration: .8, ease: 'power3.out' });
    }
  });

  container.style.cursor = 'none';

  /* Flatter arc on narrow screens so near-full-width cards sit level */
  const isMobile = window.innerWidth <= 640;

  new CircularGallery(container, {
    items,
    bend: isMobile ? 1 : 3,
    textColor: '#555859',
    borderRadius: 0.04,
    font: '500 20px GothamMedium, Montserrat, sans-serif',
    scrollSpeed: 4,
    scrollEase: 0.025,
    onItemClick: (idx, cx, cy) => openLightbox(idx, cx, cy),
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
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam025.jpg', label: 'Overview',
    hotspots: [
      { x: '38%', y: '22%', title: 'Panoramic Sunroof', desc: 'Tinted electrochromic glass dims on demand.', img: '/assets/images/v27/interior-sunroof.jpg' },
      { x: '52%', y: '44%', title: 'Central Display',  desc: '34" curved AMOLED, 2880×1080 resolution.',  img: '/assets/images/v27/interior-display.jpg' },
      { x: '30%', y: '62%', title: 'Centre Console',   desc: 'Floating console with wireless charging.',    img: '/assets/images/v27/interior-console.jpg' },
      { x: '18%', y: '54%', title: 'Nappa Leather',    desc: 'Perforated semi-aniline hide with massage.', img: '/assets/images/v27/interior-leather.jpg' },
    ]
  },
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam026 copy.jpg', label: 'Front Cabin' },
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam027 copy.jpg', label: 'Rear Seats' },
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam028 copy.jpg', label: 'Console' },
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam033 copy.jpg', label: 'Rear Cabin' },
  { src: '/assets/images/v27/iCAUR INTL_V27 REV_cam0301 copy.jpg', label: 'Detailing' },
  { src: '/assets/images/v27/interior-display.jpg', label: 'Central Display' },
  { src: '/assets/images/v27/interior-leather.jpg', label: 'Nappa Leather' },
  { src: '/assets/images/v27/interior-sunroof.jpg', label: 'Panoramic Roof' },
  { src: '/assets/images/v27/interior-console.jpg', label: 'Wireless Charging' },
  { src: '/assets/images/v27/interior-01.jpg', label: 'Cabin Ambience' },
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
    $$('.v27-charging-eyebrow, .v27-charging-intro, .v27-charge-stat-label', section).forEach(el => {
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

/* ══════════════════════════════════════════════════════════
   12. TRIMS ACCORDION
══════════════════════════════════════════════════════════ */
function initTrims() {
  ScrollTrigger.create({
    trigger: '#v27-trims', start: 'top 70%', once: true,
    onEnter() {
      gsap.to('.v27-trim-col-head', { opacity: 1, y: 0, stagger: .1, duration: .6 });
      gsap.from('.v27-trim-section-label, .v27-trim-row', { opacity: 0, y: 12, stagger: .04, duration: .45, delay: .2 });
    }
  });
}

/* ══════════════════════════════════════════════════════════
   13. RESERVE SECTION
══════════════════════════════════════════════════════════ */
function initReserve() {
  ScrollTrigger.create({
    trigger: '#v27-reserve', start: 'top 70%', once: true,
    onEnter() {
      gsap.from('#v27-reserve-h2', { opacity: 0, y: 30, duration: .8, ease: 'power3.out' });
      gsap.from('#v27-reserve .v27-reserve-ctas', { opacity: 0, y: 20, duration: .6, delay: .35 });
    }
  });
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
function init() {
  initScene();
  initHeroEntrance();
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
  initTrims();
  initReserve();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
