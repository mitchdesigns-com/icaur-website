import { SiteChrome } from "@/components/SiteChrome";
import { AboutView } from "@/components/views/AboutView";
import { getPage, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

/** About — App Router entry (edge). */
export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "about");
  const page = await getPage("about", locale);
  return seoMetadata(page?.seo, fallback);
}

export default async function AboutPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const page = await getPage("about", locale);
  if (!page) notFound();
  const chrome = PAGE_CHROME.about;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts}>
      <AboutView page={page} />
    </SiteChrome>
  );
}
