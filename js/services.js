'use strict';

/* ============================================================
   Services page — interactions
   - Folder component (vanilla port of React Bits)
   - Warranty stacked-card scroll driver
   - Section entry animations (slide + rotate)
============================================================ */

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const ss    = t => { t = clamp(t,0,1); return t*t*(3-2*t); };
const lerp  = (a, b, t) => a + (b-a)*t;
const seg   = (p, a, b) => ss(clamp((p-a)/(b-a),0,1));

function darkenHex(hex, pct) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const n = parseInt(hex,16);
  const ch = ch => Math.max(0, Math.floor(ch * (1-pct)));
  const r = ch((n>>16)&255), g = ch((n>>8)&255), b = ch(n&255);
  return '#' + ((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1).toUpperCase();
}

/* ── Folder component ─────────────────────────────── */
function initFolders() {
  document.querySelectorAll('.folder-host').forEach(host => {
    const color     = host.dataset.color || '#F37021';
    const backColor = darkenHex(color, 0.08);
    const folder    = host.querySelector('.folder');
    if (!folder) return;

    folder.style.setProperty('--folder-color',      color);
    folder.style.setProperty('--folder-back-color', backColor);
    folder.style.setProperty('--paper-1', darkenHex('#ffffff', 0.10));
    folder.style.setProperty('--paper-2', darkenHex('#ffffff', 0.05));
    folder.style.setProperty('--paper-3', '#ffffff');

    let open = false;

    folder.addEventListener('click', e => {
      e.stopPropagation();
      open = !open;
      folder.classList.toggle('open', open);
    });

    folder.querySelectorAll('.paper').forEach(paper => {
      paper.addEventListener('mousemove', e => {
        if (!open) return;
        const r  = paper.getBoundingClientRect();
        const ox = (e.clientX - r.left - r.width/2) * 0.15;
        const oy = (e.clientY - r.top  - r.height/2) * 0.15;
        paper.style.setProperty('--mx', ox + 'px');
        paper.style.setProperty('--my', oy + 'px');
      });
      paper.addEventListener('mouseleave', () => {
        paper.style.setProperty('--mx', '0px');
        paper.style.setProperty('--my', '0px');
      });
    });
  });
}

/* ── Warranty — ScrollStack (window-scroll) ───────── */
function initWarrantyStack() {
  var wrapper = document.getElementById('warrantyDriver');
  if (!wrapper) return;
  var cards = Array.from(wrapper.querySelectorAll('.scroll-stack-card'));
  var endEl = document.getElementById('warrantyStackEnd');
  if (!cards.length || !endEl) return;

  // ScrollStack props
  var ITEM_SCALE      = 0.03;
  var ITEM_STACK_DIST = 30;
  var STACK_PCT       = 0.22;
  var SCALE_END_PCT   = 0.12;
  var BASE_SCALE      = 0.88;

  // Initial card styles
  cards.forEach(function(card, i) {
    card.style.willChange         = 'transform';
    card.style.transformOrigin    = 'top center';
    card.style.backfaceVisibility = 'hidden';
    card.style.zIndex             = String(i + 1);
  });

  // ── Cache ORIGINAL document tops BEFORE any transforms ──────
  // Reading getBoundingClientRect() of a transformed element includes
  // the transform, creating a feedback loop. Cache positions once.
  var origTops = [];
  var origEndTop = 0;

  function cachePositions() {
    var saved = cards.map(function(c) { return c.style.transform; });
    cards.forEach(function(c) { c.style.transform = 'none'; });
    origTops = cards.map(function(c) {
      return c.getBoundingClientRect().top + window.scrollY;
    });
    origEndTop = endEl.getBoundingClientRect().top + window.scrollY;
    cards.forEach(function(c, i) { c.style.transform = saved[i] || ''; });
  }

  // Cache after layout settles
  requestAnimationFrame(function() {
    cachePositions();
    update();
  });

  // Recache on resize (debounced)
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(cachePositions, 150);
  });

  var raf = null;
  var lastT = cards.map(function() { return null; });

  function update() {
    raf = null;
    if (!origTops.length) return;

    var sy      = window.scrollY;
    var vh      = window.innerHeight;
    var stackPx = STACK_PCT * vh;
    var scEndPx = SCALE_END_PCT * vh;
    // Cards unpin when end marker reaches 35% from top
    var pinEnd  = origEndTop - vh * 0.35;

    cards.forEach(function(card, i) {
      var cardTop = origTops[i];
      var tStart  = cardTop - stackPx - ITEM_STACK_DIST * i;
      var tEnd    = cardTop - scEndPx;

      // Scale down as card enters stack
      var sp = (tEnd > tStart && sy > tStart)
        ? Math.min(1, (sy - tStart) / (tEnd - tStart))
        : (sy >= tStart ? 1 : 0);
      var targetScale = BASE_SCALE + i * ITEM_SCALE;
      var scale = 1 - sp * (1 - targetScale);

      // Translate to pin at stackPx from top
      var ty = 0;
      if (sy >= tStart && sy <= pinEnd) {
        ty = sy - cardTop + stackPx + ITEM_STACK_DIST * i;
      } else if (sy > pinEnd) {
        ty = pinEnd - cardTop + stackPx + ITEM_STACK_DIST * i;
      }

      var tyR = Math.round(ty * 10) / 10;
      var scR = Math.round(scale * 1000) / 1000;
      var last = lastT[i];
      if (last && last.ty === tyR && last.sc === scR) return;
      lastT[i] = { ty: tyR, sc: scR };
      card.style.transform = 'translate3d(0,' + tyR + 'px,0) scale(' + scR + ')';
    });
  }

  window.addEventListener('scroll', function() {
    if (!raf) raf = requestAnimationFrame(update);
  }, { passive: true });
}

/* ── Section entry observer (slide + rotate) ──────── */
function initSectionEntries() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseFloat(entry.target.dataset.enterDelay || 0) * 1000;
      setTimeout(() => entry.target.classList.add('svc--entered'), delay);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.svc-enter').forEach(el => obs.observe(el));
}

/* ── Book section: wipe reveal + parallax ─────────── */
function initBookSection(section) {
  var bg = section.querySelector('.svc-book__bg');
  if (!bg) return;

  /* Trigger staggered wipe once on first intersection */
  var revealed = false;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !revealed) {
        revealed = true;
        section.classList.add('book--revealed');
        obs.disconnect();
      }
    });
  }, { threshold: 0.15 });
  obs.observe(section);

  /* Parallax on scroll */
  var ticking = false;
  function tick() {
    ticking = false;
    var rect    = section.getBoundingClientRect();
    var visible = -rect.top;
    if (visible < -window.innerHeight || visible > rect.height + window.innerHeight) return;
    bg.style.transform = 'translateY(' + (visible * 0.22).toFixed(2) + 'px)';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  }, { passive: true });
  tick();
}

function initBookParallax() {
  document.querySelectorAll('.svc-book').forEach(initBookSection);
}

/* ── Find Us — Interactive Leaflet map ────────────── */
var FIND_US_LOCATIONS = [
  {
    id: 'qattamya', name: 'Qattamya Heights', area: 'New Cairo',
    address: 'Plot 12, Qattamya Heights, New Cairo, Cairo, Egypt',
    phone: '+20 2 2759 1100', hours: 'Sat–Thu  9 am – 6 pm',
    badges: ['showroom', 'service'],
    lat: 30.0012, lng: 31.5037,
    mapsUrl: 'https://maps.google.com/?q=30.0012,31.5037',
  },
  {
    id: 'zayed', name: 'Sheikh Zayed', area: '6th of October City',
    address: '26 July Corridor, Sheikh Zayed, 6th of October, Egypt',
    phone: '+20 2 3854 2200', hours: 'Sat–Thu  9 am – 6 pm',
    badges: ['showroom'],
    lat: 30.0626, lng: 30.9762,
    mapsUrl: 'https://maps.google.com/?q=30.0626,30.9762',
  },
  {
    id: 'newcairo', name: 'North Teseen Center', area: 'Fifth Settlement, New Cairo',
    address: 'Building 16, North Teseen Street, Fifth Settlement, New Cairo, Egypt',
    phone: '+20 2 2614 3300', hours: 'Sat–Thu  8 am – 8 pm',
    badges: ['service'],
    lat: 30.0195, lng: 31.4725,
    mapsUrl: 'https://maps.google.com/?q=30.0195,31.4725',
  },
  {
    id: 'maadi', name: 'Maadi Center', area: 'Maadi, Cairo',
    address: '7 Road 9, Maadi, Cairo, Egypt',
    phone: '+20 2 2358 4400', hours: 'Sat–Thu  9 am – 6 pm',
    badges: ['showroom', 'service'],
    lat: 29.9600, lng: 31.2400,
    mapsUrl: 'https://maps.google.com/?q=29.9600,31.2400',
  },
];

var BADGE_LABELS = { showroom: 'Showroom', service: 'Service Center' };

function fuMakeIcon(active) {
  var S = 60, H = 30, DOT = active ? 20 : 13, off = H - DOT / 2;
  var dotCSS = active
    ? 'background:#231815;box-shadow:0 0 0 4px rgba(35,24,21,0.20),0 0 16px rgba(35,24,21,0.55);animation:fuGlow 2s ease-in-out infinite;'
    : 'background:#B08070;box-shadow:0 0 0 3px rgba(168,120,100,0.18);';
  var rings = active
    ? [0, 0.8, 1.6].map(function(delay) {
        return '<div style="position:absolute;top:' + off + 'px;left:' + off + 'px;width:' + DOT + 'px;height:' + DOT + 'px;border-radius:50%;background:rgba(35,24,21,0.22);animation:fuBloom 2.4s ease-out infinite ' + delay + 's;pointer-events:none;"></div>';
      }).join('')
    : '';
  return L.divIcon({
    html: '<div style="position:relative;width:' + S + 'px;height:' + S + 'px;">' + rings +
          '<div style="position:absolute;top:' + off + 'px;left:' + off + 'px;width:' + DOT + 'px;height:' + DOT + 'px;border-radius:50%;' + dotCSS + '"></div></div>',
    className: 'find-us-marker',
    iconSize: [S, S], iconAnchor: [H, H], popupAnchor: [0, H + 6],
  });
}

function fuPopupHTML(loc) {
  var icoPin   = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#231815" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  var icoPhone = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#231815" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.4 2 2 0 0 1 3.59 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.91z"/></svg>';
  var icoClock = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#231815" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  var BADGE_POP = { showroom: { bg:'#FDF4EF', color:'#7A3D2C', dot:'#8C5A48', r:'50%' }, service: { bg:'#EFF4F2', color:'#2C5040', dot:'#5A7060', r:'2px' } };
  var badges = loc.badges.map(function(b) {
    var s = BADGE_POP[b];
    var dot = '<span style="display:inline-block;width:5px;height:5px;border-radius:' + s.r + ';background:' + s.dot + ';margin-right:6px;flex-shrink:0;"></span>';
    return '<span style="display:inline-flex;align-items:center;padding:4px 10px 4px 8px;border-radius:5px;background:' + s.bg + ';color:' + s.color + ';font-size:0.6rem;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;">' + dot + BADGE_LABELS[b] + '</span>';
  }).join('');
  return '<div style="padding:22px 24px 20px;font-family:Gotham,sans-serif;min-width:300px;box-sizing:border-box;">' +
    '<div style="display:flex;gap:5px;margin-bottom:11px;flex-wrap:wrap;">' + badges + '</div>' +
    '<div style="font-weight:700;font-size:.96rem;color:#1F0F08;margin-bottom:16px;letter-spacing:-.015em;line-height:1.18;">' + loc.name + '</div>' +
    '<div style="display:flex;flex-direction:column;gap:9px;padding-bottom:15px;border-bottom:1px solid rgba(35,24,21,.08);">' +
      '<div style="display:flex;gap:9px;align-items:flex-start;">' + icoPin   + '<span style="font-size:.75rem;color:#666;line-height:1.45;">' + loc.address + '</span></div>' +
      '<div style="display:flex;gap:9px;align-items:center;">'      + icoPhone + '<span style="font-size:.75rem;color:#666;">' + loc.phone + '</span></div>' +
      '<div style="display:flex;gap:9px;align-items:center;">'      + icoClock + '<span style="font-size:.75rem;color:#666;">' + loc.hours + '</span></div>' +
    '</div>' +
    '<a href="' + loc.mapsUrl + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;margin-top:14px;font-size:.74rem;font-weight:500;color:#231815;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(35,24,21,.28);">Open in Maps</a>' +
  '</div>';
}

function initFindUs() {
  var section  = document.getElementById('find-us');
  var header   = document.getElementById('findUsHeader');
  var listEl   = document.getElementById('findUsList');
  var mapWrap  = document.getElementById('findUsMapWrap');
  var mapDom   = document.getElementById('findUsMap');
  if (!section || !listEl || !mapDom) return;

  var map, markers = {}, activeId = null;

  /* ── Build list rows ── */
  FIND_US_LOCATIONS.forEach(function(loc) {
    var btn = document.createElement('button');
    btn.className = 'find-us__row';
    btn.dataset.id = loc.id;
    btn.innerHTML =
      '<div class="find-us__badges">' +
        loc.badges.map(function(b) {
          return '<span class="find-us__badge find-us__badge--' + b + '">' + BADGE_LABELS[b] + '</span>';
        }).join('') +
      '</div>' +
      '<div class="find-us__name">' + loc.name + '</div>' +
      '<div class="find-us__area">' + loc.area + '</div>';
    btn.addEventListener('click', function() { handleCard(loc.id); });
    listEl.appendChild(btn);
  });

  /* ── Init Leaflet ── */
  if (!window.L) return;
  map = L.map(mapDom, {
    center: [30.02, 31.22], zoom: 10,
    zoomControl: true, scrollWheelZoom: false,
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd', maxZoom: 19,
  }).addTo(map);

  FIND_US_LOCATIONS.forEach(function(loc) {
    var marker = L.marker([loc.lat, loc.lng], { icon: fuMakeIcon(false) })
      .addTo(map)
      .bindPopup(fuPopupHTML(loc), {
        minWidth: 300, maxWidth: 340,
        closeButton: true, autoPan: true,
        autoPanPaddingTopLeft: L.point(60, 60),
        autoPanPaddingBottomRight: L.point(60, 100),
      });
    marker.on('click', function() { selectById(loc.id); });
    marker.on('popupclose', function() {
      if (activeId === loc.id) {
        activeId = null;
        refreshIcons(null);
        setActive(null);
      }
    });
    markers[loc.id] = marker;
  });

  /* ── Scroll entrance ── */
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      if (header)  header.classList.add('is-visible');
      if (listEl)  listEl.classList.add('is-visible');
      if (mapWrap) {
        mapWrap.classList.add('is-visible');
        setTimeout(function() { map && map.invalidateSize(); }, 820);
      }
      obs.disconnect();
    });
  }, { threshold: 0.12 });
  obs.observe(section);

  /* ── Helpers ── */
  function refreshIcons(selectedId) {
    FIND_US_LOCATIONS.forEach(function(loc) {
      if (markers[loc.id]) markers[loc.id].setIcon(fuMakeIcon(loc.id === selectedId));
    });
  }

  function setActive(id) {
    listEl.querySelectorAll('.find-us__row').forEach(function(r) {
      r.classList.toggle('is-active', r.dataset.id === id);
    });
  }

  function selectById(id) {
    var loc = FIND_US_LOCATIONS.filter(function(l) { return l.id === id; })[0];
    if (!loc || !map) return;
    activeId = id;
    refreshIcons(id);
    setActive(id);
    map.flyTo([loc.lat, loc.lng], 14, { duration: 1.0, easeLinearity: 0.5 });
    setTimeout(function() { markers[id] && markers[id].openPopup(); }, 860);
  }

  function handleCard(id) {
    if (activeId === id) {
      markers[id] && markers[id].closePopup();
      activeId = null;
      refreshIcons(null);
      setActive(null);
      map && map.flyTo([30.02, 31.22], 10, { duration: 1.0 });
    } else {
      selectById(id);
    }
  }
}

/* ── Boot ─────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function boot() {
  initFolders();
  initWarrantyStack();
  initSectionEntries();
  initBookParallax();
  initFindUs();
}
