import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS, LEAFLET } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us — iCAUR",
  description: "Contact iCAUR — Get in touch with our team, find showrooms, or schedule a test drive.",
};

export default async function ContactPage() {
  const html = await readPageHtml("contact");
  return (
    <SiteChrome
      bodyClass="is-loading"
      html={html}
      extraStyles={["https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]}
      scripts={[...CORE_SCRIPTS, ...LEAFLET, { src: "/js/services.js" }, { src: "/js/page/contact.js" }]}
    />
  );
}
