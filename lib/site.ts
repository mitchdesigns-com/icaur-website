export type SiteScript = {
  src: string;
  type?: "module";
};

export const CORE_SCRIPTS: SiteScript[] = [
  { src: "/js/components.js" },
  { src: "/js/main.js?v=77" },
  { src: "/js/transitions.js?v=2" },
  { src: "/js/game.js" },
];

export const GSAP_V27: SiteScript[] = [
  { src: "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" },
  { src: "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" },
  { src: "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/InertiaPlugin.min.js" },
];

export const GSAP_INNOV: SiteScript[] = [
  { src: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" },
  { src: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" },
];

export const LEAFLET: SiteScript[] = [
  { src: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" },
];

export const FEEDBACK_WIDGET = {
  src: "https://feedback-widget.mitchdesigns.workers.dev/widget.js",
  ingestKey: "pk_45fe8548cf2370887b3de70a9d752080",
  endpoint: "https://bugger-worker.mitchdesigns.workers.dev/functions/v1/ingest-feedback",
} as const;

export const DEFAULT_TITLE = "iCAUR — Built for Every Road";
export const DEFAULT_DESCRIPTION =
  "iCAUR — Egypt's next-generation electric vehicle. Built for every road.";

export const MODEL_CHROME: { bodyClass: string; scripts: SiteScript[]; styles: string[] } = {
  bodyClass: "v27-page",
  styles: ["/css/v27.css?v=77"],
  scripts: [...GSAP_V27, ...CORE_SCRIPTS, { src: "/js/page/models-v27.js" }, { src: "/js/v27.js?v=77", type: "module" }],
};

export const PAGE_CHROME: Record<string, { bodyClass: string; scripts: SiteScript[]; styles?: string[] }> = {
  home: { bodyClass: "is-loading dark-hero-page", scripts: CORE_SCRIPTS },
  about: {
    bodyClass: "is-loading",
    scripts: [
      ...CORE_SCRIPTS,
      { src: "/js/dot-field.js" },
      { src: "/js/doodles.js" },
      { src: "/js/about-thread.js" },
      { src: "/js/page/about.js" },
      { src: "/js/about-mv.js", type: "module" },
    ],
  },
  contact: {
    bodyClass: "is-loading",
    styles: ["https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"],
    scripts: [...CORE_SCRIPTS, ...LEAFLET, { src: "/js/services.js?v=2" }],
  },
  faq: { bodyClass: "is-loading", scripts: CORE_SCRIPTS },
  innovation: {
    bodyClass: "is-loading dark-hero-page",
    styles: ["/css/v27.css"],
    scripts: [...CORE_SCRIPTS, ...GSAP_INNOV, { src: "/js/page/innovation.js" }],
  },
  news: { bodyClass: "is-loading", scripts: CORE_SCRIPTS },
  reserve: { bodyClass: "is-loading dark-hero-page", scripts: CORE_SCRIPTS },
  services: {
    bodyClass: "is-loading dark-hero-page",
    styles: ["https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"],
    scripts: [...CORE_SCRIPTS, { src: "/js/doodles.js" }, ...LEAFLET, { src: "/js/services.js?v=2" }],
  },
  "services-maintenance": {
    bodyClass: "is-loading dark-hero-page",
    scripts: [...CORE_SCRIPTS, { src: "/js/doodles.js" }, { src: "/js/services.js?v=2" }],
  },
  "services-programs": {
    bodyClass: "is-loading dark-hero-page",
    scripts: [...CORE_SCRIPTS, { src: "/js/doodles.js" }],
  },
  "services-warranty": {
    bodyClass: "is-loading dark-hero-page",
    scripts: [...CORE_SCRIPTS, { src: "/js/doodles.js" }],
  },
  "models-v27": MODEL_CHROME,
  "models-o3t": MODEL_CHROME,
  article: { bodyClass: "is-loading", scripts: CORE_SCRIPTS },
  legal: { bodyClass: "is-loading", scripts: CORE_SCRIPTS },
};
