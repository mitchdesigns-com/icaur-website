import { BodyClass } from "@/components/BodyClass";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { GrainFilter } from "@/components/GrainFilter";
import { Header } from "@/components/Header";
import { LegacyScripts } from "@/components/LegacyScripts";
import { PageMarkup } from "@/components/PageMarkup";
import { QuickNav } from "@/components/QuickNav";
import {
  cmsRuntime,
  loadChrome,
  toSiteScripts,
  type CmsArticle,
  type CmsPage,
} from "@/lib/cms";
import type { SiteScript } from "@/lib/site";

type Props = {
  locale: string;
  page?: CmsPage | CmsArticle | null;
  html: string;
  fallbackBodyClass: string;
  fallbackScripts: SiteScript[];
  fallbackStyles?: string[];
};

export async function SiteChrome({
  locale,
  page,
  html,
  fallbackBodyClass,
  fallbackScripts,
  fallbackStyles = [],
}: Props) {
  const { global, locations, models } = await loadChrome(locale);
  const scripts = toSiteScripts(page?.scripts);
  const styles = page?.extraStyles?.length ? page.extraStyles : fallbackStyles;
  const runtime = cmsRuntime(locations, models);

  return (
    <>
      {styles.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <BodyClass className={page?.bodyClass || fallbackBodyClass} />
      <GrainFilter />
      <Cursor />
      <Header global={global} models={models} />
      <PageMarkup html={html} />
      <Footer global={global} />
      <QuickNav global={global} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__ICAUR_CMS=${JSON.stringify(runtime)};`,
        }}
      />
      <LegacyScripts scripts={scripts.length ? scripts : fallbackScripts} />
    </>
  );
}
