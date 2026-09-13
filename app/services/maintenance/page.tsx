import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Maintenance Schedules — iCAUR",
  description:
    "iCAUR Maintenance Schedules — factory-recommended service intervals for V27 and O3T, plus instant booking through the iCAUR app.",
};

export default async function MaintenancePage() {
  const html = await readPageHtml("services-maintenance");
  return (
    <SiteChrome
      bodyClass="is-loading dark-hero-page"
      html={html}
      scripts={[...CORE_SCRIPTS, { src: "/js/doodles.js" }, { src: "/js/services.js" }]}
    />
  );
}
