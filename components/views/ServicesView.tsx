import type { CmsPage } from "@/lib/cms";
import { CmsLink, CtaVideo, list, str } from "./shared";

export function ServicesView({ page }: { page: CmsPage }) {
  const hero = page.hero || {};
  const cards = list(page.hub, "cards");
  const findUs = page.findUs || {};
  return (
    <main id="main">
      <section className="svc-hero" id="hero">
        <div className="svc-hero__bg" />
        <div className="svc-hero__grain" aria-hidden="true" />
        <div className="svc-hero__gradient" aria-hidden="true" />
        <div className="svc-hero__inner">
          <p className="eyebrow eyebrow--warm reveal reveal--up" data-delay="0">{str(hero, "eyebrow")}</p>
          <h1 className="svc-hero__h reveal reveal--up" data-delay="1">
            {str(hero, "title")}
            <br />
            {str(hero, "titleMid")} <em>{str(hero, "titleEm")}</em>
          </h1>
          <p className="svc-hero__sub reveal reveal--up" data-delay="2">{str(hero, "subtitle")}</p>
        </div>
      </section>

      <section className="section svc-hub" id="explore">
        <div className="container">
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

      <section id="find-us" className="find-us">
        <div className="find-us__grid">
          <div className="find-us__left">
            <div className="find-us__header" id="findUsHeader">
              <p className="eyebrow eyebrow--warm">{str(findUs, "eyebrow")}</p>
              <h2 className="find-us__h">{str(findUs, "title")}<br /><em>{str(findUs, "titleEm")}</em></h2>
            </div>
            <div className="find-us__list" id="findUsList" />
          </div>
          <div className="find-us-map-wrap" id="findUsMapWrap">
            <div id="findUsMap" />
          </div>
        </div>
      </section>

      <CtaVideo cta={page.cta} />
    </main>
  );
}
