import { SiteChrome } from "@/components/SiteChrome";
import { resolvePageHtml } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { CORE_SCRIPTS, LEAFLET } from "@/lib/site";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "services");
  const { page } = await resolvePageHtml("services", locale, "services");
  return page?.seo?.title ? { title: page.seo.title, description: page.seo.description } : fallback;
}

export default async function ServicesPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const { page, html } = await resolvePageHtml("services", locale, "services");
  return (
    <SiteChrome
      locale={locale}
      page={page}
      html={html}
      fallbackBodyClass="is-loading dark-hero-page"
      fallbackStyles={["https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]}
      fallbackScripts={[...CORE_SCRIPTS, { src: "/js/doodles.js" }, ...LEAFLET, { src: "/js/services.js" }]}
    />
  );
}
