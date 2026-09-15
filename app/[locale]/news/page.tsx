import { SiteChrome } from "@/components/SiteChrome";
import { NewsView } from "@/components/views/NewsView";
import { getArticles, getPage, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "news");
  const page = await getPage("news", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function NewsPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const [page, articles] = await Promise.all([getPage("news", locale), getArticles(locale)]);
  if (!page) notFound();
  const chrome = PAGE_CHROME.news;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts}>
      <NewsView page={page} articles={articles || []} locale={locale} />
    </SiteChrome>
  );
}
