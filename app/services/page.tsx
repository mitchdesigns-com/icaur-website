import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS, LEAFLET } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services — iCAUR",
  description: "iCAUR Services — Maintenance, warranty, service centers, and 24/7 support.",
};

export default async function ServicesPage() {
  const html = await readPageHtml("services");
  return (
    <SiteChrome
      bodyClass="is-loading dark-hero-page"
      html={html}
      extraStyles={["https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]}
      scripts={[...CORE_SCRIPTS, { src: "/js/doodles.js" }, ...LEAFLET, { src: "/js/services.js" }]}
    />
  );
}
