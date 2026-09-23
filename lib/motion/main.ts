import { CORE_MOTION, loadMotionSequence, type MotionScript } from "./registry";

/**
 * TypeScript entry for core site motion (formerly public/js/main.js + chrome).
 * Implementation remains in public/js for animation fidelity; this module
 * owns typed load order inside the Next.js runtime.
 */
export async function initMainMotion(extra: MotionScript[] = []): Promise<void> {
  await loadMotionSequence([...CORE_MOTION, ...extra]);
}

export { CORE_MOTION };
