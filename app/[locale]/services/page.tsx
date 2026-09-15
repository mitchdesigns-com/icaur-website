import { SiteChrome } from "@/components/SiteChrome";
import { ServicesView } from "@/components/views/ServicesView";
import { getPage, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "services");
  const page = await getPage("services", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function ServicesPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const page = await getPage("services", locale);
  if (!page) notFound();
  const chrome = PAGE_CHROME.services;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts} styles={chrome.styles}>
      <ServicesView page={page} />
    </SiteChrome>
  );
}
