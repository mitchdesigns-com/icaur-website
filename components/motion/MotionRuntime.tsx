"use client";

import { useEffect } from "react";
import { loadMotionSequence, type MotionScript } from "@/lib/motion/registry";

type Props = {
  scripts: MotionScript[];
};

/**
 * Typed sequential loader for GSAP/core/v27 scripts.
 * Replaces ad-hoc script injection while preserving CDN load order.
 *
 * loadMotionScript is idempotent via data-motion-id, so remounts are safe.
 * Do not abort the sequence on effect cleanup — a cancelled first run would
 * leave animations dead until a full hard navigation.
 */
export function MotionRuntime({ scripts }: Props) {
  const key = scripts.map((s) => s.id).join("|");

  useEffect(() => {
    if (scripts.length === 0) return;

    void loadMotionSequence(scripts).catch((error) => {
      console.error(error);
    });
  }, [key, scripts]);

  return null;
}
