import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reserve — iCAUR",
  description: "Reserve your iCAUR — Secure your V27 or O3T with a fully refundable deposit today.",
};

export default async function ReservePage() {
  const html = await readPageHtml("reserve");
  return (
    <SiteChrome
      bodyClass="is-loading dark-hero-page"
      html={html}
      scripts={[...CORE_SCRIPTS, { src: "/js/page/reserve.js" }]}
    />
  );
}
