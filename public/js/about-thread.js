'use strict';

/* ============================================================
   About page — the ORANGE RAIL (landonorris.com reference).
   A sharp, technical line running down the LEFT side of the
   screen: long verticals with two 45° lane-change jogs, small
   corner radii — geometric, never arced. It starts at the top
   of the Vision/Mission scene, rides its whole 420vh, and stops
   just short of the Values section.

   Drawn in sync with the screen: the lit end of the line rides a
   fixed reading line (~72% down the viewport), so scrolling pulls
   the light down the rail with you and scrolling back rewinds it.
   All geometry is measured from the two anchor sections at
   runtime — nothing is hard-coded to a layout.

   Body-level overlay: the sections it crosses clip their own
   overflow, so the rail lives above them and under the nav.
   Desktop + motion-tolerant only.
============================================================ */
(function () {
  const driver  = document.getElementById('mvDriver');
  const values  = document.getElementById('values');
  const eyebrow = values && values.querySelector('.eyebrow');
  if (!driver || !values || !eyebrow) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 860px)').matches) return;

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const NS  = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'mv-thread');
  svg.setAttribute('aria-hidden', 'true');
  const glow = document.createElementNS(NS, 'path');   // tight soft halo
  const core = document.createElementNS(NS, 'path');   // the rail itself
  glow.setAttribute('class', 'mv-thread__glow');
  core.setAttribute('class', 'mv-thread__core');
  svg.append(glow, core);
  document.body.appendChild(svg);

  /* polyline → path with small rounded corners (radius r): each corner is
     cut short on both legs and bridged with a quadratic — reads as a sharp
     technical jog, not a curve */
  function roundedPath(pts, r) {
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], [cx, cy] = pts[i + 1];
      const l1 = Math.hypot(bx - ax, by - ay), l2 = Math.hypot(cx - bx, cy - by);
      const r1 = Math.min(r, l1 / 2), r2 = Math.min(r, l2 / 2);
      const p1x = bx - (bx - ax) / l1 * r1, p1y = by - (by - ay) / l1 * r1;
      const p2x = bx + (cx - bx) / l2 * r2, p2y = by + (cy - by) / l2 * r2;
      d += ` L ${p1x.toFixed(1)} ${p1y.toFixed(1)} Q ${bx} ${by} ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;
    }
    d += ` L ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
    return d;
  }

  const PAD = 40;                       // keeps the glow clear of the svg box
  let L = 0, startY = 0, endY = 0;

  function build() {
    const sy = window.scrollY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const y0 = driver.getBoundingClientRect().top + sy + 80;          // vision opens
    /* the eyebrow is measured through its offset chain, NOT its rect —
       its .reveal transform moves the rect around load, and a rail that
       was aimed at the un-revealed position lands inside the title */
    const host  = eyebrow.offsetParent || values;
    const hr    = host.getBoundingClientRect();
    const y1 = hr.top + sy + eyebrow.offsetTop - 22;      // stop OVER the tagline
    const x1 = hr.left + eyebrow.offsetLeft + eyebrow.offsetWidth / 2;
    const span = y1 - y0;

    /* two lanes on the left edge; the 45° jogs land at the scene's own
       beats — roughly where the mission chapter takes over, and where
       the statement settles */
    const XO  = clamp(vw * 0.055, 48, 84);        // outer lane
    const XI  = XO + clamp(vw * 0.05, 44, 72);    // inner lane
    const jog = XI - XO;                          // 45°: dy = dx
    const a   = PAD + span * 0.30;
    const b   = PAD + span * 0.58;
    /* the landing: leave the edge, traverse across, then a final VERTICAL
       drop that stops dead over "What We Stand For" — timed (via the
       shared reading-line sync) to finish as the section's own content
       reveals around it */
    const drop = clamp(vh * 0.16, 110, 190);      // the last vertical leg
    const hY   = PAD + span - drop;               // traverse height
    const pts = [
      [XO, PAD],
      [XO, a], [XI, a + jog],                     // lane change in
      [XI, b], [XO, b + jog],                     // lane change out
      [XO, hY], [x1, hY],                         // across to the title's lane
      [x1, PAD + span],                           // …and straight down onto it
    ];
    const d = roundedPath(pts, 16);

    svg.style.top    = (y0 - PAD) + 'px';
    svg.style.height = (span + PAD * 2) + 'px';
    svg.setAttribute('width', vw);
    svg.setAttribute('height', span + PAD * 2);
    glow.setAttribute('d', d);
    core.setAttribute('d', d);
    L = core.getTotalLength();
    [glow, core].forEach(p => {
      p.style.strokeDasharray  = L.toFixed(1);
      p.style.strokeDashoffset = L.toFixed(1);
    });
    startY = y0; endY = y1;
  }

  /* one smoothed draw state, so fast scrolls still read as one stroke.
     Fully bidirectional: scrolling down draws the rail toward the values,
     scrolling back up plays the same stroke in REVERSE — the line
     collapses back the way it came, tip tracking the reading line both
     directions. */
  let cur = 0, raf = null;
  function frame() {
    raf = requestAnimationFrame(frame);
    const vh = window.innerHeight;
    const sy = window.scrollY;
    // sleep while the rail's stretch of page is nowhere near
    if (sy + vh < startY - 200 || sy > endY + 400) return;

    /* the lit end tracks the reading line: 72% down the screen */
    const t = clamp((sy + vh * 0.72 - startY) / (endY - startY), 0, 1);
    cur += (t - cur) * 0.16;
    const off = (L * (1 - cur)).toFixed(1);
    glow.style.strokeDashoffset = off;
    core.style.strokeDashoffset = off;
  }

  build();
  requestAnimationFrame(frame);
  window.addEventListener('resize', build, { passive: true });
  /* re-measure once everything (fonts, reveals) has settled */
  window.addEventListener('load', build);
})();
