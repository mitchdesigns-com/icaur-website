"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

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
  const router = useRouter();
  const pathname = usePathname();
  const nextLocale = locale === "ar" ? "en" : "ar";
  const isSwitchingToAr = nextLocale === "ar";

  return (
    <button
      type="button"
      id={id}
      className={className}
      lang={nextLocale}
      aria-label={isSwitchingToAr ? switchToAr : switchToEn}
      onClick={() => router.replace(pathname, { locale: nextLocale })}
    >
      {isSwitchingToAr ? arLabel : enLabel}
    </button>
  );
}
