# iCAUR — Design / Animation / Migration Inventory

**Status:** Migration finalized (parity-first). App Router + TSX + Tailwind dual-CSS + MotionRuntime. Animation implementations remain in `public/js/**` by design.

**Canonical static assets:** `public/js/**`, `public/css/**` only. Legacy HTML under `archive/`.

---

## 1. Architecture

| Layer | Location | Notes |
|-------|----------|--------|
| Routes | `app/[locale]/**/page.tsx` | Edge, `next-intl` |
| Views | `components/views/*.tsx` | DOM contracts frozen |
| Chrome | `SiteChrome` + `MotionRuntime` | Load order via `lib/site.ts` → registry |
| CSS | `app/globals.css` (no Preflight) + `public/css/*` | Dual by design |
| Motion | `public/js/*` via typed loaders | GSAP / Three CDN |

---

## 2. public/js classification (Phase A audit)

| File | Class | Reason |
|------|-------|--------|
| `main.js` | C | Core scroll/reveal/hero/forms; CORE_SCRIPTS |
| `v27.js` | C | Model page GSAP+Three; MODEL_CHROME + dynamic liquid-ether |
| `liquid-ether.js` | C | Dynamic import from innovation.js + v27.js |
| `transitions.js` | C | Page transition strips; CORE_SCRIPTS |
| `game.js` | C | Footer offroad canvas; CORE_SCRIPTS |
| `components.js` | C | Nav/QuickNav chrome; CORE_SCRIPTS |
| `about-mv.js` | C | About vision/mission; PAGE_CHROME about |
| `about-thread.js` | C | About orange rail; PAGE_CHROME about |
| `dot-field.js` | C | About figures canvas; PAGE_CHROME about |
| `doodles.js` | C | SVG doodles; about + services chrome |
| `page/innovation.js` | C | GSAP tech + liquid-ether load |
| `page/models-v27.js` | C | V27 page helper |
| `page/about.js` | B | About hero video nudge |
| `page/contact.js` | B | ContactFormClient island |
| `page/reserve.js` | B | ReserveFormClient island |
| `services.js` | B | Maps/folder helpers; contact + services |
| `vendor/three.*.js` | D | Local Three vendor (CDN importmap preferred) |

### Deleted (Class A — zero app references)

| File | Reason |
|------|--------|
| `page/faq.js` | Replaced by FaqView client filters |
| `page/news.js` | Comment-only; NewsView owns UI |
| `about-car.js` | Immediate return; not in PAGE_CHROME |
| `about-3d.js` | Not loaded by chrome/islands |
| `about-cinema.js` | Not loaded |
| `about-glb.js` | Not loaded |
| `about-story.js` | Not loaded |
| `circular-gallery.js` | Not loaded |
| `lego-pit.js` | Harness-only |

---

## 3. Fonts

- Gotham woff2 files: **missing** (`public/assets/fonts/` empty)
- Broken `@font-face` removed; stacks lead with Montserrat (AR: Noto Kufi Arabic first)
- Google Fonts loaded in locale layout

---

## 4. Tailwind

Presentational: Legal, FAQ, News, Article. Shells elsewhere. Animation CSS retained in `styles.css` / `v27.css`. Preflight **off**.

---

## 5. Visual QA checklist

See `docs/MIGRATION_SUMMARY.md` for pass/fail recorded after browser QA.
