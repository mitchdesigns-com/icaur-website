/* ═══════════════════════════════════════════════════════════
   About page — 3D story car (Three.js module)
   Replaces the old 2D canvas car: the porcelain-gray V27 GLB
   moves and rotates between the story text blocks as you
   scroll, reference-style — 3/4 view beside the Overview copy,
   then turning to face front as it glides to the other side
   for the iCAUR Story steps.
   Panels fade + steps activate on the same scroll progress the
   old driver used, so the copy choreography is unchanged.
═══════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'meshopt_decoder';

(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;   // skip touch

  const scene3El = document.getElementById('aboutScene');
  const hero     = document.getElementById('hero');
  if (!scene3El || !hero) return;

  const ovPanel = scene3El.querySelector('.scene-panel--overview');
  const stPanel = scene3El.querySelector('.scene-panel--story');
  const steps   = [...scene3El.querySelectorAll('.saga-step')];

  const GLB_URL = 'https://pub-835dbefa2ea84f599cef0519f76de888.r2.dev/car-v27-porcelain-gray.glb';

  /* ── Poses (world units; camera at z ≈ 9) ─────────────────
     A: right side, 3/4 front-left view — beside Overview copy
     B: left side, facing the viewer   — beside Story steps   */
  const ENTER_POSE = { rotY: -1.2,  x:  5.2, y: 0.4, scale: 1.25 };
  const POSE_A     = { rotY: -0.62, x:  2.3, y: 0.55, scale: 1.5 };
  const POSE_B     = { rotY:  0.06, x: -2.4, y: 0.55, scale: 1.55 };

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const ss    = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const lerp  = (a, b, t) => a + (b - a) * t;
  const mix   = (pa, pb, t) => ({
    rotY:  lerp(pa.rotY,  pb.rotY,  t),
    x:     lerp(pa.x,     pb.x,     t),
    y:     lerp(pa.y,     pb.y,     t),
    scale: lerp(pa.scale, pb.scale, t),
  });
  const seg = (p, a, b) => ss((p - a) / (b - a));

  /* ── Renderer / scene ────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.id = 'about3dCanvas';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '5',
    opacity: '0', transition: 'opacity .4s ease',
  });
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2.6, 9.2);
  camera.lookAt(0, 0.6, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const d1 = new THREE.DirectionalLight(0xffffff, 3.4);
  d1.position.set(5, 9, 6); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0xffffff, 2.0);
  d2.position.set(-6, 5, -8); scene.add(d2);
  const p1 = new THREE.PointLight(0xffffff, 1.1, 18);
  p1.position.set(3, 4, 5); scene.add(p1);
  const p2 = new THREE.PointLight(0xffeedd, 0.7, 14);
  p2.position.set(-4, 3, -3); scene.add(p2);

  /* ── Car ─────────────────────────────────────────────── */
  let car = null;
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);

  loader.load(GLB_URL, (gltf) => {
    car = gltf.scene;

    /* soft ground shadow */
    const sc = document.createElement('canvas');
    sc.width = sc.height = 256;
    const sctx = sc.getContext('2d');
    const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 126);
    grad.addColorStop(0, 'rgba(0,0,0,0.38)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.16)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 256, 256);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 4.6),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    shadow.renderOrder = -1;
    car.add(shadow);

    scene.add(car);
  }, undefined, (err) => console.warn('About GLB load error:', err));

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Scroll state → pose + panel opacities ───────────── */
  function state() {
    const sr = scene3El.getBoundingClientRect();
    const scrollable = scene3El.offsetHeight - window.innerHeight;
    const vh = window.innerHeight;

    // Past the scene → hide everything
    if (sr.bottom < vh * 0.5) return { pose: POSE_B, op: 0, ov: 0, st: 0, active: -1 };

    // Entering (scene below viewport top): blend in from off-screen right
    if (sr.top > 0) {
      if (sr.top >= vh) return { pose: ENTER_POSE, op: 0, ov: 0, st: 0, active: -1 };
      const t = ss((vh - sr.top) / vh);
      return { pose: mix(ENTER_POSE, POSE_A, t), op: t, ov: t, st: 0, active: -1 };
    }

    // Pinned: scrub by progress p
    const p = clamp(-sr.top / scrollable, 0, 1);
    const ovOp = 1 - seg(p, 0.30, 0.48);          // overview lifts away
    const stOp = seg(p, 0.52, 0.66);              // story enters after the move

    let pose, active = -1;
    if (p <= 0.30)      { pose = POSE_A; }
    else if (p < 0.60)  { pose = mix(POSE_A, POSE_B, ss((p - 0.30) / 0.30)); }
    else                { pose = POSE_B; active = p < 0.82 ? 0 : 1; }

    return { pose, op: 1, ov: ovOp, st: stOp, active };
  }

  /* smooth scrubbing */
  const cur = { rotY: ENTER_POSE.rotY, x: ENTER_POSE.x, y: ENTER_POSE.y, scale: ENTER_POSE.scale };
  let curOp = 0;

  function frame() {
    const s = state();

    if (ovPanel) { ovPanel.style.opacity = s.ov; ovPanel.style.transform = `translateY(${(s.ov - 1) * 180}px)`; }
    if (stPanel) { stPanel.style.opacity = s.st; stPanel.style.transform = `translateY(${(1 - s.st) * 120}px)`; }
    steps.forEach((el, i) => el.classList.toggle('is-active', i === s.active));

    // lerp toward target pose for buttery scrubbing
    const K = 0.12;
    cur.rotY  += (s.pose.rotY  - cur.rotY)  * K;
    cur.x     += (s.pose.x     - cur.x)     * K;
    cur.y     += (s.pose.y     - cur.y)     * K;
    cur.scale += (s.pose.scale - cur.scale) * K;

    if (car) {
      car.rotation.y = cur.rotY;
      car.position.set(cur.x, cur.y - 0.55, 0);   // y offset: wheels on virtual floor
      car.scale.setScalar(cur.scale);
    }

    if (Math.abs(s.op - curOp) > 0.01) {
      curOp = s.op;
      canvas.style.opacity = String(curOp);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
