import type { CmsPage } from "@/lib/cms";
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
    <main id="main">
      <section className="post-hero">
        <div className="post-hero__inner">
          <p className="eyebrow reveal reveal--up" data-delay="0">
            {str(hero, "eyebrow")}
          </p>
          <h1 className="post-hero__h reveal reveal--up" data-delay="1">
            {str(hero, "title")}{" "}
            {str(hero, "titleEm") ? <em>{str(hero, "titleEm")}</em> : null}
          </h1>
          {updatedLabel || updatedOn ? (
            <div className="post-meta reveal reveal--up" data-delay="2">
              <span>
                {updatedLabel}
                {updatedLabel && updatedOn ? " " : ""}
                {updatedOn}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <article className="post-body reveal reveal--up">
        {sections.map((section, index) => (
          <div key={`${section.heading || "section"}-${index}`}>
            {section.heading ? <h2>{section.heading}</h2> : null}
            {paragraphs(section.body).map((para) => (
              <p key={para.slice(0, 48)}>{para}</p>
            ))}
          </div>
        ))}
      </article>
    </main>
  );
}
