import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Brand button — Tailwind utilities mirror public/css `.btn` metrics exactly.
 * Legacy `btn` / `btn--*` classes are kept so magnetic / JS hooks keep working
 * until those scripts are ported.
 */

type Variant = "filled" | "dark" | "amber" | "ghost" | "outline" | "outline-dark" | "outline-light" | "reserve";
type Size = "md" | "lg" | "sm";

const base =
  "relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full border-2 border-transparent font-display text-[12px] font-bold uppercase tracking-[0.08em] transition-[background,color,border-color,box-shadow,transform] duration-sm ease-out-brand";

const sizes: Record<Size, string> = {
  md: "px-[30px] py-[14px] text-[12px]",
  lg: "px-[38px] py-[17px] text-[13px]",
  sm: "px-5 py-2.5 text-[11px]",
};

const variants: Record<Variant, string> = {
  filled: "bg-amber text-white border-amber hover:bg-amber-mid hover:border-amber-mid",
  dark: "bg-black text-white border-black",
  amber: "bg-amber text-white border-amber hover:bg-amber-mid hover:border-amber-mid",
  ghost: "bg-transparent text-text-dark border-transparent hover:border-amber hover:text-amber",
  outline: "bg-transparent text-text-dark border-text-dark/20 hover:border-amber hover:text-amber",
  "outline-dark": "bg-transparent text-black border-black hover:bg-black hover:text-white",
  "outline-light": "bg-transparent text-white border-white/40 hover:border-white hover:bg-white/10",
  reserve: "bg-amber text-white border-amber",
};

const legacyVariant: Record<Variant, string> = {
  filled: "btn--filled",
  dark: "btn--dark",
  amber: "btn--amber",
  ghost: "btn--ghost",
  outline: "btn--outline",
  "outline-dark": "btn--outline-dark",
  "outline-light": "btn--outline-light",
  reserve: "btn--reserve",
};

type Common = {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = Common &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "filled",
  size = "md",
  magnetic = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "btn",
    legacyVariant[variant],
    size === "lg" && "btn--lg",
    size === "sm" && "btn--sm",
    magnetic && "btn--magnetic",
    base,
    sizes[size],
    variants[variant],
    className
  );

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <a href={href} className={classes} {...linkRest}>
        {children}
      </a>
    );
  }

  const buttonRest = rest as ButtonAsButton;
  return (
    <button type={buttonRest.type || "button"} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
