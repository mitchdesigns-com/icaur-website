import { BodyClass } from "@/components/BodyClass";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { GrainFilter } from "@/components/GrainFilter";
import { Header } from "@/components/Header";
import { LegacyScripts } from "@/components/LegacyScripts";
import { PageMarkup } from "@/components/PageMarkup";
import { QuickNav } from "@/components/QuickNav";
import type { SiteScript } from "@/lib/site";

type Props = {
  bodyClass: string;
  html: string;
  scripts: SiteScript[];
  extraStyles?: string[];
};

export function SiteChrome({ bodyClass, html, scripts, extraStyles = [] }: Props) {
  return (
    <>
      {extraStyles.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <BodyClass className={bodyClass} />
      <GrainFilter />
      <Cursor />
      <Header />
      <PageMarkup html={html} />
      <Footer />
      <QuickNav />
      <LegacyScripts scripts={scripts} />
    </>
  );
}
