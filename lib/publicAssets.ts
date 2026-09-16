const CMS_MEDIA = "https://pub-835dbefa2ea84f599cef0519f76de888.r2.dev/cms";

export const PUBLIC_ASSET_ALIASES: Record<string, string> = {
  "/assets/images/overview background.webp": `${CMS_MEDIA}/overview_background_e951a8b89c.webp`,
  "/assets/images/ICUAR V27 brochure 03 18.webp": `${CMS_MEDIA}/ICUAR_V27_brochure_03_18_bc9df0f1f9.webp`,
  "/assets/images/ICUAR V27 brochure 03 20.webp": `${CMS_MEDIA}/ICUAR_V27_brochure_03_20_a1c4586b67.webp`,
  "/assets/images/iCAUR INTL_V27 REV_cam025.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam025_f1865d5cda.webp`,
  "/assets/images/v27/iCAUR INTL_V27 REV_cam025.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam025_f1865d5cda.webp`,
  "/assets/images/iCAUR INTL_V27 REV_cam026 copy.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam026_copy_7ca1e4bf5b.webp`,
  "/assets/images/v27/iCAUR INTL_V27 REV_cam026 copy.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam026_copy_7ca1e4bf5b.webp`,
  "/assets/images/iCAUR INTL_V27 REV_cam027 copy.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam027_copy_55d48e610a.webp`,
  "/assets/images/v27/iCAUR INTL_V27 REV_cam027 copy.webp": `${CMS_MEDIA}/i_CAUR_INTL_V27_REV_cam027_copy_55d48e610a.webp`,
  "/assets/images/v27/interior-display.webp": `${CMS_MEDIA}/interior_display_4c3657864e.webp`,
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
  return extra?.[src] || extra?.[decoded] || PUBLIC_ASSET_ALIASES[src] || PUBLIC_ASSET_ALIASES[decoded] || src;
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
