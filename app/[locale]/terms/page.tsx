import { redirect } from "@/i18n/navigation";
import { applyRequestLocale, asLocale, type LocaleParams } from "@/lib/pageMeta";

export const runtime = "edge";

export default async function TermsRedirectPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  redirect({ href: "/terms-and-conditions", locale: asLocale(locale) });
}
