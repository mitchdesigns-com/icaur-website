// ============================================================
// LEGO PIT — services section floor (three.js)
// Adapted from React Bits' <Ballpit /> physics (inspired by
// Kevin Levron), rebuilt vanilla for this static site:
//   • spheres → small 3D orange LEGO 2×2 bricks (instanced)
//   • gravity pools them at the bottom of the section
//   • the sweeping .diff__panel cards act as moving colliders,
//     smacking pieces aside as the horizontal carousel scrubs
//   • an invisible cursor sphere follows the pointer (followCursor)
// Desktop + fine pointers only; canvas is display:none under 861px.
// ============================================================
import {
  WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, DirectionalLight,
  PointLight, InstancedMesh, MeshPhysicalMaterial, Object3D, Color,
  BoxGeometry, CylinderGeometry, BufferGeometry, BufferAttribute,
  MathUtils, Vector3, SRGBColorSpace, ACESFilmicToneMapping
} from 'three';

(function initLegoPit() {
  const canvas  = document.getElementById('legoPit');
  const section = document.getElementById('services');
  if (!canvas || !section) return;
  // state stamp — inspectable via #legoPit[data-state] when debugging
  const stamp = s => { canvas.dataset.state = s; };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return stamp('skip-reduced-motion');
  if (window.innerWidth <= 860) return stamp('skip-narrow');   // CSS hides it there anyway
  // (no pointer:fine gate — followCursor simply stays idle without a mouse)
  stamp('init');

  // ── Config (user-tuned Ballpit params, adapted) ─────────────
  const CFG = {
    count: 110,          // fewer but bigger bricks
    gravity: 0,          // ZERO-G — pieces float in the background, never
                         // pooling/cropping at the section floor
    friction: 0.9975,    // per-frame damping (Ballpit default; 0.8 freezes)
    wallBounce: 0.95,
    maxVelocity: 0.15,   // reference default
    followCursor: true,
    minSize: 0.7, maxSize: 1.35,  // per-brick scale range (bigger)
    cursorRadius: 1.4,            // invisible pointer collider
    zSpread: 2.0,
    drift: 0.0022        // gentle ambient force so floating never stalls
  };

  // ── Renderer / scene / camera ───────────────────────────────
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  const scene  = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 20);

  scene.add(new AmbientLight(0xffffff, 0.9));
  const key = new DirectionalLight(0xffffff, 2.2); key.position.set(4, 8, 10); scene.add(key);
  const warm = new PointLight(0xffb27d, 60); warm.position.set(-6, 4, 6); scene.add(warm);

  // World size at z=0 (Ballpit's updateWorldSize)
  const world = { w: 20, h: 10 };
  function resize() {
    const r = section.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const fovRad = (camera.fov * Math.PI) / 180;
    world.h = 2 * Math.tan(fovRad / 2) * camera.position.length();
    world.w = world.h * camera.aspect;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ── LEGO 2×2 brick geometry (box + 4 studs, hand-merged) ────
  function mergeGeoms(geoms) {
    let vCount = 0;
    const parts = geoms.map(g => { const n = g.toNonIndexed(); vCount += n.attributes.position.count; return n; });
    const pos = new Float32Array(vCount * 3), nor = new Float32Array(vCount * 3);
    let o = 0;
    parts.forEach(g => {
      pos.set(g.attributes.position.array, o * 3);
      nor.set(g.attributes.normal.array, o * 3);
      o += g.attributes.position.count;
    });
    const out = new BufferGeometry();
    out.setAttribute('position', new BufferAttribute(pos, 3));
    out.setAttribute('normal', new BufferAttribute(nor, 3));
    return out;
  }
  const B = 0.66;                 // brick footprint (world units)
  const bodyH = B * 0.62, studR = B * 0.19, studH = B * 0.17;
  const parts = [new BoxGeometry(B, bodyH, B)];
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sz]) => {
    const stud = new CylinderGeometry(studR, studR, studH, 14);
    stud.translate(sx * B * 0.25, bodyH / 2 + studH / 2, sz * B * 0.25);
    parts.push(stud);
  });
  const brickGeom = mergeGeoms(parts);
  parts.forEach(g => g.dispose());

  const mat = new MeshPhysicalMaterial({
    color: new Color('#FA6124'),
    roughness: 0.32, metalness: 0,
    clearcoat: 0.9, clearcoatRoughness: 0.25
  });
  const mesh = new InstancedMesh(brickGeom, mat, CFG.count);
  scene.add(mesh);

  // ── Physics state (Ballpit's W class, + spin) ───────────────
  const N = CFG.count;
  const P = new Float32Array(N * 3);   // positions
  const V = new Float32Array(N * 3);   // velocities
  const S = new Float32Array(N);       // sizes (collision radius ≈ B*size)
  const R = new Float32Array(N * 3);   // euler rotations
  const W_ = new Float32Array(N * 3);  // angular velocities
  const { randFloat: rf, randFloatSpread: rs } = MathUtils;
  const maxX = () => world.w / 2, maxY = () => world.h / 2;

  for (let i = 0; i < N; i++) {
    P[i*3]   = rs(world.w * 0.92);
    P[i*3+1] = rs(world.h * 0.86);   // full-height spread — floating field
    P[i*3+2] = rs(CFG.zSpread);
    S[i] = rf(CFG.minSize, CFG.maxSize);
    R[i*3] = rs(Math.PI); R[i*3+1] = rs(Math.PI); R[i*3+2] = rs(Math.PI);
    W_[i*3] = rs(2); W_[i*3+1] = rs(2); W_[i*3+2] = rs(2);
  }

  // Cursor collider (Ballpit's controlSphere0, but not a rendered brick)
  const cursor = { x: 0, y: -100, active: false };
  section.addEventListener('pointermove', e => {
    const r = section.getBoundingClientRect();
    cursor.x = ((e.clientX - r.left) / r.width - 0.5) * world.w;
    cursor.y = -((e.clientY - r.top) / r.height - 0.5) * world.h;
    cursor.active = CFG.followCursor;
  }, { passive: true });
  section.addEventListener('pointerleave', () => { cursor.active = false; }, { passive: true });

  // Card colliders — the sweeping .diff__panel cards
  const cards = Array.from(section.querySelectorAll('.diff__panel'));
  const cardState = cards.map(() => ({ x: 0, y: 0, hw: 0, hh: 0, vx: 0, seen: false }));
  function sampleCards() {
    const sr = section.getBoundingClientRect();
    cards.forEach((el, i) => {
      const c = cardState[i];
      const r = el.getBoundingClientRect();
      // ignore cards fully off the stage or faded out
      const st = el.style.opacity;
      if (r.width < 10 || (st !== '' && parseFloat(st) < 0.15)) { c.seen = false; return; }
      const x = ((r.left + r.width / 2 - sr.left) / sr.width - 0.5) * world.w;
      const y = -((r.top + r.height / 2 - sr.top) / sr.height - 0.5) * world.h;
      c.vx = c.seen ? (x - c.x) : 0;
      c.x = x; c.y = y;
      c.hw = (r.width  / sr.width)  * world.w / 2;
      c.hh = (r.height / sr.height) * world.h / 2;
      c.seen = true;
    });
  }

  // ── Simulation step (adapted Ballpit update loop) ───────────
  const dummy = new Object3D();
  let last = performance.now(), running = false, rafId = null, elapsed = 0;

  function step(now) {
    rafId = requestAnimationFrame(step);
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!running) return;

    sampleCards();
    const MX = maxX(), MY = maxY();
    // reference detail: the point light rides the cursor ball
    if (cursor.active) warm.position.set(cursor.x, cursor.y, 4);

    elapsed += dt;
    for (let i = 0; i < N; i++) {
      const b = i * 3, rad = S[i] * B * 0.72;
      // gravity + damping (Ballpit core); in zero-G a gentle per-piece
      // sinusoid drift keeps the field lazily floating instead of stalling
      V[b+1] -= dt * CFG.gravity * S[i];
      if (CFG.gravity === 0) {
        V[b]   += Math.sin(elapsed * 0.6 + i * 2.13) * CFG.drift * dt;
        V[b+1] += Math.cos(elapsed * 0.5 + i * 1.71) * CFG.drift * dt;
      }
      V[b] *= CFG.friction; V[b+1] *= CFG.friction; V[b+2] *= CFG.friction;
      const vl = Math.hypot(V[b], V[b+1], V[b+2]);
      if (vl > CFG.maxVelocity) { const k = CFG.maxVelocity / vl; V[b]*=k; V[b+1]*=k; V[b+2]*=k; }
      P[b] += V[b]; P[b+1] += V[b+1]; P[b+2] += V[b+2];

      // brick-brick collisions (approx as spheres, O(n²) like Ballpit)
      for (let j = i + 1; j < N; j++) {
        const c = j * 3, rad2 = S[j] * B * 0.72;
        let dx = P[c]-P[b], dy = P[c+1]-P[b+1], dz = P[c+2]-P[b+2];
        const dist = Math.hypot(dx, dy, dz), sum = rad + rad2;
        if (dist < sum && dist > 1e-4) {
          const ov = (sum - dist) / 2, il = 1 / dist;
          dx*=il; dy*=il; dz*=il;
          P[b]-=dx*ov; P[b+1]-=dy*ov; P[b+2]-=dz*ov;
          P[c]+=dx*ov; P[c+1]+=dy*ov; P[c+2]+=dz*ov;
          const imp = ov * 0.65;
          V[b]-=dx*imp; V[b+1]-=dy*imp; V[c]+=dx*imp; V[c+1]+=dy*imp;
          W_[b]   += (Math.random()-0.5) * imp * 26;
          W_[c+2] += (Math.random()-0.5) * imp * 26;
        }
      }

      // cursor collider
      if (cursor.active) {
        let dx = P[b]-cursor.x, dy = P[b+1]-cursor.y;
        const dist = Math.hypot(dx, dy), sum = rad + CFG.cursorRadius;
        if (dist < sum && dist > 1e-4) {
          const ov = sum - dist, il = 1/dist;
          P[b]+=dx*il*ov; P[b+1]+=dy*il*ov;
          V[b]+=dx*il*ov*0.55; V[b+1]+=dy*il*ov*0.55;
          W_[b+1]+= (Math.random()-0.5)*ov*30;
        }
      }

      // card colliders — AABB push + card momentum ("cards hit them")
      for (let ci = 0; ci < cardState.length; ci++) {
        const c = cardState[ci];
        if (!c.seen) continue;
        const px = P[b]-c.x, py = P[b+1]-c.y;
        const ox = c.hw + rad - Math.abs(px), oy = c.hh + rad - Math.abs(py);
        if (ox > 0 && oy > 0) {
          if (ox < oy) {           // push out sideways + inherit card sweep
            const sgn = Math.sign(px) || 1;
            P[b] += sgn * ox;
            V[b]  = sgn * Math.max(Math.abs(V[b]), Math.abs(c.vx) * 0.9) + c.vx * 0.4;
            W_[b+2] -= sgn * Math.abs(c.vx) * 40;
          } else {                 // push down/up out of the card
            const sgn = Math.sign(py) || -1;
            P[b+1] += sgn * oy;
            V[b+1] = sgn * Math.abs(V[b+1]) * CFG.wallBounce + c.vx * 0.1;
          }
        }
      }

      // walls (Ballpit boundary code — gravity 0 ⇒ bounce off ALL walls,
      // so the field floats forever instead of pooling at a floor)
      if (Math.abs(P[b]) + rad > MX) { P[b] = Math.sign(P[b]) * (MX - rad); V[b] = -V[b] * CFG.wallBounce; }
      if (CFG.gravity === 0) {
        if (Math.abs(P[b+1]) + rad > MY) { P[b+1] = Math.sign(P[b+1]) * (MY - rad); V[b+1] = -V[b+1] * CFG.wallBounce; }
      } else if (P[b+1] - rad < -MY) {
        P[b+1] = -MY + rad; V[b+1] = -V[b+1] * CFG.wallBounce;
        W_[b] *= 0.9; W_[b+2] *= 0.9;
      }
      if (Math.abs(P[b+2]) + rad > CFG.zSpread) { P[b+2] = Math.sign(P[b+2]) * (CFG.zSpread - rad * 0.4); V[b+2] = -V[b+2] * CFG.wallBounce; }

      // tumble + settle
      W_[b]*=0.985; W_[b+1]*=0.985; W_[b+2]*=0.985;
      R[b] += W_[b]*dt; R[b+1] += W_[b+1]*dt; R[b+2] += W_[b+2]*dt;

      dummy.position.set(P[b], P[b+1], P[b+2]);
      dummy.rotation.set(R[b], R[b+1], R[b+2]);
      dummy.scale.setScalar(S[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
    if (canvas.dataset.state !== 'running') stamp('running');
  }

  // Only simulate while the section is on screen (it lives in a 400vh
  // pinned driver, so this is most of the services scroll)
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { running = en.isIntersecting; });
  }, { threshold: 0.05 });
  io.observe(section);

  rafId = requestAnimationFrame(step);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(rafId); renderer.dispose(); });
})();
