import {
  CORE_MOTION,
  GSAP_V27_SCRIPTS,
  loadMotionSequence,
  type MotionScript,
} from "./registry";

const V27_PAGE: MotionScript[] = [
  { id: "models-v27", src: "/js/page/models-v27.js" },
  { id: "v27", src: "/js/v27.js?v=77", type: "module" },
];

/**
 * TypeScript entry for V27 model-page motion (GSAP + Three + v27.js).
 * Scripts stay byte-compatible with the legacy public/js implementations.
 */
export async function initV27Motion(): Promise<void> {
  await loadMotionSequence([...GSAP_V27_SCRIPTS, ...CORE_MOTION, ...V27_PAGE]);
}

export { GSAP_V27_SCRIPTS, V27_PAGE };
