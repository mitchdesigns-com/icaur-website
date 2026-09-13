import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs — iCAUR",
  description:
    "iCAUR FAQs — Answers to your most common questions about iCAUR vehicles, reservations, warranty, and services.",
};

export default async function FaqPage() {
  const html = await readPageHtml("faq");
  return (
    <SiteChrome
      bodyClass="is-loading"
      html={html}
      scripts={[...CORE_SCRIPTS, { src: "/js/page/faq.js" }]}
    />
  );
}
