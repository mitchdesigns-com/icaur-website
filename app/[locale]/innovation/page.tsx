import { SiteChrome } from "@/components/SiteChrome";
import { InnovationView } from "@/components/views/InnovationView";
import { getPage, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "innovation");
  const page = await getPage("innovation", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function InnovationPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const page = await getPage("innovation", locale);
  if (!page) notFound();
  const chrome = PAGE_CHROME.innovation;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts} styles={chrome.styles}>
      <InnovationView page={page} />
    </SiteChrome>
  );
}
