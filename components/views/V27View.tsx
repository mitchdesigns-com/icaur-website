import type { CmsPage } from "@/lib/cms";
import { CmsLink, CtaVideo, str } from "./shared";
import { readPageHtml } from "@/lib/readPageHtml";

export async function V27View({ page }: { page: CmsPage }) {
  const hero = page.hero || {};
  const overview = page.overview || {};
  const html = await readPageHtml("models-v27");
  const start = html.indexOf('<section id="v27-exterior">');
  const end = html.indexOf('<section class="cta-video"');
  const experience = start >= 0 && end > start ? html.slice(start, end) : "";

  return (
    <>
      <div className="eg-dotgrid-wrap" aria-hidden="true" />
      <div id="v27-canvas-wrap">
        <canvas id="v27-canvas" />
      </div>
      <section id="v27-hero">
        <div className="v27-hero-sticky">
          <video className="v27-hero-video" id="v27HeroVideo" src={str(hero, "videoSrc")} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
          <div className="v27-hero-scrim" aria-hidden="true" />
          <div className="v27-hero-top" id="v27-hero-top">
            <h1 className="v27-hero-h1" id="v27-hero-h1">
              {str(hero, "title")} <img src={str(hero, "logo") || "/assets/images/V27-logo.svg"} alt="V27" className="v27-model-logo-inline" aria-hidden="true" />
            </h1>
            <p className="v27-hero-sub" id="v27-hero-sub">{str(hero, "subtitle")}</p>
          </div>
          <div className="v27-hero-bottom" id="v27-hero-bottom">
            <CmsLink href={str(hero, "ctaHref", "/reserve")} className="v27-cta-btn v27-cta-btn--dark v27-hero-reserve-btn" id="v27-hero-cta">
              {str(hero, "ctaLabel")}
            </CmsLink>
          </div>
        </div>
      </section>
      <section id="v27-overview" aria-label="V27 overview">
        <div className="ovx-sticky">
          <div className="ovx-frame" id="ovxFrame">
            <div className="ovx-bg" aria-hidden="true">
              <img id="ovxBgImg" src={str(overview, "image")} alt="" />
            </div>
            <div className="ovx-shade" aria-hidden="true" />
            <div className="ovx-copy ovx-copy--lead" id="ovxLead">
              <p className="ovx-eyebrow">{str(overview, "eyebrow")}</p>
              <p className="ovx-para" data-ovx-split>{str(overview, "lead")}</p>
              <div className="ovx-rule" aria-hidden="true" />
              <span className="ovx-mark" role="img" aria-label="V27" />
            </div>
            <div className="ovx-copy ovx-copy--close" id="ovxClose">
              <p className="ovx-para ovx-para--close" data-ovx-split>{str(overview, "close")}</p>
              <div className="ovx-price">
                <span className="ovx-price__label">{str(overview, "priceLabel")}</span>
                <span className="ovx-price__value">{str(overview, "price")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div dangerouslySetInnerHTML={{ __html: experience }} />
      <CtaVideo cta={page.cta} />
    </>
  );
}
