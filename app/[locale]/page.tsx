import { SiteChrome } from "@/components/SiteChrome";
import { HomeView } from "@/components/views/HomeView";
import { getArticles, getFaqs, getPage, getVehicleModels, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "home");
  const page = await getPage("home", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function HomePage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const [page, models, articles, faqs] = await Promise.all([
    getPage("home", locale),
    getVehicleModels(locale),
    getArticles(locale),
    getFaqs(locale),
  ]);
  if (!page) notFound();
  const chrome = PAGE_CHROME.home;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts}>
      <HomeView page={page} models={models || []} articles={articles || []} faqs={faqs || []} locale={locale} />
    </SiteChrome>
  );
}
