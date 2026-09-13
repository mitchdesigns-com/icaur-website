import { SiteChrome } from "@/components/SiteChrome";
import { resolvePageHtml } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { CORE_SCRIPTS } from "@/lib/site";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "programs");
  const { page } = await resolvePageHtml("services-programs", locale, "services-programs");
  return page?.seo?.title ? { title: page.seo.title, description: page.seo.description } : fallback;
}

export default async function ProgramsPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const { page, html } = await resolvePageHtml("services-programs", locale, "services-programs");
  return (
    <SiteChrome
      locale={locale}
      page={page}
      html={html}
      fallbackBodyClass="is-loading dark-hero-page"
      fallbackScripts={[...CORE_SCRIPTS, { src: "/js/doodles.js" }]}
    />
  );
}
