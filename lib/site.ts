export type SiteScript = {
  src: string;
  type?: "module";
};

export const CORE_SCRIPTS: SiteScript[] = [
  { src: "/js/components.js" },
  { src: "/js/main.js" },
  { src: "/js/transitions.js" },
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
