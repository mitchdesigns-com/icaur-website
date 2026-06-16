'use strict';

/* ============================================================
   About page — pinned scene driver.
   One viewport: the Overview panel cross-fades into the iCAUR
   Story panel while the cartoon car follows a smooth curved
   path. Everything is SCRUBBED directly to scroll progress
   (no spring / no bounce). Reuses the game car (window.iCAURCar).
============================================================ */
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;   // skip touch

  const hero   = document.getElementById('hero');
  const scene  = document.getElementById('aboutScene');
  if (!hero || !scene) return;
  const ovPanel = scene.querySelector('.scene-panel--overview');
  const stPanel = scene.querySelector('.scene-panel--story');
  const steps   = [...scene.querySelectorAll('.saga-step')];

  const HERO_SC = 1.3, OV_SC = 1.55, STORY_SC = 1.32;     // per-stage scale
  const HERO_ROT = 0.06, OV_ROT = 0.035, VERT = -Math.PI / 2;   // 2° ≈ 0.035rad in overview

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const ss = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };   // smoothstep
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => ss((p - a) / (b - a));
  function arc(a, b, t) {                       // quadratic-bezier arc
    const cx = (a.x + b.x) / 2, cy = Math.min(a.y, b.y) - vh * 0.16, u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
             y: u * u * a.y + 2 * u * t * cy + t * t * b.y };
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'aboutCarCanvas';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '5',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let vw = 0, vh = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth; vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const margin = () => Math.max(28, vw * 0.06);
  let prevX = null, prevY = null, spin = 0;

  function state() {
    const sr = scene.getBoundingClientRect();
    const scrollable = scene.offsetHeight - vh;

    // After the scene → fade out, hand off to later sections
    if (sr.bottom < vh * 0.5) return { op: 0, ov: 0, st: 0, active: -1 };

    const ov = { x: vw - margin() - 54 * OV_SC, y: vh * 0.5 };

    // Before pin (entering) → blend hero → overview (rotate + grow)
    if (sr.top > 0) {
      const hr = hero.getBoundingClientRect();
      const hAnchor = { x: hr.right - margin() - 54 * HERO_SC, y: hr.bottom };
      if (sr.top >= vh) return { x: hAnchor.x, y: hAnchor.y, rot: HERO_ROT, sc: HERO_SC, op: 1, ov: 0, st: 0, active: -1 };
      const t = ss((vh - sr.top) / vh);
      return { x: lerp(hAnchor.x, ov.x, t), y: lerp(hAnchor.y, ov.y, t),
               rot: lerp(HERO_ROT, OV_ROT, t), sc: lerp(HERO_SC, OV_SC, t),
               op: 1, ov: t, st: 0, active: -1 };
    }

    // Pinned → scrub the whole scene by progress p
    const p = clamp(-sr.top / scrollable, 0, 1);
    const r0 = steps[0].getBoundingClientRect();
    const r1 = steps[1].getBoundingClientRect();
    const s0 = { x: r0.left - 6, y: r0.top + r0.height / 2 };
    const s1 = { x: r1.left - 6, y: r1.top + r1.height / 2 };
    // Overview lifts away first; the story only enters AFTER the car has driven across
    const ovOp = 1 - seg(p, 0.25, 0.45);
    const stOp = seg(p, 0.50, 0.64);

    let x, y, rot, sc, active;
    if (p <= 0.25)      { x = ov.x; y = ov.y; rot = OV_ROT; sc = OV_SC; active = -1; }
    // 1) drive horizontally across the screen (overview lifts up & fades)
    else if (p < 0.48)  { const t = ss((p - 0.25) / 0.23);
                          x = lerp(ov.x, s0.x, t); y = lerp(ov.y, s0.y, t);
                          rot = lerp(OV_ROT, 0, Math.min(t * 1.5, 1)); sc = lerp(OV_SC, STORY_SC, t); active = -1; }
    // 2) reached the end → story enters and the car rears up IN PLACE (x fixed)
    else if (p < 0.64)  { const t = ss((p - 0.48) / 0.16);
                          x = s0.x; y = s0.y; rot = lerp(0, VERT, t); sc = STORY_SC; active = t > 0.55 ? 0 : -1; }
    else if (p <= 0.74) { x = s0.x; y = s0.y; rot = VERT; sc = STORY_SC; active = 0; }
    // 3) slide down to the next paragraph
    else if (p < 0.88)  { const t = ss((p - 0.74) / 0.14);
                          x = lerp(s0.x, s1.x, t); y = lerp(s0.y, s1.y, t); rot = VERT; sc = STORY_SC; active = t < 0.5 ? 0 : 1; }
    else                { x = s1.x; y = s1.y; rot = VERT; sc = STORY_SC; active = 1; }

    return { x, y, rot, sc, op: 1, ov: ovOp, st: stOp, active };
  }

  function frame() {
    if (!window.iCAURCar) { requestAnimationFrame(frame); return; }
    const s = state();

    // panels: fade + subtle slide (no x/y-only pop)
    if (ovPanel) { ovPanel.style.opacity = s.ov; ovPanel.style.transform = `translateY(${(s.ov - 1) * 180}px)`; }
    if (stPanel) { stPanel.style.opacity = s.st; stPanel.style.transform = `translateY(${(1 - s.st) * 120}px)`; }
    steps.forEach((el, i) => el.classList.toggle('is-active', i === s.active));

    ctx.clearRect(0, 0, vw, vh);
    if (s.op > 0.01 && s.x != null) {
      if (prevX != null) spin += (Math.hypot(s.x - prevX, s.y - prevY)) * 0.05 * (s.x >= prevX ? 1 : -1);
      prevX = s.x; prevY = s.y;
      ctx.save();
      ctx.globalAlpha = clamp(s.op, 0, 1);
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.scale(-1, 1);
      window.iCAURCar.drawCar(ctx, 0, 0, s.sc || HERO_SC, spin, 0, 0, true);
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);
})();


// ============================================================
// OUR VISION — scroll-driven panel
// Layout: flex column  dash → title → image → paragraph
// p 0.00 – 0.18  elastic slide-up with rotation snap
// p 0.18 – 0.75  image shrinks 3.6 → 1.0 (transform-origin: center top)
// p 0.72 – 0.84  paragraph fades in (already in flow below image)
// p 0.78 – 1.00  word-by-word colour reveal + cursor weight
// ============================================================
(function initVision() {
  const driver     = document.getElementById('visionDriver');
  const section    = document.getElementById('vision');
  const imgWrap    = document.getElementById('visionImgWrap');
  const stmt       = document.getElementById('visionStatement');
  const visionBody = stmt ? stmt.closest('.vision__body') : null;
  if (!driver || !section) return;

  const FROM = 400, TO = 900, RADIUS = 130;
  const wordEls = [], letterEls = [];

  if (stmt) {
    const raw = stmt.textContent;
    stmt.textContent = '';
    raw.split(/(\s+)/).forEach(part => {
      if (/^\s+$/.test(part)) { stmt.appendChild(document.createTextNode(' ')); return; }
      if (!part) return;
      const word = document.createElement('span');
      word.className = 'vision__word';
      [...part].forEach(ch => {
        const letter = document.createElement('span');
        letter.className = 'vision__letter';
        letter.textContent = ch;
        word.appendChild(letter);
        letterEls.push(letter);
      });
      stmt.appendChild(word);
      wordEls.push(word);
    });
    stmt.classList.add('vp-on');
  }

  let mx = -9999, my = -9999;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const ss    = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const lerp  = (a, b, t) => a + (b - a) * t;
  const seg   = (p, a, b) => ss(clamp((p - a) / (b - a), 0, 1));

  function tick() {
    const rect       = driver.getBoundingClientRect();
    const scrollable = Math.max(driver.offsetHeight - window.innerHeight, 1);
    const p          = clamp(-rect.top / scrollable, 0, 1);

    // 1. Elastic slide-in: starts −2.5° tilt, overshoots to +0.5°, snaps to 0°
    {
      const t   = clamp(p / 0.18, 0, 1);
      const out = ss(t);
      const ty  = (1 - out) * 100;
      const rot = t < 0.70
        ? lerp(-2.5, 0.5, ss(t / 0.70))
        : lerp(0.5, 0.0, ss((t - 0.70) / 0.30));
      section.style.transform = `translateY(${ty.toFixed(2)}%) rotate(${rot.toFixed(3)}deg)`;
    }

    // 2. Image scale 3.6 → 1.0 (grows downward from top, never covers title above)
    const imgScale = 3.6 - seg(p, 0.18, 0.75) * (3.6 - 1.0);
    if (imgWrap) {
      imgWrap.style.transform = `scale(${imgScale.toFixed(3)})`;
    }

    // 3. Paragraph fades in after image has retreated to thumbnail size
    if (visionBody) {
      visionBody.style.opacity = seg(p, 0.72, 0.84).toFixed(3);
    }

    // 5. Cursor proximity → letter weight (once text is visible)
    if (letterEls.length && p >= 0.70) {
      for (const l of letterEls) {
        const r = l.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        const f = d >= RADIUS ? 0 : (1 - d / RADIUS);
        l.style.fontVariationSettings = `'wght' ${Math.round(FROM + (TO - FROM) * f)}`;
      }
    }

    // 6. Word colour reveal
    if (wordEls.length) {
      const litCount = Math.floor(wordEls.length * seg(p, 0.78, 1.0));
      wordEls.forEach((w, i) => {
        const lit = i < litCount;
        if (w._lit !== lit) { w.classList.toggle('is-lit', lit); w._lit = lit; }
      });
    }

    requestAnimationFrame(tick);
  }

  function lockAndStart() {
    letterEls.forEach(l => { l.style.fontVariationSettings = `'wght' ${TO}`; });
    requestAnimationFrame(() => {
      wordEls.forEach(w => { w.style.minWidth = w.getBoundingClientRect().width + 'px'; });
      letterEls.forEach(l => { l.style.fontVariationSettings = `'wght' ${FROM}`; });
      requestAnimationFrame(tick);
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(lockAndStart);
  } else {
    requestAnimationFrame(lockAndStart);
  }
})();
