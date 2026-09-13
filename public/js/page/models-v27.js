/* The hero video is remote, so the initial autoplay attempt can fire
           before enough data has buffered. Nudge it once it's playable. */
        (function () {
          var v = document.getElementById('v27HeroVideo');
          if (!v) return;
          var tryPlay = function () { var p = v.play(); if (p) p.catch(function () {}); };
          if (v.paused) tryPlay();
          ['loadeddata', 'canplay'].forEach(function (e) {
            v.addEventListener(e, function () { if (v.paused) tryPlay(); });
          });
        })();
