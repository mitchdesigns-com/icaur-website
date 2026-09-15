import { SiteChrome } from "@/components/SiteChrome";
import { ProgramsView } from "@/components/views/ServiceSubViews";
import { getPage, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "programs");
  const page = await getPage("services-programs", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function ProgramsPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const page = await getPage("services-programs", locale);
  if (!page) notFound();
  const chrome = PAGE_CHROME["services-programs"];
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts}>
      <ProgramsView page={page} />
    </SiteChrome>
  );
}
