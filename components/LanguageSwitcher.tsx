"use client";

import { useLocale } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";

type Props = {
  id: string;
  className: string;
  switchToAr?: string;
  switchToEn?: string;
  arLabel?: string;
  enLabel?: string;
};

export function LanguageSwitcher({
  id,
  className,
  switchToAr = "التبديل إلى العربية",
  switchToEn = "Switch to English",
  arLabel = "العربية",
  enLabel = "EN",
}: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const nextLocale = locale === "ar" ? "en" : "ar";
  const isSwitchingToAr = nextLocale === "ar";
  const href = getPathname({ href: pathname || "/", locale: nextLocale });

  return (
    <a
      id={id}
      href={href}
      className={className}
      lang={nextLocale}
      hrefLang={nextLocale}
      aria-label={isSwitchingToAr ? switchToAr : switchToEn}
    >
      {isSwitchingToAr ? arLabel : enLabel}
    </a>
  );
}
