/* The video is remote, so the first autoplay attempt can fire before
       enough has buffered. Nudge it once it's playable. */
    (function () {
      var v = document.getElementById('aboutHeroVideo');
      if (!v) return;
      var tryPlay = function () { var p = v.play(); if (p) p.catch(function () {}); };
      if (v.paused) tryPlay();
      ['loadeddata', 'canplay'].forEach(function (e) {
        v.addEventListener(e, function () { if (v.paused) tryPlay(); });
      });
    })();
