'use strict';

/* ============================================================
   Background doodles — thin geometric SVG shapes for the three
   black sections: #vision, #cta, footer.
   CSS animations handle floating/spinning. JS handles scroll
   parallax for the non-sticky sections (CTA + footer).
============================================================ */
(function () {
  var W = 1440, H = 900;

  function dots(x, y, cols, rows, gap) {
    var s = '';
    for (var r = 0; r < rows; r++)
      for (var c = 0; c < cols; c++)
        s += '<circle cx="' + (x + c * gap) + '" cy="' + (y + r * gap) + '" r="2.5"/>';
    return s;
  }

  var DOODLES = {
    '#vision': [
      /* Concentric orbit rings — top right, slow spin */
      '<g class="d-spin"><circle cx="1390" cy="-60" r="270" fill="none" stroke="rgba(255,255,255,.045)" stroke-width="1.5"/><circle cx="1390" cy="-60" r="182" fill="none" stroke="rgba(255,255,255,.03)" stroke-width="1"/></g>',
      '<circle cx="1390" cy="-60" r="96" fill="none" stroke="rgba(255,255,255,.04)" stroke-width=".8" class="d-spin-r"/>',
      /* Partial ring — bottom left */
      '<circle cx="-50" cy="920" r="158" fill="none" stroke="rgba(255,255,255,.04)" stroke-width="1" class="d-spin"/>',
      /* Dot grid — bottom left quadrant */
      '<g fill="rgba(255,255,255,.07)" class="d-float-b">' + dots(80, 640, 5, 4, 32) + '</g>',
      /* Corner brackets */
      '<g stroke="rgba(255,255,255,.08)" stroke-width="1.5" fill="none"><path d="M60,60 L60,102 M60,60 L102,60"/><path d="M1380,60 L1380,102 M1380,60 L1338,60"/></g>',
      /* Plus / cross marks */
      '<g stroke="rgba(255,255,255,.07)" stroke-width="1.5" fill="none" class="d-float-a"><path d="M224,180 v14 m-7,-7 h14"/><path d="M1168,248 v14 m-7,-7 h14"/><path d="M96,670 v12 m-6,-6 h12"/></g>',
      /* Diagonal accent */
      '<line x1="50" y1="300" x2="170" y2="442" stroke="rgba(255,255,255,.04)" stroke-width="1"/>',
    ],

    '#cta': [
      /* Ring cluster — top left */
      '<g class="d-spin"><circle cx="-60" cy="-20" r="248" fill="none" stroke="rgba(255,255,255,.045)" stroke-width="1.5"/><circle cx="-60" cy="-20" r="162" fill="none" stroke="rgba(255,255,255,.03)" stroke-width="1"/></g>',
      /* Ring — bottom right */
      '<circle cx="1500" cy="560" r="190" fill="none" stroke="rgba(255,255,255,.04)" stroke-width="1" class="d-spin-r"/>',
      /* Dot grid — top right */
      '<g fill="rgba(255,255,255,.06)" class="d-float-b">' + dots(1224, 60, 5, 3, 30) + '</g>',
      /* Corner brackets */
      '<g stroke="rgba(255,255,255,.07)" stroke-width="1.5" fill="none"><path d="M60,60 L60,100 M60,60 L100,60"/><path d="M1380,490 L1380,450 M1380,490 L1340,490"/></g>',
      /* Dashed arc */
      '<path d="M 720,820 A 380 380 0 0 0 1280,480" stroke="rgba(255,255,255,.04)" fill="none" stroke-width="1" stroke-dasharray="6 12" class="d-float-a"/>',
      /* Plus marks */
      '<g stroke="rgba(255,255,255,.06)" stroke-width="1.5" fill="none" class="d-float-c"><path d="M1100,100 v14 m-7,-7 h14"/><path d="M210,440 v14 m-7,-7 h14"/></g>',
    ],

    'footer': [
      /* Large concentric rings — centred just below fold */
      '<g class="d-spin"><circle cx="720" cy="980" r="360" fill="none" stroke="rgba(255,255,255,.04)" stroke-width="1.5"/><circle cx="720" cy="980" r="255" fill="none" stroke="rgba(255,255,255,.025)" stroke-width="1"/></g>',
      /* Dot grids — top corners */
      '<g fill="rgba(255,255,255,.06)" class="d-float-b">' + dots(80, 60, 4, 3, 30) + '</g>',
      '<g fill="rgba(255,255,255,.06)" class="d-float-c">' + dots(1250, 60, 4, 3, 30) + '</g>',
      /* Corner brackets — top */
      '<g stroke="rgba(255,255,255,.07)" stroke-width="1.5" fill="none"><path d="M60,60 L60,100 M60,60 L100,60"/><path d="M1380,60 L1380,100 M1380,60 L1340,60"/></g>',
      /* Plus marks */
      '<g stroke="rgba(255,255,255,.06)" stroke-width="1.5" fill="none" class="d-float-a"><path d="M310,100 v12 m-6,-6 h12"/><path d="M1080,100 v12 m-6,-6 h12"/></g>',
    ],
  };

  function addLayer(section, shapes) {
    if (!section) return null;
    var cs = getComputedStyle(section);
    if (cs.position === 'static') section.style.position = 'relative';
    /* isolation: isolate makes z:-1 doodle paint above section bg but below content */
    section.style.isolation = 'isolate';
    var layer = document.createElement('div');
    layer.className = 'doodle-layer';
    layer.innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMin slice"' +
      ' aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
      shapes.join('') + '</svg>';
    section.insertBefore(layer, section.firstChild);
    return layer;
  }

  /* Static sections present in DOM immediately */
  addLayer(document.querySelector('#vision'), DOODLES['#vision']);
  addLayer(document.querySelector('#cta'),    DOODLES['#cta']);

  /* Footer is injected by components.js — poll until available */
  var footerTries = 0;
  function tryFooter() {
    var footer = document.querySelector('footer');
    if (footer) { addLayer(footer, DOODLES['footer']); initParallax(); return; }
    if (++footerTries < 25) setTimeout(tryFooter, 120);
  }
  setTimeout(tryFooter, 80);

  /* Scroll parallax — CTA and footer only (vision is sticky, CSS animations are enough) */
  var ticking = false;
  function runParallax() {
    ticking = false;
    var pairs = [['#cta', 0.13], ['footer', 0.09]];
    pairs.forEach(function (p) {
      var el = document.querySelector(p[0]);
      if (!el) return;
      var layer = el.querySelector(':scope > .doodle-layer');
      if (!layer) return;
      var rect = el.getBoundingClientRect();
      var entered = -rect.top; /* px past the section's top edge */
      if (entered > -window.innerHeight && entered < rect.height + window.innerHeight) {
        layer.style.transform = 'translateY(' + (entered * p[1] * 0.45) + 'px)';
      }
    });
  }

  function initParallax() {
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(runParallax); }
    }, { passive: true });
    runParallax();
  }

  /* Start parallax for CTA right away; footer parallax starts after footer is added */
  initParallax();
})();
