import { SiteChrome } from "@/components/SiteChrome";
import { V27View } from "@/components/views/V27View";
import { getPage, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "v27");
  const page = await getPage("models-v27", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function V27Page({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const page = await getPage("models-v27", locale);
  if (!page) notFound();
  const chrome = PAGE_CHROME["models-v27"];
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts} styles={chrome.styles} page={page}>
      <V27View page={page} />
    </SiteChrome>
  );
}
