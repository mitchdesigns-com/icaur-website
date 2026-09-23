'use strict';

/* ============================================================
   About page — VISION → MISSION statement scroll + car crossing
   (serverobotics.com reference, adapted to iCAUR).

   The two chapters are addressed by POSITION, not by name: chA is
   whichever panel plays first, chB second. Swapping the running
   order therefore only means swapping the two bindings below (and
   the panels' DOM order, which the static fallback stacks in).
   Current order: VISION first, MISSION second.

   One sticky stage, everything a pure function of scroll p —
   scrolling up plays the whole sequence in reverse:

   1  p 0.00–0.12  the brand DASH MARK opens centre-stage, then
                   scales up and blurs away
   2  p 0.08–0.38  chapter A (VISION): title pops, statement words
                   and inline picture chips pop in with elastic
                   overshoot, one reading-order sequence
   3  p 0.40–0.66  the carbon-black V27 drives in from the RIGHT
                   (wheels rolling), crosses the stage and turns
                   to stop FACING the camera; chapter A zooms away
   4  p 0.62+      chapter B (MISSION): title pops…
   5  p 0.66–0.88  …the car tips over the BRIDGE EDGE and drives
                   straight down, shrinking as it goes…
   6  p 0.79–0.94  …then chapter B's statement builds, clear of the
                   car, which sits small in top view beneath it

   Reduced motion: static stacked fallback (.mv--static), no 3D.
============================================================ */

import * as THREE from 'three';
import { GLTFLoader }  from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'meshopt_decoder';

const driver = document.getElementById('mvDriver');
/* chapter order — chA plays first, chB second (see header) */
const chA    = document.getElementById('mvVision');
const chB    = document.getElementById('mvMission');
const canvas = document.getElementById('mvCanvas');
if (driver && chA && chB && canvas) init();

function init() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── split [data-mv-split] into word spans (keeps inline <em>) ── */
  function splitWords(root) {
    const words = [];
    (function walk(node) {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 1) { walk(child); return; }
        if (child.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        (child.textContent || '').split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'mv-w';
          w.textContent = part;
          frag.appendChild(w);
          words.push(w);
        });
        node.replaceChild(frag, child);
      });
    })(root);
    return words;
  }
  chA.querySelectorAll('[data-mv-split]').forEach(splitWords);
  chB.querySelectorAll('[data-mv-split]').forEach(splitWords);
  /* Pose UNITS, not just words: the picture chips take their place in the
     same sequence as the words around them (document order = reading
     order), so nothing is ever visible before the copy it sits inside. */
  const aUnits = [...chA.querySelectorAll('.mv-w, .mv-chip')];
  const bUnits = [...chB.querySelectorAll('.mv-w, .mv-chip')];

  if (reduced) { driver.classList.add('mv--static'); return; }

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const ss    = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const seg   = (p, a, b) => ss((p - a) / (b - a));
  const back  = t => {
    t = clamp(t, 0, 1);
    const c1 = 1.70158, c3 = c1 + 1, u = t - 1;
    return 1 + c3 * u * u * u + c1 * u * u;
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  const bg     = document.getElementById('mvBg');
  const aTitle = chA.querySelector('.mv__title');
  const bTitle = chB.querySelector('.mv__title');
  const aInner = chA.querySelector('.mv__inner');
  const bInner = chB.querySelector('.mv__inner');

  /* ── 3D: the carbon-black V27 on a transparent canvas ── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  const placeCamera = () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    /* portrait: pull back so the crossing car fits the frame */
    camera.position.set(0, 1.5, 9.5 * clamp(1.15 / aspect, 1, 2));
    camera.lookAt(0, 0.9, 0);
    camera.updateProjectionMatrix();
  };
  placeCamera();

  scene.add(new THREE.HemisphereLight(0xc8d2e2, 0x33363c, 0.9));
  const key = new THREE.DirectionalLight(0xf4f6fa, 2.6);
  key.position.set(1.5, 10, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 40;
  key.shadow.camera.left = -10; key.shadow.camera.right = 10;
  key.shadow.camera.top = 8;    key.shadow.camera.bottom = -8;
  key.shadow.bias = -0.0005;    key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdde8f6, 2.2);
  rim.position.set(-6, 4, -6);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xdfe6f2, 0.9);
  fill.position.set(6, 3, 7);
  scene.add(fill);

  /* invisible ground that catches the car's soft shadow */
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 20),
    new THREE.ShadowMaterial({ transparent: true, opacity: 0.32, color: 0x000000 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);

  /* the R2 colour GLBs ship with panels POSED OPEN — close them all
     before measuring (same fix as js/v27.js prepModel) */
  const CLOSE_PANELS = new Set(['Door_FL', 'Door_FR', 'Door_BL', 'Door_BR', 'Trunk', 'Bonnet']);
  let car = null;
  const spinners = [];
  loader.load('https://pub-835dbefa2ea84f599cef0519f76de888.r2.dev/car-v27-carbon-black.glb', (gltf) => {
    const body = gltf.scene;
    const wheels = [];
    body.traverse(o => {
      if (CLOSE_PANELS.has(o.name)) {
        o.position.set(0, 0, 0);
        o.quaternion.set(0, 0, 0, 1);
        o.scale.set(1, 1, 1);
      }
      if (o.isMesh) {
        o.castShadow = true;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(m => {
          if (/glass/i.test(m.name || '')) {
            m.transparent = true;
            m.opacity = /dark/i.test(m.name) ? 0.42 : 0.16;
            m.side = THREE.DoubleSide;
            m.depthWrite = false;
          }
          if ('envMapIntensity' in m) m.envMapIntensity = 1.5;
        });
      }
      if (/^Wheel_(FL|FR|BL|BR)$/.test(o.name)) wheels.push(o);
    });

    /* wheels: wrap tire/rim parts in hub pivots so they can ROLL while
       the car crosses (js/v27.js prepModel pattern) */
    body.updateMatrixWorld(true);
    wheels.forEach(grp => {
      [...grp.children].forEach(part => {
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

    car = new THREE.Group();
    car.add(body);
    scene.add(car);

    /* nose → +X (yaw off the wheel hubs), normalise to 4.6 units,
       grounded and centred inside the group */
    const hubMid = re => {
      const g = wheels.filter(w => re.test(w.name));
      if (!g.length) return null;
      const c = new THREE.Vector3();
      g.forEach(w => c.add(new THREE.Box3().setFromObject(w).getCenter(new THREE.Vector3())));
      return c.divideScalar(g.length);
    };
    const front = hubMid(/^Wheel_F/), backHub = hubMid(/^Wheel_B/);
    if (front && backHub) {
      const yaw = Math.atan2(front.x - backHub.x, front.z - backHub.z);
      body.rotation.y = Math.PI / 2 - yaw;
    }
    body.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(body);
    const s = 4.6 / (box.max.x - box.min.x);
    body.scale.setScalar(s);
    body.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(body);
    const centre = box.getCenter(new THREE.Vector3());
    body.position.x -= centre.x;
    body.position.z -= centre.z;
    body.position.y -= box.min.y;

    window.__mv = { car, spinners };
  }, undefined, err => console.warn('mv GLB load error:', err));

  /* ── one chapter's typography pose ──
     wordsFrom/wordsSpread place the statement inside the chapter's
     window — mission delays its words until the car has driven off
     the "bridge edge", so the text never sits over the car. `units`
     is words AND picture chips in reading order — one sequence. */
  function poseChapter(units, title, inner, tIn, wordsFrom = 0.14, wordsSpread = 0.58) {
    const tt = seg(tIn, 0, 0.18);
    const tb = back(tt);
    title.style.opacity = tt.toFixed(3);
    title.style.transform = `scale(${(0.6 + 0.4 * tb).toFixed(3)}) translateY(${((1 - ss(tt)) * 20).toFixed(1)}px)`;
    title.style.filter = `blur(${((1 - tt) * 8).toFixed(1)}px)`;

    const z = seg(tIn, 0, 0.6);
    inner.style.transform = `scale(${(0.94 + 0.06 * z).toFixed(4)})`;

    const n = units.length || 1;
    units.forEach((w, i) => {
      const start = wordsFrom + (i / n) * wordsSpread;
      const t = clamp((tIn - start) / 0.20, 0, 1);
      const b = back(t);
      w.style.opacity = ss(t * 1.6).toFixed(3);
      w.style.transform =
        `translateY(${((1 - ss(t)) * 46).toFixed(1)}px)` +
        ` scale(${(0.5 + 0.5 * b).toFixed(3)})` +
        ` rotate(${((1 - b) * 5).toFixed(2)}deg)`;
    });
  }

  /* ── scroll-scrubbed frame loop ── */
  const WHEEL_R = 0.42;
  function frame() {
    requestAnimationFrame(frame);
    const rect = driver.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
    const scrollable = Math.max(driver.offsetHeight - window.innerHeight, 1);
    const p = clamp(-rect.top / scrollable, 0, 1);

    /* 0 — the black sheet slides up over the stats section as the chapter
       arrives: eased (cubic out) so it accelerates in and settles softly,
       fully seated by the time the pin engages and the sequence starts */
    if (bg) {
      const arrive = 1 - clamp(rect.top / window.innerHeight, 0, 1);
      const be = 1 - Math.pow(1 - arrive, 3);
      bg.style.transform = `translateY(${((1 - be) * 100).toFixed(2)}%)`;
    }

    /* 2 + 4 — chapters. Chapter B's words wait (wordsFrom 0.52 of its
       window ≈ p 0.79) until the car has dropped off the bridge edge. */
    const aT = seg(p, 0.08, 0.38);
    const bT = seg(p, 0.62, 0.94);
    poseChapter(aUnits, aTitle, aInner, aT);
    poseChapter(bUnits, bTitle, bInner, bT, 0.52, 0.36);

    /* chapter A zooms away as the car arrives; handoff at p=0.52 */
    const out = seg(p, 0.40, 0.52);
    chA.style.opacity = (1 - out).toFixed(3);
    chA.style.filter = `blur(${(out * 10).toFixed(1)}px)`;
    chA.style.transform = `scale(${(1 - out * 0.10).toFixed(4)})`;
    const swapped = p >= 0.52;
    chA.style.visibility = swapped ? 'hidden' : 'visible';
    chB.style.visibility = swapped ? 'visible' : 'hidden';
    const inn = seg(p, 0.60, 0.72);
    chB.style.opacity = inn.toFixed(3);

    /* 3 + 5 — the car crossing. The model moved to the Overview/Story scene
       (js/about-glb.js), so this canvas stays hidden; the statement
       choreography above is still driven from here. */
    canvas.style.opacity = '0';
    if (car) {
      const cross = seg(p, 0.42, 0.62);             /* right → centre */
      const turn  = seg(p, 0.56, 0.66);             /* side → front view */
      /* the BRIDGE-EDGE exit: after chapter B's title lands, the car
         tips a full 90° over the edge and drives STRAIGHT DOWN the
         centre line — by the end we look at its ROOF, no sideways
         drift, no 3/4 stance */
      const dip   = seg(p, 0.66, 0.88);
      /* staged like a real roll-over-the-edge: the nose TIPS first,
         the descent follows once the car has committed, and the shrink
         rides the whole way down — each on its own eased curve */
      const pitch = (Math.PI / 2) * seg(dip, 0, 0.65);
      const drop  = seg(dip, 0.12, 1);

      const x = lerp(9.5, 0, cross);                /* straight line — no drift */
      /* landing height derived from the camera frustum, NOT a fixed
         number: wide (laptop) screens see less vertical world-space,
         so a constant drop crops the car at the section edge there.
         halfH = visible world half-height at the car's plane;
         2.27 = look height (0.9) + safety margin (0.5) + half the
         top-view car length (4.6 × 0.38 / 2). */
      const halfH = Math.tan(camera.fov * Math.PI / 360) * camera.position.z;
      const y = drop * (2.27 - halfH);
      car.position.set(x, y, 0);
      /* the nose is normalised to +X, so the LATERAL axis is Z: pitch
         is a Z rotation applied after yaw (order YZX) — rotation.x
         would ROLL the car onto its side */
      car.rotation.order = 'YZX';
      /* nose -X while driving left, +90° more to face the camera */
      car.rotation.y = Math.PI + (Math.PI / 2) * turn;
      car.rotation.z = -pitch;
      car.rotation.x = 0;
      /* shrink WITH the descent so it ends small — and never cropped —
         under the statement */
      const sc = 1 - 0.62 * seg(dip, 0.08, 1);
      car.scale.setScalar(sc);

      /* wheels roll with the crossing distance */
      const spin = -(x - 9.5) / WHEEL_R;
      spinners.forEach(sp => { sp.rotation[sp.userData.axis] = spin; });
      shadowPlane.position.y = y;
      /* a ground shadow makes no sense under a nose-down car */
      shadowPlane.material.opacity = 0.32 * (1 - dip);

      renderer.render(scene, camera);
    }

    /* chapter B's copy lifts slightly as the car settles under it */
    const dipUi = seg(p, 0.68, 0.86);
    bInner.style.marginTop = `${(-dipUi * 6).toFixed(2)}vh`;
  }
  requestAnimationFrame(frame);

  window.addEventListener('resize', () => {
    placeCamera();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
