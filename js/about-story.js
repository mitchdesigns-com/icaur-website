'use strict';

/* ============================================================
   About page — pinned story scene driver.
   Entering the section: the car sits BIG at the TOP LEFT, cropped
   by the edge of the screen, on a front-right three-quarter.
   Overview: scrolling walks it DOWN past the copy while the model
   itself spins a full 360° about its own axis, shrinking the whole
   way, until it comes to rest small and FRONT-ON under the paragraph
   — in the space the CTA used to occupy — and stays there.
   Story: scrolls in around the parked car and plays with no car of
   its own — rail fill, lighting steps and image stack all read from
   scroll progress.
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
  const ovLead    = scene.querySelector('.about-overview__lead');
  const scribble  = document.getElementById('aboutHeadScribble');

  /* ── Per-LINE orange bars ────────────────────────────────────
     A paragraph's lines only exist after layout, so they are measured
     with a Range (one client rect per rendered line) and a bar is placed
     over each. Re-measured on resize because the line count changes with
     the width. Each bar starts covering its line and slides off to the
     right; the stagger between them is what makes the copy resolve line
     by line instead of all at once. */
  function lineHost(p) {
    if (!p) return null;
    let host = p.querySelector(':scope > .lw-boxes');
    if (!host) {
      host = document.createElement('span');
      host.className = 'lw-boxes';
      host.setAttribute('aria-hidden', 'true');
      p.appendChild(host);
    }
    return host;
  }
  function measureLines(p) {
    const host = lineHost(p);
    if (!host) return [];
    // measure the TEXT only — the bar host must not be part of the range
    const range = document.createRange();
    const nodes = [...p.childNodes].filter(n => n !== host);
    if (!nodes.length) return [];
    range.setStartBefore(nodes[0]);
    range.setEndAfter(nodes[nodes.length - 1]);
    const pr = p.getBoundingClientRect();
    // client rects come per line box; merge slivers from inline wrapping
    const rects = [...range.getClientRects()].filter(r => r.width > 4 && r.height > 4);
    const lines = [];
    rects.forEach(r => {
      const prev = lines[lines.length - 1];
      if (prev && Math.abs(r.top - prev.top) < 4) {
        prev.left = Math.min(prev.left, r.left);
        prev.right = Math.max(prev.right, r.right);
      } else {
        lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
      }
    });
    host.innerHTML = '';
    return lines.map(l => {
      const b = document.createElement('span');
      b.className = 'lw-box';
      b.style.left   = (l.left - pr.left - 6).toFixed(1) + 'px';
      b.style.top    = (l.top - pr.top - 2).toFixed(1) + 'px';
      b.style.width  = (l.right - l.left + 12).toFixed(1) + 'px';
      b.style.height = (l.bottom - l.top + 4).toFixed(1) + 'px';
      host.appendChild(b);
      return b;
    });
  }

  /* eased retract, with a tiny delay between consecutive lines.
     PHONES: the same copy wraps to ~9 lines instead of 6, so a per-line
     stagger turned a snappy effect into a slow "still loading" crawl —
     there the lines clear almost together, in a single quick pass. */
  const narrow       = () => window.innerWidth <= 860;
  const LINE_STAGGER = narrow() ? 0.02 : 0.10;   // fraction of the para's window
  const LINE_DUR     = narrow() ? 0.35 : 0.55;
  /* The overview paragraph runs on its OWN clock rather than the scroll:
     tied to scroll, the bars park over the copy for as long as the reader
     pauses, which reads as broken rather than as an effect. 700ms carries
     the last line past full retract in a little under a second. */
  const OV_PLAY_MS = narrow() ? 420 : 700;
  let ovPlaying = false, ovStart = 0;
  /* Story steps share the clock but fire one after another — the gap keeps
     the two paragraphs reading as separate beats rather than one flash. */
  const ST_STEP_DELAY = narrow() ? 120 : 260;
  let stPlaying = false, stStart = 0;
  const easeOutCubic = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  function playLines(bars, T) {
    bars.forEach((b, i) => {
      const t = easeOutCubic((T - i * LINE_STAGGER) / LINE_DUR);
      b.style.transform = `scaleX(${(1 - t).toFixed(3)})`;
    });
  }

  let stepBars = [], ovBars = [];
  function measureAll() {
    stepBars = steps.map(el => measureLines(el.querySelector('p')));
    ovBars   = measureLines(ovLead);
  }
  measureAll();
  window.addEventListener('resize', measureAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);
  window.addEventListener('load', measureAll);
  if (!pin || !car || !line) return;

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const ss    = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const lerp  = (a, b, t) => a + (b - a) * t;
  const seg   = (p, a, b) => ss((p - a) / (b - a));

  /* Entry / landed / rail car sizes. It arrives oversized and cropped, then
     shrinks the whole way down the copy, so the run reads as the car driving
     away from the reader rather than sliding at one flat size. */
  const SCL_ENTER = 2.4;
  const SCL_LAND  = 1.0;

  /* Where the descent finishes. js/about-glb.js spins the model through a
     full turn across this SAME window, so the two must stay in step — the
     car is meant to come to rest and face front on the same frame. */
  const DRIVE_END = 0.20;

  /* smoothed car state, so every move glides. Parked off the LEFT edge now,
     so the first frames ease in from the crop rather than fly across. */
  const cur = { x: -300, y: 0, rot: 0, scl: SCL_ENTER };
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

    /* Panels — no crossfade. The handoff reads like NORMAL scrolling inside
       the pin: overview (with the car parked on it) rides up and off as one
       block while the story panel comes in from below it, the two stacked a
       viewport apart the whole way — nothing fades, nothing dissolves. */
    const slide = seg(p, 0.24, 0.44);
    const stOp  = seg(p, 0.34, 0.50);      // gates steps/bars, NOT opacity
    if (ovPanel) { ovPanel.style.opacity = 1; ovPanel.style.transform = `translateY(${(-vh * slide).toFixed(1)}px)`; }
    if (stPanel) { stPanel.style.opacity = 1; stPanel.style.transform = `translateY(${(vh * (1 - slide)).toFixed(1)}px)`; }

    // Rail spans exactly the story text block
    if (rail && stepsBox && stPanel) {
      const stepsRect = stepsBox.getBoundingClientRect();
      const panelRect = stPanel.getBoundingClientRect();
      rail.style.top    = (stepsRect.top - panelRect.top).toFixed(1) + 'px';
      rail.style.height = stepsRect.height.toFixed(1) + 'px';
      rail.style.bottom = 'auto';
    }

    const pinRect = pin.getBoundingClientRect();

    // Rail progress across the story phase
    const rp = seg(p, 0.42, 0.96);
    smoothRp += (rp - smoothRp) * 0.14;
    if (fill) fill.style.height = (smoothRp * 100).toFixed(2) + '%';

    // ── Car choreography ──────────────────────────────────
    // Fully opaque the whole time the section is on screen — never faded,
    // never moved off. It parks and simply stays put through the Story.
    const visible = sr.top < vh * 0.75 && sr.bottom > vh * 0.4;
    const carOp   = visible ? 1 : 0;

    /* Start: up top, pushed far enough left that the screen edge crops it.
       Land: dead centre UNDER the paragraph, in the CTA's old place. The
       lead's rect is read LIVE — it already carries the panel's slide
       transform — so once parked, the car rides up glued to the copy.
       PHONES: no side theatre — the car sits centred ABOVE the eyebrow,
       descends straight down the middle (spin intact) and stops at the
       end of the paragraph, centred the whole way. */
    const mob    = vw <= 960;
    const leadR  = ovLead ? ovLead.getBoundingClientRect() : null;
    const eyeR   = mob ? scene.querySelector('.about-overview__inner .eyebrow')?.getBoundingClientRect() : null;
    /* mobile keeps the CTA button (desktop hides it in the car's favour) —
       the car must settle BELOW it, not on top of it */
    const ctaR   = mob ? scene.querySelector('.about-overview__cta')?.getBoundingClientRect() : null;
    const sEnter = mob ? 1.15 : SCL_ENTER;
    const sLand  = mob ? 0.8  : SCL_LAND;
    const startX = mob ? vw / 2 : vw * 0.08;
    const startY = mob ? (eyeR ? eyeR.top - 96 : vh * 0.14) : vh * 0.26;
    const landX  = leadR ? leadR.left + leadR.width / 2 : vw * 0.5;
    const landY  = mob && ctaR ? ctaR.bottom + 78
                 : leadR ? leadR.bottom + (mob ? 64 : 92) : vh * 0.78;
    let tx, ty, trot, tscl;

    /* Phones: the drive is synced to the SCREEN from the first scroll —
       the section's entry covers the opening stretch of the descent, the
       pinned scroll carries the rest, one continuous progress. */
    const ENTRY_SHARE = 0.45;
    const entry = clamp(1 - sr.top / vh, 0, 1);
    const mobT  = clamp(entry * ENTRY_SHARE
                + ss(clamp(p / DRIVE_END, 0, 1)) * (1 - ENTRY_SHARE), 0, 1);

    if (sr.top > 0 && !mob) {
      // Entering (desktop): locked vertically to the section so it rides
      // with it rather than floating against it
      tx   = startX;
      ty   = sr.top + startY;
      trot = 0;
      tscl = sEnter;
    } else if (mob ? mobT < 1 : p < DRIVE_END) {
      // Overview: the descent past the copy. Down and inward on a shallow
      // bow — a straight line between the two points reads as a slide, the
      // bow reads as steering — shrinking to the parked size on arrival.
      // The 360° turn belongs to the MODEL, not the path: js/about-glb.js
      // spins it about its own axis across this same window.
      // (phones: no bow — the descent stays dead centre, and t is the
      // combined entry+pin progress so it moves with the very first scroll)
      const t = mob ? mobT : ss(p / DRIVE_END);
      tx   = lerp(startX, landX, t) + (mob ? 0 : Math.sin(t * Math.PI) * vw * 0.05);
      ty   = lerp(startY, landY, t);
      trot = 0;
      tscl = lerp(sEnter, sLand, t);
    } else {
      /* Landed. It stays parked on the overview — landY reads the live,
         already-translated rect, so when the panel slides up and away the
         car goes with it, part of the section, exactly like normal scroll. */
      tx   = landX;
      ty   = landY;
      trot = 0;
      tscl = sLand;
    }

    const K = 0.16;
    cur.x   += (tx   - cur.x)   * K;
    cur.y   += (ty   - cur.y)   * K;
    cur.rot += (trot - cur.rot) * K;
    cur.scl += (tscl - cur.scl) * K;
    // While entering, y must track the section exactly — smoothing
    // here would read as vertical drift against the copy. Same once the
    // slide starts: parked means BOLTED to the panel, not trailing it.
    if (sr.top > 0 || slide > 0.001) cur.y = ty;

    const carL = cur.x - pinRect.left;
    const carT = cur.y - pinRect.top;
    car.style.left = carL.toFixed(1) + 'px';
    car.style.top  = carT.toFixed(1) + 'px';
    car.style.setProperty('--rot', cur.rot.toFixed(2) + 'deg');
    car.style.setProperty('--scl', cur.scl.toFixed(3));
    car.style.setProperty('--op', carOp.toFixed(3));

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

    // ── Orange drifting boxes, line by line ──────────────────
    // Both copies run on their OWN clocks, never the scroll: each fires the
    // moment its panel has arrived, plays itself out fast, and re-arms only
    // after the section has left again, so coming back replays it.
    if (!ovPlaying && sr.top < vh * 0.45) { ovPlaying = true; ovStart = now; }
    else if (ovPlaying && sr.top > vh * 0.95) ovPlaying = false;
    playLines(ovBars, ovPlaying ? (now - ovStart) / OV_PLAY_MS : 0);
    // story steps: one shot as the panel slides in, a beat between steps
    if (!stPlaying && slide > 0.85) { stPlaying = true; stStart = now; }
    else if (stPlaying && slide < 0.1) stPlaying = false;
    const nS = Math.max(1, steps.length);
    stepBars.forEach((bars, i) => {
      const T = stPlaying ? (now - stStart - i * ST_STEP_DELAY) / OV_PLAY_MS : 0;
      playLines(bars, T);
    });

    // the scribble draws itself in once the headline has arrived
    // the highlight strokes draw themselves behind the word once the
    // headline has actually settled in (parent = .hl-word)
    if (scribble) scribble.parentElement.classList.toggle('is-scribbled', p > 0.05);

    // Steps light up as the car passes
    const active = stOp < 0.5 ? -1 : Math.min(nS - 1, Math.floor(smoothRp * nS));
    steps.forEach((el, i) => el.classList.toggle('is-active', i === active));

    // Images stack in as the car drives down
    stackImgs.forEach((img, i) => {
      img.classList.toggle('is-in', smoothRp > 0.14 + i * 0.3);
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
