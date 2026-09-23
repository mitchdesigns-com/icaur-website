# DOM / Class Contracts (frozen for animation parity)

Scripts in `public/js/**` and CDN GSAP/Three query these hooks. **Do not rename or remove without replacing the consumer.**

## Global / chrome

| Hook | Consumer |
|------|----------|
| `#site-header`, `#site-footer` | `components.js` (inject no-op under React) |
| `#cursor` | `main.js` cursor |
| `#qn`, Quick Nav | `components.js` |
| `body.is-loading`, `dark-hero-page`, `v27-page` | CSS + intro |

## Home

| Hook | Consumer |
|------|----------|
| `#heroScrollDriver`, `#heroMaskReveal`, `#heroOverlay` | `main.js` mask scroll |
| `.hero__headline`, `.hero__word`, `.lettre`, `.letters-in` | letter pop |
| `#why-icaur`, `.why-strip` | why-strips |
| `.reveal`, `[data-delay]` | IntersectionObserver reveals |
| `.btn--magnetic` | magnetic buttons |

## FAQ

| Hook | Consumer |
|------|----------|
| `.faq-cat-btn`, `[data-cat]`, `.faq-group`, `[data-group]` | `FaqView` client filter (was `page/faq.js`) |
| `.faq-item__q`, `.faq-item__a` | `main.js` accordion |
| `.faq-hero-shot`, `.faq-ask` | magnet hover in `main.js` |

## Contact / Reserve

| Hook | Consumer |
|------|----------|
| `#rsForm`, `.rs-*`, `#rs-category` | `ContactFormClient` → `page/contact.js` |
| Reserve form ids | `ReserveFormClient` → `page/reserve.js` |

## About / Services / Innovation / Models

| Hook | Consumer |
|------|----------|
| `#figures[data-dotfield]` | `dot-field.js` |
| about MV / thread selectors | `about-mv.js`, `about-thread.js` |
| doodle hosts | `doodles.js` |
| innovation tech section | `page/innovation.js` + GSAP |
| `#v27-*`, canvas wrap | `v27.js` + GSAP/Three |

## Canonical asset trees

- Edit only: `public/js/**`, `public/css/**`
- Do not treat as source: root `js/`, `css/`, `.vercel/output/**`
