(function () {
  /* ── Request Category → dependent Sub-category (Chery-style) ── */
  var SUB = {
    inquiry:   { label: 'Inquiry Type',   opts: ['Service Follow Up', 'After Sales General Info', 'Spare Parts Inquiry', 'Sales'] },
    complaint: { label: 'Complaint Type', opts: ['After Sales Complaint', 'Spare Parts Complaint', 'Sales Complaint'] }
  };
  var catSel   = document.getElementById('rs-category');
  var subSel   = document.getElementById('rs-subcategory');
  var subWrap  = document.getElementById('rs-subwrap');
  var subLabel = document.getElementById('rs-sublabel');

  function slug(s) { return s.toLowerCase().replace(/\s+/g, '-'); }

  function setCategory(cat, presetSub) {
    var conf = SUB[cat];
    if (!conf || !subSel) return;
    subLabel.textContent = conf.label;
    subSel.innerHTML = '<option value="" disabled selected></option>' +
      conf.opts.map(function (o) { return '<option value="' + slug(o) + '">' + o + '</option>'; }).join('');
    subSel.disabled = false;
    subWrap.classList.remove('is-disabled');
    subWrap.classList.toggle('is-active', !!presetSub);
    if (presetSub) subSel.value = presetSub;
  }

  if (catSel) catSel.addEventListener('change', function () { setCategory(catSel.value); });

  /* ── Request-type chips ──────────────────────────────────────────
     One chip is active at a time; its .rs-panel and its .rs-slot (the
     second cell of the phone row) are the only ones left in the DOM
     flow. Everything outside those — name, phone, email, message,
     channels — is shared by all three request types. */
  var chips  = Array.prototype.slice.call(document.querySelectorAll('.rs-chip'));
  var swaps  = Array.prototype.slice.call(document.querySelectorAll('.rs-panel, .rs-slot'));

  function setPanel(name) {
    chips.forEach(function (c) {
      var on = c.dataset.panel === name;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    swaps.forEach(function (el) { el.hidden = el.dataset.panel !== name; });
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () { setPanel(c.dataset.panel); });
  });

  /* ── Deep links: ?tab=test-drive / ?tab=maintenance now open the
        matching chip rather than pre-filling a generic inquiry ── */
  var urlTab = new URLSearchParams(location.search).get('tab');
  if (urlTab === 'test-drive')      setPanel('testdrive');
  else if (urlTab === 'maintenance') setPanel('maintenance');

  /* ── No booking a slot in the past ── */
  var today = new Date().toISOString().slice(0, 10);
  ['rs-td-date', 'rs-mt-date'].forEach(function (id) {
    var d = document.getElementById(id);
    if (d) d.min = today;
  });

  /* ── Floating labels (text inputs, incl. dates) ──
        Date fields behave like every other field now: the native
        dd/mm/yyyy skeleton is hidden in CSS, so the label can rest over
        an empty field and spring up once a date is picked. */
  document.querySelectorAll('.rs-field').forEach(function (wrap) {
    var input = wrap.querySelector('.rs-input');
    if (!input) return;
    var pinned = wrap.hasAttribute('data-label-static');
    function refresh() {
      wrap.classList.toggle('is-active',
        pinned || document.activeElement === input || input.value.length > 0);
    }
    input.addEventListener('focus', refresh);
    input.addEventListener('blur', refresh);
    input.addEventListener('input', refresh);
    input.addEventListener('change', refresh);
    refresh();
  });

  /* ── Floating labels (selects) ── */
  document.querySelectorAll('.rs-select-wrap').forEach(function (wrap) {
    var sel = wrap.querySelector('.rs-select');
    if (!sel) return;
    function refresh() {
      wrap.classList.toggle('is-active', sel.value !== '');
    }
    sel.addEventListener('change', refresh);
    refresh();
  });

  /* ── Compact dropdowns ─────────────────────────────────────────
     The OS-native <select> popup can't be made to look like a small
     rounded menu sitting right under the field — styling it is either
     unsupported (Firefox/Safari) or partial (Chrome). So mouse users
     get a small custom panel instead; the real <select> stays the
     source of truth (value + a genuine 'change' event on pick), so
     the category → sub-category dependency and the floating-label
     refresh() above don't need to know this exists.

     Keyboard/assistive-tech users are untouched: the hit-button that
     opens the panel is tabindex="-1" and aria-hidden, so Tab still
     lands on the real <select>, and its native arrow-key / Enter /
     typeahead behaviour (including its own OS popup) works exactly
     as before — this is a mouse-only visual replacement, not a
     rebuild of the control's accessibility. */
  (function () {
    var openPanel = null, openHit = null;

    function closePanel() {
      if (!openPanel) return;
      var p = openPanel;
      p.classList.remove('is-open');
      setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 160);
      if (openHit) openHit.setAttribute('aria-expanded', 'false');
      openPanel = null; openHit = null;
    }

    function buildPanel(select, hit) {
      var panel = document.createElement('div');
      panel.className = 'rs-select-panel';
      panel.setAttribute('role', 'listbox');

      // read live — the sub-category list is rebuilt by setCategory()
      // above, so a stale/cached option set would drift out of sync
      var opts = Array.prototype.filter.call(select.options, function (o) { return o.value !== ''; });
      opts.forEach(function (o) {
        var row = document.createElement('div');
        row.className = 'rs-select-opt' + (o.value === select.value ? ' is-selected' : '');
        row.setAttribute('role', 'option');
        row.textContent = o.textContent;
        row.addEventListener('click', function () {
          select.value = o.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          closePanel();
        });
        panel.appendChild(row);
      });

      document.body.appendChild(panel);

      var r  = hit.getBoundingClientRect();
      var vh = window.innerHeight;
      var spaceBelow = vh - r.bottom;
      var spaceAbove = r.top;
      var openUp = spaceBelow < 200 && spaceAbove > spaceBelow;

      panel.style.left  = r.left + 'px';
      panel.style.width = r.width + 'px';
      if (openUp) {
        panel.classList.add('rs-select-panel--up');
        panel.style.bottom    = (vh - r.top + 6) + 'px';
        panel.style.maxHeight = Math.max(120, spaceAbove - 12) + 'px';
      } else {
        panel.style.top       = (r.bottom + 6) + 'px';
        panel.style.maxHeight = Math.max(120, spaceBelow - 12) + 'px';
      }

      requestAnimationFrame(function () { panel.classList.add('is-open'); });
      hit.setAttribute('aria-expanded', 'true');
      openPanel = panel; openHit = hit;
    }

    document.querySelectorAll('.rs-select-wrap').forEach(function (wrap) {
      var select = wrap.querySelector('.rs-select');
      if (!select) return;

      var hit = document.createElement('button');
      hit.type = 'button';
      hit.className = 'rs-select-hit';
      hit.tabIndex = -1;
      hit.setAttribute('aria-hidden', 'true');
      hit.setAttribute('aria-expanded', 'false');
      wrap.appendChild(hit);

      hit.addEventListener('click', function () {
        if (select.disabled) return;
        if (openHit === hit) { closePanel(); return; }
        closePanel();
        buildPanel(select, hit);
      });
    });

    document.addEventListener('click', function (e) {
      if (!openPanel || openPanel.contains(e.target) || e.target === openHit) return;
      closePanel();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
    window.addEventListener('scroll', closePanel, { passive: true });
    window.addEventListener('resize', closePanel, { passive: true });
  })();

  /* ── Date pickers ──────────────────────────────────────────────
     Same deal as the compact dropdowns above: the native control stays
     the source of truth (and keyboard/AT users keep its own picker via
     Tab + typing), while a tabindex="-1" hit-button over the field
     opens OUR calendar panel for mouse users, so picking a date feels
     identical to picking from a select. */
  (function initDatePickers() {
    var MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
    var MON    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var DOWS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    var openPanel = null, openHit = null;

    function iso(y, m, d) {
      return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    }
    function pretty(value) {                       // "2026-07-28" → "28 Jul 2026"
      var p = value.split('-');
      if (p.length !== 3) return '';
      return Number(p[2]) + ' ' + MON[Number(p[1]) - 1] + ' ' + p[0];
    }

    function closePanel() {
      if (!openPanel) return;
      var p = openPanel;
      p.classList.remove('is-open');
      setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 160);
      if (openHit) openHit.setAttribute('aria-expanded', 'false');
      openPanel = null; openHit = null;
    }

    document.querySelectorAll('.rs-field--date').forEach(function (wrap) {
      var input = wrap.querySelector('input[type="date"]');
      var text  = wrap.querySelector('.rs-date-text');
      if (!input || !text) return;

      function syncText() { text.textContent = pretty(input.value); }
      input.addEventListener('change', syncText);
      syncText();

      var hit = document.createElement('button');
      hit.type = 'button';
      hit.className = 'rs-select-hit';
      hit.tabIndex = -1;
      hit.setAttribute('aria-hidden', 'true');
      hit.setAttribute('aria-expanded', 'false');
      wrap.appendChild(hit);

      function buildPanel() {
        var panel = document.createElement('div');
        panel.className = 'rs-select-panel rs-date-panel';

        /* min: today (set above) — earlier days are disabled, and the
           month the calendar opens on never sits below it */
        var minParts = (input.min || '').split('-');
        var minY = minParts.length === 3 ? Number(minParts[0]) : null;
        var minM = minParts.length === 3 ? Number(minParts[1]) - 1 : null;
        var minD = minParts.length === 3 ? Number(minParts[2]) : null;

        var cur = input.value ? input.value.split('-').map(Number) : null;
        var view = cur ? { y: cur[0], m: cur[1] - 1 }
                       : (minY !== null ? { y: minY, m: minM } : null);
        if (!view) {                                  // no value, no min
          var n = new Date();
          view = { y: n.getFullYear(), m: n.getMonth() };
        }

        var todayStr = input.min || '';

        function render() {
          panel.innerHTML = '';

          var head = document.createElement('div');
          head.className = 'rs-date-head';
          var prev = document.createElement('button');
          prev.type = 'button'; prev.className = 'rs-date-nav';
          prev.textContent = '‹'; prev.setAttribute('aria-label', 'Previous month');
          if (minY !== null && (view.y < minY || (view.y === minY && view.m <= minM))) prev.disabled = true;
          var title = document.createElement('span');
          title.className = 'rs-date-title';
          title.textContent = MONTHS[view.m] + ' ' + view.y;
          var next = document.createElement('button');
          next.type = 'button'; next.className = 'rs-date-nav';
          next.textContent = '›'; next.setAttribute('aria-label', 'Next month');
          prev.addEventListener('click', function () {
            view.m--; if (view.m < 0) { view.m = 11; view.y--; } render();
          });
          next.addEventListener('click', function () {
            view.m++; if (view.m > 11) { view.m = 0; view.y++; } render();
          });
          head.appendChild(prev); head.appendChild(title); head.appendChild(next);
          panel.appendChild(head);

          var dows = document.createElement('div');
          dows.className = 'rs-date-dows';
          DOWS.forEach(function (d) {
            var s = document.createElement('span'); s.textContent = d; dows.appendChild(s);
          });
          panel.appendChild(dows);

          var grid = document.createElement('div');
          grid.className = 'rs-date-grid';
          var firstDow = new Date(view.y, view.m, 1).getDay();
          var days     = new Date(view.y, view.m + 1, 0).getDate();
          for (var i = 0; i < firstDow; i++) {
            var pad = document.createElement('span');
            pad.className = 'rs-date-day rs-date-day--pad';
            grid.appendChild(pad);
          }
          for (var d = 1; d <= days; d++) {
            var value = iso(view.y, view.m, d);
            var cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'rs-date-day';
            cell.textContent = d;
            if (value === input.value) cell.classList.add('is-selected');
            if (value === todayStr)    cell.classList.add('is-today');
            if (minY !== null && value < iso(minY, minM, minD)) cell.disabled = true;
            cell.addEventListener('click', function (ev) {
              input.value = ev.currentTarget.dataset.value;
              input.dispatchEvent(new Event('input',  { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              closePanel();
            });
            cell.dataset.value = value;
            grid.appendChild(cell);
          }
          panel.appendChild(grid);
        }
        render();

        document.body.appendChild(panel);

        var r  = hit.getBoundingClientRect();
        var vh = window.innerHeight;
        var spaceBelow = vh - r.bottom;
        var spaceAbove = r.top;
        var openUp = spaceBelow < 300 && spaceAbove > spaceBelow;

        panel.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 296)) + 'px';
        if (openUp) {
          panel.classList.add('rs-select-panel--up');
          panel.style.bottom = (vh - r.top + 6) + 'px';
        } else {
          panel.style.top = (r.bottom + 6) + 'px';
        }

        requestAnimationFrame(function () { panel.classList.add('is-open'); });
        hit.setAttribute('aria-expanded', 'true');
        openPanel = panel; openHit = hit;
      }

      hit.addEventListener('click', function () {
        if (openHit === hit) { closePanel(); return; }
        closePanel();
        buildPanel();
      });
    });

    document.addEventListener('click', function (e) {
      if (!openPanel || openPanel.contains(e.target) || e.target === openHit) return;
      closePanel();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
    window.addEventListener('scroll', closePanel, { passive: true });
    window.addEventListener('resize', closePanel, { passive: true });
  })();

  /* ── Stabilize panel height ────────────────────────────────────
     Inquiry has one contextual row; Test Drive and Book Maintenance
     have two — swapping chips visibly jumped the whole card's height
     (and, via .rs-left-media's flex:1, the photo's height with it).
     Measure every panel's natural height once and floor them all at
     the tallest, so only one panel is ever visible but the space it
     holds never changes when you switch. */
  (function stabilizePanelHeight() {
    var panels = document.querySelectorAll('.rs-panel');
    if (!panels.length) return;

    function measure() {
      panels.forEach(function (p) { p.style.minHeight = ''; });
      var max = 0;
      panels.forEach(function (p) {
        var wasHidden = p.hidden;
        p.hidden = false;              // synchronous — no paint happens mid-script
        max = Math.max(max, p.offsetHeight);
        p.hidden = wasHidden;
      });
      panels.forEach(function (p) { p.style.minHeight = max + 'px'; });
    }

    measure();
    // custom font swapping in can change text metrics after first paint
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    var resizeT;
    window.addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(measure, 150);
    }, { passive: true });
  })();

  /* ── Floating labels (textarea) ── */
  document.querySelectorAll('.rs-textarea-wrap').forEach(function (wrap) {
    var ta = wrap.querySelector('.rs-textarea');
    if (!ta) return;
    function refresh() {
      wrap.classList.toggle('is-active', ta.value.length > 0);
    }
    ta.addEventListener('input', refresh);
    ta.addEventListener('focus', refresh);
    ta.addEventListener('blur', refresh);
  });

  /* ── Parallax: section backdrop + the left-column photo ──────────
        Both run off one coalesced rAF rather than a frame request per
        scroll event. Skipped entirely for reduced-motion users. */
  var rsBg      = document.querySelector('.rs-bg');
  var rsSection = document.getElementById('contact');
  var rsMedia   = document.querySelector('.rs-left-media');
  var rsMediaImg = rsMedia && rsMedia.querySelector('img');
  var noMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ((rsBg && rsSection) || rsMediaImg) {
    // drift range = the slack --par gives the image on each side, so the
    // photo can never travel far enough to reveal its own edge
    var par = rsMedia
      ? parseFloat(getComputedStyle(rsMedia).getPropertyValue('--par')) || 46
      : 46;
    // travel a little short of the full slack — at exactly --par the image
    // edge lands flush with the frame, leaving no room for rounding
    var drift = par * 0.9;
    var ticking = false;

    function updateParallax() {
      ticking = false;

      if (rsBg && rsSection) {
        rsBg.style.transform =
          'translateY(' + (-rsSection.getBoundingClientRect().top * 0.3).toFixed(1) + 'px)';
      }

      if (rsMediaImg && !noMotion) {
        var r  = rsMedia.getBoundingClientRect();
        var vh = window.innerHeight;
        if (r.bottom > 0 && r.top < vh) {
          // +1 while still below the fold … 0 at centre … -1 once past the top
          var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
          p = Math.max(-1, Math.min(1, p));
          // negated so the photo drifts down as the frame rides up — it
          // reads as moving slower than the page
          rsMediaImg.style.transform =
            'translate3d(0,' + (-p * drift).toFixed(1) + 'px,0)';
        }
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
    }, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });
    updateParallax();
  }

  /* ── Form submit ── */
  var rsForm = document.getElementById('rsForm');
  if (rsForm) {
    rsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitUrl = window.__ICAUR_CMS && window.__ICAUR_CMS.submitUrl;
      if (!submitUrl) return;
      var data = Object.fromEntries(new FormData(rsForm));
      fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            requestType: data['rs-type'] || data.requestType || 'inquiry',
            salutation: data['rs-salutation'],
            firstName: data['rs-first'],
            lastName: data['rs-last'],
            email: data['rs-email'],
            phone: data['rs-phone'],
            city: data['rs-city'],
            showroom: data['rs-showroom'],
            centre: data['rs-centre'],
            category: data['rs-category'],
            subcategory: data['rs-subcategory'],
            message: data['rs-message'],
            tdModel: data['rs-td-model'],
            tdDate: data['rs-td-date'],
            tdTime: data['rs-td-time'],
            tdLicense: data['rs-td-license'],
            mtModel: data['rs-mt-model'],
            mtType: data['rs-mt-type'],
            mtMileage: data['rs-mt-mileage'],
            mtDate: data['rs-mt-date'],
            locale: document.documentElement.lang || 'en',
            data: data,
          },
        }),
      }).catch(function () {});
    });
  }
})();
