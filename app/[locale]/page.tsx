import { SiteChrome } from "@/components/SiteChrome";
import { resolvePageHtml } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { CORE_SCRIPTS } from "@/lib/site";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "home");
  const { page } = await resolvePageHtml("home", locale, "home");
  return page?.seo?.title ? { title: page.seo.title, description: page.seo.description } : fallback;
}

export default async function HomePage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const { page, html } = await resolvePageHtml("home", locale, "home");
  return (
    <SiteChrome
      locale={locale}
      page={page}
      html={html}
      fallbackBodyClass="is-loading dark-hero-page"
      fallbackScripts={[...CORE_SCRIPTS, { src: "/js/dot-field.js" }]}
    />
  );
}
