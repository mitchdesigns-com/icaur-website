import { BodyClass } from "@/components/BodyClass";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { GrainFilter } from "@/components/GrainFilter";
import { Header } from "@/components/Header";
import { LegacyScripts } from "@/components/LegacyScripts";
import { QuickNav } from "@/components/QuickNav";
import { cmsRuntime, loadChrome, type CmsPage, type CmsVehicleModel } from "@/lib/cms";
import type { SiteScript } from "@/lib/site";
import type { ReactNode } from "react";

type Props = {
  locale: string;
  children: ReactNode;
  bodyClass: string;
  scripts: SiteScript[];
  styles?: string[];
  page?: CmsPage | CmsVehicleModel | null;
};

export async function SiteChrome({ locale, children, bodyClass, scripts, styles = [], page }: Props) {
  const { global, locations, models } = await loadChrome(locale);
  const runtime = cmsRuntime(locations, models, page);

  return (
    <>
      {styles.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <BodyClass className={bodyClass} />
      <GrainFilter />
      <Cursor />
      <Header global={global} models={models} />
      {children}
      <Footer global={global} />
      <QuickNav global={global} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__ICAUR_CMS=${JSON.stringify(runtime)};`,
        }}
      />
      <LegacyScripts scripts={scripts} />
    </>
  );
}
