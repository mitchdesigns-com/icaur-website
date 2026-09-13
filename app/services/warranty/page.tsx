import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Warranty — iCAUR",
  description:
    "iCAUR Warranty — comprehensive coverage from day one for every V27 and O3T. Complete peace of mind, in writing.",
};

export default async function WarrantyPage() {
  const html = await readPageHtml("services-warranty");
  return (
    <SiteChrome
      bodyClass="is-loading dark-hero-page"
      html={html}
      scripts={[...CORE_SCRIPTS, { src: "/js/doodles.js" }]}
    />
  );
}
