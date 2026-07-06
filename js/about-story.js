'use strict';

/* ============================================================
   About page — pinned story scene driver.
   Entering the section: the PNG car drives in BIG from the RIGHT
   while the scene scrolls into view, and parks on the right side.
   Transition: it swings across onto the gray rail, shrinking
   while rotating -90° (nose down). Story: it rides the rail —
   sized to match the text block — filling it orange behind it,
   lighting the steps and stacking the images on the right.
============================================================ */
(function () {
  const scene = document.getElementById('aboutScene');
  if (!scene) return;

  const pin       = scene.querySelector('.about-scene__pin');
  const ovPanel   = scene.querySelector('.scene-panel--overview');
  const stPanel   = scene.querySelector('.scene-panel--story');
  const steps     = [...scene.querySelectorAll('.saga-step')];
  const fill      = document.getElementById('storyRailFill');
  const line      = scene.querySelector('.story-rail__line');
  const rail      = scene.querySelector('.story-rail');
  const stepsBox  = scene.querySelector('.about-saga__steps');
  const car       = document.getElementById('storySceneCar');
  const stackImgs = [...scene.querySelectorAll('.story-stack__img')];
  if (!pin || !car || !line) return;

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const ss    = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const lerp  = (a, b, t) => a + (b - a) * t;
  const seg   = (p, a, b) => ss((p - a) / (b - a));

  /* smoothed car state, so every move glides */
  const cur = { x: window.innerWidth + 300, y: 0, rot: 0, scl: 1.75 };
  let smoothRp = 0;

  function frame() {
    const sr = scene.getBoundingClientRect();
    const scrollable = Math.max(scene.offsetHeight - window.innerHeight, 1);
    const p = clamp(-sr.top / scrollable, 0, 1);
    const vw = window.innerWidth, vh = window.innerHeight;

    // Panels
    const ovOp = 1 - seg(p, 0.22, 0.38);
    const stOp = seg(p, 0.34, 0.50);
    if (ovPanel) { ovPanel.style.opacity = ovOp; ovPanel.style.transform = `translateY(${(ovOp - 1) * 180}px)`; }
    if (stPanel) { stPanel.style.opacity = stOp; stPanel.style.transform = `translateY(${(1 - stOp) * 120}px)`; }

    // Rail spans exactly the story text block
    if (rail && stepsBox && stPanel) {
      const stepsRect = stepsBox.getBoundingClientRect();
      const panelRect = stPanel.getBoundingClientRect();
      rail.style.top    = (stepsRect.top - panelRect.top).toFixed(1) + 'px';
      rail.style.height = stepsRect.height.toFixed(1) + 'px';
      rail.style.bottom = 'auto';
    }

    // Rail geometry (viewport coords → pin-local)
    const pinRect = pin.getBoundingClientRect();
    const lr      = line.getBoundingClientRect();
    const railX   = lr.left + lr.width / 2;
    const railTop = lr.top, railH = lr.height;

    // Rail progress across the story phase
    const rp = seg(p, 0.42, 0.96);
    smoothRp += (rp - smoothRp) * 0.14;
    if (fill) fill.style.height = (smoothRp * 100).toFixed(2) + '%';

    // ── Car choreography ──────────────────────────────────
    // visible from the moment the section starts entering the viewport
    const visible = sr.top < vh * 0.75 && sr.bottom > vh * 0.4;
    const parkX = vw * 0.72, parkY = vh * 0.76;     // parked on the RIGHT
    let tx, ty, trot, tscl;

    if (sr.top > 0) {
      // Entering: locked vertically to the section (rides with it,
      // no float) while driving in from off-screen right; the
      // drive completes exactly as the pin engages
      const t = ss((vh * 0.35 - sr.top) / (vh * 0.35));
      tx   = lerp(vw + 260, parkX, t);
      ty   = sr.top + parkY;
      trot = 0;                                     // png faces left — driving in
      tscl = 1.75;                                  // large on arrival
    } else if (p < 0.22) {
      // Overview: parked large on the right side
      tx   = parkX;
      ty   = parkY;
      trot = 0;
      tscl = 1.75;
    } else if (p < 0.42) {
      // Transition: swing across onto the rail, shrinking while
      // rotating nose-DOWN (png faces left → -90°)
      const t = ss((p - 0.22) / 0.20);
      tx   = lerp(parkX, railX, t);
      ty   = lerp(parkY, railTop, t);
      trot = -90 * t;
      tscl = lerp(1.75, 1, t);
    } else {
      // Story: ride the line, nose down
      tx   = railX;
      ty   = railTop + railH * smoothRp;
      trot = -90;
      tscl = 1;
    }

    const K = 0.16;
    cur.x   += (tx   - cur.x)   * K;
    cur.y   += (ty   - cur.y)   * K;
    cur.rot += (trot - cur.rot) * K;
    cur.scl += (tscl - cur.scl) * K;
    // While entering, y must track the section exactly — smoothing
    // here would read as vertical drift against the copy
    if (sr.top > 0) cur.y = ty;

    car.style.left = (cur.x - pinRect.left).toFixed(1) + 'px';
    car.style.top  = (cur.y - pinRect.top).toFixed(1) + 'px';
    car.style.setProperty('--rot', cur.rot.toFixed(2) + 'deg');
    car.style.setProperty('--scl', cur.scl.toFixed(3));
    car.style.setProperty('--op', visible ? '1' : '0');

    // Steps light up as the car passes
    const active = stOp < 0.5 ? -1 : (smoothRp < 0.5 ? 0 : 1);
    steps.forEach((el, i) => el.classList.toggle('is-active', i === active));

    // Images stack in as the car drives down
    stackImgs.forEach((img, i) => {
      img.classList.toggle('is-in', smoothRp > 0.14 + i * 0.3);
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
