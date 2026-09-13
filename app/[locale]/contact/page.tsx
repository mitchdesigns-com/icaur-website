import { SiteChrome } from "@/components/SiteChrome";
import { resolvePageHtml } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { CORE_SCRIPTS, LEAFLET } from "@/lib/site";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "contact");
  const { page } = await resolvePageHtml("contact", locale, "contact");
  return page?.seo?.title ? { title: page.seo.title, description: page.seo.description } : fallback;
}

export default async function ContactPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const { page, html } = await resolvePageHtml("contact", locale, "contact");
  return (
    <SiteChrome
      locale={locale}
      page={page}
      html={html}
      fallbackBodyClass="is-loading"
      fallbackStyles={["https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]}
      fallbackScripts={[...CORE_SCRIPTS, ...LEAFLET, { src: "/js/services.js" }, { src: "/js/page/contact.js" }]}
    />
  );
}
