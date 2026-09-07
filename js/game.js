/* ── iCAUR Offroad Game — vanilla JS canvas port ────────────────────── */
(function () {
  /* ── Constants ───────────────────────────────────────────────────── */
  const CAR_W0 = 108, CAR_H0 = 70, CAR_X0 = 108
  const GRAV0 = 0.96, JUMP0 = 15, SPD0 = 5.6, SPDMAX0 = 12.5
  const BOTTOM = 84, BEST_KEY = 'icaur_game_best', CS = 1.3
  const TERR = { a1: 12, a2: 5, f1: 0.0062, f2: 0.014 }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

  /* Dark theme — merged with the footer (#0A0A0A) */
  const C = {
    bg: '#0A0A0A', ink: 'rgba(255,255,255,0.82)', inkSoft: 'rgba(255,255,255,0.4)',
    inkFaint: 'rgba(255,255,255,0.12)', orange: '#F37021',
    glass: '#E8EEF1', cloud: 'rgba(255,255,255,0.07)', rock: 'rgba(255,255,255,0.08)',
    hill: 'rgba(255,255,255,0.035)',
  }
  const OR = '#F37021', GY = '#9DA3A8'
  const RW = { cx1: 28, cx2: 82, cy: 56, r: 13 }

  const T = {
    title: 'Born To Play.',
    idleHint: 'Press Space to Play',
    jumpHint: 'Press Space to Jump',
    score: 'Score',
    best: 'Best',
    overTitle: 'Game Over',
    restart: 'Press Space to Play',
  }

  /* ── Logo image ──────────────────────────────────────────────────── */
  const LOGO_IMG = new Image()
  LOGO_IMG.src = '/icaur-website/assets/images/icaur-logo.svg'

  /* ── Page-gutter helper — aligns the car to the site content margin ── */
  const MAXW = 1280, PADX = 60   // matches CSS --max-w / --pad-x
  function gutterX(s) { return Math.max(0, (s.W - MAXW) / 2) + PADX }
  function carScreenX(s) { return gutterX(s) + 48 * s.k * CS }

  /* ── Ground helper ───────────────────────────────────────────────── */
  function groundAt(s, screenX) {
    const wx = screenX + s.dist
    return s.baseGroundY
      + Math.sin(wx * TERR.f1 / s.k) * TERR.a1 * s.k
      + Math.sin(wx * TERR.f2 / s.k + 1.3) * TERR.a2 * s.k
  }

  /* ── Drawing helpers ─────────────────────────────────────────────── */
  function drawPixelWheel(ctx, cx, cy, R, spin) {
    const N = 6, cell = R / N
    const L = '#C4D3DB', S = '#9FB4BF'
    for (let gy = -N; gy < N; gy++) {
      for (let gx = -N; gx < N; gx++) {
        const d = Math.hypot(gx + 0.5, gy + 0.5)
        if (d <= N) {
          ctx.fillStyle = d > N - 1.25 ? S : L
          ctx.fillRect(cx + gx * cell - 0.3, cy + gy * cell - 0.3, cell + 0.6, cell + 0.6)
        }
      }
    }
    ctx.fillStyle = S
    const nub = (gx, gy) => ctx.fillRect(cx + gx * cell - 0.3, cy + gy * cell - 0.3, cell + 0.6, cell + 0.6)
    nub(-0.5, -N); nub(-0.5, N - 1); nub(-N, -0.5); nub(N - 1, -0.5)
    const step = Math.floor(spin / (Math.PI / 2))
    const even = ((step % 2) + 2) % 2 === 0
    const r2 = N - 2
    const acc = even
      ? [[r2, 0], [-r2 - 1, 0], [0, r2], [0, -r2 - 1]]
      : [[r2 - 1, r2 - 1], [-r2, r2 - 1], [r2 - 1, -r2], [-r2, -r2]]
    ctx.fillStyle = S
    acc.forEach(([gx, gy]) => ctx.fillRect(cx + gx * cell - 0.3, cy + gy * cell - 0.3, cell + 0.6, cell + 0.6))
    ctx.fillStyle = '#E8EEF1'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.36, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#141414'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.2, 0, Math.PI * 2); ctx.fill()
  }

  function drawCar(ctx, gx, gy, kk, spin, bob, tilt, flipBadge) {
    ctx.save()
    ctx.translate(gx, gy)
    ctx.rotate(tilt || 0)
    ctx.scale(kk, kk)
    ctx.translate(-54, -69)
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'
    const INK = '#141414'
    const fs = (fill, lw = 2.4) => {
      if (fill) { ctx.fillStyle = fill; ctx.fill() }
      if (lw) { ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke() }
    }
    const rect = (a, b, w, h, fill, lw) => { ctx.beginPath(); ctx.rect(a, b, w, h); fs(fill, lw) }
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath(); ctx.ellipse(56, 68, 54, 5, 0, 0, Math.PI * 2); ctx.fill()
    drawPixelWheel(ctx, RW.cx1, RW.cy + bob * 0.15, RW.r, spin)
    drawPixelWheel(ctx, RW.cx2, RW.cy + bob * 0.15, RW.r, spin)
    ctx.save(); ctx.translate(0, bob)
    rect(2, 32, 7, 13, INK, 0); rect(100, 36, 7, 12, INK, 0)
    ctx.beginPath()
    ctx.moveTo(8, 12); ctx.lineTo(68, 12); ctx.lineTo(80, 28)
    ctx.lineTo(100, 28); ctx.lineTo(100, 56)
    ctx.lineTo(RW.cx2 + 14, 56); ctx.arc(RW.cx2, 56, 14, 0, Math.PI, true)
    ctx.lineTo(RW.cx1 + 14, 56); ctx.arc(RW.cx1, 56, 14, 0, Math.PI, true)
    ctx.lineTo(8, 56); ctx.closePath(); fs(OR, 2.6)
    rect(RW.cx1 + 13, 55, (RW.cx2 - 13) - (RW.cx1 + 13), 6, INK, 0)
    ctx.beginPath(); ctx.moveTo(8, 1)
    ctx.arcTo(64, 1, 64, 13, 4); ctx.arcTo(64, 13, 8, 13, 4)
    ctx.arcTo(6, 13, 6, 1, 3); ctx.arcTo(6, 1, 64, 1, 3); ctx.closePath(); fs(GY, 1.6)
    if (LOGO_IMG.complete && LOGO_IMG.naturalWidth) {
      const bx = 11, by = 2.5, bw = 48, bh = 9
      const sc = Math.min(bw / LOGO_IMG.naturalWidth, bh / LOGO_IMG.naturalHeight)
      const w = LOGO_IMG.naturalWidth * sc, h = LOGO_IMG.naturalHeight * sc
      const dx = bx + (bw - w) / 2, dy = by + (bh - h) / 2
      if (flipBadge) {
        ctx.save(); ctx.translate(dx + w / 2, dy + h / 2); ctx.scale(-1, 1)
        ctx.drawImage(LOGO_IMG, -w / 2, -h / 2, w, h); ctx.restore()
      } else {
        ctx.drawImage(LOGO_IMG, dx, dy, w, h)
      }
    } else {
      ctx.save()
      if (flipBadge) { ctx.translate(35, 7.4); ctx.scale(-1, 1); ctx.translate(-35, -7.4) }
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.font = 'italic 900 9px "Montserrat", sans-serif'
      ctx.fillText('iCAUR', 35, 7.4)
      ctx.restore()
    }
    rect(26, 18, 17, 18, GY, 2); rect(28.5, 20.5, 12, 13, C.glass, 0)
    ctx.beginPath()
    ctx.moveTo(49, 18); ctx.lineTo(71, 18); ctx.lineTo(67, 36); ctx.lineTo(46, 36); ctx.closePath(); fs(GY, 2)
    ctx.beginPath()
    ctx.moveTo(51.5, 20.5); ctx.lineTo(67.5, 20.5); ctx.lineTo(64, 33.5); ctx.lineTo(48.5, 33.5); ctx.closePath(); fs(C.glass, 0)
    ctx.lineWidth = 0.9; ctx.strokeStyle = INK
    const rivet = (rx, ry) => { ctx.beginPath(); ctx.arc(rx, ry, 2.1, 0, Math.PI * 2); ctx.fillStyle = OR; ctx.fill(); ctx.stroke() }
    ;[14, 21].forEach(rx => [20, 28].forEach(ry => rivet(rx, ry)))
    for (let rx = 14; rx <= 96; rx += 9) rivet(rx, 40)
    ;[46, 55, 64].forEach(rx => rivet(rx, 49))
    ctx.restore(); ctx.restore()
  }

  function drawRock(ctx, o, k, gy) {
    const w = o.w * k, h = o.h * k, x = o.x, top = gy - h
    ctx.beginPath()
    ctx.moveTo(x, gy); ctx.lineTo(x + 2 * k, top + h * 0.34)
    ctx.quadraticCurveTo(x + w * 0.22, top, x + w * 0.46, top + 2 * k)
    ctx.quadraticCurveTo(x + w * 0.74, top - 2 * k, x + w - 2 * k, top + h * 0.36)
    ctx.lineTo(x + w, gy); ctx.closePath()
    ctx.fillStyle = C.rock; ctx.fill()
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + w * 0.52, top + h * 0.32); ctx.lineTo(x + w * 0.42, gy - 2 * k)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.4; ctx.stroke()
  }

  function drawCloud(ctx, c, k) {
    const u = c.s * k * 1.35, x = c.x, y = c.y
    ctx.beginPath()
    ctx.moveTo(x - 18 * u, y)
    ctx.bezierCurveTo(x - 18 * u, y - 7 * u, x - 11 * u, y - 13 * u, x - 5 * u, y - 10 * u)
    ctx.bezierCurveTo(x - 3 * u, y - 19 * u, x + 9 * u, y - 19 * u, x + 10 * u, y - 10 * u)
    ctx.bezierCurveTo(x + 19 * u, y - 13 * u, x + 20 * u, y - 1 * u, x + 13 * u, y)
    ctx.closePath()
    ctx.fillStyle = C.cloud; ctx.fill()
    ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2; ctx.stroke()
  }

  /* ── Game state ──────────────────────────────────────────────────── */
  let s = null           // game state object
  let status = 'idle'    // 'idle' | 'playing' | 'over'
  let score = 0
  let best = (() => { try { return parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0 } catch { return 0 } })()
  let rafId = 0

  /* ── DOM elements (created in init) ─────────────────────────────── */
  let wrap, canvas, ctx
  let elScore, elBest, elOverlay, elOverlayBtn, elJumpHint

  function makeClouds(W, Hc) {
    const n = Math.max(3, Math.round(W / 380))
    return Array.from({ length: n }, () => ({
      x: Math.random() * W, y: (0.14 + Math.random() * 0.34) * Hc,
      s: 0.7 + Math.random() * 0.7, spd: 0.12 + Math.random() * 0.22,
    }))
  }

  function layout() {
    const W = wrap.clientWidth, Hc = wrap.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width  = Math.round(W * dpr)
    canvas.height = Math.round(Hc * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const k = clamp(W / 1000, 1, 1.85)
    const baseGroundY = Hc - BOTTOM
    return { W, Hc, k, baseGroundY }
  }

  function initState() {
    const { W, Hc, k, baseGroundY } = layout()
    s = {
      W, Hc, k, baseGroundY,
      clouds: makeClouds(W, Hc), t: 0,
      car: { h: 0, vy: 0, grounded: true },
      obstacles: [], speed: SPD0 * k,
      dist: 0, sinceSpawn: 0, nextGap: 300 * k, spin: 0,
    }
  }

  function resetGame() {
    s.car = { h: 0, vy: 0, grounded: true }
    s.obstacles = []; s.speed = SPD0 * s.k; s.dist = 0
    s.sinceSpawn = 0; s.nextGap = 300 * s.k; s.spin = 0
    score = 0; updateScoreUI()
  }

  /* ── UI helpers ──────────────────────────────────────────────────── */
  function updateScoreUI() {
    if (elScore) elScore.textContent = String(score).padStart(4, '0')
    if (elBest)  elBest.textContent  = String(best).padStart(4, '0')
  }

  function showOverlay(label) {
    elOverlay.style.display = 'flex'
    if (elOverlayBtn) elOverlayBtn.textContent = label
    elJumpHint.hidden = false
  }

  function hideOverlay() {
    elOverlay.style.display = 'none'
    elJumpHint.hidden = false
  }

  /* ── Draw ────────────────────────────────────────────────────────── */
  function draw() {
    if (!s) return
    const { W, Hc, k } = s
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, Hc)
    s.clouds.forEach(c => drawCloud(ctx, c, k))
    const hill = (amp, baseY, factor, segW) => {
      const off = (s.dist * factor) % segW
      ctx.beginPath(); ctx.moveTo(-off - segW, baseY)
      for (let bx = -off - segW; bx < W + segW; bx += segW) ctx.quadraticCurveTo(bx + segW / 2, baseY - amp, bx + segW, baseY)
      ctx.lineTo(W + segW, Hc); ctx.lineTo(-off - segW, Hc); ctx.closePath()
      ctx.fillStyle = C.hill; ctx.fill()
      ctx.beginPath(); ctx.moveTo(-off - segW, baseY)
      for (let bx = -off - segW; bx < W + segW; bx += segW) ctx.quadraticCurveTo(bx + segW / 2, baseY - amp, bx + segW, baseY)
      ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 2; ctx.stroke()
    }
    hill(56 * k, s.baseGroundY - 22 * k, 0.10, 360 * k)
    hill(36 * k, s.baseGroundY - 6  * k, 0.22, 250 * k)
    const STEP = 6
    ctx.beginPath(); ctx.moveTo(0, groundAt(s, 0))
    for (let x = STEP; x <= W; x += STEP) ctx.lineTo(x, groundAt(s, x))
    ctx.lineTo(W, Hc); ctx.lineTo(0, Hc); ctx.closePath()
    ctx.fillStyle = '#1A1A1A'; ctx.fill()
    ctx.beginPath(); ctx.moveTo(0, groundAt(s, 0))
    for (let x = STEP; x <= W; x += STEP) ctx.lineTo(x, groundAt(s, x))
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6; ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 3
    const dash = 30 * k, gap = 26 * k, period = dash + gap
    const dOff = s.dist % period
    for (let x = -dOff; x < W; x += period) {
      ctx.beginPath(); ctx.moveTo(x, groundAt(s, x) + 12 * k)
      ctx.lineTo(x + dash, groundAt(s, x + dash) + 12 * k); ctx.stroke()
    }
    s.obstacles.forEach(o => drawRock(ctx, o, k, groundAt(s, o.x + o.w * k / 2)))
    const playing = status === 'playing'
    const bob = (s.car.grounded && playing) ? Math.sin(s.t * 0.5) * 1.1 : 0
    const carX = carScreenX(s)
    const span = 26 * k * CS
    const slope = (groundAt(s, carX + span) - groundAt(s, carX - span)) / (2 * span)
    drawCar(ctx, carX, groundAt(s, carX) - s.car.h, k * CS, s.spin, bob, Math.atan(slope))
  }

  /* ── Update ──────────────────────────────────────────────────────── */
  function update(dt) {
    const k = s.k, carX = carScreenX(s)
    s.speed = Math.min(SPDMAX0 * k, s.speed + 0.0014 * k * dt)
    s.spin += s.speed * 0.085 * dt
    s.dist += s.speed * dt
    if (!s.car.grounded) {
      s.car.h  += s.car.vy * dt
      s.car.vy -= GRAV0 * k * dt
      /* ceiling: keep the car fully inside the band so it never clips the top */
      const maxH = s.baseGroundY - 112 * k - 8
      if (s.car.h > maxH) { s.car.h = maxH; if (s.car.vy > 0) s.car.vy = 0 }
      if (s.car.h <= 0) { s.car.h = 0; s.car.vy = 0; s.car.grounded = true }
    }
    s.sinceSpawn += s.speed * dt
    if (s.sinceSpawn >= s.nextGap) {
      s.sinceSpawn = 0
      s.nextGap = Math.max(240 * k, (320 + Math.random() * 240) * k - s.speed * 6)
      const tall = Math.random() < 0.34
      const h = tall ? 32 + Math.random() * 14 : 16 + Math.random() * 12
      const w = 18 + Math.random() * 18
      s.obstacles.push({ x: s.W + 30, w, h, passed: false })
    }
    const kk = k * CS
    const carBottom = groundAt(s, carX) - s.car.h
    const carBox = { x: carX - 36 * kk, y: carBottom - 52 * kk, w: 72 * kk, h: 44 * kk }
    for (let i = s.obstacles.length - 1; i >= 0; i--) {
      const o = s.obstacles[i]
      o.x -= s.speed * dt
      if (!o.passed && o.x + o.w * k < carX) {
        o.passed = true; score++; updateScoreUI()
      }
      const rTop = groundAt(s, o.x + o.w * k / 2) - o.h * k
      const rb = { x: o.x + 4 * k, y: rTop, w: o.w * k - 8 * k, h: o.h * k }
      if (carBox.x < rb.x + rb.w && carBox.x + carBox.w > rb.x &&
          carBox.y < rb.y + rb.h && carBox.y + carBox.h > rb.y) {
        endGame(); return
      }
      if (o.x + o.w * k < -60) s.obstacles.splice(i, 1)
    }
  }

  /* ── Game lifecycle ──────────────────────────────────────────────── */
  function startGame() { resetGame(); status = 'playing'; hideOverlay() }

  function endGame() {
    status = 'over'
    best = Math.max(best, score)
    try { localStorage.setItem(BEST_KEY, String(best)) } catch { /**/ }
    updateScoreUI()
    showOverlay('Play Again')
  }

  function jump() {
    if (status === 'idle' || status === 'over') { startGame(); return }
    if (s && s.car.grounded) { s.car.vy = JUMP0 * s.k; s.car.grounded = false }
  }

  /* ── Loop ────────────────────────────────────────────────────────── */
  let visible = false, lastTime = 0

  function loop(now) {
    const dt = Math.min(2.2, (now - lastTime) / 16.67)
    lastTime = now
    if (s) {
      s.t += dt
      s.clouds.forEach(c => { c.x -= c.spd * dt; if (c.x < -80) c.x = s.W + 60 })
      if (status === 'playing') update(dt)
      draw()
    }
    if (visible) rafId = requestAnimationFrame(loop)
  }

  function startLoop() {
    cancelAnimationFrame(rafId)
    lastTime = performance.now()
    rafId = requestAnimationFrame(loop)
  }

  /* ── Init ────────────────────────────────────────────────────────── */
  function init() {
    const section = document.getElementById('gameBg')
    if (!section) return

    /* build inner HTML */
    section.innerHTML = `
      <canvas id="gameCanvas" style="position:absolute;inset:0;width:100%;height:100%;display:block"></canvas>
      <div style="position:absolute;top:clamp(28px,5vh,48px);left:0;right:0;text-align:center;pointer-events:none">
        <p style="font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.45);margin:0 0 8px">Take a Break</p>
        <h3 id="gameTitle" style="font-family:'Montserrat',sans-serif;font-weight:800;font-size:clamp(1.6rem,4vw,3rem);letter-spacing:-.02em;color:#FFFFFF;margin:0">${T.title}</h3>
      </div>
      <div style="position:absolute;top:clamp(28px,5vh,48px);left:0;right:0;pointer-events:none">
        <div style="max-width:var(--max-w);margin:0 auto;padding:0 var(--pad-x);display:flex;justify-content:flex-end">
          <div style="border:1.5px solid rgba(255,255,255,.28);border-radius:10px;padding:6px 14px;text-align:center">
            <div style="font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#F37021;font-weight:700">${T.score}</div>
            <div id="gameScore" style="font-size:1.1rem;font-weight:700;font-variant-numeric:tabular-nums;color:#FFFFFF;line-height:1.1">0000</div>
          </div>
        </div>
      </div>
      <div id="gameOverlay" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding-bottom:clamp(40px,6vh,70px)">
        <button id="gameOverlayBtn" type="button" style="font-family:'Montserrat',sans-serif;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#FFFFFF;background:#2A2A2A;border:1px solid rgba(255,255,255,.12);padding:14px 32px;border-radius:999px;cursor:pointer">Play Again</button>
      </div>
      <p id="gameJumpHint" style="position:absolute;bottom:clamp(96px,13vh,132px);left:0;right:0;text-align:center;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.35);pointer-events:none;margin:0">${T.jumpHint}</p>
    `

    wrap   = section
    canvas = document.getElementById('gameCanvas')
    ctx    = canvas.getContext('2d')
    elScore        = document.getElementById('gameScore')
    elOverlay      = document.getElementById('gameOverlay')
    elOverlayBtn   = document.getElementById('gameOverlayBtn')
    elJumpHint     = document.getElementById('gameJumpHint')

    showOverlay('Play')
    initState()
    draw()
    updateScoreUI()

    /* events */
    section.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump() }
    })
    section.addEventListener('pointerdown', e => { e.preventDefault(); section.focus(); jump() })
    if (elOverlayBtn) elOverlayBtn.addEventListener('click', e => { e.stopPropagation(); startGame() })
    section.setAttribute('tabindex', '0')

    /* visibility (pause when off-screen) */
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) startLoop(); else cancelAnimationFrame(rafId)
    }, { threshold: 0.01 })
    io.observe(section)

    /* resize */
    const ro = new ResizeObserver(() => {
      if (!s) return
      const { W, Hc, k, baseGroundY } = layout()
      s.W = W; s.Hc = Hc; s.k = k; s.baseGroundY = baseGroundY
      s.clouds = makeClouds(W, Hc)
      draw()
    })
    ro.observe(section)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()

  /* Expose the cartoon car renderer so other scripts (e.g. the About page
     scroll-along car) can reuse the exact same illustration. */
  window.iCAURCar = { drawCar, LOGO_IMG }
})()
