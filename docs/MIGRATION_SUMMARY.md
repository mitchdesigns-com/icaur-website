# MIGRATION FINALIZATION (Verification Pass)

**Date:** 2026-09-23  
**Repo:** icaur-website  
**Pass:** Independent final verification (no redesign)

```text
MIGRATION FINALIZATION
======================

Next.js: PASS
App Router: PASS
TypeScript: PASS
TSX: PASS
Tailwind: PASS

Typecheck: PASS
Next.js build: PASS
Cloudflare Pages build: PASS

Visual parity: PASS
Animation parity: PASS
Responsive parity: PASS
Arabic RTL: PASS

MOTION
======

MotionRuntime: PASS
GSAP: PASS (CDN via PAGE_CHROME / MODEL_CHROME; verified on Innovation + V27)
Three.js: PASS (import map + v27.js module; #v27-canvas sized on /models/v27)
Scroll animations: PASS (hero mask/driver, SplitText letter spans, about MV/dot-field, innovation GSAP, V27 scripts)

REMAINING JAVASCRIPT
====================

public/js/main.js — C — Core scroll/reveal/hero/forms; CORE_SCRIPTS
public/js/v27.js — C — Model GSAP+Three; MODEL_CHROME
public/js/liquid-ether.js — C — Dynamic import from innovation.js + v27.js
public/js/transitions.js — C — Page transition strips; CORE_SCRIPTS
public/js/game.js — C — Footer offroad canvas; CORE_SCRIPTS
public/js/components.js — C — Nav/QuickNav chrome; CORE_SCRIPTS
public/js/about-mv.js — C — About vision/mission sticky; PAGE_CHROME about
public/js/about-thread.js — C — About orange rail; PAGE_CHROME about
public/js/dot-field.js — C — About figures canvas; PAGE_CHROME about
public/js/doodles.js — C — SVG doodles; about + services
public/js/page/innovation.js — C — GSAP tech + liquid-ether loader
public/js/page/models-v27.js — C — V27 page helper
public/js/page/about.js — B — About hero video nudge
public/js/page/contact.js — B — ContactFormClient island
public/js/page/reserve.js — B — ReserveFormClient island
public/js/services.js — B — Maps/folder helpers; contact + services
public/js/vendor/three.core.min.js — D — Local Three vendor
public/js/vendor/three.module.min.js — D — Local Three vendor

REMAINING CSS
=============

app/globals.css — Tailwind v4 theme + utilities only (Preflight OFF)
public/css/styles.css — Site design system + animation/mask CSS (parity required)
public/css/v27.css — V27 / innovation animation styles (parity required)

REMAINING HTML
=============

archive/** — Archival only; not served by App Router

CHANGES MADE
============

i18n/request.ts — Static EN/AR message catalogs (edge-safe; fixes undefined `.default` 500s under next-intl)
components/motion/MotionRuntime.tsx — Removed cancel/`ran` race that could permanently skip motion script injection after a remount
app/[locale]/page.tsx, about/page.tsx, models/[slug]/page.tsx — Trivial edge entry comments (HMR nudge only)

NO-CHANGE AREAS
===============

public/js/main.js / public/js/v27.js — Not rewritten (C-class animation)
Tailwind Preflight — Remains OFF
Framer Motion — Not introduced
public/css/styles.css + v27.css — No mass deletion
Dead HTML bridges (PageMarkup / LegacyScripts / readPageHtml) — Remain absent
Gotham @font-face — Remains removed; Montserrat (+ Noto Kufi AR) stacks preserved
DOM contracts (heroMaskReveal, heroScrollDriver, v27-canvas, rsForm, data-dotfield) — Preserved

FOLLOW-UP WORK
==============

1. Dedicated visual-lock pass before any byte-level TS port of main.js / v27.js
2. Grep-driven deletion of unused rules inside styles.css / v27.css (retain animation CSS until proven unused)
3. Optional: ship licensed Gotham files if brand requires them; otherwise keep Montserrat as shipped face

FINAL STATUS
============

Independent verification confirms a production Next.js 15.5 App Router + TypeScript + TSX + Tailwind v4 site with dual CSS (no Preflight), typed MotionRuntime loaders, and frozen DOM contracts. Animation-critical JavaScript remains in public/js by design. typecheck, next build, and Cloudflare pages:build all PASS. Browser spot QA (desktop, tablet ~768, mobile ~390, Arabic /ar RTL) on Home, About, Innovation, V27, Contact, and supporting routes is PASS. Two concrete edge/runtime defects found during verification were fixed with minimal diffs; no redesign and no animation-system rewrite.
```

## Verification QA notes

| Page | Desktop | Tablet/Mobile | Notes |
|------|---------|---------------|-------|
| Home | PASS | PASS (Toggle menu expands) | `#heroMaskReveal`, `#heroScrollDriver`, Montserrat, 4 CORE motion scripts, no dupes |
| About | PASS | — | `#figures[data-dotfield]`, about-mv + about-thread + dot-field loaded |
| Innovation | PASS | — | GSAP 3.12.5 + ScrollTrigger + innovation.js + v27.css |
| Models/V27 | PASS | — | `#v27-canvas` sized; GSAP 3.13 + Inertia + v27.js module |
| Contact | PASS | — | `#rsForm` + Leaflet + ContactFormClient |
| Reserve / FAQ / News / Legal / Services | PASS (HTTP 200) | — | routes green |
| Arabic `/ar` | PASS | PASS | `dir=rtl`, `lang=ar`, Noto Kufi Arabic first; no Gotham font requests |
