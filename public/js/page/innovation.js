
(function () {
  function initInnovTech() {
    var section = document.getElementById('innov-tech');
    if (!section || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    var ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    var $ = function(s) { return document.querySelector(s); };
    var $$ = function(s) { return Array.from(document.querySelectorAll(s)); };

    /* LiquidEther fluid background */
    var liquidBg = $('#v27-ct-liquid-bg');
    if (liquidBg) {
      import('/js/liquid-ether.js').then(function(m) {
        m.createLiquidEther(liquidBg, {
          colors: ['#2A1810', '#231815', '#015699', '#555859', '#E8D5CC'],
          mouseForce: 20, cursorSize: 150, resolution: 0.4,
          iterationsPoisson: 16, iterationsViscous: 16, dt: 0.012,
          autoDemo: true, autoSpeed: 0.2, autoIntensity: 1.6,
          autoResumeDelay: 2500, autoRampDuration: 1.4, takeoverDuration: 0.5,
        });
      }).catch(function() {});
    }

    /* Headline mask-reveal */
    var headEl = $('#v27-ct-head');
    if (headEl) {
      gsap.set(['#v27-ct-line1', '#v27-ct-line2', '#v27-ct-sub'], { opacity: 0 });
      gsap.set('#v27-ct-mask1', { x: '-101%', background: '#0D0B09' });
      gsap.set('#v27-ct-mask2', { x: '101%', background: '#555859' });
      var revealed = false;
      var revealHead = function() {
        if (revealed) return;
        revealed = true;
        var tl = gsap.timeline();
        tl.from('#v27-ct-eyebrow', { opacity: 0, y: 10, duration: .3, ease: 'power2.out' })
          .to('#v27-ct-mask1', { x: '0%', duration: .28, ease: 'power2.in' }, '-=0.05')
          .set('#v27-ct-line1', { opacity: 1 })
          .to('#v27-ct-mask1', { x: '101%', duration: .28, ease: 'power2.out' })
          .to('#v27-ct-mask2', { x: '0%', duration: .28, ease: 'power2.in' }, '-=0.18')
          .set('#v27-ct-line2', { opacity: 1 })
          .to('#v27-ct-mask2', { x: '-101%', duration: .28, ease: 'power2.out' })
          .to('#v27-ct-sub', { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, '-=0.1');
      };
      ST.create({
        trigger: headEl, start: 'top 80%', once: true,
        onEnter: revealHead,
        onRefresh: function() {
          var rect = headEl.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) revealHead();
        }
      });
    }

    /* Headline depth scrub: LARGE at the intro, then scales down and
       blurs over the section's first viewport of scroll so the tech
       cards sweep over a receding headline. Driven from live geometry
       each scroll frame → perfectly reversible on scroll-up. (Same
       effect as the V27 model page's initTech.) */
    var ctHead = $('#v27-ct-head');
    if (ctHead) {
      ctHead.style.willChange = 'transform, filter';
      var headQueued = false;
      var headScrub = function () {
        headQueued = false;
        var top = section.getBoundingClientRect().top;
        var p = Math.min(Math.max(-top / window.innerHeight, 0), 1);
        var e = 1 - (1 - p) * (1 - p);            /* ease-out: recedes early */
        ctHead.style.transform = 'scale(' + (1.6 - 0.6 * e).toFixed(4) + ')';
        ctHead.style.filter = e > 0.02 ? 'blur(' + (e * 9).toFixed(2) + 'px)' : 'none';
      };
      var headQueue = function () { if (!headQueued) { headQueued = true; requestAnimationFrame(headScrub); } };
      window.addEventListener('scroll', headQueue, { passive: true });
      window.addEventListener('resize', headQueue, { passive: true });
      headScrub();
    }

    /* Per-item scroll animations */
    $$('#innov-tech .v27-ct-item').forEach(function(item) {
      var img   = item.querySelector('.v27-ct-img');
      var left  = item.querySelector('.v27-ct-left');
      var right = item.querySelector('.v27-ct-right');
      var rotate = parseFloat(item.dataset.rotate) || 0;
      if (!img) return;
      ST.create({
        trigger: item, start: 'top bottom', end: 'bottom top', scrub: 1.2,
        onUpdate: function(self) {
          var p = self.progress;
          var ep = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
          var rot = rotate * (1 - ep * 2);
          var scl = Math.min(0.88 + ep * (1 - ep) * 0.48 + (p > 0.5 ? 0.12 : 0), 1.02);
          var yShift = (0.5 - p) * 80;
          gsap.set(img, { rotate: rot, scale: scl, y: yShift });
        }
      });
      if (left && right) {
        gsap.timeline({
          scrollTrigger: { trigger: item, start: 'top 70%', end: 'center 40%', scrub: 0.9 }
        }).fromTo([left, right], { opacity: 0, y: 32 }, { opacity: 1, y: 0, stagger: 0.05 });
      }
    });

    /* ScrollTrigger measures start/end at creation, but web fonts, lazy
       images and the async fluid background all reflow the layout afterward —
       which left every item's start/end at negative offsets, pinning progress
       at 1 so the images never rotated. Re-measure once the layout settles. */
    var refresh = function () { ST.refresh(); };
    if (document.readyState === 'complete') refresh();
    else window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    setTimeout(refresh, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInnovTech);
  } else {
    initInnovTech();
  }
})();
