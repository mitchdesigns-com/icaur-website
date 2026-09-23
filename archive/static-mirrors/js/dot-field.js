'use strict';

/* ============================================================
   DotField — interactive dot-grid background (vanilla port of
   React Bits' DotField, bulge-only mode). Attaches a canvas to
   any element with [data-dotfield]; dots bulge away from the
   cursor while it moves.
============================================================ */
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;   // skip touch
  const hosts = document.querySelectorAll('[data-dotfield]');
  if (!hosts.length) return;
  const TWO_PI = Math.PI * 2;

  hosts.forEach(setup);

  function setup(host) {
    /* per-host overrides: data-df-from / data-df-to (dot gradient CSS
       colours) and data-df-glow ("r,g,b" triplet) — a soft cursor glow
       drawn in the HOST BACKGROUND's own colour, so the hover reads as
       a spotlight rather than introducing a new hue */
    const cfg = {
      dotRadius: 2.6, dotSpacing: 17, cursorRadius: 320, bulgeStrength: 48,
      gradientFrom: host.dataset.dfFrom || 'rgba(255,255,255,0.55)',
      gradientTo:   host.dataset.dfTo   || 'rgba(255,255,255,0.18)',
      glowRGB:      host.dataset.dfGlow || null,
      glowRadius:   170,
    };

    const canvas = document.createElement('canvas');
    canvas.className = 'dot-field';
    host.prepend(canvas);
    const ctx = canvas.getContext('2d', { alpha: true });

    let W = 0, H = 0, dots = [], eng = 0, raf = 0;
    const m = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      const step = cfg.dotRadius + cfg.dotSpacing;
      const cols = Math.floor(W / step), rows = Math.floor(H / step);
      const padX = (W % step) / 2, padY = (H % step) / 2;
      dots = [];
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          dots.push({ ax, ay, sx: ax, sy: ay });
        }
    }

    window.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      m.x = e.clientX - r.left; m.y = e.clientY - r.top;
    }, { passive: true });

    setInterval(() => {
      const dx = m.prevX - m.x, dy = m.prevY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.speed += (dist - m.speed) * 0.5; if (m.speed < 0.001) m.speed = 0;
      m.prevX = m.x; m.prevY = m.y;
    }, 20);

    function tick() {
      const target = Math.min(m.speed / 5, 1);
      eng += (target - eng) * 0.06; if (eng < 0.001) eng = 0;

      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, cfg.gradientFrom);
      grad.addColorStop(1, cfg.gradientTo);
      ctx.fillStyle = grad;

      const cr = cfg.cursorRadius, crSq = cr * cr, rad = cfg.dotRadius / 2;
      ctx.beginPath();
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dx = m.x - d.ax, dy = m.y - d.ay, distSq = dx * dx + dy * dy;
        if (distSq < crSq && eng > 0.01) {
          const dist = Math.sqrt(distSq);
          const t = 1 - dist / cr;
          const push = t * t * cfg.bulgeStrength * eng;
          const angle = Math.atan2(dy, dx);
          d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
          d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
        } else {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }
        ctx.moveTo(d.sx + rad, d.sy);
        ctx.arc(d.sx, d.sy, rad, 0, TWO_PI);
      }
      ctx.fill();

      /* cursor glow in the host background's own colour — dots melt
         into the background near the pointer, no extra hue */
      if (cfg.glowRGB && eng > 0.01) {
        const gr = cfg.glowRadius;
        const g2 = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, gr);
        g2.addColorStop(0, `rgba(${cfg.glowRGB},${(eng * 0.9).toFixed(3)})`);
        g2.addColorStop(1, `rgba(${cfg.glowRGB},0)`);
        ctx.fillStyle = g2;
        ctx.fillRect(m.x - gr, m.y - gr, gr * 2, gr * 2);
      }
      raf = requestAnimationFrame(tick);
    }

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
    else window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(tick);
  }
})();
