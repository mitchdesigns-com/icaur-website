"use client";

import type { ReactNode } from "react";

type Props = {
  href?: string;
  filename?: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

export function DownloadFile({ href = "", filename, className, children, ...rest }: Props) {
  const src = href && href !== "#" ? href : "";

  if (!src) {
    return (
      <span className={className} aria-disabled="true" {...rest}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={src}
      download={filename || true}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}
