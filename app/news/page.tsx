import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "News — iCAUR",
  description:
    "iCAUR News — Latest updates, engineering insights, and announcements from Egypt's next-gen EV company.",
};

export default async function NewsPage() {
  const html = await readPageHtml("news");
  return (
    <SiteChrome
      bodyClass="is-loading"
      html={html}
      scripts={[...CORE_SCRIPTS, { src: "/js/page/news.js" }]}
    />
  );
}
