import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Match legacy `.container` max-width + horizontal pad */
  narrow?: boolean;
};

/**
 * Site container — mirrors legacy `.container` (max 1440px, pad-x 60px).
 */
export function Container({ children, className, narrow = false, ...rest }: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-site px-pad-x",
        narrow && "max-w-4xl",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
