import { SiteChrome } from "@/components/SiteChrome";
import { resolvePageHtml } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { CORE_SCRIPTS } from "@/lib/site";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "about");
  const { page } = await resolvePageHtml("about", locale, "about");
  return page?.seo?.title ? { title: page.seo.title, description: page.seo.description } : fallback;
}

export default async function AboutPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const { page, html } = await resolvePageHtml("about", locale, "about");
  return (
    <SiteChrome
      locale={locale}
      page={page}
      html={html}
      fallbackBodyClass="is-loading"
      fallbackScripts={[
        ...CORE_SCRIPTS,
        { src: "/js/about-car.js" },
        { src: "/js/dot-field.js" },
        { src: "/js/doodles.js" },
        { src: "/js/about-thread.js" },
        { src: "/js/page/about.js" },
        { src: "/js/about-mv.js", type: "module" },
      ]}
    />
  );
}
