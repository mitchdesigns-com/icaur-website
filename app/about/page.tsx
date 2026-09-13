import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — iCAUR",
  description: "About iCAUR — Egypt's next-generation EV company. Our story, mission, and values.",
};

export default async function AboutPage() {
  const html = await readPageHtml("about");
  return (
    <SiteChrome
      bodyClass="is-loading"
      html={html}
      scripts={[
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
