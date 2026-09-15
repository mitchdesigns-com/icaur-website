import type { CmsPage } from "@/lib/cms";
import { CmsLink, CtaVideo, list, str, texts } from "./shared";

export function InnovationView({ page }: { page: CmsPage }) {
  const hero = page.hero || {};
  const technology = page.technology || {};
  const techItems = list(technology, "items");
  const pillars = Array.isArray(page.pillars) ? page.pillars : [];
  const rotates = [-14, 14, -12, 12];

  return (
    <main id="main">
      <section className="innov-page-hero" id="hero">
        <div className="innov-page-hero__bg" aria-hidden="true">
          <video className="innov-page-hero__video" src={str(hero, "videoSrc")} poster={str(hero, "posterSrc")} autoPlay muted loop playsInline preload="auto" />
        </div>
        <div className="innov-page-hero__overlay" aria-hidden="true" />
        <div className="innov-page-hero__inner">
          <p className="eyebrow eyebrow--warm reveal reveal--up" data-delay="0">{str(hero, "eyebrow")}</p>
          <h1 className="innov-page-hero__h reveal reveal--up" data-delay="1">
            {str(hero, "title")}
            <br />
            <em>{str(hero, "titleEm")}</em>
          </h1>
          <CmsLink href={str(hero, "ctaHref", "/reserve")} className="btn btn--filled btn--lg btn--arrow btn--magnetic reveal reveal--up" data-delay="3">
            {str(hero, "ctaLabel")} <span className="brand-name">iCAUR</span> <span className="arrow">→</span>
          </CmsLink>
        </div>
      </section>

      <section id="innov-tech" style={{ position: "relative", zIndex: 5, background: "#0D0B09" }}>
        <div className="v27-ct-sticky">
          <div className="v27-ct-liquid-bg" id="v27-ct-liquid-bg" aria-hidden="true" />
          <div className="v27-ct-vignette" aria-hidden="true" />
          <div className="v27-ct-head" id="v27-ct-head">
            <p className="v27-ct-eyebrow" id="v27-ct-eyebrow">{str(technology, "eyebrow")}</p>
            <div className="v27-ct-line-wrap">
              <div className="v27-ct-line1" id="v27-ct-line1">{str(technology, "line1")}</div>
              <div className="v27-ct-mask" id="v27-ct-mask1" />
            </div>
            <div className="v27-ct-line-wrap" style={{ marginBottom: 24 }}>
              <div className="v27-ct-line2" id="v27-ct-line2">{str(technology, "line2")}</div>
              <div className="v27-ct-mask" id="v27-ct-mask2" />
            </div>
            <p className="v27-ct-sub" id="v27-ct-sub">{str(technology, "sub")}</p>
          </div>
        </div>
        {techItems.map((item, index) => (
          <div className="v27-ct-item" data-rotate={rotates[index] ?? 12} key={str(item, "title")}>
            <div className="v27-ct-item-inner">
              <div className="v27-ct-left">
                <h3 className="v27-ct-title">{str(item, "title")}</h3>
              </div>
              <div className="v27-ct-center">
                <img className="v27-ct-img" src={str(item, "image")} alt={str(item, "imageAlt")} loading="lazy" />
              </div>
              <div className="v27-ct-right">
                <p className="v27-ct-label">{str(item, "label")}</p>
                <p className="v27-ct-desc">{str(item, "text")}</p>
                <div className="v27-ct-deco" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {pillars.map((pillar, index) => (
        <div className={`innov-pillar${index === 0 ? " innov-pillar--reverse innov-pillar--cream" : " innov-pillar--dark"}`} key={str(pillar, "tag")}>
          <div className="innov-pillar__img reveal reveal--up">
            <img src={str(pillar, "image")} alt={str(pillar, "imageAlt")} loading="lazy" />
          </div>
          <div className="innov-pillar__text">
            <p className="innov-pillar__num">{str(pillar, "num")}</p>
            <p className="innov-pillar__tag">{str(pillar, "tag")}</p>
            <h2 className="innov-pillar__h">
              {str(pillar, "title")}
              <br />
              {str(pillar, "titleEm")}
            </h2>
            <p className="innov-pillar__body">{str(pillar, "body")}</p>
            <div className="innov-pillar__bullets">
              {texts(pillar.bullets).map((bullet) => (
                <div className="innov-pillar__bullet" key={bullet}>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <CtaVideo cta={page.cta} />
    </main>
  );
}
