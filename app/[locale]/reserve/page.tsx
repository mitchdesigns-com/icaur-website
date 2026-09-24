import { SiteChrome } from "@/components/SiteChrome";
import { ReserveView } from "@/components/views/ReserveView";
import { getLocations, getPage, getVehicleModels, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "reserve");
  const page = await getPage("reserve", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function ReservePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ model?: string | string[] }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  applyRequestLocale(locale);
  const [page, models, locations] = await Promise.all([
    getPage("reserve", locale),
    getVehicleModels(locale),
    getLocations(locale),
  ]);
  if (!page) notFound();
  const chrome = PAGE_CHROME.reserve;
  const preferredModel = Array.isArray(query.model) ? query.model[0] : query.model;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts}>
      <ReserveView
        page={page}
        models={models || []}
        locations={locations || []}
        preferredModel={preferredModel}
      />
    </SiteChrome>
  );
}
