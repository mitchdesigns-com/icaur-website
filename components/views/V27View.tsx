import type { CmsPage } from "@/lib/cms";
import { rewriteHtmlAssets } from "@/lib/publicAssets";
import { CmsLink, CtaVideo, str } from "./shared";
import { readPageHtml } from "@/lib/readPageHtml";

function PriceValue({ price, unit }: { price: string; unit: string }) {
  if (unit) {
    return (
      <>
        {price} <em>{unit}</em>
      </>
    );
  }
  const match = price.match(/^(.*?)(\s+)([A-Za-z\u0600-\u06FF]+)$/);
  if (match) {
    return (
      <>
        {match[1]} <em>{match[3]}</em>
      </>
    );
  }
  return <>{price}</>;
}

export async function ModelView({
  page,
  htmlId,
  mark = "V27",
}: {
  page: CmsPage;
  htmlId?: string;
  mark?: string;
}) {
  const hero = page.hero || {};
  const overview = page.overview || {};
  const videoSrc = str(hero, "videoSrc");
  const logo = str(hero, "logo");
  const brochureLabel = str(overview, "brochureLabel");
  const brochureHref = str(overview, "brochureHref", "/assets/docs/iCAUR-V27-Brochure.pdf");
  let experience = "";
  if (htmlId) {
    const html = await readPageHtml(htmlId);
    const start = html.indexOf('<section id="v27-exterior">');
    const end = html.indexOf('<section class="cta-video"');
    experience = start >= 0 && end > start ? rewriteHtmlAssets(html.slice(start, end)) : "";
  }

  return (
    <>
      <div className="eg-dotgrid-wrap" aria-hidden="true" />
      <div id="v27-canvas-wrap">
        <canvas id="v27-canvas" />
      </div>
      <section id="v27-hero">
        <div className="v27-hero-sticky">
          {videoSrc ? (
            <video className="v27-hero-video" id="v27HeroVideo" src={videoSrc} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
          ) : (
            <img className="v27-hero-video" src={str(overview, "image")} alt="" />
          )}
          <div className="v27-hero-scrim" aria-hidden="true" />
          <div className="v27-hero-top" id="v27-hero-top">
            <h1 className="v27-hero-h1" id="v27-hero-h1">
              {str(hero, "title")} {logo ? <img src={logo} alt={mark} className="v27-model-logo-inline" aria-hidden="true" /> : mark}
            </h1>
            <p className="v27-hero-sub" id="v27-hero-sub">{str(hero, "subtitle")}</p>
          </div>
          <div className="v27-hero-bottom" id="v27-hero-bottom">
            <CmsLink href={str(hero, "ctaHref", "/reserve")} className="v27-cta-btn v27-cta-btn--dark v27-hero-reserve-btn" id="v27-hero-cta">
              {str(hero, "ctaLabel")}
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </CmsLink>
          </div>
        </div>
      </section>
      <section id="v27-overview" aria-label={`${mark} overview`}>
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
              <span className="ovx-mark" role="img" aria-label={mark} />
            </div>
            <div className="ovx-copy ovx-copy--close" id="ovxClose">
              <p className="ovx-para ovx-para--close" data-ovx-split>{str(overview, "close")}</p>
              <div className="ovx-price">
                <span className="ovx-price__label">{str(overview, "priceLabel")}</span>
                <span className="ovx-price__value">
                  <PriceValue price={str(overview, "price")} unit={str(overview, "priceUnit")} />
                </span>
              </div>
              {brochureLabel ? (
                <a href={brochureHref} download className="v27-cta-btn v27-cta-btn--dark ovx-cta">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3v13M7 11l5 5 5-5" />
                    <path d="M4 20h16" />
                  </svg>
                  {brochureLabel}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      {experience ? <div dangerouslySetInnerHTML={{ __html: experience }} /> : null}
      <CtaVideo cta={page.cta} />
    </>
  );
}

export function V27View({ page }: { page: CmsPage }) {
  return <ModelView page={page} htmlId="models-v27" mark="V27" />;
}
