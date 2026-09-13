
(function () {
  /* ── Parallax background ── */
  var bg = document.getElementById('rvBg');
  if (bg) {
    window.addEventListener('scroll', function () {
      bg.style.transform = 'translateY(' + (window.scrollY * 0.35).toFixed(1) + 'px)';
    }, { passive: true });
  }

  /* ── Floating labels ── */
  document.querySelectorAll('.rv-field').forEach(function (wrap) {
    var inp = wrap.querySelector('.rv-input');
    if (!inp) return;
    function refresh() {
      wrap.classList.toggle('is-active', inp.value.length > 0 || document.activeElement === inp);
    }
    inp.addEventListener('input', refresh);
    inp.addEventListener('focus', refresh);
    inp.addEventListener('blur', refresh);
    refresh();
  });

  /* ── Showroom dropdown floating label ── */
  var showroomWrap = document.getElementById('rvf-showroom');
  var showroomSel  = document.getElementById('rv-showroom');
  if (showroomWrap && showroomSel) {
    showroomSel.addEventListener('change', function () {
      showroomWrap.classList.toggle('is-active', showroomSel.value !== '');
    });
  }

  /* ── Compact dropdown — same mechanism (and the same global
        .rs-select-panel / .rs-select-opt styles) as the contact form:
        a tabindex="-1" hit-button over the native select opens a small
        rounded panel under the field for mouse users; the real <select>
        stays the source of truth and keyboard/AT behaviour is untouched. */
  if (showroomWrap && showroomSel) (function () {
    var openPanel = null;

    function closePanel() {
      if (!openPanel) return;
      var p = openPanel;
      p.classList.remove('is-open');
      setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 160);
      hit.setAttribute('aria-expanded', 'false');
      openPanel = null;
    }

    var hit = document.createElement('button');
    hit.type = 'button';
    hit.className = 'rs-select-hit';
    hit.tabIndex = -1;
    hit.setAttribute('aria-hidden', 'true');
    hit.setAttribute('aria-expanded', 'false');
    showroomWrap.appendChild(hit);

    hit.addEventListener('click', function () {
      if (openPanel) { closePanel(); return; }
      var panel = document.createElement('div');
      panel.className = 'rs-select-panel';
      panel.setAttribute('role', 'listbox');

      Array.prototype.filter.call(showroomSel.options, function (o) { return o.value !== ''; })
        .forEach(function (o) {
          var row = document.createElement('div');
          row.className = 'rs-select-opt' + (o.value === showroomSel.value ? ' is-selected' : '');
          row.setAttribute('role', 'option');
          row.textContent = o.textContent;
          row.addEventListener('click', function () {
            showroomSel.value = o.value;
            showroomSel.dispatchEvent(new Event('change', { bubbles: true }));
            closePanel();
          });
          panel.appendChild(row);
        });

      document.body.appendChild(panel);

      var r  = hit.getBoundingClientRect();
      var vh = window.innerHeight;
      var spaceBelow = vh - r.bottom;
      var openUp = spaceBelow < 200 && r.top > spaceBelow;

      panel.style.left  = r.left + 'px';
      panel.style.width = r.width + 'px';
      if (openUp) {
        panel.classList.add('rs-select-panel--up');
        panel.style.bottom    = (vh - r.top + 6) + 'px';
        panel.style.maxHeight = Math.max(120, r.top - 12) + 'px';
      } else {
        panel.style.top       = (r.bottom + 6) + 'px';
        panel.style.maxHeight = Math.max(120, spaceBelow - 12) + 'px';
      }

      requestAnimationFrame(function () { panel.classList.add('is-open'); });
      hit.setAttribute('aria-expanded', 'true');
      openPanel = panel;
    });

    document.addEventListener('click', function (e) {
      if (!openPanel || openPanel.contains(e.target) || e.target === hit) return;
      closePanel();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
    window.addEventListener('scroll', closePanel, { passive: true });
    window.addEventListener('resize', closePanel, { passive: true });
  })();

  /* ── Form submit ── */
  var form = document.getElementById('rvForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.innerHTML = '<div class="rv-success"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><h3>Request Received</h3><p>Our team will be in touch with you shortly.</p></div>';
    });
  }
})();
