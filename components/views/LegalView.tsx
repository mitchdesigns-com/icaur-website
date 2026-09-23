import type { CmsPage } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { str } from "./shared";

type LegalSection = {
  heading?: string;
  body?: string;
};

type Props = {
  page: CmsPage;
};

function paragraphs(body?: string) {
  return String(body || "")
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function LegalView({ page }: Props) {
  const hero = page.hero || {};
  const sections = (Array.isArray(page.sections) ? page.sections : []) as LegalSection[];
  const updatedLabel = str(hero, "updatedLabel");
  const updatedOn = str(hero, "updatedOn");

  return (
    <main id="main" className="bg-white font-body antialiased">
      <section className={cn("post-hero", "bg-white pt-[clamp(80px,10vh,140px)] pb-0")}>
        <div className={cn("post-hero__inner", "mx-auto max-w-[780px] px-10 max-md:px-5")}>
          <p className={cn("eyebrow", "reveal reveal--up font-display text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted")} data-delay="0">
            {str(hero, "eyebrow")}
          </p>
          <h1
            className={cn(
              "post-hero__h",
              "reveal reveal--up font-display text-[clamp(2rem,4.5vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.035em] text-black"
            )}
            data-delay="1"
          >
            {str(hero, "title")}{" "}
            {str(hero, "titleEm") ? <em className="text-amber not-italic">{str(hero, "titleEm")}</em> : null}
          </h1>
          {updatedLabel || updatedOn ? (
            <div className={cn("post-meta", "reveal reveal--up mt-5 mb-11 flex flex-wrap items-center gap-[14px] text-[13px] text-text-muted")} data-delay="2">
              <span>
                {updatedLabel}
                {updatedLabel && updatedOn ? " " : ""}
                {updatedOn}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <article
        className={cn(
          "post-body",
          "reveal reveal--up mx-auto max-w-[900px] bg-white px-[clamp(20px,8vw,120px)] pb-[clamp(64px,8vh,120px)]"
        )}
      >
        {sections.map((section, index) => (
          <div key={`${section.heading || "section"}-${index}`}>
            {section.heading ? (
              <h2 className="mb-[0.65em] mt-[2.5em] font-display text-[clamp(1.3rem,2.2vw,1.75rem)] font-bold tracking-[-0.025em] text-black">
                {section.heading}
              </h2>
            ) : null}
            {paragraphs(section.body).map((para) => (
              <p key={para.slice(0, 48)} className="mb-[1.4em] text-[clamp(15px,1.15vw,17px)] leading-[1.82] text-text-mid">
                {para}
              </p>
            ))}
          </div>
        ))}
      </article>
    </main>
  );
}
