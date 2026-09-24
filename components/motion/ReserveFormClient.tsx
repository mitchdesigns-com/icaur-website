"use client";

import { useEffect, useRef } from "react";
import { modelsMatch } from "@/lib/reserveModel";
import { loadMotionScript } from "@/lib/motion/registry";

/**
 * Typed entry for reserve form behavior (public/js/page/reserve.js).
 * Also preselects the model from ?model= or the /models/{slug} referrer.
 */
export function ReserveFormClient({ preferredModel }: { preferredModel?: string }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void loadMotionScript({ id: "page-reserve", src: "/js/page/reserve.js" });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let preferred = params.get("model") || preferredModel || "";
    if (!preferred) {
      const refMatch = (document.referrer || "").match(/\/models\/([^/?#]+)/i);
      if (refMatch?.[1]) preferred = decodeURIComponent(refMatch[1]);
    }
    if (!preferred) return;

    const radios = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[name="rv-model"]'),
    );
    if (!radios.length) return;

    const target = radios.find((radio) => modelsMatch(radio.value, preferred)) || null;
    if (!target || target.checked) return;
    target.checked = true;
    target.dispatchEvent(new Event("change", { bubbles: true }));
  }, [preferredModel]);

  return null;
}
