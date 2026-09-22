import { SiteChrome } from "@/components/SiteChrome";
import { LegalView } from "@/components/views/LegalView";
import { getPage, seoMetadata } from "@/lib/cms";
import { PRIVACY_FALLBACK } from "@/lib/legalFallbacks";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "privacy");
  const page = (await getPage("privacy", locale)) || PRIVACY_FALLBACK;
  return seoMetadata(page?.seo, fallback);
}

export default async function PrivacyPolicyPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const page = (await getPage("privacy", locale)) || PRIVACY_FALLBACK;
  const chrome = PAGE_CHROME.legal;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts}>
      <LegalView page={page} />
    </SiteChrome>
  );
}
