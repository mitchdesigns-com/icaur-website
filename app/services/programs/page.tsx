import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Programs — iCAUR",
  description:
    "iCAUR Programs — extended coverage and protection plans that go beyond the standard warranty, built around your driving life.",
};

export default async function ProgramsPage() {
  const html = await readPageHtml("services-programs");
  return (
    <SiteChrome
      bodyClass="is-loading dark-hero-page"
      html={html}
      scripts={[...CORE_SCRIPTS, { src: "/js/doodles.js" }]}
    />
  );
}
