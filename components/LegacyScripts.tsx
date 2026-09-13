"use client";

import { useEffect } from "react";
import type { SiteScript } from "@/lib/site";

type Props = {
  scripts: SiteScript[];
};

function loadScript(script: SiteScript): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${script.src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = script.src;
    if (script.type) el.type = script.type;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${script.src}`));
    document.body.appendChild(el);
  });
}

export function LegacyScripts({ scripts }: Props) {
  const key = scripts.map((script) => script.src).join("|");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      for (const script of scripts) {
        if (cancelled) return;
        try {
          await loadScript(script);
        } catch (error) {
          console.error(error);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [key, scripts]);

  return null;
}
