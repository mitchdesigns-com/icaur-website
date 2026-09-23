import type { CmsLocation, CmsPage } from "@/lib/cms";
import { CmsLink, CtaVideo, list, str } from "./shared";
import { FindUsSection } from "./FindUsSection";

export function ServicesView({ page, locations = [] }: { page: CmsPage; locations?: CmsLocation[] }) {
  const hero = page.hero || {};
  const cards = list(page.hub, "cards");
  const findUs = page.findUs || {};
  return (
    <main id="main" className="font-body antialiased">
      <section className="svc-hero relative overflow-hidden" id="hero">
        <div className="svc-hero__bg" />
        <div className="svc-hero__grain" aria-hidden="true" />
        <div className="svc-hero__gradient" aria-hidden="true" />
        <div className="svc-hero__inner relative z-10 mx-auto max-w-site px-pad-x">
          <p className="eyebrow eyebrow--warm reveal reveal--up font-display" data-delay="0">{str(hero, "eyebrow")}</p>
          <h1 className="svc-hero__h reveal reveal--up font-display" data-delay="1">
            {str(hero, "title")}
            <br />
            {str(hero, "titleMid")} <em>{str(hero, "titleEm")}</em>
          </h1>
          <p className="svc-hero__sub reveal reveal--up font-body text-text-muted" data-delay="2">{str(hero, "subtitle")}</p>
        </div>
      </section>

      <section className="section svc-hub" id="explore">
        <div className="container mx-auto max-w-site px-pad-x">
          <div className="svc-hub__grid">
            {cards.map((card, index) => (
              <CmsLink href={str(card, "href")} className="svc-hub-card reveal reveal--up" data-delay={index} key={str(card, "href")}>
                <h3 className="svc-hub-card__h">{str(card, "title")}</h3>
                <p className="svc-hub-card__p">{str(card, "text")}</p>
                <span className="svc-hub-card__link">{str(card, "ctaLabel")} <span className="arrow">→</span></span>
              </CmsLink>
            ))}
          </div>
        </div>
      </section>

      <FindUsSection
        eyebrow={str(findUs, "eyebrow")}
        title={str(findUs, "title")}
        titleEm={str(findUs, "titleEm")}
        locations={locations}
      />

      <CtaVideo cta={page.cta} />
    </main>
  );
}
