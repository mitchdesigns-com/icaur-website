'use strict';

(function PageTransitions() {

  const COLORS  = ['var(--amber)', 'var(--sky-blue)', 'var(--black)'];
  const DUR     = 260;
  const STAGGER = 50;
  const EASE    = 'cubic-bezier(0.76,0,0.24,1)';
  const NAV_DELAY = DUR + STAGGER * (COLORS.length - 1) + 20;

  function buildOverlay(phase) {
    const wrap = document.createElement('div');
    wrap.className = 'pt-overlay';

    COLORS.forEach((color, i) => {
      const strip = document.createElement('div');
      strip.className = 'pt-strip';
      strip.style.background = color;
      const delay = phase === 'leave'
        ? i * STAGGER
        : (COLORS.length - 1 - i) * STAGGER;
      // leave: sweep in from right; enter: already covering, sweep out to left
      strip.style.transform = phase === 'leave' ? 'translateX(102%)' : 'translateX(0)';
      strip.style.transition = `transform ${DUR}ms ${EASE} ${delay}ms`;
      wrap.appendChild(strip);
    });

    document.body.appendChild(wrap);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      wrap.querySelectorAll('.pt-strip').forEach(s => {
        s.style.transform = phase === 'leave' ? 'translateX(0)' : 'translateX(-102%)';
      });
    }));

    return wrap;
  }

  // ── ENTER ──────────────────────────────────────────────
  if (sessionStorage.getItem('pt-nav')) {
    sessionStorage.removeItem('pt-nav');
    const overlay = buildOverlay('enter');
    const totalEnter = DUR + STAGGER * (COLORS.length - 1) + 80;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.documentElement.classList.remove('pt-entering');
    }));
    setTimeout(() => overlay.remove(), totalEnter);
  } else {
    document.documentElement.classList.remove('pt-entering');
  }

  // ── LEAVE ──────────────────────────────────────────────
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (a.target === '_blank') return;
    if (a.classList.contains('nav__drop-trigger')) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    buildOverlay('leave');
    sessionStorage.setItem('pt-nav', '1');
    setTimeout(() => { window.location.href = href; }, NAV_DELAY);
  }, true);

})();
