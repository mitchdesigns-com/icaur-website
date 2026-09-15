import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale, routing } from "@/i18n/routing";

export type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export function localeStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function asLocale(value: string): Locale {
  if (routing.locales.includes(value as Locale)) return value as Locale;
  return routing.defaultLocale;
}

export function applyRequestLocale(locale: string): Locale {
  const resolved = asLocale(locale);
  setRequestLocale(resolved);
  return resolved;
}

type MetaKey =
  | "home"
  | "about"
  | "contact"
  | "faq"
  | "innovation"
  | "news"
  | "reserve"
  | "services"
  | "maintenance"
  | "programs"
  | "warranty"
  | "v27"
  | `newsArticles.${string}`;

export async function pageMeta(
  locale: string,
  key: MetaKey
): Promise<{ title: string; description: string }> {
  const t = await getTranslations({
    locale: asLocale(locale),
    namespace: `meta.${key}` as "meta.home",
  });
  return {
    title: t("title"),
    description: t("description"),
  };
}
