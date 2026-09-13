import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS, GSAP_INNOV } from "@/lib/site";

export const metadata: Metadata = {
  title: "Innovation — iCAUR",
  description:
    "iCAUR Innovation — The technology, sustainability, and design principles driving Egypt's next-generation EV.",
};

export default async function InnovationPage() {
  const html = await readPageHtml("innovation");
  return (
    <SiteChrome
      bodyClass="is-loading dark-hero-page"
      html={html}
      extraStyles={["/css/v27.css"]}
      scripts={[...CORE_SCRIPTS, ...GSAP_INNOV, { src: "/js/page/innovation.js" }]}
    />
  );
}
