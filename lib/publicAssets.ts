const CMS_MEDIA = "https://pub-835dbefa2ea84f599cef0519f76de888.r2.dev/cms";
const PAGES_ORIGIN = "https://icaur-website.pages.dev";
const R2 = "https://pub-835dbefa2ea84f599cef0519f76de888.r2.dev";

/** Oversized CMS/R2 MP4s → local 1080p cuts until Strapi media is replaced. */
const HEAVY_VIDEO_REMAPS: Array<{ test: RegExp; to: string }> = [
  { test: /icaur[_-]?homepagehero[^/]*\.mp4$/i, to: "/assets/videos/compressed/homepage-hero.mp4" },
  { test: /abouticaurhomepage[^/]*\.mp4$/i, to: "/assets/videos/compressed/about-overview.mp4" },
  { test: /about[_-]?hero[^/]*\.mp4$/i, to: "/assets/videos/compressed/about-hero.mp4" },
];

export const PUBLIC_ASSET_ALIASES: Record<string, string> = {
  // Exact production URLs currently returned by Strapi (hash suffixes change on re-upload).
  [`${CMS_MEDIA}/icaur_homepagehero_bf7a36789d.mp4`]: "/assets/videos/compressed/homepage-hero.mp4",
  [`${CMS_MEDIA}/abouticaurhomepage_cff6b70265.mp4`]: "/assets/videos/compressed/about-overview.mp4",
  [`${CMS_MEDIA}/about_hero_2554e6732b.mp4`]: "/assets/videos/compressed/about-hero.mp4",
  [`${R2}/icaur-homepagehero.mp4`]: "/assets/videos/compressed/homepage-hero.mp4",
  [`${R2}/abouticaurhomepage.mp4`]: "/assets/videos/compressed/about-overview.mp4",
  [`${R2}/about-hero.mp4`]: "/assets/videos/compressed/about-hero.mp4",
  "/assets/images/overview background.webp": `${CMS_MEDIA}/overview_background_e951a8b89c.webp`,
  "/assets/images/ICUAR V27 brochure 03 18.webp": `${CMS_MEDIA}/ICUAR_V27_brochure_03_18_bc9df0f1f9.webp`,
  "/assets/images/ICUAR V27 brochure 03 20.webp": `${CMS_MEDIA}/ICUAR_V27_brochure_03_20_a1c4586b67.webp`,
  "/assets/images/iCAUR INTL_V27 REV_cam025.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam025_f1865d5cda.webp`,
  "/assets/images/v27/iCAUR INTL_V27 REV_cam025.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam025_f1865d5cda.webp`,
  "/assets/images/iCAUR INTL_V27 REV_cam026 copy.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam026_copy_7ca1e4bf5b.webp`,
  "/assets/images/v27/iCAUR INTL_V27 REV_cam026 copy.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam026_copy_7ca1e4bf5b.webp`,
  "/assets/images/iCAUR INTL_V27 REV_cam027 copy.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam027_copy_55d48e610a.webp`,
  "/assets/images/v27/iCAUR INTL_V27 REV_cam027 copy.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam027_copy_55d48e610a.webp`,
  "/assets/images/v27/iCAUR INTL_V27 REV_cam028 copy.webp": `${PAGES_ORIGIN}/assets/images/v27/iCAUR%20INTL_V27%20REV_cam028%20copy.webp`,
  "/assets/images/v27/iCAUR INTL_V27 REV_cam033 copy.webp": `${PAGES_ORIGIN}/assets/images/v27/iCAUR%20INTL_V27%20REV_cam033%20copy.webp`,
  "/assets/images/v27/iCAUR INTL_V27 REV_cam0301 copy.webp": `${PAGES_ORIGIN}/assets/images/v27/iCAUR%20INTL_V27%20REV_cam0301%20copy.webp`,
  "/assets/images/v27/interior-display.webp": `${CMS_MEDIA}/interior_display_4c3657864e.webp`,
  "/assets/images/v27/interior-01.webp": `${PAGES_ORIGIN}/assets/images/v27/interior-01.webp`,
};

export const MODEL_INTERIOR_PATHS: Record<string, string[]> = {
  v27: [
    "/assets/images/v27/iCAUR INTL_V27 REV_cam025.webp",
    "/assets/images/v27/iCAUR INTL_V27 REV_cam026 copy.webp",
    "/assets/images/v27/iCAUR INTL_V27 REV_cam027 copy.webp",
    "/assets/images/v27/iCAUR INTL_V27 REV_cam028 copy.webp",
    "/assets/images/v27/iCAUR INTL_V27 REV_cam033 copy.webp",
    "/assets/images/v27/iCAUR INTL_V27 REV_cam0301 copy.webp",
    "/assets/images/v27/interior-display.webp",
    "/assets/images/v27/interior-leather.webp",
    "/assets/images/v27/interior-sunroof.webp",
    "/assets/images/v27/interior-console.webp",
    "/assets/images/v27/interior-01.webp",
  ],
};

type Slide = { src?: string; label?: string };

export function publicAsset(src?: string | null, extra?: Record<string, string>): string {
  if (!src) return "";
  const decoded = (() => {
    try {
      return decodeURIComponent(src);
    } catch {
      return src;
    }
  })();
  const exact = extra?.[src] || extra?.[decoded] || PUBLIC_ASSET_ALIASES[src] || PUBLIC_ASSET_ALIASES[decoded];
  if (exact) return exact;
  const pathOnly = decoded.split("?")[0] || decoded;
  for (const { test, to } of HEAVY_VIDEO_REMAPS) {
    if (test.test(pathOnly)) return to;
  }
  return src;
}

export function rewriteHtmlAssets(html: string, extra?: Record<string, string>): string {
  let out = html;
  const map = { ...PUBLIC_ASSET_ALIASES, ...extra };
  for (const [from, to] of Object.entries(map)) {
    if (!from || !to || from === to) continue;
    out = out.split(from).join(to);
  }
  return out;
}

export function modelAssetMap(models?: { slug?: string; interiorSlides?: Slide[]; safetyImage?: string }[]): Record<string, string> {
  const map = { ...PUBLIC_ASSET_ALIASES };
  for (const model of models || []) {
    const paths = MODEL_INTERIOR_PATHS[model.slug || ""] || [];
    (model.interiorSlides || []).forEach((slide, index) => {
      if (paths[index] && slide.src) map[paths[index]] = slide.src;
    });
    if (model.safetyImage) {
      map["/assets/images/ICUAR V27 brochure 03 18.webp"] = model.safetyImage;
    }
  }
  return map;
}
