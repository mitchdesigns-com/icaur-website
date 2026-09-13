import { SiteChrome } from "@/components/SiteChrome";
import { resolvePageHtml } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { CORE_SCRIPTS, GSAP_V27 } from "@/lib/site";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "v27");
  const { page } = await resolvePageHtml("models-v27", locale, "models-v27");
  return page?.seo?.title ? { title: page.seo.title, description: page.seo.description } : fallback;
}

export default async function V27Page({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const { page, html } = await resolvePageHtml("models-v27", locale, "models-v27");
  return (
    <SiteChrome
      locale={locale}
      page={page}
      html={html}
      fallbackBodyClass="v27-page"
      fallbackStyles={["/css/v27.css"]}
      fallbackScripts={[
        ...GSAP_V27,
        ...CORE_SCRIPTS,
        { src: "/js/page/models-v27.js" },
        { src: "/js/v27.js?v=67", type: "module" },
      ]}
    />
  );
}
