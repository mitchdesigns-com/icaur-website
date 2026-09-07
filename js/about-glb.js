'use strict';

/* ============================================================
   About page — the scene car as a live 3D model.

   The PNG that used to ride this scene is replaced by the
   carbon-black V27 GLB, rendered into #storySceneCar (now a
   <canvas>). js/about-story.js still owns the choreography —
   it positions, scales and shows/hides that element exactly as
   before — so this module only has two jobs:

     1. draw the model into the canvas, and
     2. turn it in 3D as the scene advances: it arrives cropped at
        the top left on a front-RIGHT three-quarter angle, then
        swings round to a full right-side profile as it drives down
        across the copy, landing flat by the time it parks.

   Desktop + fine pointers only; reduced motion gets the parked
   angle with no turning. If WebGL or the model is unavailable
   the canvas simply stays empty and the scene still works.
============================================================ */
import {
  WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, DirectionalLight,
  Box3, Vector3, SRGBColorSpace, ACESFilmicToneMapping, MathUtils
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(function initAboutGlb() {
  const canvas = document.getElementById('storySceneCar');
  const scene3 = document.getElementById('aboutScene');
  if (!canvas || !scene3 || canvas.tagName !== 'CANVAS') return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Angles, in degrees around Y. The model's own forward axis puts a
  // front-RIGHT three-quarter — front plus right flank, the pose it is
  // cropped on at the top-left — near +34°, and a head-on FRONT view at
  // 360°. Sweeping between the two spins the model a full turn and lands
  // it square to the camera, which is where the orbit stops.
  const ANGLE_ENTER = 34;
  const ANGLE_FRONT = 360;

  const MODEL_URL =
    'https://pub-835dbefa2ea84f599cef0519f76de888.r2.dev/car-v27-tactical-green.glb';

  let renderer, camera, scene, car, raf = null;
  let curDeg = ANGLE_ENTER;        // eased yaw, so turns read as turns

  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return;                       // no WebGL — leave the canvas blank
  }
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new Scene();
  camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.55, 8);

  // Carbon-black paint eats light, so this is lit deliberately hot: a strong
  // ambient floor plus a key, a fill from the opposite side and a warm rim to
  // pick the roofline out against a light page.
  renderer.toneMappingExposure = 1.85;
  scene.add(new AmbientLight(0xffffff, 3.2));
  const key  = new DirectionalLight(0xffffff, 4.2); key.position.set(5, 7, 8);
  const fill = new DirectionalLight(0xffffff, 2.2); fill.position.set(-6, 3, 6);
  const rim  = new DirectionalLight(0xffd9b8, 2.6); rim.position.set(-4, 6, -6);
  const under = new DirectionalLight(0xffffff, 1.1); under.position.set(0, -5, 3);
  scene.add(key, fill, rim, under);

  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // Progress is read the same way about-story.js reads it, so the turn stays
  // locked to the choreography rather than drifting against it.
  function progress() {
    const sr = scene3.getBoundingClientRect();
    const scrollable = Math.max(scene3.offsetHeight - window.innerHeight, 1);
    return { p: MathUtils.clamp(-sr.top / scrollable, 0, 1), top: sr.top };
  }

  function draw() {
    if (!car) return;
    const { p, top } = progress();
    /* Entering (section still below the fold) → hold the arrival angle. Then
       spin through a whole turn — front-right three-quarter, round past both
       side profiles and the tail, back to square-on — as it descends. The
       window here is DRIVE_END in js/about-story.js: the same one the car
       falls down, so the spin finishes on the frame it parks.
       Phones mirror the choreography's combined progress: the section's
       ENTRY carries the first 45% of the spin, so it turns with the very
       first scroll instead of waiting for the pin. */
    const mob = window.innerWidth <= 960;
    const t = mob
      ? MathUtils.clamp(
          MathUtils.clamp(1 - top / window.innerHeight, 0, 1) * 0.45 +
          MathUtils.smoothstep(p, 0, 0.20) * 0.55, 0, 1)
      : (top > 0 ? 0 : MathUtils.smoothstep(p, 0, 0.20));
    const deg = reduce ? ANGLE_FRONT
                       : ANGLE_ENTER + (ANGLE_FRONT - ANGLE_ENTER) * t;
    // eased, so the spin keeps running on after the scroll stops
    curDeg += (deg - curDeg) * (reduce ? 1 : 0.12);
    car.rotation.y = MathUtils.degToRad(curDeg);
    renderer.render(scene, camera);
  }
  /* A continuous loop while the scene is anywhere near the viewport. The old
     scroll-triggered redraw cannot serve an eased angle — the easing needs
     frames after the scroll stops, exactly like the choreography in
     js/about-story.js, which this has to stay locked to. Off-screen it costs
     one rect read per frame and no WebGL work at all. */
  function tick() {
    const sr = scene3.getBoundingClientRect();
    if (sr.bottom > -200 && sr.top < window.innerHeight + 200) draw();
    raf = requestAnimationFrame(tick);
  }
  const request = () => { if (!raf) raf = requestAnimationFrame(tick); };

  // The GLB ships with panels posed open (that stray back-left door). The V27
  // configurator closes them by resetting the panel groups to their neutral
  // transform — same model, same fix.
  const CLOSE_PANELS = new Set(['Door_FL', 'Door_FR', 'Door_BL', 'Door_BR', 'Trunk', 'Bonnet']);

  new GLTFLoader().load(MODEL_URL, (gltf) => {
    car = gltf.scene;
    car.traverse((o) => {
      if (CLOSE_PANELS.has(o.name)) {
        o.position.set(0, 0, 0);
        o.quaternion.set(0, 0, 0, 1);
        o.scale.set(1, 1, 1);
      }
    });
    // normalise: centre on the origin and scale to a predictable size, so the
    // framing does not depend on how the asset happens to be authored
    const box = new Box3().setFromObject(car);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    car.position.sub(centre);
    const span = Math.max(size.x, size.y, size.z) || 1;
    // fit inside the canvas frame with margin: the camera sees ~4.6 units of
    // height here, so a 3.6-unit car never clips its own box — which is what
    // the oversized value was doing, especially once rotated onto the rail
    car.scale.setScalar(4.3 / span);
    scene.add(car);
    resize();
    request();                      // nothing to render until the model lands
  }, undefined, () => { /* model unavailable — canvas stays empty */ });

  resize();
  window.addEventListener('resize', () => { resize(); request(); }, { passive: true });
})();
