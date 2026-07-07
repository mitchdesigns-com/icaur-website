'use strict';

/* ============================================================
   iCAUR — components.js
   Global Header (nav + compare) and Footer (with game) injected
   into every page via <div id="site-header"></div> /
   <div id="site-footer"></div> placeholders.

   Runs deferred BEFORE main.js / game.js so their init code finds
   the injected elements. Uses root-absolute paths so it works
   from any page depth (/, /about, /models/v27, …).
============================================================ */

const SITE_HEADER = `
<nav class="nav" id="nav" role="navigation" aria-label="Main">
  <div class="nav__inner">
    <a href="/" class="nav__logo" aria-label="iCAUR home">
      <img src="/assets/images/icaur-logo.svg" alt="iCAUR" width="113" height="22" aria-hidden="true">
    </a>

    <ul class="nav__links" role="list">
      <li><a href="/about"    class="nav__link">About</a></li>
      <li class="nav__item--has-drop">
        <a href="/models" class="nav__link nav__drop-trigger" aria-haspopup="true" aria-expanded="false">
          Models
          <svg class="nav__drop-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <div class="nav__dropdown" id="navModelsDropdown" role="region" aria-label="Models">
          <article class="mfc">
            <a href="/models/v27" class="mfc__inner" data-cursor-label="Explore">
              <span class="mfc__glow" aria-hidden="true"></span>
              <img src="/assets/images/v27-model-in-homepge-01.webp" alt="" class="mfc__img mfc__img--default" loading="lazy">
              <img src="/assets/images/v27-model-in-homepge-02.webp" alt="iCAUR V27" class="mfc__img mfc__img--hover" loading="lazy">
              <div class="mfc__bottom">
                <img src="/assets/images/V27-logo.svg" alt="iCAUR V27" class="mfc__logo">
                <h3 class="mfc__name">Bold. <span class="mfc__hl">Capable.</span></h3>
                <div class="mfc__specs"><span>450 km</span><span>380 hp</span><span>4.8s 0–100</span></div>
              </div>
            </a>
          </article>
          <article class="mfc">
            <a href="/models/v27" class="mfc__inner" data-cursor-label="Explore">
              <span class="mfc__glow" aria-hidden="true"></span>
              <img src="/assets/images/ot3-model-in-homepage-01.webp" alt="" class="mfc__img mfc__img--default" loading="lazy">
              <img src="/assets/images/ot3-model-in-homepage-02.webp" alt="iCAUR OT3" class="mfc__img mfc__img--hover" loading="lazy">
              <div class="mfc__bottom">
                <img src="/assets/images/T03-logo.svg" alt="iCAUR OT3" class="mfc__logo">
                <h3 class="mfc__name">Smart. <span class="mfc__hl">Sleek.</span></h3>
                <div class="mfc__specs"><span>520 km</span><span>420 hp</span><span>4.2s 0–100</span></div>
              </div>
            </a>
          </article>
        </div>
      </li>
      <li class="nav__item--has-drop">
        <a href="/services" class="nav__link nav__drop-trigger" aria-haspopup="true" aria-expanded="false">
          Services
          <svg class="nav__drop-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <div class="nav__dropdown nav__dropdown--services" id="navServicesDropdown" role="region" aria-label="Services">
          <div class="nav__svc-links">
            <a href="/services/maintenance" class="nav__svc-link">Maintenance Schedules</a>
            <a href="/services/programs" class="nav__svc-link">Programs</a>
            <a href="/services/warranty" class="nav__svc-link">Warranty</a>
          </div>
          <a href="/services" class="nav__svc-media" data-cursor-label="Explore" aria-label="All services">
            <img src="/assets/images/Maintainance.webp" alt="iCAUR service &amp; maintenance" loading="lazy">
          </a>
        </div>
      </li>
      <li><a href="/innovation" class="nav__link">Innovation</a></li>
      <li><a href="/news"       class="nav__link">Media Center</a></li>
      <li><a href="/faq"        class="nav__link">FAQs</a></li>
      <li><a href="/contact"    class="nav__link">Contact Us</a></li>
    </ul>

    <div class="nav__actions">
      <button class="nav__lang" id="langToggle" lang="ar" aria-label="التبديل إلى العربية">العربية</button>
      <button class="nav__compare" id="compareToggle" aria-label="Compare models">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M11 2l3 3-3 3M14 5H5M5 14l-3-3 3-3M2 11h9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="nav__compare-label">Compare</span>
        <span class="nav__compare-count" id="compareCount" data-count="0">0</span>
      </button>
      <a href="/reserve" class="btn btn--reserve btn--sm nav-btn-reserve">Reserve iCAUR</a>
    </div>

    <button class="nav__hamburger" id="navHamburger" aria-expanded="false" aria-label="Toggle menu">
      <span></span><span></span>
    </button>
  </div>
</nav>

<!-- Compare Drawer -->
<div class="cmp-drawer" id="cmpDrawer" aria-hidden="true">
  <div class="cmp-drawer__backdrop" id="cmpBackdrop"></div>
  <div class="cmp-drawer__panel">
    <header class="cmp-drawer__header">
      <h3>Compare iCAUR Models</h3>
      <button class="cmp-drawer__close" id="cmpClose" aria-label="Close">✕</button>
    </header>
    <div class="cmp-drawer__body" id="cmpBody">
      <div class="cmp-empty">
        <button class="cmp-add-btn" id="cmpAddBtn">
          <span class="cmp-add-btn__icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 4v14M4 11h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </span>
          <span>Add Model</span>
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Compare Model Selector Modal -->
<div class="cmp-modal" id="cmpModal" aria-hidden="true">
  <div class="cmp-modal__backdrop" id="cmpModalBackdrop"></div>
  <div class="cmp-modal__panel">
    <header class="cmp-modal__header">
      <div class="cmp-modal__header-top">
        <h4>Select Models &amp; Trims</h4>
        <button class="cmp-modal__close" id="cmpModalClose" aria-label="Close">✕</button>
      </div>
      <p>Choose up to 5 trims to compare. <span class="cmp-modal__count">Selected: <em id="cmpModalSelCount">0</em> / 5</span></p>
    </header>
    <div class="cmp-modal__grid">

      <!-- V27 -->
      <div class="cmp-model-col">
        <div class="cmp-mfc">
          <img src="/assets/images/v27-model-in-homepge-01.webp" alt="iCAUR V27" class="cmp-mfc__img cmp-mfc__img--default">
          <img src="/assets/images/v27-model-in-homepge-02.webp" alt="iCAUR V27" class="cmp-mfc__img cmp-mfc__img--hover">
          <img src="/assets/images/V27-logo.svg" alt="" class="cmp-mfc__logo" aria-hidden="true">
          <div class="cmp-mfc__bottom">
            <span class="cmp-mfc__name">Bold. <em>Capable.</em></span>
            <div class="cmp-mfc__specs"><span>450 km</span><span>380 hp</span><span>4.8s</span></div>
          </div>
        </div>
        <div class="cmp-trims">
          <label class="cmp-trim">
            <input type="checkbox" data-model="v27" data-trim="Standard Range" data-label="V27 Standard Range">
            <span class="cmp-trim__box"></span>
            <span class="cmp-trim__name">Standard Range</span>
            <span class="cmp-trim__price">From 450,000 EGP</span>
          </label>
          <label class="cmp-trim">
            <input type="checkbox" data-model="v27" data-trim="Long Range" data-label="V27 Long Range">
            <span class="cmp-trim__box"></span>
            <span class="cmp-trim__name">Long Range</span>
            <span class="cmp-trim__price">From 520,000 EGP</span>
          </label>
          <label class="cmp-trim">
            <input type="checkbox" data-model="v27" data-trim="Performance" data-label="V27 Performance">
            <span class="cmp-trim__box"></span>
            <span class="cmp-trim__name">Performance</span>
            <span class="cmp-trim__price">From 610,000 EGP</span>
          </label>
        </div>
      </div>

      <!-- O3T -->
      <div class="cmp-model-col">
        <div class="cmp-mfc">
          <img src="/assets/images/ot3-model-in-homepage-01.webp" alt="iCAUR O3T" class="cmp-mfc__img cmp-mfc__img--default">
          <img src="/assets/images/ot3-model-in-homepage-02.webp" alt="iCAUR O3T" class="cmp-mfc__img cmp-mfc__img--hover">
          <img src="/assets/images/T03-logo.svg" alt="" class="cmp-mfc__logo" aria-hidden="true">
          <div class="cmp-mfc__bottom">
            <span class="cmp-mfc__name">Smart. <em>Sleek.</em></span>
            <div class="cmp-mfc__specs"><span>520 km</span><span>420 hp</span><span>4.2s</span></div>
          </div>
        </div>
        <div class="cmp-trims">
          <label class="cmp-trim">
            <input type="checkbox" data-model="o3t" data-trim="Core" data-label="O3T Core">
            <span class="cmp-trim__box"></span>
            <span class="cmp-trim__name">Core</span>
            <span class="cmp-trim__price">From 480,000 EGP</span>
          </label>
          <label class="cmp-trim">
            <input type="checkbox" data-model="o3t" data-trim="Plus" data-label="O3T Plus">
            <span class="cmp-trim__box"></span>
            <span class="cmp-trim__name">Plus</span>
            <span class="cmp-trim__price">From 560,000 EGP</span>
          </label>
          <label class="cmp-trim">
            <input type="checkbox" data-model="o3t" data-trim="Ultra" data-label="O3T Ultra">
            <span class="cmp-trim__box"></span>
            <span class="cmp-trim__name">Ultra</span>
            <span class="cmp-trim__price">From 640,000 EGP</span>
          </label>
        </div>
      </div>

    </div><!-- /cmp-modal__grid -->
    <footer class="cmp-modal__footer">
      <button class="btn btn--dark btn--arrow btn--magnetic" id="cmpConfirm">Done <span class="arrow">→</span></button>
    </footer>
  </div>
</div>

<!-- Mobile Menu -->
<div class="mobile-menu" id="mobileMenu" aria-hidden="true">
  <button class="mobile-menu__close" id="mobileClose" aria-label="Close">✕</button>
  <nav class="mobile-menu__nav" aria-label="Mobile">
    <ul role="list">
      <li><a href="/about">About</a></li>
      <li class="mobile-menu__has-sub">
        <a href="/models/v27">Models</a>
        <ul class="mobile-menu__sub" role="list">
          <li><a href="/models/v27">V27</a></li>
          <li><a href="/models/v27">OT3</a></li>
        </ul>
      </li>
      <li><a href="/services">Services</a></li>
      <li><a href="/innovation">Innovation</a></li>
      <li><a href="/news">Media Center</a></li>
      <li><a href="/contact">Contact Us</a></li>
    </ul>
  </nav>
  <div class="mobile-menu__actions">
    <a href="/reserve" class="btn btn--filled btn--lg">Reserve Your iCAUR</a>
  </div>
</div>
`;

const SITE_FOOTER = `
<!-- GAME — before the footer so contact info is the last block (client G7) -->
<section id="gameBg" class="game-bg" aria-label="iCAUR offroad game"></section>

<footer class="footer" id="footer">

  <!-- Full-width Wordmark -->
  <div class="footer__logo-wrap">
    <a href="/" aria-label="iCAUR home" class="footer__wordmark reveal reveal--logo" data-delay="0">
      <img src="/assets/images/icaur-logo.svg" alt="iCAUR" aria-hidden="true">
    </a>
  </div>

  <div class="footer__inner">
    <div class="footer__divider reveal reveal--clip-h" data-delay="1"></div>

    <!-- Main Body -->
    <div class="footer__body">

      <!-- Left: Models + Nav + CTA -->
      <div class="footer__body-left reveal reveal--up" data-delay="2">
        <p class="footer__models-lbl">Models</p>
        <div class="footer__models-big">
          <a href="/models/v27">V27</a>
          <a href="/models/o3t">O3T</a>
        </div>
        <nav class="footer__nav-row" aria-label="Footer navigation">
          <a href="/about">About</a>
          <a href="/services">Services</a>
          <a href="/innovation">Innovation</a>
          <a href="/news">Media Center</a>
          <a href="/faq">FAQs</a>
          <a href="/contact">Contact us</a>
        </nav>
        <a href="/reserve" class="btn btn--reserve btn--sm btn--arrow btn--magnetic">Reserve Your iCAUR <span class="arrow">→</span></a>
      </div>

      <!-- Right: Newsletter + Contact + Partner -->
      <div class="footer__body-right reveal reveal--up" data-delay="3">
        <h6 class="footer__nl-heading">Join Our Newsletter</h6>
        <form class="nl-form--footer" action="#" method="post" novalidate>
          <input type="email" name="email" placeholder="Your email address" required aria-label="Email address">
          <button type="submit">Subscribe</button>
        </form>
        <p class="footer__nl-legal">By subscribing you agree to our <a href="/privacy">Privacy Policy</a> and consent to receive updates from iCAUR.</p>

        <div class="footer__contact">
          <a href="tel:+20221234567" class="footer__contact-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            <span>+20 (2) 2123-4567</span>
          </a>
          <a href="mailto:hello@icaur.com" class="footer__contact-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>hello@icaur.com</span>
          </a>
        </div>

        <div class="footer__partner">
          <img src="/assets/images/Ghabour-logo.svg" alt="Ghabour Auto" class="footer__ghabour-logo">
        </div>

        <div class="footer__social" aria-label="Social media">
          <a href="#" aria-label="Facebook" class="social-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
          </a>
          <a href="#" aria-label="Instagram" class="social-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="#" aria-label="X / Twitter" class="social-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" aria-label="LinkedIn" class="social-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a href="#" aria-label="YouTube" class="social-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
          </a>
        </div>
      </div>
    </div>

  </div>
</footer>

<div class="footer__outro">
  <div class="footer__inner">
    <div class="footer__bottom">
      <p class="footer__legal">© 2026 iCAUR. All rights reserved. &nbsp;·&nbsp; <a href="/privacy">Privacy Policy</a> &nbsp;·&nbsp; <a href="/terms">Terms of Service</a></p>
      <p class="footer__credit">WEBSITE DESIGN &amp; DEVELOPMENT BY MITCHDESIGNS</p>
    </div>
  </div>
</div>
`;

const QUICK_NAV_HTML = `
<div id="quick-nav" class="qn" aria-label="Quick navigation">
  <div class="qn-menu" id="qnMenu" aria-hidden="true">
    <a href="https://wa.me/20221234567" class="qn-item qn-item--wa" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      <span class="qn-item-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.858L0 24l6.336-1.508A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.001-1.373l-.359-.213-3.722.886.916-3.614-.234-.371A9.787 9.787 0 012.182 12C2.182 6.567 6.567 2.182 12 2.182S21.818 6.567 21.818 12 17.433 21.818 12 21.818z"/></svg>
      </span>
      <span class="qn-item-label">Chat on WhatsApp</span>
    </a>
    <a href="/contact/?tab=maintenance" class="qn-item qn-item--maintenance" aria-label="Book Maintenance">
      <span class="qn-item-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      </span>
      <span class="qn-item-label">Book Maintenance</span>
    </a>
    <a href="/contact/?tab=test-drive" class="qn-item qn-item--drive" aria-label="Request Test Drive">
      <span class="qn-item-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="9" y1="11.5" x2="2.5" y2="15"/><line x1="15" y1="11.5" x2="21.5" y2="15"/></svg>
      </span>
      <span class="qn-item-label">Request Test Drive</span>
    </a>
  </div>
  <button class="qn-toggle" id="qnToggle" aria-label="Open quick navigation" aria-expanded="false">
    <span class="qn-bar qn-bar--1"></span>
    <span class="qn-bar qn-bar--2"></span>
    <span class="qn-bar qn-bar--3"></span>
  </button>
</div>`;

(function injectComponents() {
  const header = document.getElementById('site-header');
  if (header) header.outerHTML = SITE_HEADER;

  const footer = document.getElementById('site-footer');
  if (footer) footer.outerHTML = SITE_FOOTER;

  /* Quick Nav FAB */
  const qnWrap = document.createElement('div');
  qnWrap.innerHTML = QUICK_NAV_HTML;
  document.body.appendChild(qnWrap.firstElementChild);

  // Mark the active nav link based on the current path
  const path = location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href !== '/' && path.startsWith(href)) a.setAttribute('aria-current', 'page');
  });

  // Nav dropdowns (Models, Services) — click-only toggle
  const dropItems = [...document.querySelectorAll('.nav__item--has-drop')];
  dropItems.forEach(dropItem => {
    const dropTrigger = dropItem.querySelector('.nav__drop-trigger');
    if (!dropTrigger) return;
    dropTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const open = dropItem.classList.toggle('is-open');
      dropTrigger.setAttribute('aria-expanded', open);
      // close siblings
      dropItems.forEach(o => {
        if (o !== dropItem) {
          o.classList.remove('is-open');
          const t = o.querySelector('.nav__drop-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });
  if (dropItems.length) {
    const closeAll = () => dropItems.forEach(o => {
      o.classList.remove('is-open');
      const t = o.querySelector('.nav__drop-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('click', (e) => {
      if (!dropItems.some(d => d.contains(e.target))) closeAll();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
  }

  /* ── Quick Nav FAB ── */
  const qn       = document.getElementById('quick-nav');
  const qnToggle = document.getElementById('qnToggle');
  if (qn && qnToggle) {
    qnToggle.addEventListener('click', () => {
      const open = qn.classList.toggle('is-open');
      qnToggle.setAttribute('aria-expanded', String(open));
      qnToggle.setAttribute('aria-label', open ? 'Close quick navigation' : 'Open quick navigation');
      document.getElementById('qnMenu').setAttribute('aria-hidden', String(!open));
    });
    document.addEventListener('click', (e) => {
      if (!qn.contains(e.target)) {
        qn.classList.remove('is-open');
        qnToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') qn.classList.remove('is-open');
    });
  }
})();
