import { SiteChrome } from "@/components/SiteChrome";
import { ContactView } from "@/components/views/ContactView";
import { getLocations, getPage, getVehicleModels, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "contact");
  const page = await getPage("contact", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function ContactPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const [page, locations, models] = await Promise.all([
    getPage("contact", locale),
    getLocations(locale),
    getVehicleModels(locale),
  ]);
  if (!page) notFound();
  const chrome = PAGE_CHROME.contact;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts} styles={chrome.styles}>
      <ContactView page={page} locations={locations || []} models={models || []} />
    </SiteChrome>
  );
}
