import { SiteChrome } from "@/components/SiteChrome";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS } from "@/lib/site";

export default async function HomePage() {
  const html = await readPageHtml("home");
  return (
    <SiteChrome
      bodyClass="is-loading dark-hero-page"
      html={html}
      scripts={[...CORE_SCRIPTS, { src: "/js/dot-field.js" }]}
    />
  );
}
