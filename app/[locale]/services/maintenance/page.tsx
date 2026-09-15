import { SiteChrome } from "@/components/SiteChrome";
import { MaintenanceView } from "@/components/views/ServiceSubViews";
import { getPage, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "maintenance");
  const page = await getPage("services-maintenance", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function MaintenancePage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const page = await getPage("services-maintenance", locale);
  if (!page) notFound();
  const chrome = PAGE_CHROME["services-maintenance"];
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts}>
      <MaintenanceView page={page} />
    </SiteChrome>
  );
}
