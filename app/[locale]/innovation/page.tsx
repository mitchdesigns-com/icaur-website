import { SiteChrome } from "@/components/SiteChrome";
import { resolvePageHtml } from "@/lib/cms";
import { applyRequestLocale, type LocaleParams, pageMeta } from "@/lib/pageMeta";
import { CORE_SCRIPTS, GSAP_INNOV } from "@/lib/site";

export const runtime = "edge";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const fallback = await pageMeta(locale, "innovation");
  const { page } = await resolvePageHtml("innovation", locale, "innovation");
  return page?.seo?.title ? { title: page.seo.title, description: page.seo.description } : fallback;
}

export default async function InnovationPage({ params }: LocaleParams) {
  const { locale } = await params;
  applyRequestLocale(locale);
  const { page, html } = await resolvePageHtml("innovation", locale, "innovation");
  return (
    <SiteChrome
      locale={locale}
      page={page}
      html={html}
      fallbackBodyClass="is-loading dark-hero-page"
      fallbackStyles={["/css/v27.css"]}
      fallbackScripts={[...CORE_SCRIPTS, ...GSAP_INNOV, { src: "/js/page/innovation.js" }]}
    />
  );
}
