import { SiteChrome } from "@/components/SiteChrome";
import { ModelView } from "@/components/views/V27View";
import { getPage, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "o3t");
  const page = await getPage("models-o3t", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function O3TPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const page = await getPage("models-o3t", locale);
  if (!page) notFound();
  const chrome = PAGE_CHROME["models-o3t"];
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts} styles={chrome.styles} page={page}>
      <ModelView page={page} mark="O3T" />
    </SiteChrome>
  );
}
