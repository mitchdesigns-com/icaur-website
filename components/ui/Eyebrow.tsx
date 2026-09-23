import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  /** White pill on dark heroes — matches `.eyebrow--badge` */
  badge?: boolean;
};

/**
 * Section eyebrow — matches legacy `.eyebrow` typography.
 * Keep passing any JS/CSS hook classes via `className`.
 */
export function Eyebrow({ children, badge = false, className, ...rest }: Props) {
  return (
    <p
      className={cn(
        "font-display text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted",
        badge &&
          "inline-flex rounded-full bg-white/12 px-3 py-1.5 text-white backdrop-blur-[2px]",
        "eyebrow",
        badge && "eyebrow--badge",
        className
      )}
      {...rest}
    >
      {children}
    </p>
  );
}
