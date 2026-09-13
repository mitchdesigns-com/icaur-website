import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

function isAppLocale(value: string | undefined): value is (typeof routing.locales)[number] {
  return !!value && routing.locales.includes(value as (typeof routing.locales)[number]);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isAppLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
