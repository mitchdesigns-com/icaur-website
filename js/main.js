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
// CUSTOM CURSOR — dot + ring with spring-physics lag
// ============================================================
(function initCursor() {
  const cursor = $('#cursor');
  const dot    = $('#cursorDot');
  const ring   = $('#cursorRing');
  const label  = $('#cursorLabel');
  if (!cursor || !dot || !ring) return;

  // Only on devices with a fine pointer (mouse)
  if (!window.matchMedia('(pointer: fine)').matches) {
    cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  const RING_SPRING = 0.18;  // lower = more lag
  let hoverEl = null;        // element the ring should fit/snap to

  // RAF loop — spring physics
  function rafLoop() {
    let targetX = mouseX, targetY = mouseY;

    if (hoverEl) {
      const r = hoverEl.getBoundingClientRect();
      targetX = r.left + r.width / 2;
      targetY = r.top + r.height / 2;
      ring.style.width  = `${r.width}px`;
      ring.style.height = `${r.height}px`;
      ring.style.borderRadius = getComputedStyle(hoverEl).borderRadius;
    } else {
      ring.style.width  = '';
      ring.style.height = '';
      ring.style.borderRadius = '';
    }

    // Ease ring toward target
    ringX += (targetX - ringX) * RING_SPRING;
    ringY += (targetY - ringY) * RING_SPRING;

    // Dot and label always share the ring's position — perfectly centered
    const transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    dot.style.transform   = transform;
    ring.style.transform  = transform;
    label.style.transform = transform;

    requestAnimationFrame(rafLoop);
  }
  requestAnimationFrame(rafLoop);

  // Track mouse position
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.classList.add('is-visible');
  }, { passive: true });

  document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  document.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));

  // Hover states
  function addHoverListeners() {
    // Grow on links / buttons — ring morphs to fit the element
    $$('a, button, [role="button"], .btn, label, input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hover');
        // FAQ questions: the ring keeps following the mouse across the
        // row — only the plus icon itself (handled below) snaps the ring
        if (el.matches('.faq-item__q')) return;
        // Color swatches: keep the round cursor (a fitted ring reads as
        // an awkward square around the tall thumbnail+label button)
        if (el.matches('.v27-swatch')) return;
        if (el.matches('.btn, button, [role="button"], .v27-cta-btn')) {
          cursor.classList.add('is-fit');
          hoverEl = el;
        }
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hover');
        if (hoverEl === el) {
          cursor.classList.remove('is-fit');
          hoverEl = null;
        }
      });
    });

    // FAQ plus icons: the ring wraps just the icon while the mouse is on it
    $$('.faq-item__plus').forEach(plus => {
      plus.addEventListener('mouseenter', () => {
        cursor.classList.add('is-fit');
        hoverEl = plus;
      });
      plus.addEventListener('mouseleave', () => {
        if (hoverEl === plus) {
          cursor.classList.remove('is-fit');
          hoverEl = null;
        }
      });
    });

    // Image hover — show label
    $$('[data-cursor-label]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const txt = el.dataset.cursorLabel || '';
        label.textContent = txt;
        cursor.classList.add('is-label');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-label');
        label.textContent = '';
      });
    });

    // Active / press state
    document.addEventListener('mousedown', () => cursor.classList.add('is-pressed'));
    document.addEventListener('mouseup',   () => cursor.classList.remove('is-pressed'));
  }
  addHoverListeners();

  // Real-time cursor contrast — sample background luminance under cursor
  function parseBgRgb(str) {
    const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return m ? [+m[1], +m[2], +m[3]] : null;
  }
  function luminance(r, g, b) {
    return [r, g, b].reduce((acc, c, i) => {
      const s = c / 255;
      const lin = s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      return acc + lin * [0.2126, 0.7152, 0.0722][i];
    }, 0);
  }
  function bgLumAt(x, y) {
    let el = document.elementFromPoint(x, y);
    while (el && el !== document.documentElement) {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        const rgb = parseBgRgb(bg);
        if (rgb) return luminance(...rgb);
      }
      el = el.parentElement;
    }
    return 1;
  }
  let lastLumMs = 0;
  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastLumMs < 80) return;
    lastLumMs = now;
    const lum = bgLumAt(e.clientX, e.clientY);
    cursor.classList.toggle('is-dark', lum < 0.35);
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

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
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

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) close();
  });
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

      // Orange mask-wipe tied to the entrance fade
      let localP;
      if (p <= segStart)            localP = 0;
      else if (p < segStart + FADE) localP = (p - segStart) / FADE;
      else                           localP = 1;

      const mask = $('.ov-mask', step);
      if (mask) {
        let left, width;
        if (localP < 0.45) { left = 0; width = (localP / 0.45) * 100; }
        else { const t = (localP - 0.45) / 0.55; left = t * 100; width = 100 - t * 100; }
        mask.style.setProperty('--mask-left', left + '%');
        mask.style.setProperty('--mask-width', width + '%');
      }
    });
  }

  tick();
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
})();


// ============================================================
// SERVICES — vertical scroll drives a horizontal track of
// service cards, like a circular "carousel" reveal
// ============================================================
(function initDiffScroll() {
  const driver = $('#diffScrollDriver');
  const section = $('#services');
  const stage  = $('#diffStage', section || document);
  if (!driver || !section || !stage) return;

  const cards = $$('.diff__panel', stage);
  const intro = $('#diffIntro', stage);
  const MOBILE_BREAKPOINT = 760;

  // Play the headline's entrance animation once, when the section
  // first scrolls into view
  if (intro) {
    const dh = $('.diff__headline', intro);
    splitHeadlineLetters(dh);   // pre-split so letters start hidden (no flash)
    const introObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          intro.classList.add('in-view');
          if (dh) dh.classList.add('letters-in');
          introObs.disconnect();
        }
      });
    }, { threshold: 0.2 });
    introObs.observe(intro);
  }

  function tick() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      cards.forEach(card => { card.style.transform = ''; card.style.opacity = ''; card.style.zIndex = ''; });
      return;
    }

    const rect       = driver.getBoundingClientRect();
    const vh         = window.innerHeight;
    const scrollable = Math.max(driver.offsetHeight - vh, 1);
    const p          = Math.min(Math.max(-rect.top / scrollable, 0), 1);

    // Continuous "virtual index" sweeps from the first card to the last
    // as the user scrolls — cards glide right -> center -> left in 3D
    const virtualIndex = p * (cards.length - 1);
    const spacing      = Math.max(stage.getBoundingClientRect().width * 0.62, 240);

    cards.forEach((card, i) => {
      const offset = i - virtualIndex;
      const abs    = Math.abs(offset);
      const scale  = Math.max(1 - abs * 0.18, 0.55);
      const opacity = Math.max(1 - abs * 0.55, 0);

      card.style.transform = `translateX(${offset * spacing}px) translateZ(${-abs * 160}px) rotateY(${-offset * 28}deg) scale(${scale})`;
      card.style.opacity   = opacity.toString();
      card.style.zIndex    = Math.round(100 - abs * 10).toString();
    });
  }

  tick();
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
})();


// ============================================================
// MAGNETIC BUTTONS — cursor attraction on hover
// ============================================================
(function initMagnetic() {
  $$('.btn--magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r   = btn.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) * 0.28;
      const dy  = (e.clientY - cy) * 0.28;
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
(function initUspList() {
  const stack   = $('#uspStack');
  const preview = $('#uspPreview');
  if (!stack || !preview) return;
  const img  = preview.querySelector('img');
  const rows = $$('.usp-row', stack);

  // Center the preview vertically on whichever row is hovered
  const alignTo = row => {
    const wrapRect = preview.parentElement.getBoundingClientRect();
    const rowRect  = row.getBoundingClientRect();
    preview.style.top = (rowRect.top - wrapRect.top + rowRect.height / 2) + 'px';
  };

  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      if (img.getAttribute('src') !== row.dataset.img) img.src = row.dataset.img;
      alignTo(row);
      preview.classList.add('is-active');
    });
    row.addEventListener('focus', () => {
      img.src = row.dataset.img;
      alignTo(row);
      preview.classList.add('is-active');
    });
  });
  stack.addEventListener('mouseleave', () => preview.classList.remove('is-active'));
})();


// ============================================================
// SPOTLIGHT HERO — flashlight reveal on service sub-pages
// ============================================================
(function initSpotHero() {
  const hero = $('.spot-hero');
  if (!hero) return;
  const reveal = hero.querySelector('.spot-hero__reveal');
  if (!reveal) return;

  // Touch devices: no cursor — show the reveal layer as a gentle
  // roaming spotlight instead of hiding the effect entirely.
  const fine = window.matchMedia('(pointer: fine)').matches;

  let mx = -999, my = -999;   // raw target
  let sx = -999, sy = -999;   // smoothed

  if (fine) {
    // Fade the light in/out at the edges instead of dragging it away —
    // a position of -999 would streak the circle across the image.
    reveal.style.opacity = '0';
    reveal.style.transition = 'opacity .45s ease';
    hero.addEventListener('mouseenter', e => {
      const r = hero.getBoundingClientRect();
      // snap to the entry point so the light doesn't travel from its old spot
      mx = sx = e.clientX - r.left;
      my = sy = e.clientY - r.top;
      reveal.style.opacity = '1';
    });
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      reveal.style.opacity = '1';
    }, { passive: true });
    hero.addEventListener('mouseleave', () => {
      reveal.style.opacity = '0';   // dim in place, no run-away
    });
  } else {
    // slow autonomous drift for touch screens
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
// WHY ICAUR — parallax image on scroll
// ============================================================
(function initWhyParallax() {
  const section  = document.getElementById('why-icaur');
  const imgInner = document.getElementById('whyImgInner');
  if (!section || !imgInner) return;

  function tick() {
    const rect     = section.getBoundingClientRect();
    const vh       = window.innerHeight;
    const progress = (vh - rect.top) / (vh + rect.height);
    const clamped  = Math.min(Math.max(progress, 0), 1);
    const scale    = 1 + clamped * 0.13;
    imgInner.style.transform = `scale(${scale})`;
  }

  tick();
  window.addEventListener('scroll', tick, { passive: true });
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
      img:  '/assets/images/v27-model-in-homepge-01.webp',
      logo: '/assets/images/V27-logo.svg',
      trimSpecs: {
        'Standard Range': { range: '450 km', hp: '380 hp', accel: '4.8s' },
        'Long Range':     { range: '560 km', hp: '380 hp', accel: '4.8s' },
        'Performance':    { range: '510 km', hp: '520 hp', accel: '3.5s' },
      },
      features: { 'Fast DC Charging': true, 'All-Wheel Drive': true, 'OTA Updates': true, 'Autopilot Suite': false, 'Heated Seats': true, 'Panoramic Roof': true, '360° Camera': false }
    },
    o3t: {
      name: 'O3T',
      img:  '/assets/images/ot3-model-in-homepage-01.webp',
      logo: '/assets/images/T03-logo.svg',
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
    countBadge.textContent = n;
    countBadge.dataset.count = n;
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

  function progress() {
    const rect = driver.getBoundingClientRect();
    const scrollable = Math.max(driver.offsetHeight - window.innerHeight, 1);
    return clamp(-rect.top / scrollable, 0, 1);
  }

  function tick() {
    if (window.innerWidth <= MOBILE) {
      cards.forEach(c => { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; });
      return;
    }
    const p = progress();
    const vi = p * (cards.length - 1);
    const spacing = Math.max(stage.getBoundingClientRect().width * 0.62, 240);
    cards.forEach((card, i) => {
      const offset = i - vi, abs = Math.abs(offset);
      const scale = Math.max(1 - abs * 0.18, 0.62);
      card.style.transform = `translateX(${offset * spacing}px) translateZ(${-abs * 160}px) rotateY(${-offset * 28}deg) scale(${scale})`;
      // intro fully fades out before the statement fades in (no overlap)
      const op = i === 0 ? clamp((0.55 - p) / 0.30, 0, 1) : clamp((p - 0.45) / 0.30, 0, 1);
      card.style.opacity = op.toString();
      card.style.zIndex = Math.round(100 - abs * 10).toString();
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
