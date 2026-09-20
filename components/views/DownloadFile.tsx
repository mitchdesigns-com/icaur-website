"use client";

import type { MouseEvent, ReactNode } from "react";

type Props = {
  href?: string;
  filename?: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

function isSameOrigin(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

export function DownloadFile({ href = "", filename, className, children, ...rest }: Props) {
  const src = href && href !== "#" ? href : "";

  async function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!src) {
      event.preventDefault();
      return;
    }
    if (isSameOrigin(src)) return;
    event.preventDefault();
    const name = filename || src.split("/").pop()?.split("?")[0] || "download";
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <a href={src || undefined} download={filename || true} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}
