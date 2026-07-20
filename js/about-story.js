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

  /* Entry / parked / rail car sizes. The drive-in runs a touch larger
     than the parked pose, so arriving reads as the car easing off the
     throttle rather than one static scale throughout. */
  const SCL_ENTER = 2.4;
  const SCL_PARK  = 2.1;

  /* smoothed car state, so every move glides */
  const cur = { x: window.innerWidth + 300, y: 0, rot: 0, scl: SCL_ENTER };
  let smoothRp = 0;

  /* ── Cartoon speed lines ──────────────────────────────────
     Four streaks parked behind the car along its live motion
     vector — they exist only while the car is actually moving
     (velocity measured in pin-local space, so riding along with
     the page scroll doesn't count as "moving"). Each has its own
     trail distance, side offset and attack rate so the group
     flickers in playfully instead of blinking as one block. */
  const STREAKS = [
    { a: 0.85, side: -32, len: 74, op: .85, k: .30, cls: '' },
    { a: 1.15, side: -10, len: 96, op: .60, k: .22, cls: ' story-speed-line--deep' },
    { a: 0.95, side:  12, len: 60, op: .75, k: .34, cls: ' story-speed-line--soft' },
    { a: 1.30, side:  32, len: 84, op: .70, k: .18, cls: '' },
  ].map(cfg => {
    const el = document.createElement('span');
    el.className = 'story-speed-line' + cfg.cls;
    el.setAttribute('aria-hidden', 'true');
    pin.appendChild(el);
    return { ...cfg, el, cur: 0 };
  });
  let prevCar = null, prevT = 0;

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
      tscl = SCL_ENTER;                             // extra large on arrival
    } else if (p < 0.22) {
      // Overview: parked large on the right side
      tx   = parkX;
      ty   = parkY;
      trot = 0;
      tscl = SCL_PARK;
    } else if (p < 0.42) {
      // Transition: swing across onto the rail, shrinking while
      // rotating nose-DOWN (png faces left → -90°)
      const t = ss((p - 0.22) / 0.20);
      tx   = lerp(parkX, railX, t);
      ty   = lerp(parkY, railTop, t);
      trot = -90 * t;
      tscl = lerp(SCL_PARK, 1, t);
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

    const carL = cur.x - pinRect.left;
    const carT = cur.y - pinRect.top;
    car.style.left = carL.toFixed(1) + 'px';
    car.style.top  = carT.toFixed(1) + 'px';
    car.style.setProperty('--rot', cur.rot.toFixed(2) + 'deg');
    car.style.setProperty('--scl', cur.scl.toFixed(3));
    car.style.setProperty('--op', visible ? '1' : '0');

    // ── Speed lines: keyed off the car's REAL velocity ────────────
    // Measured in pin-local space, so the car merely riding along with
    // the scroll (entry phase y-lock) contributes nothing — streaks
    // appear only when the car visibly travels across the page.
    const now = performance.now();
    if (prevCar) {
      const dt    = Math.max((now - prevT) / 1000, 1e-3);
      const vx    = (carL - prevCar.x) / dt;
      const vy    = (carT - prevCar.y) / dt;
      const speed = Math.hypot(vx, vy);
      // silent below ~140 px/s, fully drawn by ~800 px/s
      const show  = visible ? clamp((speed - 140) / 660, 0, 1) : 0;
      const ang   = speed > 1 ? Math.atan2(vy, vx) : null;

      STREAKS.forEach(s => {
        s.cur += (show * s.op - s.cur) * s.k;
        if (s.cur < 0.015) { s.el.style.opacity = '0'; return; }
        if (ang !== null) {
          // trail behind the bumper: clear the car body (75px half-size
          // × scale) plus each streak's own gap along the motion vector
          const dist = (80 + s.a * 70) * cur.scl * 0.9;
          const cos = Math.cos(ang), sin = Math.sin(ang);
          s.el.style.left = (carL - cos * dist - sin * s.side).toFixed(1) + 'px';
          s.el.style.top  = (carT - sin * dist + cos * s.side).toFixed(1) + 'px';
          s.el.style.width = (s.len * (0.5 + show * 0.9)
            * clamp(cur.scl * 0.55, 0.6, 1.4)).toFixed(1) + 'px';
          s.el.style.setProperty('--a', (ang * 180 / Math.PI).toFixed(1) + 'deg');
        }
        s.el.style.opacity = s.cur.toFixed(3);
      });
    }
    prevCar = { x: carL, y: carT };
    prevT   = now;

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
