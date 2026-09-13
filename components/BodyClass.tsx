"use client";

import { useEffect } from "react";

type Props = {
  className: string;
};

export function BodyClass({ className }: Props) {
  useEffect(() => {
    const tokens = className.split(/\s+/).filter(Boolean);
    document.body.classList.add(...tokens);
    return () => {
      document.body.classList.remove(...tokens);
    };
  }, [className]);

  return null;
}
