/**
 * Typed script registry for legacy motion (CDN + public/js).
 * Keeps animation parity while the Next.js app owns loading order.
 */

export type MotionScript = {
  src: string;
  type?: "module";
  /** Stable id for dedupe */
  id: string;
};

export const CORE_MOTION: MotionScript[] = [
  { id: "components", src: "/js/components.js" },
  { id: "main", src: "/js/main.js?v=77" },
  { id: "transitions", src: "/js/transitions.js" },
  { id: "game", src: "/js/game.js" },
];

export const GSAP_V27_SCRIPTS: MotionScript[] = [
  { id: "gsap", src: "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" },
  { id: "scrolltrigger", src: "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" },
  { id: "inertia", src: "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/InertiaPlugin.min.js" },
];

export const GSAP_INNOV_SCRIPTS: MotionScript[] = [
  { id: "gsap-innov", src: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" },
  { id: "scrolltrigger-innov", src: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" },
];

export function loadMotionScript(script: MotionScript): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-motion-id="${script.id}"]`);
    if (existing) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = script.src;
    el.dataset.motionId = script.id;
    if (script.type) el.type = script.type;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load motion script ${script.id}`));
    document.body.appendChild(el);
  });
}

export async function loadMotionSequence(scripts: MotionScript[]): Promise<void> {
  for (const script of scripts) {
    await loadMotionScript(script);
  }
}
