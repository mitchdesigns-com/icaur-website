import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS, GSAP_V27 } from "@/lib/site";

export const metadata: Metadata = {
  title: "iCAUR V27 — Experience the Future",
  description: "iCAUR — Egypt's next-generation electric vehicle. Built for every road.",
};

export default async function V27Page() {
  const html = await readPageHtml("models-v27");
  return (
    <SiteChrome
      bodyClass="v27-page"
      html={html}
      extraStyles={["/css/v27.css"]}
      scripts={[
        ...GSAP_V27,
        ...CORE_SCRIPTS,
        { src: "/js/page/models-v27.js" },
        { src: "/js/v27.js?v=67", type: "module" },
      ]}
    />
  );
}
