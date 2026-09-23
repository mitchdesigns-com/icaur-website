"use client";

import { useEffect, useRef } from "react";
import { loadMotionScript } from "@/lib/motion/registry";

/**
 * Typed entry for reserve form behavior (public/js/page/reserve.js).
 * Loads once from the client island so PAGE_CHROME no longer ships reserve.js.
 */
export function ReserveFormClient() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void loadMotionScript({ id: "page-reserve", src: "/js/page/reserve.js" });
  }, []);

  return null;
}
