'use strict';

/* ============================================================
   About page — MISSION + VISION 3D cinema (drone cut).
   Scroll-scrubbed Three.js sequence; every state is a pure
   function of scroll progress, so scrolling up reverses it.

   The car stands in the desert of assets/images/model-bg.webp
   (CSS backdrop behind a transparent canvas, darkened 30% for
   text contrast). One continuous drone move:

   1  p 0.00–0.30  camera starts far TOP-DOWN, descends and
                   orbits around the car, closing in a little,
                   settling on a side beauty shot with the car
                   framed RIGHT
   2  p 0.30–0.57  MISSION headline scales up on the left, the
                   paragraph writes itself word by word
   3  p 0.57–0.82  camera swings around to the REAR, hanging a
                   little far back; the tailgate (side-hinged
                   swing gate, spare wheel mounted) opens
                   smoothly; the car settles framed LEFT
   4  p 0.80–1.00  VISION headline scales up on the right, the
                   paragraph writes itself

   Mobile: same sequence, framing centred and the camera pulled
   back to fit portrait. Reduced motion: bail, CSS shows the
   static stacked fallback (styles.css .cinema block).
============================================================ */

import * as THREE from 'three';
import { GLTFLoader }  from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'meshopt_decoder';

const driver = document.getElementById('cinemaDriver');
const canvas = document.getElementById('cinemaCanvas');
const missionCard = document.getElementById('cinMission');
const visionCard  = document.getElementById('cinVision');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (driver && canvas && !reduced) init();

/* Split a paragraph into .cin-word spans (keeps inline <em>) */
function splitWords(el) {
  const words = [];
  (function walk(root) {
    [...root.childNodes].forEach(node => {
      if (node.nodeType === 1) { walk(node); return; }
      if (node.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      (node.textContent || '').split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'cin-word';
        w.textContent = part;
        frag.appendChild(w);
        words.push(w);
      });
      root.replaceChild(frag, node);
    });
  })(el);
  return words;
}

function init() {
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const ss    = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const seg   = (p, a, b) => ss((p - a) / (b - a));

  const missionH     = missionCard.querySelector('.cinema__h');
  const visionH      = visionCard.querySelector('.cinema__h');
  const missionWords = splitWords(document.getElementById('cinMissionPar'));
  const visionWords  = splitWords(document.getElementById('cinVisionPar'));

  /* ── Renderer / scene — transparent canvas over the CSS desert plate ── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);

  /* ── 360° desert panorama, composited at runtime from the flat
        model-bg.webp plate. A static CSS backdrop makes an orbiting
        camera read as the CAR spinning; a real equirect background
        rotates with the camera, so the move reads as a drone flying
        around a standing car. Build: 4 × 90° mirror-tiled segments
        (mirroring makes every junction AND the 0/360 wrap seamless),
        sky/ground extended from sampled plate colours, the three
        duplicate suns muted into dusk glows (different "themes" per
        side), and the 30% contrast darkening baked in. ── */
  const img = new Image();
  img.onload = () => {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const eqW = 4096, eqH = 2048;
    const pc = document.createElement('canvas');
    pc.width = eqW; pc.height = eqH;
    const px = pc.getContext('2d');

    /* reference colours from the plate: sky (top strip), horizon ground
       (rows just under the horizon) and the MID-GROUND dunes (~60–75%
       height). The plate's very bottom is near-black foreground rock —
       sampling it made the whole lower hemisphere a void, so the nadir
       extension uses the brighter mid-ground tone instead. */
    const sc = document.createElement('canvas');
    sc.width = 1; sc.height = 3;
    const sx = sc.getContext('2d');
    sx.drawImage(img, 0, 0,        iw, ih * 0.06, 0, 0, 1, 1);   /* sky */
    sx.drawImage(img, 0, ih * 0.64, iw, ih * 0.08, 0, 1, 1, 1);  /* horizon ground */
    sx.drawImage(img, 0, ih * 0.72, iw, ih * 0.18, 0, 2, 1, 1);  /* mid-ground gravel */
    const sd = sx.getImageData(0, 0, 1, 3).data;
    const skyC = `rgb(${sd[0]},${sd[1]},${sd[2]})`;
    const gndC = `rgb(${sd[4]},${sd[5]},${sd[6]})`;
    const midR = sd[8], midG = sd[9], midB = sd[10];
    const midC = `rgb(${midR},${midG},${midB})`;

    /* the plate band: 4 segments × 90°; vertical span keeps square pixels */
    const segW = eqW / 4;
    const bandH = Math.round(eqH * (90 * (ih / iw)) / 180);
    const horizonFrac = 0.68;                       /* horizon row in the plate */
    const bandTop = Math.round(eqH / 2 - horizonFrac * bandH);

    /* mirror-tile the plate: A, mirror(A), A, mirror(A) */
    for (let i = 0; i < 4; i++) {
      px.save();
      if (i % 2) { px.translate((i + 1) * segW, 0); px.scale(-1, 1); }
      else px.translate(i * segW, 0);
      px.drawImage(img, 0, 0, iw, ih, 0, bandTop, segW, bandH);
      px.restore();
    }

    /* "themes" — graded on the BAND ONLY so the sky/ground extensions
       (painted next) keep their intended brightness. Keep the segment-0
       sun as THE sunset; mute its three mirror copies into cool dusk
       glows, then sweep a wrap-safe cool gradient over the far side. */
    const sunFx = 0.88, sunFy = 0.42;               /* storm-light break in the plate (right side) */
    const sunY = bandTop + sunFy * bandH;
    const keptU = (sunFx * segW) / eqW;
    /* copies that land circularly close to the kept glow (the edge glow
       wraps across 0/360 and merges with itself) must NOT be muted */
    const copies = [(1 + (1 - sunFx)) * segW, (2 + sunFx) * segW, (3 + (1 - sunFx)) * segW]
      .filter(cxp => {
        const du = Math.abs(cxp / eqW - keptU);
        return Math.min(du, 1 - du) > 0.1;
      });
    px.globalCompositeOperation = 'multiply';
    copies.forEach(cxp => {
      const rg = px.createRadialGradient(cxp, sunY, 0, cxp, sunY, segW * 0.30);
      rg.addColorStop(0, 'rgb(96,102,128)');
      rg.addColorStop(1, 'rgb(255,255,255)');
      px.fillStyle = rg;
      px.fillRect(cxp - segW * 0.30, sunY - segW * 0.30, segW * 0.60, segW * 0.60);
    });
    /* white (keep) at the sun's azimuth → cool dusk at the opposite
       side; sampled from a periodic curve so u=0 and u=1 match and the
       360° wrap has no seam */
    const f = (sunFx * segW) / eqW;                 /* the kept sun's azimuth */
    let g = px.createLinearGradient(0, 0, eqW, 0);
    for (let u = 0; u <= 1.001; u += 0.05) {
      const uu = Math.min(u, 1);
      const t = Math.cos(2 * Math.PI * (uu - f)) * 0.5 + 0.5;   /* 1 at sun, 0 opposite */
      const mix = (a, b) => Math.round(a + (b - a) * t);
      g.addColorStop(uu, `rgb(${mix(178, 255)},${mix(180, 255)},${mix(200, 255)})`);
    }
    px.fillStyle = g; px.fillRect(0, bandTop, eqW, bandH);
    px.globalCompositeOperation = 'source-over';

    /* sky above the band, ground below it. The nadir fills the whole
       frame in the top-down opening shot, so it stays on the sunlit
       mid-ground tone — never near black. */
    g = px.createLinearGradient(0, 0, 0, bandTop);
    g.addColorStop(0, '#0a0d13'); g.addColorStop(1, skyC);
    px.fillStyle = g; px.fillRect(0, 0, eqW, bandTop);
    g = px.createLinearGradient(0, bandTop + bandH, 0, eqH);
    g.addColorStop(0, gndC);
    g.addColorStop(1, midC);
    px.fillStyle = g; px.fillRect(0, bandTop + bandH, eqW, eqH - bandTop - bandH);

    /* soften the band's top/bottom edges into the fills */
    g = px.createLinearGradient(0, bandTop, 0, bandTop + 90);
    g.addColorStop(0, skyC); g.addColorStop(1, 'rgba(0,0,0,0)');
    px.fillStyle = g; px.fillRect(0, bandTop, eqW, 90);
    g = px.createLinearGradient(0, bandTop + bandH, 0, bandTop + bandH - 90);
    g.addColorStop(0, gndC); g.addColorStop(1, 'rgba(0,0,0,0)');
    px.fillStyle = g; px.fillRect(0, bandTop + bandH - 90, eqW, 90);

    /* contrast overlay: bake a lighter 12% (ACES tone mapping already
       darkens scene.background vs the raw plate; combined this lands
       near the requested ~30% perceived darkening) */
    px.fillStyle = 'rgba(0,0,0,0.12)';
    px.fillRect(0, 0, eqW, eqH);

    const pano = new THREE.CanvasTexture(pc);
    pano.colorSpace = THREE.SRGBColorSpace;
    pano.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = pano;
    scene.backgroundIntensity = 0.82;   /* moody — the scene sits dark */
    /* rotation tuned so the mirror junctions (every 90°) sit ~45° off
       the centre of BOTH the side and the rear hero shots — a junction
       centred in frame reads as a butterfly-symmetric mountain */
    scene.backgroundRotation = new THREE.Euler(0, Math.PI * 1.20, 0);

    /* ── Ground: two stacked discs so the car stands on REAL terrain ── */
    /* Layer 1 — detail tile cropped straight out of the plate's own
       foreground gravel, so the floor is literally the image's
       material. MirroredRepeatWrapping makes any crop seamless
       (edges reflect instead of jumping), and on noisy gravel the
       mirroring itself is invisible. A whisper of neutral grain masks
       the crop's upscale softness; the same canvas doubles as bump
       map so the stones respond to the key light. */
    const TS = 512;
    const tile = document.createElement('canvas');
    tile.width = tile.height = TS;
    const tx = tile.getContext('2d');
    const cropS = Math.round(ih * 0.22);
    tx.drawImage(img, Math.round((iw - cropS) / 2), ih - cropS - 2, cropS, cropS, 0, 0, TS, TS);
    /* a whisper of dark grain only — bright added specks shimmer at
       grazing angles and read as water */
    for (let i = 0; i < 2500; i++) {
      const sxp = Math.random() * TS, syp = Math.random() * TS;
      tx.fillStyle = `rgba(6,8,12,${0.05 + Math.random() * 0.08})`;
      tx.fillRect(sxp, syp, 1, 1);
    }
    /* COLOUR map = softened, contrast-flattened copy — bright albedo
       speckle smears into a wet-water sheen at grazing angles; real
       gravel reads through SHADING, so the sharp copy drives the bump
       relief instead and the colour stays calm. */
    const mapTile = document.createElement('canvas');
    mapTile.width = mapTile.height = TS;
    const mpx = mapTile.getContext('2d');
    mpx.filter = 'blur(1.2px)';
    mpx.drawImage(tile, 0, 0);
    mpx.filter = 'none';
    mpx.fillStyle = `rgba(${midR},${midG},${midB},0.30)`;
    mpx.fillRect(0, 0, TS, TS);
    const tileTex = new THREE.CanvasTexture(mapTile);
    tileTex.colorSpace = THREE.SRGBColorSpace;
    tileTex.wrapS = tileTex.wrapT = THREE.MirroredRepeatWrapping;
    tileTex.repeat.set(5.5, 5.5);
    tileTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const bumpTex = new THREE.CanvasTexture(tile);
    bumpTex.wrapS = bumpTex.wrapT = THREE.MirroredRepeatWrapping;
    bumpTex.repeat.set(5.5, 5.5);

    /* SMALL disc — only the ground the car actually stands on. Beyond
       its faded rim the panorama's own photographed terrain shows, so
       the mid/far ground is literally the image, not a tiled imitation. */
    const groundDisc = new THREE.Mesh(
      new THREE.CircleGeometry(16, 48),
      new THREE.MeshStandardMaterial({
        map: tileTex,
        bumpMap: bumpTex,
        bumpScale: 0.4,
        /* darkened so the lit disc sits at the pano floor's tone instead
           of ringing against it */
        color: 0xb4bac4,
        roughness: 1,
      })
    );
    groundDisc.rotation.x = -Math.PI / 2;
    groundDisc.position.y = 0.002;
    groundDisc.receiveShadow = true;   /* the car's shadow falls on real gravel */
    scene.add(groundDisc);

    /* Layer 2 — distance blend: transparent over the car, fading to the
       panorama's floor tone at the rim so the tiled detail melts into
       the backdrop instead of ending at a hard edge. Low-frequency
       mottling lives here (never in the tile — repeated low-freq
       features would read as an obvious pattern). */
    const BS = 1024;
    const bc = document.createElement('canvas');
    bc.width = bc.height = BS;
    const bx2 = bc.getContext('2d');
    for (let i = 0; i < 40; i++) {
      const mx = Math.random() * BS, my = Math.random() * BS;
      const mr = 40 + Math.random() * 130;
      const mg = bx2.createRadialGradient(mx, my, 0, mx, my, mr);
      mg.addColorStop(0, Math.random() < 0.5 ? 'rgba(218,224,234,0.07)' : 'rgba(8,10,14,0.13)');
      mg.addColorStop(1, 'rgba(0,0,0,0)');
      bx2.fillStyle = mg;
      bx2.fillRect(0, 0, BS, BS);
    }
    const rg = bx2.createRadialGradient(BS / 2, BS / 2, 0, BS / 2, BS / 2, BS / 2);
    rg.addColorStop(0.00, `rgba(${midR},${midG},${midB},0)`);
    rg.addColorStop(0.40, `rgba(${midR},${midG},${midB},0)`);
    rg.addColorStop(0.72, `rgba(${midR},${midG},${midB},.80)`);
    rg.addColorStop(1.00, `rgba(${midR},${midG},${midB},1)`);
    bx2.fillStyle = rg;
    bx2.fillRect(0, 0, BS, BS);
    const blendTex = new THREE.CanvasTexture(bc);
    blendTex.colorSpace = THREE.SRGBColorSpace;
    const blendDisc = new THREE.Mesh(
      new THREE.CircleGeometry(16, 48),
      new THREE.MeshBasicMaterial({ map: blendTex, transparent: true, depthWrite: false })
    );
    blendDisc.rotation.x = -Math.PI / 2;
    blendDisc.position.y = 0.004;
    scene.add(blendDisc);
  };
  img.src = '/assets/images/model-bg03.webp';

  /* ── Lights — neutral/cool rig to match the monochrome basalt plate
        (a warm sunset rig would clash with the storm light) ── */
  /* low ambient — deep shadows give the paint its contrast; the key and
     rim carve the body out of the dark backdrop */
  scene.add(new THREE.HemisphereLight(0xc8d2e2, 0x33363c, 0.65));
  /* near-vertical key → compact contact shadow straight under the car;
     a long directional shadow would contradict the plate's fixed sun
     as the camera orbits */
  const key = new THREE.DirectionalLight(0xf4f6fa, 2.6);
  key.position.set(1.5, 10, 1.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 40;
  key.shadow.camera.left = -6; key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;   key.shadow.camera.bottom = -6;
  key.shadow.bias = -0.0005;   key.shadow.normalBias = 0.02;
  scene.add(key);
  /* cool rim from behind so the tail reads in the rear shot */
  const rim = new THREE.DirectionalLight(0xdde8f6, 2.6);
  rim.position.set(-8, 4, -5);
  scene.add(rim);
  /* soft cool fill from the opposite quarter so the shadow side of the
     black body never collapses to a silhouette */
  const fill = new THREE.DirectionalLight(0xdfe6f2, 0.7);
  fill.position.set(7, 3, 6);
  scene.add(fill);

  /* ── Car ── */
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);

  let car = null, trunkPivot = null, trunkSign = 1, KEYS = null;
  /* tail lights — the Light_RED lens materials (cloned per-mesh) plus a
     soft red spill light; both fade on with the vision beat */
  const tailMats = [];
  const tailGlow = new THREE.PointLight(0xff1616, 0, 6);
  scene.add(tailGlow);
  /* the pivot's parent is rotated in the GLB, so the swing must be
     computed about the WORLD vertical axis, not the pivot's local Y */
  const trunkParentQ = new THREE.Quaternion();
  const _swingQ = new THREE.Quaternion(), _invQ = new THREE.Quaternion();
  const _yAxis = new THREE.Vector3(0, 1, 0);

  /* porcelain-gray variant (same rig as the local camel GLB) — light
     paint against the charcoal basalt plate.
     NOTE: the R2 colour GLBs ship with panels POSED OPEN (doors/trunk/
     bonnet) — reset them to closed exactly like js/v27.js prepModel,
     BEFORE any bbox measurement or the trunk hinge is built. */
  const CLOSE_PANELS = new Set(['Door_FL', 'Door_FR', 'Door_BL', 'Door_BR', 'Trunk', 'Bonnet']);
  loader.load('https://pub-835dbefa2ea84f599cef0519f76de888.r2.dev/car-v27-porcelain-gray.glb', (gltf) => {
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
          /* glass ships opaque in this GLB — make it read as glass */
          if (/glass/i.test(m.name || '')) {
            m.transparent = true;
            m.opacity = /dark/i.test(m.name) ? 0.42 : 0.16;
            m.side = THREE.DoubleSide;
            m.depthWrite = false;
          }
          /* dark paint reads through reflections — lift the env response */
          if ('envMapIntensity' in m) m.envMapIntensity = 1.35;
        });
      }
      if (/^Wheel_(FL|FR|BL|BR)$/.test(o.name)) wheels.push(o);
    });

    car = new THREE.Group();
    car.add(body);
    scene.add(car);

    /* Nose → +X (yaw measured off the wheel hubs, as in js/v27.js) */
    body.updateMatrixWorld(true);
    const hubMid = re => {
      const g = wheels.filter(w => re.test(w.name));
      if (!g.length) return null;
      const c = new THREE.Vector3();
      g.forEach(w => c.add(new THREE.Box3().setFromObject(w).getCenter(new THREE.Vector3())));
      return c.divideScalar(g.length);
    };
    const front = hubMid(/^Wheel_F/), back = hubMid(/^Wheel_B/);
    if (front && back) {
      const yaw = Math.atan2(front.x - back.x, front.z - back.z);
      car.rotation.y = Math.PI / 2 - yaw;
    }

    /* Normalise: 4.6-unit length, grounded, centred */
    car.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(car);
    car.scale.setScalar(4.6 / box.getSize(new THREE.Vector3()).x);
    car.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(car);
    const centre = box.getCenter(new THREE.Vector3());
    car.position.x -= centre.x;
    car.position.z -= centre.z;
    car.position.y -= box.min.y;
    car.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(car);

    /* driver side sign (same convention as the doors) */
    const doorNode = car.getObjectByName('Door_FL');
    const s = doorNode
      ? (Math.sign(new THREE.Box3().setFromObject(doorNode).getCenter(new THREE.Vector3()).z) || 1)
      : 1;

    /* ── Tailgate: this V27 carries its spare on the gate, so it is a
          SIDE-HINGED swing gate — vertical hinge on the kerb-side edge,
          panel swings out rearward like a door ── */
    const trunkNode = car.getObjectByName('Trunk');
    if (trunkNode) {
      const tb = new THREE.Box3().setFromObject(trunkNode);
      const hingeZ = s > 0 ? tb.min.z : tb.max.z;   /* edge opposite the driver side */
      const parent = trunkNode.parent;
      trunkPivot = new THREE.Object3D();
      parent.add(trunkPivot);
      parent.updateMatrixWorld(true);
      trunkPivot.position.copy(parent.worldToLocal(
        new THREE.Vector3(tb.max.x, (tb.min.y + tb.max.y) / 2, hingeZ)));
      trunkPivot.updateMatrixWorld(true);
      trunkPivot.attach(trunkNode);
      trunkSign = -s;   /* free edge swings rearward/outward */
      parent.getWorldQuaternion(trunkParentQ);
    }

    /* ── Tail lights: clone the Light_RED lens materials on the two rear
          lamps (cloned so nothing else sharing the material glows) and
          prime them to emit red; the frame loop drives the intensity ── */
    ['Light_BL', 'Light_BR'].forEach(name => {
      const lamp = car.getObjectByName(name);
      if (!lamp) return;
      lamp.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m, i) => {
          if (!/light_red/i.test(m.name || '')) return;
          const glow = m.clone();
          glow.emissive = new THREE.Color(0xff0f0f);
          glow.emissiveIntensity = 0;
          if (Array.isArray(o.material)) o.material[i] = glow;
          else o.material = glow;
          tailMats.push(glow);
        });
      });
    });
    /* red spill centred behind the tailgate */
    tailGlow.position.set(box.min.x - 0.3, 0.95, 0);

    /* ── Drone keyframes: top → side (car RIGHT) → rear (car LEFT).
          `shift` is a screen-space horizontal offset (fraction of the
          viewport) applied via setViewOffset — negative pushes the car
          right, positive pushes it left. Zeroed on narrow screens. ── */
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const rearX = box.min.x;
    KEYS = [
      /* 1 — far top establishing. High angle but not straight nadir, and
         the raised look target keeps the car LOW in frame, over the
         terrain band of the eye-level backdrop plate (dead-centre over
         the mountains it reads as floating). */
      { p: 0.00, pos: V( 3.8, 10.6, s * 2.6), look: V(0, 2.30, 0), shift: 0 },
      /* descend + orbit around the nose to the driver side */
      { p: 0.10, pos: V( 3.0,  7.4, s * 4.4), look: V(0, 1.80, 0), shift: -0.05 },
      { p: 0.20, pos: V( 1.7,  3.7, s * 6.3), look: V(0, 1.15, 0), shift: -0.13 },
      /* side beauty shot, a little closer, car framed right */
      { p: 0.30, pos: V( 0.2,  1.65, s * 5.8), look: V(0, 0.95, 0), shift: -0.19 },
      /* slow drift while the mission writes */
      { p: 0.55, pos: V(-0.5,  1.55, s * 5.5), look: V(0, 0.95, 0), shift: -0.19 },
      /* swing around the tail… */
      { p: 0.68, pos: V(-4.9,  1.85, s * 4.9), look: V(-0.4, 0.90, 0), shift: 0 },
      /* …to a slightly distant rear shot, car framed left */
      /* …to a CLOSE rear shot aimed at the tailgate, so the gate is
         clearly seen swinging open */
      { p: 0.82, pos: V(rearX - 3.6, 1.85, s * 1.2), look: V(rearX + 0.9, 1.05, 0), shift: 0.18 },
      /* settle while the vision writes */
      { p: 1.00, pos: V(rearX - 3.3, 1.70, s * 0.5), look: V(rearX + 0.9, 1.00, 0), shift: 0.20 },
    ];

    window.__cinema = { car, trunkPivot, trunkSign, KEYS, box };
  }, undefined, err => console.warn('cinema GLB load error:', err));

  /* ── Scroll-scrubbed frame loop ── */
  const lookCur = new THREE.Vector3(0, 0.9, 0);
  const posCur  = new THREE.Vector3();

  function pose(p) {
    let a = KEYS[0], b = KEYS[KEYS.length - 1];
    for (let i = 0; i < KEYS.length - 1; i++) {
      if (p >= KEYS[i].p && p <= KEYS[i + 1].p) { a = KEYS[i]; b = KEYS[i + 1]; break; }
    }
    const t = a === b ? 0 : ss((p - a.p) / (b.p - a.p));
    posCur.lerpVectors(a.pos, b.pos, t);
    lookCur.lerpVectors(a.look, b.look, t);
    let shift = a.shift + (b.shift - a.shift) * t;

    const w = window.innerWidth, h = window.innerHeight;
    const aspect = w / h;
    /* portrait: pull the camera back to fit, centre the framing */
    const fit = aspect >= 1 ? 1 : clamp(1.28 / aspect, 1, 2.25);
    shift *= clamp((aspect - 0.9) / 0.4, 0, 1);

    camera.position.copy(lookCur).addScaledVector(posCur.clone().sub(lookCur), fit);
    camera.lookAt(lookCur);
    camera.setViewOffset(w, h, shift * w, 0, w, h);
  }

  function frame() {
    requestAnimationFrame(frame);
    const rect = driver.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
    const scrollable = Math.max(driver.offsetHeight - window.innerHeight, 1);
    const p = clamp(-rect.top / scrollable, 0, 1);

    if (car && KEYS) {
      pose(p);

      /* swing gate: eases open on the way to the rear shot, stays open.
         Rotation happens about the WORLD vertical axis at the hinge —
         qLocal = Qp⁻¹ · R(worldY, θ) · Qp — so the gate swings flat
         like a real door regardless of the GLB's nested rotations. */
      if (trunkPivot) {
        const ang = trunkSign * seg(p, 0.64, 0.82) * 1.28;
        _swingQ.setFromAxisAngle(_yAxis, ang);
        _invQ.copy(trunkParentQ).invert();
        trunkPivot.quaternion.copy(_invQ).multiply(_swingQ).multiply(trunkParentQ);
      }

      /* tail lights fade ON as the rear (vision) shot arrives —
         pure function of p, so they dim back off on reverse scroll */
      const tl = seg(p, 0.72, 0.84);
      tailMats.forEach(m => { m.emissiveIntensity = tl * 2.4; });
      tailGlow.intensity = tl * 1.5;

      renderer.render(scene, camera);
    }

    /* ── Text overlays (pure functions of p) ──
       Mission: headline scales up, then the paragraph writes. */
    const mIn  = seg(p, 0.30, 0.36) * (1 - seg(p, 0.57, 0.64));
    const mPop = seg(p, 0.30, 0.385);
    missionCard.style.opacity = mIn.toFixed(3);
    missionH.style.opacity   = mPop.toFixed(3);
    missionH.style.transform = `scale(${(0.55 + 0.45 * mPop).toFixed(3)})`;
    const nM = missionWords.length || 1;
    missionWords.forEach((w, i) => {
      const wsP = 0.375 + (i / nM) * 0.155;
      const o = seg(p, wsP, wsP + 0.03);
      w.style.opacity = o.toFixed(3);
      w.style.transform = `translateY(${((1 - o) * 10).toFixed(1)}px)`;
    });

    /* Vision: same beat on the right, over the rear shot */
    const vIn  = seg(p, 0.80, 0.86);
    const vPop = seg(p, 0.80, 0.875);
    visionCard.style.opacity = vIn.toFixed(3);
    visionH.style.opacity   = vPop.toFixed(3);
    visionH.style.transform = `scale(${(0.55 + 0.45 * vPop).toFixed(3)})`;
    const nV = visionWords.length || 1;
    visionWords.forEach((w, i) => {
      const wsP = 0.86 + (i / nV) * 0.105;
      const o = seg(p, wsP, wsP + 0.03);
      w.style.opacity = o.toFixed(3);
      w.style.transform = `translateY(${((1 - o) * 10).toFixed(1)}px)`;
    });
  }
  requestAnimationFrame(frame);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
