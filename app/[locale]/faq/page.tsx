import { SiteChrome } from "@/components/SiteChrome";
import { FaqView } from "@/components/views/FaqView";
import { getFaqs, getPage, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "faq");
  const page = await getPage("faq", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function FaqPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const [page, faqs] = await Promise.all([getPage("faq", locale), getFaqs(locale)]);
  if (!page) notFound();
  const chrome = PAGE_CHROME.faq;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts}>
      <FaqView page={page} locale={locale} faqs={(faqs || []).filter((item) => item.category !== "home")} />
    </SiteChrome>
  );
}
