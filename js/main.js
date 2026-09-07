'use strict';

/* ============================================================
   iCAUR — main.js  v2
   Page Intro · Custom Cursor · Nav · Mobile Menu
   Scroll Reveals · Magnetic Buttons · FAQ · Spec Counters
   Newsletter Form
============================================================ */

// ─── Helpers ──────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


// ============================================================
// PAGE INTRO — branded logo flash on load
// ============================================================
(function initPage() {
  const ready = () => {
    document.body.classList.remove('is-loading');
    setTimeout(triggerHeroWords, 100);
  };
  if (document.readyState === 'complete') setTimeout(ready, 50);
  else window.addEventListener('load', () => setTimeout(ready, 50), { once: true });
})();


// ============================================================
// HERO WORD REVEALS — animate words in sequence after intro
// ============================================================
function triggerHeroWords() {
  // Per-letter elastic pop + color cycle (matches landing-page SplitText)
  const headline = $('.hero__headline');
  if (headline && !headline.dataset.split) {
    headline.dataset.split = '1';
    let idx = 0;
    $$('.hero__word', headline).forEach(word => {
      const text = word.textContent;
      word.textContent = '';
      [...text].forEach(ch => {
        const span = document.createElement('span');
        span.className = 'lettre';
        span.textContent = ch;
        span.style.setProperty('--ld', (idx * 0.045).toFixed(3) + 's');
        word.appendChild(span);
        idx++;
      });
    });
    requestAnimationFrame(() => headline.classList.add('letters-in'));
  }

  // Also fire any hero .reveal elements marked data-delay <= 1
  $$('.hero .reveal').forEach(el => {
    const delay = parseFloat(el.dataset.delay ?? 0) * 90 + 400;
    setTimeout(() => el.classList.add('in-view'), delay);
  });
}

// Split a headline into per-letter spans (preserving inline accents like <em>)
// for the elastic pop animation. Letters stay hidden until `.letters-in` is set.
function splitHeadlineLetters(headline) {
  if (!headline || headline.dataset.split) return;
  headline.dataset.split = '1';
  const counter = { i: 0 };
  const walk = (root) => {
    [...root.childNodes].forEach(node => {
      if (node.nodeType === 3) {                      // text node
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (part === '') return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const word = document.createElement('span');
          word.className = 'split-word';
          [...part].forEach(ch => {
            const s = document.createElement('span');
            s.className = 'lettre';
            s.textContent = ch;
            s.style.setProperty('--ld', (counter.i * 0.045).toFixed(3) + 's');
            counter.i++;
            word.appendChild(s);
          });
          frag.appendChild(word);
        });
        root.replaceChild(frag, node);
      } else if (node.nodeType === 1) {               // element (e.g. <em>)
        node.classList.add('split-word');
        walk(node);
      }
    });
  };
  walk(headline);
}


// ============================================================
// CUSTOM CURSOR — brand arrow, tracking the pointer 1:1
// ============================================================
(function initCursor() {
  const cursor = $('#cursor');
  if (!cursor) return;   // the arrow is built here — no dot/ring needed

  // Only on devices with a fine pointer (mouse)
  if (!window.matchMedia('(pointer: fine)').matches) {
    cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  // Brand arrow, injected here so the 19 pages carrying the old
  // dot/ring/label markup don't each need editing. Inlined (not an <img>)
  // so the two parts can recolour independently: .cursor__body is the arrow
  // silhouette, .cursor__logo is the iCAUR mark inside it. Fills live in CSS
  // so the low-contrast (white) state can flip body→white, logo→orange —
  // see .cursor__arrow in styles.css. Size and tip offset are in CSS too.
  cursor.insertAdjacentHTML('beforeend',
    '<svg class="cursor__arrow" viewBox="0 0 1120 1252" fill="none" ' +
    'aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
    '<path class="cursor__body" d="M348.231 1182.47L4.60199 118.008C-21.3322 37.6717 67.6479 -30.9487 138.756 14.5498L1072.93 612.28C1140.66 655.615 1132.14 757.108 1058.14 788.55L755.539 917.118C738.883 924.195 724.459 935.659 713.805 950.289L524.234 1210.62C476.114 1276.7 373.344 1260.26 348.231 1182.47Z"/>' +
    '<path class="cursor__logo" d="M189.716 221.997L171.397 165.393C171.17 164.69 170.474 164.143 169.748 164.08L113.727 159.221C113.243 159.179 113.114 159.654 113.494 160.1L166.723 217.898C168.751 220.088 171.544 221.589 174.162 221.816L188.845 223.09C189.571 223.153 189.926 222.645 189.716 221.997Z"/>' +
    '<path class="cursor__logo" d="M127.737 216.621L127.689 216.617L109.37 160.012C109.143 159.309 108.447 158.763 107.768 158.704L48.2602 153.542C47.5819 153.483 47.1621 153.933 47.3896 154.636L61.5162 198.287C64.0496 206.115 72.7376 213.018 80.9745 213.733L126.865 217.714C127.544 217.773 127.965 217.324 127.737 216.621Z"/>' +
    '<path class="cursor__logo" d="M198.337 434.775L255.335 496.643L217.292 493.343L198.337 434.775ZM263.828 820.009L283.415 773.277L283.433 773.332L308.187 800.19C312.253 804.607 317.877 807.577 323.014 808.022L366.095 811.759C374.333 812.474 378.924 806.722 376.385 798.876L357.444 740.349C355.743 735.093 352.515 729.778 348.159 725.048L305.405 678.661C304.899 678.114 304.153 678.282 304.345 678.875L328.723 754.203L308.612 752.459L296.911 739.737L272.431 664.093L319.685 668.192C327.872 668.902 332.457 663.14 329.927 655.322L315.812 611.707C315.601 611.054 314.875 610.475 314.189 610.416L224.436 602.63L225.386 602.332L208.569 550.369L283.633 556.88C291.871 557.595 296.462 551.842 293.929 544.015L270.214 470.738C268.514 465.483 265.292 460.186 260.935 455.455L132.852 316.402L122.63 284.817L178.455 289.66L199.294 354.052C200.995 359.308 204.223 364.623 208.574 369.336L251.284 415.736C251.785 416.264 252.537 416.115 252.345 415.522L198.072 247.82C195.533 239.975 186.852 233.089 178.614 232.374L84.3615 224.198C76.1221 223.484 71.5264 229.218 74.0654 237.064L102.803 325.864C104.504 331.119 107.725 336.416 112.082 341.146L147.233 379.319L173.81 461.441C175.511 466.696 178.731 471.992 183.088 476.723L196.759 491.562L170.14 489.253C161.901 488.539 157.305 494.273 159.844 502.118L195.337 611.792L195.622 611.704C197.451 615.619 200.067 619.463 203.318 622.992L238.464 661.147L252.153 703.446L240.386 737.531C238.927 741.756 239.048 746.785 240.749 752.04L262.612 819.598C262.804 820.191 263.657 820.499 263.828 820.009Z"/>' +
    '</svg>');

  // Track the pointer 1:1 — an arrow that lags behind the real hit point
  // reads as broken, so there's no spring smoothing here.
  let rafId = null, mouseX = 0, mouseY = 0;
  function paint() {
    rafId = null;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  }
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.classList.add('is-visible');
    if (!rafId) rafId = requestAnimationFrame(paint);
  }, { passive: true });

  document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  document.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));

  // Press feedback — the only state the arrow keeps
  document.addEventListener('mousedown', () => cursor.classList.add('is-pressed'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('is-pressed'));

  // ── Hotspot hover + auto-contrast ──────────────────────────────
  // No swap to a native pointer icon on hotspots (that would break the
  // arrow illusion) — just a small scale-up so the target still reads
  // as interactive. Separately, an actual WCAG-style contrast check
  // against whatever's under the tip: the arrow's own amber can sit on
  // amber buttons/chips/CTAs (this site uses --amber everywhere) where
  // it nearly disappears, so low-contrast spots force it to a flat
  // white silhouette instead of hand-listing "orange sections" by class.
  function relLuminance(r, g, b) {
    const chan = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
  }
  function contrastRatio(l1, l2) {
    const [a, b] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (a + 0.05) / (b + 0.05);
  }
  const AMBER_LUM = relLuminance(243, 112, 33);   // --amber, the arrow's own colour
  const LOW_CONTRAST_THRESHOLD = 2.3;             // below this, amber-on-amber is unreadable

  function bgColorAt(x, y) {
    let el = document.elementFromPoint(x, y);
    const hotEl = el;
    while (el && el !== document.documentElement) {
      const bg = getComputedStyle(el).backgroundColor;
      const m = bg && bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (m && (m[4] === undefined || +m[4] > 0.4)) {
        return { rgb: [+m[1], +m[2], +m[3]], hotEl };
      }
      el = el.parentElement;
    }
    return { rgb: [255, 255, 255], hotEl }; // no ancestor paints a background — assume light page bg
  }

  let lastSampleMs = 0;
  document.addEventListener('mousemove', e => {
    const now = performance.now();
    if (now - lastSampleMs < 80) return;   // elementFromPoint + style reads are not free
    lastSampleMs = now;

    const { rgb, hotEl } = bgColorAt(e.clientX, e.clientY);
    const ratio = contrastRatio(AMBER_LUM, relLuminance(rgb[0], rgb[1], rgb[2]));
    cursor.classList.toggle('is-low-contrast', ratio < LOW_CONTRAST_THRESHOLD);

    cursor.classList.toggle('is-hotspot', !!(hotEl && hotEl.closest('.v27-hotspot-dot')));
  }, { passive: true });
})();


// ============================================================
// HERO MASK REVEAL — scroll-driven BORN TO PLAY text mask
// ============================================================
(function initHeroMask() {
  const driver  = $('#heroScrollDriver');
  const mask    = $('#heroMaskReveal');
  const overlay = $('#heroOverlay');
  const inner   = $('.hero__inner');
  if (!driver || !mask) return;

  function tick() {
    const rect      = driver.getBoundingClientRect();
    const scrolled  = Math.max(0, -rect.top);
    const scrollable = Math.max(driver.offsetHeight - window.innerHeight, 1);
    const p = Math.min(scrolled / scrollable, 1); // 0 → 1

    // Fade in quickly over first 15% of scroll
    const appear = Math.min(p / 0.15, 1);

    // Reach full scale by 85% of scroll, then hold at scale 1 for the
    // remaining 15% — gives the user a moment to read "BORN TO PLAY"
    // before the hero releases and the page continues scrolling.
    const pScale = Math.min(p / 0.85, 1);

    // Scale: 15 (whole viewport = letter stroke = pure video) → 1 (black frame + letter windows)
    const scale = Math.max(15 - pScale * 14, 1);

    mask.style.opacity   = appear;
    mask.style.transform = `scale(${scale})`;

    // Fade out the headline as the BORN/TO PLAY reveal takes over, so they
    // never visually overlap mid-scroll
    if (inner) {
      const heroFade = 1 - Math.min(p / 0.12, 1);
      inner.style.opacity = String(heroFade);
      inner.style.pointerEvents = heroFade < 0.05 ? 'none' : '';
    }

    // Overlay stays light — the mask black handles the darkening
    if (overlay) overlay.style.opacity = '0.28';
  }

  window.addEventListener('scroll', tick, { passive: true });
  tick(); // run once on load
})();


// ============================================================
// HERO TEXT FIT — calibrate BORN / TO PLAY to fill viewport width
// Runs after fonts load + on every resize so it's always perfect
// ============================================================
(function initHeroTextFit() {
  const mask = $('#heroMaskReveal');
  if (!mask) return;

  function fit() {
    const lines = $$('.hero__mask-line', mask);
    if (lines.length < 2) return;

    // Build an off-screen clone that isn't affected by scale() transform
    const probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = [
      'position:fixed', 'top:-9999px', 'left:0',
      'visibility:hidden', 'pointer-events:none',
      'white-space:nowrap',
      `font-family:${getComputedStyle(mask).fontFamily}`,
      'font-weight:900', 'letter-spacing:-0.04em', 'word-spacing:-0.12em',
      'font-size:200px',              // large reference size
      'text-transform:uppercase',
    ].join(';');

    const b = document.createElement('span');
    b.textContent = lines[0].textContent;
    const t = document.createElement('span');
    t.style.display = 'block';
    t.textContent = lines[1].textContent;

    probe.appendChild(b);
    probe.appendChild(t);
    document.body.appendChild(probe);

    const vw       = window.innerWidth;
    const ref      = 200; // px — our probe font-size
    const bornW    = b.getBoundingClientRect().width;
    const toplayW  = t.getBoundingClientRect().width;
    document.body.removeChild(probe);

    if (!bornW || !toplayW) return;

    // Scale so each line fills exactly 100vw (both independently)
    let bornFs   = ref * (vw / bornW);         // px at current vw
    const ratio  = toplayW ? (bornW / toplayW) : 1; // toplayFs / bornFs

    // Cap by viewport height too, so on wide/ultrawide screens the two
    // stacked lines never exceed the viewport — keeps the same scale
    // and centred position from laptops up to large wide screens.
    const vh = window.innerHeight;
    const lineHeight = 0.88;
    const maxBornFsByHeight = (vh * 0.86) / ((1 + ratio) * lineHeight);
    bornFs = Math.min(bornFs, maxBornFsByHeight);

    const toplayFs = bornFs * ratio;

    mask.style.fontSize = bornFs + 'px';
    lines[1].style.fontSize = toplayFs + 'px';
  }

  // Run once fonts are ready, then on every resize
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fit);
  } else {
    setTimeout(fit, 500);
  }
  window.addEventListener('resize', fit, { passive: true });
})();


// ============================================================
// NAVIGATION — colour mode on scroll
// ============================================================
(function initNav() {
  const nav    = $('#nav');
  const driver = $('#heroScrollDriver'); // use driver height for sticky hero
  const hero   = $('#hero');
  const footer = $('#footer');
  if (!nav) return;

  const darkIds  = ['hero', 'cta', 'why-icaur'];
  const lightIds = ['models', 'overview', 'services', 'innovation', 'news', 'faq', 'about'];

  function setNavMode(mode) {
    nav.classList.remove('nav--on-hero', 'nav--dark', 'nav--light');
    nav.classList.add(`nav--${mode}`);
  }

  function updateNav() {
    const scrollY    = window.scrollY;
    // Use scroll driver height so nav stays white for the full scroll experience
    const heroBottom = driver
      ? driver.offsetHeight - nav.offsetHeight
      : (hero?.offsetHeight ?? window.innerHeight) - nav.offsetHeight;

    if (scrollY < heroBottom) {
      setNavMode('on-hero');
      return;
    }

    let currentId = '';
    $$('main > section, main > div').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= nav.offsetHeight + 4) {
        currentId = el.id || '';
      }
    });

    const isDark  = darkIds.some(id  => currentId.includes(id));
    const isLight = lightIds.some(id => currentId.includes(id));

    if (isDark || (!isDark && !isLight)) {
      setNavMode('dark');
    } else {
      setNavMode('light');
    }
  }

  /* Fade the nav out while the footer scrolls in — gone by the time
     the footer fills the viewport, so the fixed bar doesn't sit over
     the newsletter form / game canvas at the very end of the page. */
  function updateNavFooterFade() {
    if (!footer) return;
    const vh = window.innerHeight;
    const top = footer.getBoundingClientRect().top;
    // 0 while the footer is still below the fold … 1 once its top edge
    // has scrolled up past the top of the screen
    const progress = Math.max(0, Math.min(1, (vh - top) / vh));
    const opacity = 1 - progress;
    nav.style.opacity = opacity.toFixed(3);
    nav.style.pointerEvents = opacity < 0.05 ? 'none' : '';
  }

  function onScroll() {
    updateNav();
    updateNavFooterFade();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateNavFooterFade, { passive: true });
  updateNav();
  updateNavFooterFade();
})();


// ============================================================
// MOBILE MENU
// ============================================================
(function initMobileMenu() {
  const hamburger  = $('#navHamburger');
  const mobileMenu = $('#mobileMenu');
  const closeBtn   = $('#mobileClose');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function open() {
    isOpen = true;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    isOpen = false;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => isOpen ? close() : open());
  closeBtn?.addEventListener('click', close);

  $$('a', mobileMenu).forEach(a => a.addEventListener('click', close));

  // the menu's العربية / Compare mirror the desktop pill's — same handlers,
  // reached by delegating to the originals so the logic lives in one place
  $('#mobileLangToggle')?.addEventListener('click', () => { $('#langToggle')?.click(); });
  $('#mobileCompareToggle')?.addEventListener('click', () => { close(); $('#compareToggle')?.click(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) close();
  });
})();


// ============================================================
// SMOOTH SCROLL — lerped wheel scrolling (Lenis-style, vanilla)
// Nearly every big section on this site is SCRUBBED by scroll
// position (hero mask, overview, services carousel, why strips,
// media morph), so the feel of the whole page is the feel of the
// scroll itself. Raw wheel input steps; this eases it: wheel
// deltas move a TARGET, and a rAF loop lerps the real scroll
// toward it, so every scrubbed animation inherits the glide.
//
// Desktop fine-pointer only — touch momentum is already smooth,
// and reduced-motion users get native scrolling untouched.
// Keyboard, scrollbar drags and anchor jumps stay native: any
// scroll we didn't write ourselves just becomes the new target.
// ============================================================
(function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  // The stylesheet sets `html { scroll-behavior: smooth }` — with that live,
  // every per-frame write below would start a NATIVE smooth animation and the
  // two easings would fight (rubbery, laggy). This module takes over wheel
  // smoothing entirely, so it turns the CSS behaviour off; the anchor handler
  // requests its own smooth glide explicitly and keeps working.
  document.documentElement.style.scrollBehavior = 'auto';

  const RATE = 10;           // 1/s — ~100ms time constant, settled in ~1/3s
  const MAX_STEP = 400;      // sanity cap for one wheel event, not a speed limit
  let target = window.scrollY;
  let current = window.scrollY;
  let lastWritten = -1;
  let rafId = null;
  let prevT = 0;

  const maxScroll = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  function loop(t) {
    // frame-rate independent: the glide takes the same real time at 30fps
    // (lego pit + carousel busy) as at 120fps
    const dt = prevT ? Math.min((t - prevT) / 1000, 0.05) : 1 / 60;
    prevT = t;
    current += (target - current) * (1 - Math.exp(-RATE * dt));
    if (Math.abs(target - current) < 0.5) {
      current = target;
      rafId = null;
      prevT = 0;
    } else {
      rafId = requestAnimationFrame(loop);
    }
    // whole pixels only — sub-pixel writes kept firing scroll handlers for a
    // long invisible tail after motion had visually stopped
    const px = Math.round(current);
    if (px !== lastWritten) {
      lastWritten = px;
      window.scrollTo(0, px);
    }
  }

  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;                       // pinch-zoom — never intercept
    if (e.defaultPrevented) return;
    // let scrollable sub-areas (modals, drawers, code blocks) scroll natively
    let n = e.target instanceof Element ? e.target : null;
    while (n && n !== document.body) {
      const cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1) return;
      n = n.parentElement;
    }
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? window.innerHeight : 1);
    const step = Math.max(-MAX_STEP, Math.min(MAX_STEP, e.deltaY * unit));
    target = Math.max(0, Math.min(maxScroll(), target + step));
    if (!rafId) rafId = requestAnimationFrame(loop);
  }, { passive: false });

  // a scroll we did not write (keyboard, scrollbar, anchor, browser find)
  // becomes the new resting point instead of being fought
  window.addEventListener('scroll', () => {
    if (Math.abs(window.scrollY - lastWritten) > 1 && !rafId) {
      target = current = window.scrollY;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    target = Math.min(target, maxScroll());
  }, { passive: true });
})();


// ============================================================
// SCROLL REVEAL — IntersectionObserver for .reveal elements
// ============================================================
(function initReveal() {
  // Regular reveal elements (up, fade, clip-h, clip-v)
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseFloat(el.dataset.delay ?? 0) * 100;
      setTimeout(() => {
        el.classList.add('in-view');

        // If this is a stagger parent, animate children
        if (el.dataset.stagger === 'parent') {
          $$('.reveal', el).forEach((child, i) => {
            setTimeout(() => child.classList.add('in-view'), i * 80);
          });
        }
      }, delay);
      obs.unobserve(el);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -48px 0px',
  });

  $$('.reveal:not(.hero .reveal)').forEach(el => obs.observe(el));

  // Word-mask reveals for non-hero words (section headings etc.)
  const wordObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.word', entry.target).forEach((word, i) => {
        const base  = parseFloat(entry.target.dataset.delay ?? 0) * 100;
        setTimeout(() => word.classList.add('in-view'), base + i * 60);
      });
      wordObs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  $$('.word-mask:not(.hero .word-mask)').forEach(el => wordObs.observe(el.closest('[data-delay]') || el));
})();

// ============================================================
// OVERVIEW VIDEO SCROLL — bounce headline + scroll-synced
// paragraphs with orange mask-wipe reveals
// ============================================================
(function initOverviewScroll() {
  const driver  = $('#overviewScrollDriver');
  const section = $('#overview');
  if (!driver || !section) return;

  const heading = $('.overview__heading', section);
  const stats   = $('#overviewStats', section);
  const statValues = stats ? $$('.ov-stat__value', stats) : [];
  let statsCounted = false;
  const steps   = $$('.ov-step', section);
  const n       = steps.length;
  const video   = $('.overview__video', section);
  const bgInner = $('#overviewBgInner', section);

  // Video is scroll-scrubbed, not auto-playing
  let duration = 0;
  if (video) {
    video.pause();
    video.addEventListener('loadedmetadata', () => { duration = video.duration || 0; });
  }

  const FADE = 0.1; // fraction of each step's range used for cross-fade
  const FILL_AT = 0.35; // scroll progress at which the video reaches full scale

  // Elastic "ease-out-back" — overshoots past 1 then settles
  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  // Gradual, near-linear growth with a small elastic snap at the very end
  function growElastic(t) {
    const ramp = 0.85;
    if (t < ramp) return (t / ramp) * 0.95;
    return 0.95 + easeOutBack((t - ramp) / (1 - ramp)) * 0.05;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Animate each stat value from 0 up to its target count
  function countUpStats() {
    const startTime = performance.now();
    const duration  = 2200;

    function frame(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = easeOutCubic(t);
      statValues.forEach(el => {
        const target = parseFloat(el.dataset.count) || 0;
        el.textContent = Math.round(target * eased).toString();
      });
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function tick() {
    const rect       = driver.getBoundingClientRect();
    const vh         = window.innerHeight;
    const scrollable = Math.max(driver.offsetHeight - vh, 1);
    const p          = Math.min(Math.max(-rect.top / scrollable, 0), 1);

    // Scale progress starts as soon as the section enters the viewport
    // (well before it becomes sticky), so the grow begins earlier.
    const scaleP = Math.min(Math.max((vh - rect.top) / (vh + scrollable * FILL_AT), 0), 1);

    // Scrub the video by scroll position — plays forward/reverse with scroll
    if (video && duration) {
      video.currentTime = p * duration;
    }

    // Gradual grow from a 60px-inset frame to full viewport width
    if (bgInner) {
      const eased  = growElastic(scaleP);
      const inset  = Math.max(0, 60 * (1 - eased));
      const radius = Math.max(0, 4 * (1 - eased));
      bgInner.style.inset = inset + 'px';
      bgInner.style.borderRadius = radius + 'px';
    }

    // Subtle parallax drift inside the video frame
    if (video) {
      video.style.transform = `translateY(${(p - 0.5) * 12}%)`;
    }

    // Headline bounces in once the video fills the viewport, and
    // disappears again if scrolling back up shrinks the video
    if (heading) {
      heading.classList.toggle('in-view', scaleP >= 1);
    }

    // Brand insight stats appear alongside the headline and count up
    // each time they come into view; they hide again on scroll-up.
    if (stats) {
      const visible = scaleP >= 1;
      stats.classList.toggle('in-view', visible);
      if (visible && !statsCounted) {
        statsCounted = true;
        statValues.forEach(el => { el.textContent = '0'; });
        countUpStats();
      } else if (!visible) {
        statsCounted = false;
      }
    }

    // Paragraphs share the range after FILL_AT — the first one appears
    // alongside the headline, then each subsequent one cross-fades in.
    const range = 1 - FILL_AT;

    steps.forEach((step, i) => {
      const segStart = FILL_AT + (i / n) * range;
      const segEnd   = FILL_AT + ((i + 1) / n) * range;

      let opacity;
      if (p <= segStart)            opacity = 0;
      else if (p < segStart + FADE) opacity = (p - segStart) / FADE;
      else if (i === n - 1)         opacity = 1;
      else if (p < segEnd - FADE)   opacity = 1;
      else if (p < segEnd)          opacity = 1 - (p - (segEnd - FADE)) / FADE;
      else                          opacity = 0;

      step.style.opacity = String(opacity);
      step.classList.toggle('is-active', opacity > 0.5);

      // Text rises in linearly with the same opacity value above — a
      // straight 1:1 mapping (no easing curve), rather than the amber
      // block this used to wipe across before uncovering the paragraph.
      const mask = $('.ov-mask', step);
      if (mask) mask.style.transform = `translateY(${(1 - opacity) * 18}px)`;
    });
  }

  tick();
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
})();


// ============================================================
// SERVICES — editorial horizontal story (off-track style)
// Phase A (intro, pinned): the flipbook deck cycles OVER the
// headline, then FLIPs down into .svc__slot — measured, so it
// lands exactly on the reserved box at any viewport. Phase B:
// the track slides horizontally through the three services;
// every [data-par] image drifts inside its window at its own
// rate, which is what gives the run its depth.
// ============================================================
/* Horizontal editorial track. Written for the homepage SERVICES section and
   now reused verbatim by the About page's Overview → Story run, so both read
   in the same voice. Everything except driver+track is optional — a track
   without a flipbook deck (About) simply skips those beats. */
function initSvcScroll(sel) {
  const driver = $(sel.driver);
  const track  = $(sel.track);
  const deck   = sel.deck ? $(sel.deck) : null;
  const slot   = sel.slot ? $(sel.slot) : null;
  const headGroup = sel.headGroup ? $(sel.headGroup) : null;
  if (!driver || !track) return;

  // live at EVERY width now — mobile gets the same pinned story
  // (client: scroll effects must appear on mobile); only reduced
  // motion falls back to the static stacked layout
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isStatic = () => reduce;

  const clamp01 = v => Math.min(1, Math.max(0, v));
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const smooth = t => t * t * (3 - 2 * t);   // gentle start + stop for the track
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;

  const deckImgs = deck ? Array.from(deck.querySelectorAll('img')) : [];
  const deckInner = deck ? deck.querySelector('.svc__deck-inner') : null;
  // The trace line's vocabulary. Every shape is M + one cubic C, so all of
  // them share the same 8 numbers and can be tweened into each other — that
  // is what lets a single stroke morph instead of swapping.
  const TRACE = [
    [10, 70, 30, 20, 70, 20, 90, 60],   // swoosh
    [10, 30, 35, 82, 65,  8, 90, 70],   // s-curve
    [16, 84, 92, 58,  8, 40, 84, 20],   // loop
    [10, 50, 35, 12, 65, 88, 90, 50],   // wave
    [12, 86, 40, 62, 62, 34, 88, 14],   // rising line
    [50, 12, 88, 44, 50, 88, 12, 44]    // closing arc
  ];
  const traceD = a =>
    `M${a[0].toFixed(1)} ${a[1].toFixed(1)} C ${a[2].toFixed(1)} ${a[3].toFixed(1)}, ` +
    `${a[4].toFixed(1)} ${a[5].toFixed(1)}, ${a[6].toFixed(1)} ${a[7].toFixed(1)}`;


  const trace = sel.trace ? $(sel.trace) : null;
  const tracePath = sel.tracePath ? $(sel.tracePath) : null;
  const panels = Array.from(track.querySelectorAll('.svc__panel'));
  const parImgs = Array.from(track.querySelectorAll('img[data-par]'))
    .map(el => ({ el, speed: parseFloat(el.dataset.par) || 0, center: 0 }));

  // The statement paragraph lights word by word as the scroll advances
  // (markwoodland reference). Split once, then only opacity is written.
  const sub = $('.svc__sub', driver);
  let words = [];
  if (sub && !sub.dataset.split) {
    const frag = document.createDocumentFragment();
    sub.textContent.trim().split(/\s+/).forEach(w => {
      const mask = document.createElement('span');
      mask.className = 'svc__wm';           // overflow-hidden window
      const s = document.createElement('span');
      s.className = 'svc__w';               // the word, rising inside it
      s.textContent = w;
      mask.appendChild(s);
      frag.appendChild(mask);
      frag.appendChild(document.createTextNode(' '));
    });
    sub.textContent = '';
    sub.appendChild(frag);
    sub.dataset.split = '1';
    words = Array.from(sub.querySelectorAll('.svc__w'));
  }

  // split-letter entrance for the headline, same voice as the hero
  const headline = sel.headline ? $(sel.headline) : null;
  if (headline) {
    splitHeadlineLetters(headline);
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { headline.classList.add('letters-in'); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(headline);
  }

  let geo = null;
  function measure() {
    if (isStatic()) { geo = null; driver.style.height = ''; return; }
    track.style.transform = '';
    const vw = window.innerWidth, vh = window.innerHeight;
    const maxX = Math.max(0, track.scrollWidth - vw);

    // clear the choreography transforms so every rect below is layout truth
    if (headGroup) headGroup.style.transform = '';
    // All rects here are VIEWPORT coordinates at whatever scroll position
    // measure() happens to run — but the choreography plays inside the PINNED
    // section, whose top is 0 while stuck. Rebase everything on the section's
    // own top, or a page measured at scrollY 0 bakes the whole page-offset
    // (thousands of px) into the transforms. Function-scoped: the deck's
    // start position needs it too.
    const secTop = track.parentElement.getBoundingClientRect().top;
    // The paragraph RISES: it starts with its first line on the bottom edge of
    // the pinned viewport and travels up to its laid-out spot as you scroll,
    // so the copy is read on the way in. Layout is untouched (transform only),
    // so the slot the picture lands on never moves.
    let subRise = 0;
    if (sub) {
      // inline `none`, NOT '' — the stylesheet parks the paragraph at
      // translateY(120vh) against the pre-JS flash, and clearing to ''
      // would hand back to that rule and poison this measurement
      sub.style.transform = 'none';
      const sr = sub.getBoundingClientRect();
      subRise = vh - (sr.top - secTop);
      // measuring left `none` on the element — INVALIDATE paint's change
      // guard, or the paint that follows sees an unchanged ty, skips its
      // write, and the paragraph stays seated in full view. (This is what
      // made it show early whenever fonts.ready / load re-measured.)
      sub.dataset.ty = '';
    }
    if (sub && slot) slot.style.marginTop = '26px';
    // FLIP: where the deck must land (the slot), from where it rests (centered)
    let flip = null;
    if (deck && slot) {
      deck.style.transform = 'translate(-50%, -50%)';
      const d = deck.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      const dx = (s.left + s.width / 2) - (d.left + d.width / 2);
      const dy = (s.top + s.height / 2) - (d.top + d.height / 2);
      const k  = s.width / d.width;
      // ONE continuous cubic bezier, start (upper right) → slot (centred
      // under the paragraph). A chain of stations changed direction at every
      // stop, and each hop's little arc broke the derivative at the joins —
      // that is what read as glitching. A single curve is smooth by
      // construction; the pictures still swap along it, but the MOTION never
      // kinks, never rotates, and lands exactly on the measured slot.
      const W = vw, H = vh;

      // START: anchored to the headline's accent word ("Covered") rather than
      // to an arbitrary fraction, so it always sits under that word and in the
      // right-hand half — never jammed against the edge. Measured, then
      // clamped so the whole picture stays inside the viewport.
      // Centre of the RIGHT HALF (75% of the viewport). Measuring the accent
      // word instead looked exact but wasn't: at measure() time the headline's
      // letters still carry their entrance transforms, so the <em> reports a
      // collapsed rect and the picture landed dead centre.
      const hgR = headGroup ? headGroup.getBoundingClientRect() : null;
      const halfW = d.width / 2, halfH = d.height / 2;
      const maxX = W / 2 - halfW - 24;               // keep it fully on screen
      // phones: the right-half anchor reads as off-centre clutter in a
      // single-column layout — fly the deck straight down the middle
      const startX = W <= 767 ? 0 : Math.min(W * 0.25, maxX);
      // vertically: in the gap between the headline and the paragraph
      const startY = hgR
        ? ((hgR.bottom - secTop) + 34 + halfH) - (H * 0.44)
        : H * 0.02;

      flip = {
        p0: { x: startX,      y: startY },
        c1: { x: startX * 1.18, y: startY + H * 0.16 },
        c2: { x: dx + (startX - dx) * 0.34, y: dy * 0.66 },
        p3: { x: dx,          y: dy },
        k
      };
    }

    // parallax centers, in track coordinates
    parImgs.forEach(p => {
      const r = p.el.closest('.svc__media').getBoundingClientRect();
      p.center = r.left + r.width / 2;    // track is untransformed right now
      // half the horizontal overflow the picture has to give (118% wide → 9%),
      // minus a pixel so a rounding error can never expose the window edge
      p.room = Math.max(0, r.width * 0.09 - 1);
    });
    const panelLefts = panels.map(el => el.getBoundingClientRect().left);

    // the driver's height IS the choreography: ~1.4 viewports for the intro
    // deck, then one px of scroll per px of horizontal travel
    const introPx = Math.round(vh * 2.1);   // four beats need the runway
    driver.style.height = (vh + introPx + maxX) + 'px';

    geo = { vw, maxX, flip, introPx, panelLefts, subRise };
  }

  let lastIdx = -1;
  if (deckImgs.length) deckImgs[0].classList.add('is-on');
  function paint() {
    if (!geo) return;
    const rect = driver.getBoundingClientRect();
    const scrolled = Math.max(0, -rect.top);

    // ── phase A, three beats: headline reads → the statement paragraph
    // lights word by word → the flipbook arcs down into its slot.
    const pA = clamp01(scrolled / geo.introPx);

    // The paragraph climbs from the bottom edge into place — a steady,
    // almost-linear rise so it reads at scroll pace rather than whipping in.
    if (sub && geo.subRise) {
      const rise = seg(pA, 0.04, 0.74);
      const eased = rise * rise * (3 - 2 * rise) * 0.35 + rise * 0.65;   // mostly linear
      const ty = (geo.subRise * (1 - eased)).toFixed(1);
      if (sub.dataset.ty !== ty) { sub.dataset.ty = ty; sub.style.transform = `translateY(${ty}px)`; }
    }

    // beat 3 — the deck glides the curve: position and scale only, zero
    // rotation. The frame swaps as it goes, but nothing about the motion
    // changes at a swap, so the travel stays perfectly continuous.
    if (deck && geo.flip && deckImgs.length) {
      // visible from the very first frame — no fade. It is part of the
      // opening composition, not something that arrives later.
      const f = easeInOut(seg(pA, 0.14, 0.92));

      // one frame per equal slice of the journey
      const idx = Math.min(deckImgs.length - 1, Math.floor(f * deckImgs.length));
      if (idx !== lastIdx) {
        lastIdx = idx;
        deckImgs.forEach((im, n) => im.classList.toggle('is-on', n === idx));
      }

      const F = geo.flip, u = 1 - f;
      const b0 = u * u * u, b1 = 3 * u * u * f, b2 = 3 * u * f * f, b3 = f * f * f;
      const x = b0 * F.p0.x + b1 * F.c1.x + b2 * F.c2.x + b3 * F.p3.x;
      const y = b0 * F.p0.y + b1 * F.c1.y + b2 * F.c2.y + b3 * F.p3.y;
      deck.style.transform =
        `translate(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px)) ` +
        `scale(${lerp(1, F.k, f).toFixed(4)})`;

      // parallax inside the frame: the picture drifts against its own window
      // as the window travels, which is what gives the flight depth
      if (deckInner) {
        const drift = ((1 - f) * -5).toFixed(2);
        if (deckInner.dataset.d !== drift) {
          deckInner.dataset.d = drift;
          deckInner.style.transform = `translateY(${drift}%)`;
        }
      }

      // The trace line rides the SAME curve, a little behind the picture and
      // offset to its side, morphing shape continuously as it travels.
      if (trace && tracePath) {
        const ft = clamp01(f - 0.10);
        const ut = 1 - ft;
        const t0 = ut * ut * ut, t1 = 3 * ut * ut * ft, t2 = 3 * ut * ft * ft, t3 = ft * ft * ft;
        const tx = t0 * F.p0.x + t1 * F.c1.x + t2 * F.c2.x + t3 * F.p3.x;
        const ty = t0 * F.p0.y + t1 * F.c1.y + t2 * F.c2.y + t3 * F.p3.y;
        // sits to the INNER side of the picture (toward the text), not the
        // outer one — at 75% of the viewport an outward offset ran it off
        // the right edge. Held WELL clear of the frame: at -165 it hugged
        // (and partly hid behind) the image edge; the wider berth keeps the
        // whole stroke in open air where it reads.
        const side = lerp(-305, -215, f);
        trace.style.opacity = (seg(f, 0.02, 0.12) * (1 - seg(f, 0.94, 1) * 0.25)).toFixed(3);
        trace.style.transform =
          `translate(calc(-50% + ${(tx + side).toFixed(1)}px), calc(-50% + ${(ty - 26).toFixed(1)}px)) ` +
          `rotate(${(f * 26).toFixed(1)}deg)`;

        // morph: walk the vocabulary, tweening every number between neighbours
        const g = f * (TRACE.length - 1);
        const i0 = Math.min(TRACE.length - 2, Math.floor(g));
        const mt = smooth(clamp01(g - i0));
        const A = TRACE[i0], B = TRACE[i0 + 1];
        const d = traceD(A.map((v, n) => lerp(v, B[n], mt)));
        if (tracePath.dataset.d !== d) { tracePath.dataset.d = d; tracePath.setAttribute('d', d); }
      }
    }

    // ── phase B: the horizontal run
    const pB = clamp01((scrolled - geo.introPx) / Math.max(1, geo.maxX));
    const x = smooth(pB) * geo.maxX;
    track.style.transform = `translate3d(${(-x).toFixed(1)}px, 0, 0)`;

    // parallax: each image drifts by its window's distance from screen centre
    parImgs.forEach(p => {
      const screenC = p.center - x;
      let shift = (screenC - geo.vw / 2) * -p.speed;
      // Clamped so the drift always stays inside the picture's own cover —
      // the frame never shows through, only the image glides within it.
      shift = Math.max(-p.room, Math.min(p.room, shift));
      p.el.style.transform = `translate(calc(-50% + ${shift.toFixed(1)}px), -50%)`;
    });

    // panel entrances — once its leading edge is well inside the viewport
    panels.forEach((el, i) => {
      if (!el.classList.contains('is-in') && geo.panelLefts[i] - x < geo.vw * 0.72) {
        el.classList.add('is-in');
      }
    });
  }

  function setStatic() {
    driver.style.height = '';
    track.style.transform = '';
    if (deck) deck.style.transform = '';
    deckImgs.forEach((im, i) => im.classList.toggle('is-on', i === 0));
    if (headGroup) headGroup.style.transform = '';
    // `none`, not '' — '' would fall back to the stylesheet's 120vh
    // anti-flash park and hide the paragraph in the static layout
    if (sub) { sub.style.transform = 'none'; sub.dataset.ty = ''; }
    if (deck) { deck.style.opacity = ''; deck.dataset.o = ''; }
    if (deckInner) { deckInner.style.transform = ''; deckInner.dataset.d = ''; }
    if (slot) slot.style.marginTop = '';
    if (trace) { trace.style.opacity = ''; trace.style.transform = ''; }
    parImgs.forEach(p => { p.el.style.transform = 'translate(-50%, -50%)'; });
    panels.forEach(el => el.classList.add('is-in'));
  }

  let rafId = null;
  const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(() => { rafId = null; paint(); }); };
  const onResize = () => { if (isStatic()) { setStatic(); } else { measure(); paint(); } };

  onResize();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
}

/* homepage — services, with the travelling flipbook deck and trace line */
initSvcScroll({
  driver: '#svcDriver', track: '#svcTrack',
  deck: '#svcDeck', slot: '#svcSlot',
  headGroup: '#svcHeadGroup', headline: '#svcHeadline',
  trace: '#svcTrace', tracePath: '#svcTracePath'
});
/* about — Overview intro, then the story panels ride past with the same
   per-image parallax. No deck/trace here: just the copy and the run. */
initSvcScroll({
  driver: '#aboutDriver', track: '#aboutTrack',
  headGroup: '#aboutHeadGroup', headline: '#aboutHeadline'
});


// ============================================================
// MAGNETIC BUTTONS — cursor attraction on hover
// ============================================================
(function initMagnetic() {
  $$('.btn--magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r   = btn.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) * 0.22;
      const dy  = (e.clientY - cy) * 0.22;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();


// ============================================================
// USP ACCORDION — Why iCAUR items expand on click (client H6)
// ============================================================
(function initUspAccordion() {
  const items = $$('.svc-list .svc-item');
  if (!items.length) return;
  items[0].classList.add('is-open');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      items.forEach(o => o.classList.remove('is-open'));
      if (!wasOpen) item.classList.add('is-open');
    });
  });
})();


// ============================================================
// TILTED CARDS — 3D perspective tilt on hover (React Bits port)
// Applied to every white-hover-card (and its .svc-hub-card alias)
// site-wide; also any explicit [data-tilt] element.
// ============================================================
(function initTiltCards() {
  const cards = $$('.white-hover-card, .svc-hub-card, [data-tilt]');
  if (!cards.length || !window.matchMedia('(pointer: fine)').matches) return;

  const AMP = 9;   // max tilt in degrees

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;   // -0.5 … 0.5
      const py = (e.clientY - r.top)  / r.height - 0.5;
      const rotY = ( px * AMP * 2).toFixed(2);
      const rotX = (-py * AMP * 2).toFixed(2);
      card.style.transform =
        `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.04)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();


// ============================================================
// SERVICES HOVER LIST — homepage image preview (reference style)
// ============================================================
// ============================================================
// FAQ HERO COLLAGE — MAGNET hover: the whole photo leans toward
// the cursor a few px (btn--magnetic energy, no zoom, no pan
// inside the frame) and springs home on leave. The frame div is
// only an anchor — reveal rides it, the magnet rides the img —
// so entrance and hover never share a transform. Fine pointers.
// ============================================================
(function initFaqHeroShots() {
  // Same magnet on both families in the hero: the photo cards lean their
  // picture, the question chips lean the whole ringed word. Each entry is
  // [outer anchor that owns the hover, inner element that actually moves,
  // pull distance] — the chips lean a little further because they are much
  // smaller, and an identical 10px read as nothing on them.
  const targets = [];
  $$('.faq-hero-shot').forEach(el => {
    const img = el.querySelector('img');
    if (img) targets.push([el, img, 10]);
  });
  $$('.faq-ask').forEach(el => {
    const pill = el.querySelector('.faq-ask__pill');
    if (pill) targets.push([el, pill, 14]);
  });
  if (!targets.length || !window.matchMedia('(pointer: fine)').matches) return;

  targets.forEach(([el, img, PULL]) => {
    // lerped state, so the lean glides and the release springs back
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const tick = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      img.style.setProperty('--mx', cx.toFixed(2) + 'px');
      img.style.setProperty('--my', cy.toFixed(2) + 'px');
      raf = (Math.abs(tx - cx) + Math.abs(ty - cy) < 0.06)
        ? null : requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width  - 0.5) * PULL * 2;
      ty = ((e.clientY - r.top)  / r.height - 0.5) * PULL * 2;
      wake();
    });
    el.addEventListener('mouseleave', () => { tx = 0; ty = 0; wake(); });
  });
})();


(function initUspList() {
  const stack   = $('#uspStack');
  const preview = $('#uspPreview');
  if (!stack || !preview) return;
  const img  = preview.querySelector('img');
  const rows = $$('.usp-row', stack);

  // Placement: the preview still alternates SIDES down the list (left,
  // right, left …) but rides ONE vertical line — centred on the stack of
  // three values (set in fitPreview) — so it never tracks rows upward
  // into the heading or crowds a title. Hover swaps picture and side.
  const sideFor = row => (rows.indexOf(row) % 2 === 1 ? 'right' : 'left');
  const rest = () => {
    preview.classList.remove('is-active');
    preview.dataset.side = 'left';        // idle mirrors row 1's side
    if (rows[0] && img.getAttribute('src') !== rows[0].dataset.img) {
      img.src = rows[0].dataset.img;
    }
  };
  rest();

  // The image must NEVER cover the titles (site-wide rule for this
  // component). Size the preview to the free gutter beside the centred
  // titles and CENTER it inside that gutter (--pv-x), keeping a
  // guaranteed, width-scaled clearance from the text at every screen
  // size — shrinking as the gutter narrows and hiding when there's no
  // useful room.
  const fitPreview = () => {
    const wrapRect = preview.parentElement.getBoundingClientRect();
    let minLeft = Infinity, maxRight = -Infinity;
    rows.forEach(r => {
      const t = r.querySelector('.usp-row__title');
      if (!t) return;
      const tr = t.getBoundingClientRect();
      minLeft  = Math.min(minLeft, tr.left);
      maxRight = Math.max(maxRight, tr.right);
    });
    if (!isFinite(minLeft)) return;
    const CLEAR = Math.max(48, window.innerWidth * 0.035);   // image ↔ text
    const EDGE  = 12;                                        // image ↔ container edge
    const gutter = Math.min(minLeft - wrapRect.left, wrapRect.right - maxRight);
    const usable = gutter - CLEAR - EDGE;
    if (usable < 140) { preview.style.display = 'none'; return; }
    preview.style.display = '';
    const w = Math.min(usable, 280);
    preview.style.width = w + 'px';
    /* dead-centre of the gutter, with the text clearance as a hard floor:
       even air on both sides where there's room, never closer than CLEAR
       to the titles where there isn't */
    let x = (gutter - w) / 2;
    x = Math.min(x, gutter - CLEAR - w);
    x = Math.max(x, EDGE);
    preview.style.setProperty('--pv-x', x.toFixed(1) + 'px');
    /* vertical: centred on the VALUES STACK, not the wrap — the wrap's
       midpoint sits in the wide heading's band, the stack's is the clear
       zone beside the row titles */
    const stackRect = stack.getBoundingClientRect();
    preview.style.top = (stackRect.top - wrapRect.top + stackRect.height / 2).toFixed(1) + 'px';
  };
  fitPreview();
  window.addEventListener('resize', fitPreview, { passive: true });
  window.addEventListener('load', fitPreview);   /* re-measure once fonts settle */

  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      if (img.getAttribute('src') !== row.dataset.img) img.src = row.dataset.img;
      preview.dataset.side = sideFor(row);
      preview.classList.add('is-active');
    });
    row.addEventListener('focus', () => {
      img.src = row.dataset.img;
      preview.dataset.side = sideFor(row);
      preview.classList.add('is-active');
    });
  });
  stack.addEventListener('mouseleave', rest);

  // MOBILE: there is no hover, so the SCROLL drives the rows instead —
  // whichever row sits nearest the viewport centre is "on": its title
  // lights up and its own image fades in small behind the word (the
  // floating side preview stays a desktop thing). CSS owns the look via
  // .is-scroll-on; each row carries its image as a custom property.
  rows.forEach(r => r.style.setProperty('--row-img', `url("${r.dataset.img}")`));
  let mRaf = null;
  function scrollSpot() {
    mRaf = null;
    if (window.innerWidth > 860) { rows.forEach(r => r.classList.remove('is-scroll-on')); return; }
    const mid = window.innerHeight / 2;
    let best = null, bd = Infinity;
    rows.forEach(r => {
      const c = r.getBoundingClientRect();
      const d = Math.abs(c.top + c.height / 2 - mid);
      if (d < bd) { bd = d; best = r; }
    });
    rows.forEach(r =>
      r.classList.toggle('is-scroll-on', r === best && bd < window.innerHeight * 0.5));
  }
  const onSpot = () => { if (!mRaf) mRaf = requestAnimationFrame(scrollSpot); };
  window.addEventListener('scroll', onSpot, { passive: true });
  window.addEventListener('resize', onSpot, { passive: true });
  scrollSpot();
})();


// ============================================================
// SPOTLIGHT HERO — flashlight reveal on service sub-pages
// ============================================================
(function initSpotHero() {
  const hero = $('.spot-hero');
  if (!hero) return;
  const reveal = hero.querySelector('.spot-hero__reveal');
  if (!reveal) return;

  // Image build: .spot-hero__reveal is the BRIGHT layer, fully dark
  // underneath at rest — a cursor-follow flashlight fades it in/out.
  // Video build: there's only one (bright) video, so .spot-hero__reveal
  // is instead a DIM layer over it (--r is its mask hole's radius, kept
  // at 0 — no interactive reveal here, just a flat, permanent dim).
  const isVideo = hero.classList.contains('spot-hero--video');

  // Touch devices: no cursor — show the reveal layer as a gentle
  // roaming spotlight instead of hiding the effect entirely.
  const fine = window.matchMedia('(pointer: fine)').matches;

  let mx = -999, my = -999;   // raw target
  let sx = -999, sy = -999;   // smoothed
  let targetR = 0, r = 0;     // video build's hole radius

  if (isVideo) {
    // Flashlight removed — the reveal layer stays a flat, permanent dim
    // over the video (its mask hole never opens: --r stays 0). No mouse
    // or touch listeners attached at all — static on every input type.
    reveal.style.setProperty('--r', '0px');
  } else if (fine) {
    // Fade the light in/out at the edges instead of dragging it away —
    // a position of -999 would streak the circle across the image.
    reveal.style.opacity = '0';
    reveal.style.transition = 'opacity .45s ease';
    hero.addEventListener('mouseenter', e => {
      const rect = hero.getBoundingClientRect();
      // snap to entry point so the light doesn't travel from its old spot
      mx = sx = e.clientX - rect.left;
      my = sy = e.clientY - rect.top;
      reveal.style.opacity = '1';
    });
    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      reveal.style.opacity = '1';
    }, { passive: true });
    hero.addEventListener('mouseleave', () => {
      reveal.style.opacity = '0';   // dim in place, no run-away
    });
  } else {
    // slow autonomous drift for touch screens (image build only)
    let t = 0;
    setInterval(() => {
      t += 0.02;
      mx = hero.offsetWidth  * (0.5 + 0.35 * Math.sin(t));
      my = hero.offsetHeight * (0.55 + 0.2 * Math.cos(t * 0.8));
    }, 40);
  }

  (function loop() {
    sx += (mx - sx) * 0.1;
    sy += (my - sy) * 0.1;
    reveal.style.setProperty('--sx', sx.toFixed(1) + 'px');
    reveal.style.setProperty('--sy', sy.toFixed(1) + 'px');
    if (isVideo) {
      r += (targetR - r) * 0.12;
      reveal.style.setProperty('--r', r.toFixed(1) + 'px');
    }
    requestAnimationFrame(loop);
  })();
})();


// ============================================================
// DARK SECTION SPOTLIGHT — glow follows the cursor (client I2)
// ============================================================
(function initDarkSpotlight() {
  const sections = $$('.innov-pillar--dark');
  if (!sections.length || !window.matchMedia('(pointer: fine)').matches) return;
  sections.forEach(sec => {
    sec.addEventListener('mousemove', e => {
      const r = sec.getBoundingClientRect();
      sec.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
      sec.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
    }, { passive: true });
  });
})();


// ============================================================
// BRAND VALUES — hover/click reveal cards on About (client A1)
// ============================================================
(function initValueCards() {
  const cards = $$('#valuesRow .value-card');
  if (!cards.length) return;
  const activate = card => {
    cards.forEach(c => {
      const on = c === card;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-expanded', String(on));
    });
  };
  const fine = window.matchMedia('(pointer: fine)').matches;
  cards.forEach(card => {
    if (fine) card.addEventListener('mouseenter', () => activate(card));
    card.addEventListener('click', () => activate(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(card); }
    });
  });
})();


// ============================================================
// SPEC COUNT-UP ANIMATION
// ============================================================
(function initSpecCounters() {
  function countUp(el, to, isFloat, delay) {
    const dur = 1000;
    let start = null;

    setTimeout(() => {
      function step(ts) {
        if (!start) start = ts;
        const p    = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3); // cubic ease-out
        const val  = isFloat
          ? (ease * to).toFixed(1)
          : Math.round(ease * to).toString();

        // Replace text node, preserving <small> child
        if (el.childNodes[0]?.nodeType === Node.TEXT_NODE) {
          el.childNodes[0].textContent = val;
        } else {
          el.insertBefore(document.createTextNode(val), el.firstChild);
        }

        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, delay);
  }

  const specObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Support both .spec__value (old) and .spec__n (new)
      $$('.spec__value, .spec__n', entry.target).forEach((el, i) => {
        const count   = el.dataset.count;
        const isFloat = 'float' in el.dataset || (count && count.includes('.'));
        const num     = parseFloat(count ?? el.textContent.trim());
        if (isNaN(num)) return;

        // Snapshot initial text node, then reset to zero
        if (el.childNodes[0]?.nodeType === Node.TEXT_NODE) {
          el.childNodes[0].textContent = isFloat ? '0.0' : '0';
        }

        countUp(el, num, isFloat, i * 120);
      });

      specObs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  $$('.model-row, .specs-block, .stats-grid').forEach(row => specObs.observe(row));
})();


// ============================================================
// FAQ ACCORDION — shared (homepage + FAQ page), one open at a time
// ============================================================
(function initFaqAccordion() {
  const buttons = $$('.faq-item__q');
  if (!buttons.length) return;

  const setState = (btn, open) => {
    btn.setAttribute('aria-expanded', String(open));
    const answer = btn.closest('.faq-item').querySelector('.faq-item__a');
    if (!answer) return;
    answer.classList.toggle('is-open', open);
    answer.setAttribute('aria-hidden', String(!open));
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const wasOpen = btn.getAttribute('aria-expanded') === 'true';
      buttons.forEach(b => setState(b, false));   // only one open at a time
      if (!wasOpen) setState(btn, true);
    });
  });
})();


// ============================================================
// NEWSLETTER FORM — prevent-default + feedback
// ============================================================
(function initNewsletter() {
  const form = $('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn   = form.querySelector('button[type="submit"]');
    if (!input?.value) return;

    // Success state
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9L7.5 13.5L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    btn.style.background = '#2d6a4f';
    input.value = '';
    input.placeholder = 'Thanks for subscribing!';
    input.blur();

    setTimeout(() => {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      btn.style.background = '';
      input.placeholder = 'Your email address';
    }, 3500);
  });
})();


// ============================================================
// PARALLAX HERO VEHICLE — subtle depth on scroll
// ============================================================
(function initHeroParallax() {
  const vehicle = $('.hero__vehicle');
  if (!vehicle) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY * 0.18;
      vehicle.style.transform = `translateY(${y}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();


// ============================================================
// HORIZONTAL SCROLL HINT — fade out after first scroll
// ============================================================
(function initScrollHint() {
  const hint = $('.scroll-hint');
  if (!hint) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) hint.classList.add('is-hidden');
  }, { passive: true, once: true });
})();


// ============================================================
// SECTION MARKS — update "01 / 07" indicator on scroll
// ============================================================
(function initSectionMarks() {
  const mark = $('.hero__mark');
  if (!mark) return;

  const sections = $$('main > section[id]');
  const total    = sections.length;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = sections.indexOf(entry.target) + 1;
      if (idx > 0) {
        mark.textContent = `${String(idx).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => obs.observe(s));
})();


// ============================================================
// MODEL ROW HOVER — subtle image scale + info reveal
// ============================================================
(function initModelRows() {
  $$('.model-row').forEach(row => {
    const card = row.querySelector('.model-card');
    if (!card) return;

    row.addEventListener('mouseenter', () => card.classList.add('is-hover'));
    row.addEventListener('mouseleave', () => card.classList.remove('is-hover'));
  });
})();


// ============================================================
// VIDEO PLAY — autoplay hero video if present
// ============================================================
(function initHeroVideo() {
  const video = $('video.hero__video');
  if (!video) return;

  video.muted  = true;
  video.loop   = true;
  video.playsinline = true;
  video.play().catch(() => {/* autoplay blocked — silent fail */});
})();


// ============================================================
// WHY iCAUR — diagonal band strips
// The strips live in normal document flow, so the page's own
// scroll does the wiping (see .why-strip in styles.css). This
// only adds the extras: a subtle horizontal parallax drift on
// each word, the side doodles drawing on with the strip's own
// progress, and the HUD counter.
// ============================================================
(function initWhyStrips() {
  const section = document.getElementById('why-icaur');
  if (!section) return;

  const strips = Array.from(section.querySelectorAll('.why-strip'));
  if (!strips.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // live on mobile too — only reduced motion gets the pre-drawn state
  const isStatic = () => reduce;

  // Split each headline into per-letter spans (keeping any <em> wrapper
  // intact) so letters can carry their own offset — the reference does
  // exactly this: ±0.5em, alternating up/down. Letters are grouped inside
  // a .why-word wrapper per word: inline-block letters are each a line-break
  // opportunity, which split words mid-word on narrow viewports.
  function splitLetters(word) {
    if (!word || word.dataset.split) return [];
    const out = [];
    let n = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          // keep the original spacing: split on spaces but re-emit them
          child.textContent.split(/(\s+)/).forEach(chunk => {
            if (!chunk) return;
            if (/^\s+$/.test(chunk)) { frag.appendChild(document.createTextNode(chunk)); return; }
            const wrap = document.createElement('span');
            wrap.className = 'why-word';
            chunk.split('').forEach(ch => {
              const span = document.createElement('span');
              span.className = 'why-ltr';
              span.textContent = ch;
              span.dataset.i = n++;
              wrap.appendChild(span);
              out.push(span);
            });
            frag.appendChild(wrap);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(word);
    word.dataset.split = '1';
    return out;
  }

  const items = strips.map(s => ({
    el:      s,
    inner:   s.querySelector('.why-strip__inner'),
    letters: splitLetters(s.querySelector('.why-strip__word')),
    // each vector path draws inside its own window of the strip's pass
    // (data-draw="start end"), so scenes build in stages (road → sun)
    paths:   Array.from(s.querySelectorAll('.why-viz :is(path, circle, rect)[data-draw]'))
               .map(el => {
                 const [a, b] = el.dataset.draw.split(' ').map(Number);
                 return { el, a, b, last: -1 };
               }),
    // data-side: which edge the word ENTERS from. At the start of a pass
    // t is -1, so x = -DRIFT * dir — meaning dir must be +1 for a word
    // that should begin off the LEFT edge.
    dir:     s.dataset.side === 'l' ? 1 : -1
  }));


  if (isStatic()) {
    items.forEach(it => {
      it.paths.forEach(p => { p.el.style.strokeDashoffset = '0'; });
      it.letters.forEach(l => { l.style.transform = ''; });
      it.el.classList.add('is-in');
    });
    return;
  }

  // The word ENTERS FROM THE SIDE: it starts well off-screen on its
  // strip's side, sweeps in, holds centred through the middle of the
  // pass, then leaves the other way. The easing exponent is what buys
  // that hold — linear travel would drift the whole time.
  // Full exit: at 100vw the block's own centre reaches the viewport edge, so
  // the whole line has cleared the screen — the entrance now reads as text
  // arriving from OUTSIDE its side rather than sliding a short distance.
  const DRIFT = 108;  // vw of travel at the extremes of the pass
  const EASE  = 3.2;  // >1 keeps the word near centre for longer
  const LETTER_LIFT = 0.12;   // em — a subtle height offset, not a big zigzag
  let rafId = null;

  function paint() {
    rafId = null;
    const vh = window.innerHeight;

    items.forEach((it, i) => {
      const r = it.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;   // off-screen — skip

      // p: 0 when the strip's top hits the bottom of the viewport,
      //    1 when its bottom leaves the top — its full pass.
      const p = (vh - r.top) / (vh + r.height);
      const c = Math.min(Math.max(p, 0), 1);

      // Word sweeps in from its side, holds centred, then exits opposite.
      const t = (c - 0.5) * 2;                       // -1 … 0 … 1
      const x = Math.sign(t) * Math.pow(Math.abs(t), EASE) * DRIFT * it.dir;
      it.inner.style.transform = `rotate(6deg) translateX(${x.toFixed(2)}vw)`;

      // Letters: a small height offset that settles flat on the way IN and
      // then STAYS flat on the way out — deliberately not reversed, so the
      // word doesn't re-animate as it leaves.
      const zig = c < 0.5 ? Math.min(1, (0.5 - c) / 0.34) : 0;
      it.letters.forEach((ltr, k) => {
        const sign = (k % 2 === 0) ? 1 : -1;
        ltr.style.transform = zig < 0.004
          ? ''
          : `translateY(${(sign * zig * LETTER_LIFT).toFixed(3)}em)`;
      });

      // Vector scenes: each path draws inside its own window while the
      // strip enters; past centre everything HOLDS fully drawn (never
      // reversed on the way out). Writes are skipped when unchanged.
      it.paths.forEach(pth => {
        const k = c >= 0.5 ? 1 : Math.min(1, Math.max(0, (c - pth.a) / (pth.b - pth.a)));
        if (k !== pth.last) {
          pth.last = k;
          pth.el.style.strokeDashoffset = (1 - k).toFixed(3);
        }
      });

      // arm the looping actions (car bob, sun pulse, cabin rock, star
      // spin, motion lines) once the scene has fully drawn
      it.el.classList.toggle('is-in', c >= 0.46);
    });
  }
  function onScroll() { if (!rafId) rafId = requestAnimationFrame(paint); }

  paint();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
})();



// ============================================================
// MEDIA TILES — 3D entrance, scrubbed by scroll
// Each tile rises out of the page: it starts pitched back on the
// grid's shared vanishing point and pushed away in Z, then rolls
// upright and forward as it enters. The yaw alternates by column
// so a row opens like a hand of cards rather than one flat plane.
// ============================================================
(function initMediaTilt() {
  const tiles = Array.from(document.querySelectorAll('.media-card--tile'));
  if (!tiles.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const clamp01 = v => Math.min(1, Math.max(0, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function paint() {
    const vh = window.innerHeight;
    tiles.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 400) return;      // far off-screen
      // 0 as the tile's top touches the bottom of the viewport,
      // 1 once it has travelled a third of the screen upward
      const p = easeOut(clamp01((vh - r.top) / (vh * 0.34)));
      const away = 1 - p;
      const yaw = (i % 3 === 0 ? -1 : i % 3 === 2 ? 1 : 0) * away * 9;
      el.style.opacity = p.toFixed(3);
      el.style.transform =
        `translate3d(0, ${(away * 70).toFixed(1)}px, ${(-away * 260).toFixed(1)}px) ` +
        `rotateX(${(away * 24).toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`;
    });
  }

  let rafId = null;
  const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(() => { rafId = null; paint(); }); };
  paint();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', paint);
})();

// ============================================================
// STORY TILE SILHOUETTE — shared by the homepage media scene and
// the Media Center listing. One definition of the shape: a rectangle
// with a stepped corner cut, every corner rounded. clip-path has no
// corner radius of its own, so the rounding is sampled — each vertex
// becomes a short quadratic arc, which works for the notch's concave
// corners as well as the convex outer ones.
// ============================================================
function mediaShapePoints(x, y, w, h, nxF, nyF, r) {
  const nx = w * nxF, ny = h * nyF;
  const v = [
    [x + nx, y], [x + w, y], [x + w, y + h - ny], [x + w - nx, y + h - ny],
    [x + w - nx, y + h], [x, y + h], [x, y + ny], [x + nx, y + ny]
  ];
  if (r <= 0.5) return v;
  const toward = (from, to) => {
    const dx = to[0] - from[0], dy = to[1] - from[1];
    const len = Math.hypot(dx, dy) || 1, d = Math.min(r, len / 2);
    return [from[0] + (dx / len) * d, from[1] + (dy / len) * d];
  };
  const out = [];
  for (let i = 0; i < v.length; i++) {
    const P = v[(i - 1 + v.length) % v.length], V = v[i], N = v[(i + 1) % v.length];
    const a = toward(V, P), b = toward(V, N);
    for (let s = 0; s <= 4; s++) {
      const t = s / 4, u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * V[0] + t * t * b[0],
                u * u * a[1] + 2 * u * t * V[1] + t * t * b[1]]);
    }
  }
  return out;
}
const mediaToClip = pts =>
  'polygon(' + pts.map(p => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(', ') + ')';
const MEDIA_TILE_RADIUS = 16;

// Give every story tile on the page that silhouette at its own size.
// The homepage scene re-runs this through its own measure pass; the
// Media Center listing relies on it entirely.
(function initMediaTiles() {
  function clipAll() {
    document.querySelectorAll('.media-card__img').forEach(el => {
      // offsetWidth/Height, NOT getBoundingClientRect: the tiles carry 3D
      // transforms (initMediaTilt) and the scene scales cards, so a rect would
      // hand us the TRANSFORMED size and the notch would be cut at the wrong
      // scale — the clip must be in the element's own untransformed space.
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      const cs = getComputedStyle(el);
      const nx = parseFloat(cs.getPropertyValue('--notch-x')) || 0;
      const ny = parseFloat(cs.getPropertyValue('--notch-y')) || 0;
      el.style.clipPath = mediaToClip(
        mediaShapePoints(0, 0, w, h, nx / 100, ny / 100, MEDIA_TILE_RADIUS));
    });
  }
  clipAll();
  window.addEventListener('resize', clipAll, { passive: true });
  window.addEventListener('load', clipAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(clipAll);
})();

// ============================================================
// MEDIA CENTER — pinned two-scene sequence
// Scene 1: #mediaVeil is a full-bleed photo under a scrim with
// the headline huge and white over it. Scene 2: the veil's
// clip-path shrinks onto #mediaLeadImg — the REAL card's picture
// box — while the photo inside pulls back, so the hero image
// literally becomes the lead card. The headline FLIPs down to
// its laid-out spot top-left, the bigger story slides in from
// the right, and the brief resolves bottom-left.
//
// Everything is measured from the real layout (never hardcoded
// offsets), so the veil lands pixel-exact at any viewport.
// ============================================================
(function initMediaScene() {
  const driver = $('#mediaDriver');
  const stage  = $('#mediaStage');
  const veil   = $('#mediaVeil');
  const img    = $('#mediaLead img');   // the story's own photo — the only one
  const scrim  = $('#mediaScrim');
  const head   = $('#mediaHead');
  const headEyebrow = head ? head.querySelector('.eyebrow') : null;
  const brief  = $('#mediaBrief');
  const lead   = $('#mediaLead');
  const target = $('#mediaLeadImg');
  const big    = $('#mediaBig');
  if (!driver || !stage || !veil || !target || !head) return;

  // live at every width — the morph measures its geometry from the live
  // layout, so the stacked mobile grid scrubs just as well; only reduced
  // motion opts out
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isStatic = () => reduce;

  const clamp01 = v => Math.min(1, Math.max(0, v));
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;

  let geo = null;

  // ONE image, full stop. Rather than copying the story's photo into a second
  // <img> and cross-fading the two (which is what produced the visible jump),
  // the story's own node is MOVED into the hero frame while the scene is
  // pinned, and handed back for the stacked layout. Moving a node keeps the
  // decoded bitmap — no reload, no flash — and with a single node there is
  // nothing left that can disagree about framing.
  let landed = false;
  function placeImage() {
    if (!img) return;
    const wanted = (isStatic() || landed) ? target : veil;
    if (img.parentElement !== wanted) wanted.insertBefore(img, wanted.firstChild);
    // the frame paints nothing while the tile owns the photo
    veil.style.visibility = wanted === veil ? '' : 'hidden';
  }

  // Where the veil has to land, and how far the headline has to travel —
  // both read off the settled layout with transforms cleared.
  function measure() {
    placeImage();          // the photo must be in its frame before we measure
    head.style.transform = '';
    // The cards carry animation transforms for most of the scene (the lead is
    // translated 20px down until p≈0.86). Reading the landing box through
    // those bakes the offset into geo.clip, and the photo then SNAPS that
    // distance at the handover — the jump. Clear them for the measurement,
    // exactly as the headline already was, then let paint() restore them.
    // head is in here too: dx/dy are deltas FROM the headline's laid-out spot
    // to the scene-1 anchor, and headX/headY/headW/headH are its laid-out box.
    // On first load its transform is still empty so that came out right, but a
    // later re-measure (resize, font swap) read the scaled box and the numbers
    // drifted — visibly so now that the colour flip is measured off headH.
    const moved = [lead, big, brief, head].filter(Boolean);
    const saved = moved.map(el => el.style.transform);
    moved.forEach(el => { el.style.transform = ''; });

    const s = stage.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const h = head.getBoundingClientRect();

    moved.forEach((el, i) => { el.style.transform = saved[i]; });

    if (!s.width || !s.height || !h.width) { geo = null; return; }

    // Headline scale in scene 1. Capped on BOTH axes — the block wraps to
    // three lines, so a width-only cap let it grow taller than the viewport.
    const k = Math.min(3.1, (s.width * 0.84) / h.width, (s.height * 0.66) / h.height);
    // the tile's corner notch, read straight off the CSS so the veil's
    // silhouette and the tile's own clip can never drift apart
    const cs = getComputedStyle(target);
    geo = {
      notchX: parseFloat(cs.getPropertyValue('--notch-x')) || 0,
      notchY: parseFloat(cs.getPropertyValue('--notch-y')) || 0,
      // the landing box, as edge insets (%) of the stage
      clip: {
        top:    (t.top    - s.top)    / s.height * 100,
        right:  (s.right  - t.right)  / s.width  * 100,
        bottom: (s.bottom - t.bottom) / s.height * 100,
        left:   (t.left   - s.left)   / s.width  * 100
      },
      k,
      // The edge-clears-headline colour flip only has meaning when the tile
      // lands to the RIGHT of the headline (the desktop 3-column scene):
      // there the picture's advancing left edge really does sweep past the
      // last letter. Stacked layouts land the tile BELOW the headline — full
      // width in one column, or half width in the two-up phone grid — and in
      // both the left edge never clears it, so the headline would stay white
      // on bare cream forever. Those fall back to the scene-progress flip.
      // Testing the geometry directly covers every such layout; the old
      // width-ratio test only caught the full-width one.
      geomFlip: t.left >= h.right - 8,
      // scene-1 anchor: inset from the left, vertically centred
      dx: (s.left + s.width * 0.07) - h.left,
      dy: (s.top + s.height * 0.52 - (h.height * k) / 2) - h.top,
      // for the colour flip: the headline's box inside the stage, in px
      headX: h.left - s.left,
      headW: h.width,
      headY: h.top - s.top,
      headH: h.height,
      stageW: s.width,
      stageH: s.height,
      // the photo's intrinsic size + the cover scale it gets at full bleed;
      // the reframe maths above works back from these
    };

    // give every tile the shared silhouette at its own size
    const nxF = geo.notchX / 100, nyF = geo.notchY / 100;
    stage.querySelectorAll('.media-card__img').forEach(el => {
      // untransformed box — the scene scales these cards while animating
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      el.style.clipPath = mediaToClip(mediaShapePoints(0, 0, w, h, nxF, nyF, MEDIA_TILE_RADIUS));
    });
  }

  function paint() {
    if (isStatic()) {
      placeImage();
      veil.removeAttribute('style');
      // removeAttribute wiped the visibility placeImage set — an empty but
      // visible veil would still paint its scrim over the static layout
      veil.style.visibility = 'hidden';
      if (img) img.style.transform = '';
      head.style.transform = '';
      head.style.color = '';
      if (headEyebrow) headEyebrow.style.transform = '';
      [brief, lead, big].forEach(el => {
        if (el) { el.style.opacity = ''; el.style.transform = ''; el.style.pointerEvents = ''; }
      });
      return;
    }
    if (!geo) measure();
    if (!geo) return;

    const rect = driver.getBoundingClientRect();
    const p = clamp01(-rect.top / Math.max(driver.offsetHeight - window.innerHeight, 1));

    // ── the morph: full bleed → the lead tile's notched silhouette.
    // The hero FRAME is resized (left/top/width/height) rather than a
    // stage-sized picture being cropped, so object-fit:cover reframes the
    // photo for free at every step — and because the frame holds the story's
    // own <img>, the end state IS the tile, with nothing to hand over to.
    // Each edge runs on its own window: the LEFT edge leads and the others
    // trail, so the picture keeps spanning the headline's full height while
    // its left edge sweeps right past it. The headline goes from fully covered
    // to fully clear in one pass instead of straddling the boundary with half
    // its letters unreadable on the bare background. (Left, not top: the tall
    // tiles land with their top ABOVE the headline's baseline, so only the
    // horizontal gap ever fully clears it.)
    const mLeft = ease(seg(p, 0.06, 0.46));
    const mRt   = ease(seg(p, 0.12, 0.68));
    const mBot  = ease(seg(p, 0.20, 0.70));
    const mTop  = ease(seg(p, 0.26, 0.70));
    const m = ease(seg(p, 0.06, 0.70));   // the picture's own pull-back
    const c = geo.clip;
    const W = geo.stageW, H = geo.stageH;
    const bx = (c.left * mLeft / 100) * W;
    const by = (c.top  * mTop  / 100) * H;
    const bw = W - bx - (c.right  * mRt  / 100) * W;
    const bh = H - by - (c.bottom * mBot / 100) * H;
    veil.style.left   = bx.toFixed(1) + 'px';
    veil.style.top    = by.toFixed(1) + 'px';
    veil.style.width  = bw.toFixed(1) + 'px';
    veil.style.height = bh.toFixed(1) + 'px';
    // the notch and the corner radius grow in, so the full-bleed opening scene
    // is a clean rectangle and the tile silhouette only forms as it lands
    veil.style.clipPath = mediaToClip(mediaShapePoints(
      0, 0, bw, bh,
      (geo.notchX / 100) * mLeft, (geo.notchY / 100) * mTop,
      MEDIA_TILE_RADIUS * m
    ));
    // a slight overshoot that settles — the pull-back feel, and exactly 1 at
    // the end so the landed tile is the picture at its natural framing
    if (img) img.style.transform = `scale(${lerp(1.08, 1, m).toFixed(4)})`;
    if (scrim) scrim.style.opacity = (1 - seg(p, 0.34, 0.78)).toFixed(3);

    // Landed = the morph is over: hand the photo to the TILE so its position
    // comes from layout, not from a measured box that can drift (font loads,
    // vh changes, browser zoom — the drift Mark saw as a gap above/below the
    // photo). Hysteresis so the handover never thrashes at the boundary.
    if (!landed && p >= 0.995) { landed = true; placeImage(); }
    else if (landed && p < 0.97) { landed = false; placeImage(); }

    // ── headline: scene-1 anchor (big, white) → its laid-out spot (small, dark)
    const t = ease(seg(p, 0.04, 0.64));
    const sc = lerp(geo.k, 1, t);
    head.style.transform = `translate(${(geo.dx * (1 - t)).toFixed(2)}px, ${(geo.dy * (1 - t)).toFixed(2)}px) scale(${sc.toFixed(4)})`;
    // The block's scale would drag the eyebrow up to headline size — cancel it
    // so the label stays small from the very first frame (origin left bottom
    // keeps it sitting right above the title as the block grows).
    if (headEyebrow) headEyebrow.style.transform = `scale(${(1 / sc).toFixed(4)})`;
    // White → brand black, driven by GEOMETRY rather than a fixed progress
    // window: the headline turns dark exactly as the picture's advancing left
    // edge clears its last letter. A fixed window left it white on bare cream.
    const picLeftPx  = bx;
    const picTopPx   = by;
    const headRightPx  = geo.headX + geo.dx * (1 - t) + geo.headW * sc;
    const headBottomPx = geo.headY + geo.dy * (1 - t) + geo.headH * sc;
    // commit once it is nearly clear, over a short ramp, so the half-way grey
    // is a brief pass rather than a readable state
    // single-column layouts land the picture at full container width, so
    // its left edge NEVER clears the headline — there the flip rides the
    // scene progress instead, committing as the veil settles into the tile
    const geomCw = clamp01((picLeftPx - (headRightPx - 30)) / 45 + 1);
    // Stacked layouts land the tile BELOW the headline, so their flip rides
    // the VERTICAL clearance — the same test, on the other axis: the headline
    // commits to dark as the picture's top edge drops past its last line.
    // A fixed progress window cannot work here, because how early the picture
    // clears depends on how small the landing tile is (full width in one
    // column, half width in the two-up phone grid).
    const stackedCw = geo.geomFlip
      ? 0
      : clamp01((picTopPx - (headBottomPx - 30)) / 45 + 1);
    const cw = Math.max(geomCw, stackedCw);
    const g = Math.round(lerp(255, 10, cw));
    head.style.color = `rgb(${g}, ${g}, ${g})`;

    // ── lead card chrome resolves under the landing frame
    if (lead) {
      const l = ease(seg(p, 0.60, 0.86));
      lead.style.opacity = l.toFixed(3);
      lead.style.transform = `translateY(${lerp(20, 0, l).toFixed(1)}px)`;
      // these cards are links — an invisible one must not be clickable
      lead.style.pointerEvents = l < 0.6 ? 'none' : '';
    }
    // ── the bigger story slides in beside it
    if (big) {
      const b = ease(seg(p, 0.56, 0.92));
      big.style.opacity = b.toFixed(3);
      big.style.transform = `translateX(${lerp(96, 0, b).toFixed(1)}px) scale(${lerp(0.94, 1, b).toFixed(4)})`;
      big.style.pointerEvents = b < 0.6 ? 'none' : '';
    }
    // ── the media-center brief closes the scene
    if (brief) {
      const bf = ease(seg(p, 0.74, 1));
      brief.style.opacity = bf.toFixed(3);
      brief.style.transform = `translateY(${lerp(26, 0, bf).toFixed(1)}px)`;
      brief.style.pointerEvents = bf < 0.6 ? 'none' : '';
    }
  }

  let rafId = null;
  const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(() => { rafId = null; paint(); }); };
  const onResize = () => { measure(); paint(); };

  measure(); paint();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  // fonts and the lead image both change where the frame has to land
  window.addEventListener('load', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
})();


// ============================================================
// SMOOTH ANCHOR SCROLL — for in-page # links
// ============================================================
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (!target) return;

  e.preventDefault();
  const nav = $('#nav');
  const offset = (nav?.offsetHeight ?? 72) + 16;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top, behavior: 'smooth' });
});

// ============================================================
// COMPARE TOOL
// ============================================================
(function initCompare() {
  const MAX = 5;
  let selections = []; // { model, trim, label }

  const SPECS = [
    { label: 'Range',        key: 'range' },
    { label: 'Power',        key: 'hp' },
    { label: 'Acceleration', key: 'accel' },
  ];

  const FEATURES = [
    'Fast DC Charging', 'All-Wheel Drive', 'OTA Updates',
    'Autopilot Suite', 'Heated Seats', 'Panoramic Roof', '360° Camera'
  ];

  const MODEL_DATA = {
    v27: {
      name: 'V27',
      img:  '/icaur-website/assets/images/v27-model-in-homepge-01.webp',
      logo: '/icaur-website/assets/images/V27-logo.svg',
      trimSpecs: {
        'Standard Range': { range: '450 km', hp: '380 hp', accel: '4.8s' },
        'Long Range':     { range: '560 km', hp: '380 hp', accel: '4.8s' },
        'Performance':    { range: '510 km', hp: '520 hp', accel: '3.5s' },
      },
      features: { 'Fast DC Charging': true, 'All-Wheel Drive': true, 'OTA Updates': true, 'Autopilot Suite': false, 'Heated Seats': true, 'Panoramic Roof': true, '360° Camera': false }
    },
    o3t: {
      name: 'O3T',
      img:  '/icaur-website/assets/images/ot3-model-in-homepage-01.webp',
      logo: '/icaur-website/assets/images/T03-logo.svg',
      trimSpecs: {
        'Core':  { range: '520 km', hp: '420 hp', accel: '4.2s' },
        'Plus':  { range: '580 km', hp: '480 hp', accel: '3.8s' },
        'Ultra': { range: '630 km', hp: '580 hp', accel: '3.1s' },
      },
      features: { 'Fast DC Charging': true, 'All-Wheel Drive': false, 'OTA Updates': true, 'Autopilot Suite': true, 'Heated Seats': true, 'Panoramic Roof': false, '360° Camera': true }
    }
  };

  const CHECK_SVG = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.5 9.5l4 4 7-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CROSS_SVG = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

  const toggleBtn  = document.getElementById('compareToggle');
  const drawer     = document.getElementById('cmpDrawer');
  const backdrop   = document.getElementById('cmpBackdrop');
  const closeBtn   = document.getElementById('cmpClose');
  const countBadge = document.getElementById('compareCount');
  const drawerBody = document.getElementById('cmpBody');
  const modal      = document.getElementById('cmpModal');
  const modalClose = document.getElementById('cmpModalClose');
  const modalBd    = document.getElementById('cmpModalBackdrop');
  const confirmBtn = document.getElementById('cmpConfirm');
  const selCountEl = document.getElementById('cmpModalSelCount');
  const checkboxes = modal ? Array.from(modal.querySelectorAll('.cmp-trim input[type="checkbox"]')) : [];

  if (!toggleBtn || !drawer || !modal) return;

  function openDrawer()  { drawer.classList.add('is-open');  drawer.removeAttribute('aria-hidden'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden','true'); if (!modal.classList.contains('is-open')) document.body.style.overflow = ''; }
  function openModal()   { modal.classList.add('is-open');   modal.removeAttribute('aria-hidden'); }
  function closeModal()  { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); }

  function syncCount() {
    const n = selections.length;
    // every badge — the nav pill's AND the mobile menu's mirror
    document.querySelectorAll('#compareCount, .nav__compare-count').forEach(b => {
      b.textContent = n;
      b.dataset.count = n;
    });
    if (selCountEl) selCountEl.textContent = n;
  }

  function syncDimState() {
    const atMax = selections.length >= MAX;
    checkboxes.forEach(cb => {
      cb.closest('.cmp-trim').classList.toggle('is-dimmed', atMax && !cb.checked);
    });
  }

  function removeSel(model, trim) {
    selections = selections.filter(s => !(s.model === model && s.trim === trim));
    checkboxes.forEach(cb => { if (cb.dataset.model === model && cb.dataset.trim === trim) cb.checked = false; });
    syncCount(); syncDimState(); renderDrawer();
  }

  function renderDrawer() {
    drawerBody.innerHTML = '';
    // Plus col visible whenever we're under the 5-selection limit
    const hasPlus = selections.length < MAX;

    if (selections.length === 0) {

      const empty = document.createElement('div');
      empty.className = 'cmp-empty';
      empty.innerHTML = `<button class="cmp-add-btn">
        <span class="cmp-add-btn__icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 4v14M4 11h14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </span><span>Add Model</span></button>`;
      empty.querySelector('.cmp-add-btn').addEventListener('click', openModal);
      drawerBody.appendChild(empty);
      return;
    }


    // Fixed 155px per selection column; feat-name col 140px; plus col 80px
    const gridCols = `140px ${selections.map(() => '155px').join(' ')}${hasPlus ? ' 80px' : ''}`;

    const table = document.createElement('div');
    table.className = 'cmp-table';
    table.style.gridTemplateColumns = gridCols;

    // ── Header row ──────────────────────────────────────────
    const spacer = document.createElement('div');
    spacer.className = 'cmp-feat-spacer';
    table.appendChild(spacer);

    // One column per trim selection
    selections.forEach(sel => {
      const data = MODEL_DATA[sel.model];
      const hcol = document.createElement('div');
      hcol.className = 'cmp-model-hcol';
      hcol.innerHTML = `
        <button class="cmp-model-hcol__remove" aria-label="Remove ${sel.trim}">✕</button>
        <div class="cmp-model-hcol__img-wrap">
          <img src="${data.img}" alt="${data.name}" class="cmp-model-hcol__img">
          <img src="${data.logo}" alt="${data.name}" class="cmp-model-hcol__logo">
        </div>
        <p class="cmp-model-hcol__title">${data.name} · ${sel.trim}</p>`;
      hcol.querySelector('.cmp-model-hcol__remove').addEventListener('click', () => removeSel(sel.model, sel.trim));
      table.appendChild(hcol);
    });

    // Plus column: always shown while under max
    if (hasPlus) {
      const plusBtn = document.createElement('button');
      plusBtn.className = 'cmp-plus-hcol';
      plusBtn.innerHTML = `<span class="cmp-plus-hcol__icon">+</span><span>Add</span>`;
      plusBtn.addEventListener('click', openModal);
      table.appendChild(plusBtn);
    }

    // ── Spec rows (text values) ───────────────────────────────
    let rowIdx = 0;
    SPECS.forEach(spec => {
      const bg = rowIdx % 2 === 1 ? 'rgba(0,0,0,.025)' : '';
      const nameCell = document.createElement('div');
      nameCell.className = 'cmp-feat-name';
      nameCell.style.background = bg;
      nameCell.textContent = spec.label;
      table.appendChild(nameCell);

      selections.forEach(sel => {
        const trimSpecs = MODEL_DATA[sel.model].trimSpecs[sel.trim] || {};
        const cell = document.createElement('div');
        cell.className = 'cmp-feat-cell cmp-feat-cell--text';
        cell.style.background = bg;
        cell.textContent = trimSpecs[spec.key] || '—';
        table.appendChild(cell);
      });

      if (hasPlus) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cmp-feat-cell cmp-feat-cell--empty';
        emptyCell.style.background = bg;
        table.appendChild(emptyCell);
      }
      rowIdx++;
    });

    // ── Feature rows (✓/✗) ───────────────────────────────────
    FEATURES.forEach(feat => {
      const bg = rowIdx % 2 === 1 ? 'rgba(0,0,0,.025)' : '';
      const nameCell = document.createElement('div');
      nameCell.className = 'cmp-feat-name';
      nameCell.style.background = bg;
      nameCell.textContent = feat;
      table.appendChild(nameCell);

      selections.forEach(sel => {
        const has  = MODEL_DATA[sel.model].features[feat];
        const cell = document.createElement('div');
        cell.className = `cmp-feat-cell cmp-feat-cell--${has ? 'yes' : 'no'}`;
        cell.style.background = bg;
        cell.innerHTML = has ? CHECK_SVG : CROSS_SVG;
        table.appendChild(cell);
      });

      if (hasPlus) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cmp-feat-cell cmp-feat-cell--empty';
        emptyCell.style.background = bg;
        table.appendChild(emptyCell);
      }
      rowIdx++;
    });

    drawerBody.appendChild(table);
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        if (selections.length >= MAX) { cb.checked = false; return; }
        selections.push({ model: cb.dataset.model, trim: cb.dataset.trim, label: cb.dataset.label });
      } else {
        selections = selections.filter(s => !(s.model === cb.dataset.model && s.trim === cb.dataset.trim));
      }
      syncCount(); syncDimState();
    });
  });

  toggleBtn.addEventListener('click', () => { renderDrawer(); openDrawer(); });
  backdrop.addEventListener('click', closeDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  modalClose.addEventListener('click', closeModal);
  modalBd.addEventListener('click', closeModal);
  confirmBtn.addEventListener('click', () => { closeModal(); renderDrawer(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

  syncCount();
})();


// ============================================================
// PRE-FOOTER CTA — "lego" boxes assemble when the section is
// centered, drift apart as you scroll away (up or down)
// ============================================================
(function initCtaLego() {
  const sections = $$('.cta-split');
  if (!sections.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const panels = sections.map(section => ({
    section,
    left:  $('[data-lego="left"]',  section),
    right: $('[data-lego="right"]', section),
  })).filter(p => p.left && p.right);

  if (!panels.length) return;

  let ticking = false;

  function update() {
    ticking = false;
    const mobile = window.innerWidth <= 900;
    const vh = window.innerHeight;
    for (const { section, left, right } of panels) {
      if (mobile) { left.style.transform = right.style.transform = ''; continue; }
      const rect = section.getBoundingClientRect();
      const sectionCenter  = rect.top + rect.height / 2;
      const viewportCenter = vh / 2;
      const dist   = Math.abs(sectionCenter - viewportCenter) / (vh * 0.6);
      const spread = Math.max(0, Math.min(1, dist));
      const sign   = sectionCenter < viewportCenter ? -1 : 1;
      const x  = spread * 86;
      const y  = sign * spread * 24;
      const ry = spread * 24;
      const rx = spread * 7;
      const sc = 1 - spread * 0.05;
      left.style.transform  = `translate3d(${-x}px, ${y}px, 0) rotateX(${rx}deg) rotateY(${ ry}deg) scale(${sc})`;
      right.style.transform = `translate3d(${ x}px, ${y}px, 0) rotateX(${rx}deg) rotateY(${-ry}deg) scale(${sc})`;
    }
  }

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  update();
})();


// ============================================================
// LANGUAGE SWITCH — Arabic toggle (sets lang + direction).
// NOTE: text translations are not wired yet; this flips
// document language/direction as the entry point for i18n.
// ============================================================
(function initLangToggle() {
  const btn = $('#langToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const toAr = document.documentElement.lang !== 'ar';
    document.documentElement.lang = toAr ? 'ar' : 'en';
    document.documentElement.dir  = toAr ? 'rtl' : 'ltr';
    btn.textContent = toAr ? 'EN' : 'ع';
    btn.setAttribute('data-tooltip', toAr ? 'English' : 'العربية');
    btn.setAttribute('aria-label', toAr ? 'Switch to English' : 'التبديل إلى العربية');
  });
})();


// ============================================================
// VARIABLE PROXIMITY — letter weight reacts to cursor distance
// (vanilla port of React Bits' VariableProximity, Montserrat wght axis)
// ============================================================
(function initVariableProximity() {
  const heads = $$('.cta-split__h, .mission-statement__text');
  if (!heads.length) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const FROM = 400, TO = 900, RADIUS = 130;
  const letters = [];

  // recurse so inline accents like <em> are preserved (keeps their colour)
  function split(root) {
    [...root.childNodes].forEach(node => {
      if (node.nodeName === 'BR') { root.replaceChild(document.createElement('br'), node); return; }
      if (node.nodeType === 1) { split(node); return; }       // element → recurse
      if (node.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      (node.textContent || '').split(/(\s+)/).forEach(part => {
        if (part === '') return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const word = document.createElement('span');
        word.className = 'vp-word';
        [...part].forEach(ch => {
          const s = document.createElement('span');
          s.className = 'vp-letter';
          s.textContent = ch;
          word.appendChild(s);
          letters.push(s);
        });
        frag.appendChild(word);
      });
      root.replaceChild(frag, node);
    });
  }

  heads.forEach(h => { split(h); h.classList.add('vp-on'); });

  // Collect all words across tracked heads for width-locking
  const allVpWords = [];
  heads.forEach(h => h.querySelectorAll('.vp-word').forEach(w => allVpWords.push(w)));

  let mx = -9999, my = -9999;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function loop() {
    for (const l of letters) {
      const r = l.getBoundingClientRect();
      const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
      const f = d >= RADIUS ? 0 : (1 - d / RADIUS);   // linear falloff
      l.style.fontVariationSettings = `'wght' ${Math.round(FROM + (TO - FROM) * f)}`;
    }
    requestAnimationFrame(loop);
  }

  // Measure each word at max weight and lock min-width so heavier glyphs
  // never cause text to reflow onto an extra line.
  function startLoop() {
    letters.forEach(l => { l.style.fontVariationSettings = `'wght' ${TO}`; });
    requestAnimationFrame(() => {
      allVpWords.forEach(w => { w.style.minWidth = w.getBoundingClientRect().width + 'px'; });
      letters.forEach(l => { l.style.fontVariationSettings = `'wght' ${FROM}`; });
      requestAnimationFrame(loop);
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(startLoop);
  } else {
    requestAnimationFrame(startLoop);
  }
})();


// ============================================================
// FIGURE COUNTERS — count up [data-count-to] numbers on scroll-in
// ============================================================
(function initFigureCounters() {
  const nums = $$('[data-count-to]');
  if (!nums.length) return;

  function countUp(el) {
    const target  = parseFloat(el.dataset.countTo) || 0;
    const suffix  = el.dataset.suffix || '';
    const dur = 1800, start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        countUp(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(n => io.observe(n));
})();


// ============================================================
// OUR MISSION — scroll-driven 3D carousel (mirrors the services
// section) + floating parallax images around the statement
// ============================================================
// OUR MISSION — horizontal carousel (headline → statement) that
// sweeps through on scroll, with floating parallax images that
// scatter out from the statement and a curve reveal on entry
// ============================================================
(function initMissionScroll() {
  const driver  = $('#missionDriver');
  const section = $('#missionSection');
  const stage   = $('#missionStage', section || document);
  if (!driver || !section || !stage) return;

  const cards = $$('.diff__panel', stage);
  const intro = $('#missionIntro', stage);
  const MOBILE = 760;

  if (intro) {
    const dh = $('.diff__headline', intro);
    splitHeadlineLetters(dh);
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { intro.classList.add('in-view'); if (dh) dh.classList.add('letters-in'); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(intro);
  }

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const ss    = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const seg   = (p, a, b) => ss((p - a) / (b - a));

  function progress() {
    const rect = driver.getBoundingClientRect();
    const scrollable = Math.max(driver.offsetHeight - window.innerHeight, 1);
    return clamp(-rect.top / scrollable, 0, 1);
  }

  /* ── Reference choreography (client video, serverobotics.com) ──
     The title holds centered exactly as it enters, then on scroll it
     SWELLS toward the camera while blurring away into a soft wash —
     staying as a faint ghost behind — while the statement writes
     itself word by word over it. No horizontal sweep. */
  const statement = stage.querySelector('.mission-statement');
  const stText    = statement && statement.querySelector('.mission-statement__text');

  // Word units to reveal. On fine-pointer devices initVariableProximity
  // has already split the statement into .vp-word spans (it runs before
  // this IIFE) — reuse those so the two effects share one DOM. On touch
  // it never runs, so fall back to a plain word wrap that preserves
  // inline elements like the <em>.
  let msWords = stText ? [...stText.querySelectorAll('.vp-word')] : [];
  if (stText && !msWords.length) {
    (function wrap(root) {
      [...root.childNodes].forEach(node => {
        if (node.nodeType === 1) { wrap(node); return; }
        if (node.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        (node.textContent || '').split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'ms-word';
          w.textContent = part;
          frag.appendChild(w);
          msWords.push(w);
        });
        root.replaceChild(frag, node);
      });
    })(stText);
  }

  function tick() {
    if (window.innerWidth <= MOBILE) {
      cards.forEach(c => { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; c.style.filter = ''; });
      msWords.forEach(w => { w.style.opacity = ''; });
      return;
    }
    const p = progress();

    // Title: as-is while entering, then scales up + blurs into a ghost
    if (intro) {
      const g = seg(p, 0.05, 0.55);
      intro.style.transform = `translateX(0px) scale(${(1 + g * 2.2).toFixed(3)})`;
      intro.style.filter    = `blur(${(g * 24).toFixed(1)}px)`;
      intro.style.opacity   = (1 - seg(p, 0.10, 0.55) * 0.88).toFixed(3);
      intro.style.zIndex    = '1';
    }

    // Statement: fixed centered over the ghost; the WORDS carry the
    // reveal — each fades in on its own slice of the scroll, so the
    // paragraph types itself with a soft frontier like the reference
    if (statement) {
      statement.style.transform = 'translateX(0px)';
      statement.style.opacity   = '1';
      statement.style.zIndex    = '2';
    }
    const n = msWords.length || 1;
    msWords.forEach((w, i) => {
      const wStart = 0.28 + (i / n) * 0.55;
      w.style.opacity = seg(p, wStart, wStart + 0.12).toFixed(3);
    });
  }

  tick();
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);

  // ── Floating images: scale OUT from the statement, parallax drift; curve reveal
  const floats = $$('.mission-float', section);
  const curve  = $('.diff__curve', section);
  const desktop = window.matchMedia('(pointer: fine)').matches;
  let homes = [];

  function measure() {
    const sr = section.getBoundingClientRect();
    const scx = sr.left + sr.width / 2, scy = sr.top + sr.height / 2;
    homes = floats.map(f => {
      f.style.transform = '';
      const r = f.getBoundingClientRect();
      return { dx: (r.left + r.width / 2) - scx, dy: (r.top + r.height / 2) - scy };
    });
  }
  measure();
  window.addEventListener('resize', measure);

  let mx = 0, my = 0, cx = 0, cy = 0;
  if (desktop) window.addEventListener('mousemove', e => {
    mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  (function loop() {
    const p = progress();
    const r = clamp((p - 0.5) / 0.32, 0, 1);   // scatter-out reveal (after statement starts)
    cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06;
    if (window.innerWidth > MOBILE) {
      floats.forEach((f, i) => {
        const h = homes[i] || { dx: 0, dy: 0 };
        const d = parseFloat(f.dataset.depth) || 0.05;
        const tx = -h.dx * (1 - r) + cx * d * 800;
        const ty = -h.dy * (1 - r) + cy * d * 800;
        f.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${r.toFixed(3)})`;
        f.style.opacity = r.toFixed(3);
      });
    }
    if (curve) {
      const sTop = section.getBoundingClientRect().top;
      const cr = clamp((window.innerHeight - sTop) / (window.innerHeight - 100), 0, 1);
      curve.style.opacity = cr.toFixed(3);
      curve.style.transform = `translateY(${((1 - cr) * 30).toFixed(1)}px)`;
    }
    requestAnimationFrame(loop);
  })();
})();
