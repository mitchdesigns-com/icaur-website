import { Fragment } from "react";
import { chargeAtPercent, chargingConfig, type CmsPage, type CmsVehicleModel } from "@/lib/cms";
import { DownloadFile } from "./DownloadFile";
import { CmsLink, CtaVideo, cmsFile, downloadName, list, num, str } from "./shared";

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

function Lines({ text }: { text: string }) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

function ResourceIcon({ icon }: { icon: string }) {
  if (icon === "calendar") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 14h3" />
        <path d="M8 18h6" />
      </svg>
    );
  }
  if (icon === "shield") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
      <path d="M9 9h1" />
    </svg>
  );
}

export function ModelView({
  page,
  mark = "V27",
}: {
  page: CmsPage | CmsVehicleModel;
  mark?: string;
}) {
  const vehicle = page as CmsVehicleModel;
  const hero = page.hero || {};
  const overview = page.overview || {};
  const exterior = page.exterior || {};
  const gallery = page.gallery || {};
  const interior = page.interior || {};
  const resources = page.resources || {};
  const tech = page.tech || {};
  const safety = page.safety || {};
  const charging = page.charging || {};
  const charge = chargingConfig(charging, vehicle.specs);
  const initialCharge = chargeAtPercent(charge.defaultPercent, charge);
  const record = page as Record<string, unknown>;
  const videoSrc = str(hero, "videoSrc");
  const logo = str(hero, "logo") || str(record, "logo");
  const brochureLabel = str(overview, "brochureLabel") || str(record, "brochureLabel");
  const brochureHref = cmsFile(overview, ["brochureFile", "brochureHref", "file"]) || cmsFile(record, ["brochureFile", "brochureHref"]);
  const colors = list(exterior, "colors");
  const resourceItems = list(resources, "items");
  const techItems = list(tech, "items");
  const safetyItems = list(safety, "items");
  const safetyImage = str(safety, "image") || str(record, "safetyImage");
  const techMark = str(tech, "mark", mark);
  const techBrand = str(tech, "brand");
  const safetyMark = str(safety, "mark", mark);
  const galleryMark = str(gallery, "eyebrowMark", mark);

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
            <CmsLink href={str(hero, "ctaHref")} className="v27-cta-btn v27-cta-btn--dark v27-hero-reserve-btn" id="v27-hero-cta">
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
              {brochureLabel && brochureHref ? (
                <DownloadFile href={brochureHref} filename={downloadName(brochureLabel, brochureHref)} className="v27-cta-btn v27-cta-btn--dark ovx-cta">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3v13M7 11l5 5 5-5" />
                    <path d="M4 20h16" />
                  </svg>
                  {brochureLabel}
                </DownloadFile>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="v27-exterior">
        <div className="v27-ext-sticky">
          <div className="v27-ext-header">
            <div>
              <div className="eyebrow" id="v27-ext-eyebrow">{str(exterior, "eyebrow")}</div>
              <h2 className="v27-ext-h2" id="v27-ext-h2">
                {str(exterior, "title")} {str(exterior, "titleEm") ? <em>{str(exterior, "titleEm")}</em> : null}
              </h2>
            </div>
          </div>
          <div className="v27-ext-window" />
          <div className="v27-swatches-wrap">
            <div className="v27-swatches" id="v27-swatches">
              {colors.map((color) => {
                const key = str(color, "key");
                const name = str(color, "name");
                return (
                  <button
                    className={`v27-swatch${color.active ? " active" : ""}`}
                    data-color={key}
                    aria-label={name}
                    key={key}
                  >
                    <img src={str(color, "image")} alt={name} draggable={false} />
                    <span className="v27-swatch-name">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="exterior-gallery">
        <div className="eg-header">
          <p className="eyebrow eg-eyebrow">
            <span>{str(gallery, "eyebrow")}</span>
            <span className="eg-eyebrow-dot" aria-hidden="true" />
            <span>{galleryMark}</span>
          </p>
          <h2 className="eg-h2" id="eg-h2">{str(gallery, "title")}</h2>
        </div>
        <div id="v27-eg-grid" className="v27-eg-grid" />
      </section>

      <div className="v27-marquee-wrap v27-marquee-wrap--ext" aria-hidden="true">
        <div className="v27-marquee-ribbon v27-marquee-ribbon--a">
          <div className="v27-marquee-track" id="v27-mq-c" />
        </div>
        <div className="v27-marquee-ribbon v27-marquee-ribbon--b">
          <div className="v27-marquee-track" id="v27-mq-d" />
        </div>
      </div>

      <div className="v27-lightbox" id="v27-lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
        <div className="v27-lb-stage" id="v27-lb-stage">
          <div className="v27-lb-frame">
            <img id="v27-lightbox-img" src="" alt="" />
          </div>
          <p className="v27-lb-caption" id="v27-lb-caption" />
        </div>
        <button className="v27-lb-btn v27-lb-btn--prev" id="v27-lb-prev" aria-label="Previous image">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button className="v27-lb-btn v27-lb-btn--next" id="v27-lb-next" aria-label="Next image">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
        </button>
        <button className="v27-lb-close" id="v27-lightbox-close" aria-label="Close lightbox">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <section id="v27-interior">
        <div className="v27-interior-head" id="v27-interior-head">
          <div className="eyebrow">{str(interior, "eyebrow")}</div>
          <h2 className="v27-interior-h2">
            {str(interior, "title")} {str(interior, "titleEm") ? <em>{str(interior, "titleEm")}</em> : null}
          </h2>
        </div>
        <div className="v27-carousel-outer" id="v27-carousel-outer">
          <button className="v27-carousel-arrow v27-carousel-arrow--prev" id="v27-arrow-prev" aria-label="Previous">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className="v27-carousel-arrow v27-carousel-arrow--next" id="v27-arrow-next" aria-label="Next">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
          </button>
          <div className="v27-carousel-track" id="v27-carousel-track" />
        </div>
      </section>

      <section id="v27-resources">
        <p className="eyebrow v27-res-eyebrow">{str(resources, "eyebrow")}</p>
        <h2 className="v27-res-h2">{str(resources, "title")}</h2>
        <div className="white-hover-cards dl-cards v27-dl-cards reveal reveal--up" data-delay="2">
          {resourceItems.map((item) => {
            const href = cmsFile(item);
            const title = str(item, "title");
            return (
              <DownloadFile
                className="white-hover-card"
                href={href}
                filename={downloadName(title, href)}
                aria-label={`${str(item, "ctaLabel")} ${title}`}
                key={title}
              >
                <span className="white-hover-card__icon">
                  <ResourceIcon icon={str(item, "icon", "file")} />
                </span>
                <h3 className="white-hover-card__h">{title}</h3>
                <p className="white-hover-card__p">{str(item, "meta")}</p>
                <span className="white-hover-card__link">{str(item, "ctaLabel")} <span className="arrow">&rarr;</span></span>
              </DownloadFile>
            );
          })}
        </div>
      </section>

      <section id="v27-tech">
        <div className="v27-ct-sticky">
          <div className="v27-ct-liquid-bg" id="v27-ct-liquid-bg" aria-hidden="true" />
          <div className="v27-ct-vignette" aria-hidden="true" />
          <div className="v27-ct-head" id="v27-ct-head">
            <p className="v27-ct-eyebrow" id="v27-ct-eyebrow">
              {str(tech, "eyebrow")} {techBrand || techMark ? <span className="eyebrow-dot" /> : null} {techBrand ? <span className="brand-name">{techBrand}</span> : null} {techMark}
            </p>
            <div className="v27-ct-line-wrap">
              <div className="v27-ct-line1" id="v27-ct-line1">{str(tech, "line1")}</div>
              <div className="v27-ct-mask" id="v27-ct-mask1" />
            </div>
            <div className="v27-ct-line-wrap" style={{ marginBottom: 24 }}>
              <div className="v27-ct-line2" id="v27-ct-line2">{str(tech, "line2")}</div>
              <div className="v27-ct-mask" id="v27-ct-mask2" />
            </div>
            <p className="v27-ct-sub" id="v27-ct-sub">{str(tech, "sub")}</p>
          </div>
        </div>
        {techItems.map((item, index) => (
          <div className="v27-ct-item" data-rotate={String(num(item, "rotate") || (index % 2 ? 14 : -14))} key={str(item, "label") || str(item, "title") || String(index)}>
            <div className="v27-ct-item-inner">
              <div className="v27-ct-left">
                <h3 className="v27-ct-title">
                  <Lines text={str(item, "title")} />
                </h3>
              </div>
              <div className="v27-ct-center">
                <img className="v27-ct-img" src={str(item, "image")} alt={str(item, "title")} />
              </div>
              <div className="v27-ct-right">
                <p className="v27-ct-label">{str(item, "label")}</p>
                <p className="v27-ct-desc">{str(item, "desc")}</p>
                <div className="v27-ct-deco" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section id="v27-safety">
        <div className="v27-sf-card">
          <div className="v27-sf-header">
            <div>
              <p className="v27-sf-eyebrow">
                {str(safety, "eyebrow")} {safetyMark ? <><span className="eyebrow-dot" /> {safetyMark}</> : null}
              </p>
              <h2 className="v27-safety-h2" id="v27-sf-h2">
                <span className="line-clip"><span className="line-inner">{str(safety, "title")}</span></span>
                <span className="line-clip"><span className="line-inner" style={{ color: "#F37021" }}>{str(safety, "titleEm")}</span></span>
              </h2>
            </div>
            <p className="v27-sf-intro">{str(safety, "intro")}</p>
          </div>
          <div className="v27-sf-main" id="v27-sf-main">
            <div className="v27-sf-img-wrap" id="v27-sf-img-wrap" aria-hidden="true">
              {safetyImage ? <img className="v27-sf-img v27-sf-img--default" id="v27-sf-default-img" src={safetyImage} alt="" /> : null}
              {safetyItems.map((item, index) => (
                <img className="v27-sf-img v27-sf-feat-img" data-idx={index} src={str(item, "image")} alt="" key={str(item, "title")} />
              ))}
            </div>
            <div className="v27-sf-list" id="v27-sf-list">
              {safetyItems.map((item, index) => (
                <div className="v27-sf-row-wrap" key={str(item, "title")}>
                  <div aria-hidden="true" />
                  <div className="v27-sf-row sf-row" data-idx={index}>
                    <div className="v27-sf-row-body">
                      <h3 className="sf-title">{str(item, "title")}</h3>
                      <div className="sf-disc-wrap"><div><p className="sf-disc">{str(item, "disc")}</p></div></div>
                    </div>
                    <span className="sf-num">{str(item, "num")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="v27-charging"
        data-default-percent={charge.defaultPercent}
        data-animate-to={charge.animateToPercent}
        data-time-cap={charge.timeCapPercent}
        data-max-time={charge.maxTime}
        data-full-range={charge.fullRange}
        data-time-unit={charge.timeUnit}
        data-range-unit={charge.rangeUnit}
      >
        <div className="v27-charging-eyebrow"><span className="eyebrow-dot" />{str(charging, "eyebrow")}</div>
        <div className="v27-charging-top">
          <h2 className="v27-charging-h2" id="v27-charging-h2">
            {str(charging, "title")} {str(charging, "titleEm") ? <em>{str(charging, "titleEm")}</em> : null}
            <br />
            {str(charging, "titleAfter")}
          </h2>
          <p className="v27-charging-intro">{str(charging, "intro")}</p>
        </div>
        <div className="v27-charge-track-wrap">
          <div className="v27-charge-tooltip" id="v27-charge-tooltip" style={{ left: `${charge.defaultPercent}%` }}>{charge.defaultPercent}%</div>
          <div className="v27-charge-track" id="v27-charge-track">
            <div className="v27-charge-fill" id="v27-charge-fill" style={{ width: `${charge.defaultPercent}%` }} />
            <div className="v27-charge-thumb" id="v27-charge-thumb" style={{ left: `${charge.defaultPercent}%` }}>
              <svg width="28" height="28" fill="#fff" viewBox="0 0 24 24"><path d="M13 2L4.5 13.5H11L10 22l9.5-11.5H13L14 2z" opacity=".9" /></svg>
            </div>
          </div>
        </div>
        <div className="v27-charge-stats">
          <div className="v27-charge-stat">
            <div className="v27-charge-stat-val" id="v27-charge-time">{initialCharge.time}<span className="v27-charge-stat-unit">{charge.timeUnit}</span></div>
            <div className="v27-charge-stat-label">{str(charging, "timeLabel")}</div>
          </div>
          <div className="v27-charge-divider" />
          <div className="v27-charge-stat">
            <div className="v27-charge-stat-val" id="v27-charge-range">{initialCharge.range}<span className="v27-charge-stat-unit">{charge.rangeUnit}</span></div>
            <div className="v27-charge-stat-label">{str(charging, "rangeLabel")}</div>
          </div>
        </div>
      </section>

      <CtaVideo cta={page.cta} />
    </>
  );
}

export function V27View({ page }: { page: CmsPage | CmsVehicleModel }) {
  return <ModelView page={page} mark="V27" />;
}
