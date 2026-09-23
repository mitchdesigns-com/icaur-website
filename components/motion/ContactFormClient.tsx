"use client";

import { useEffect, useRef } from "react";
import { loadMotionScript } from "@/lib/motion/registry";

/**
 * Typed entry for contact form behavior (public/js/page/contact.js).
 * Loads once from the client island so PAGE_CHROME no longer ships contact.js.
 */
export function ContactFormClient() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void loadMotionScript({ id: "page-contact", src: "/js/page/contact.js" });
  }, []);

  return null;
}
