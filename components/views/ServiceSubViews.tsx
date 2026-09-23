import type { CmsPage } from "@/lib/cms";
import { DownloadFile } from "./DownloadFile";
import { CmsImg } from "./CmsMedia";
import { CmsLink, CtaVideo, StoreBadges, cmsFile, downloadName, list, str } from "./shared";

function SpotHero({ hero }: { hero: Record<string, unknown> }) {
  const image = str(hero, "image");
  return (
    <section className="spot-hero" id="hero">
      <div className="spot-hero__base" style={{ backgroundImage: `url('${image}')` }} aria-hidden="true" />
      <div className="spot-hero__reveal" style={{ backgroundImage: `url('${image}')` }} aria-hidden="true" />
      <div className="spot-hero__shade" aria-hidden="true" />
      <div className="spot-hero__head">
        <p className="eyebrow eyebrow--warm spot-anim spot-anim--fade" style={{ animationDelay: ".1s" }}>{str(hero, "eyebrow")}</p>
        <h1 className="spot-hero__h">
          <span className="spot-l1 spot-anim spot-anim--reveal" style={{ animationDelay: ".25s" }}>{str(hero, "titleA")}</span>
          <span className="spot-l2 spot-anim spot-anim--reveal" style={{ animationDelay: ".42s" }}>
            {str(hero, "titleB")} {str(hero, "titleEm") ? <em>{str(hero, "titleEm")}</em> : null}
          </span>
        </h1>
        <p className="spot-hero__sub spot-anim spot-anim--fade" style={{ animationDelay: ".6s" }}>{str(hero, "subtitle")}</p>
        <CmsLink href={str(hero, "ctaHref")} className="btn btn--filled btn--arrow btn--magnetic spot-anim spot-anim--fade" style={{ animationDelay: ".78s" }}>
          {str(hero, "ctaLabel")} <span className="arrow">→</span>
        </CmsLink>
      </div>
    </section>
  );
}

export function MaintenanceView({ page }: { page: CmsPage }) {
  const book = page.book || {};
  const downloads = page.downloads || {};
  const items = list(downloads, "items");
  return (
    <main id="main" className="font-body">
      <SpotHero hero={page.hero || {}} />
      <section className="svc-book" id="book">
        <div className="svc-book__bg" aria-hidden="true" />
        <div className="svc-book__inner">
          <div id="svcBookCard">
            {str(book, "image") ? <CmsImg className="svc-book__pop" src={book.image} alt="" aria-hidden="true" variant="thumb" /> : null}
            <div className="svc-book__panel-wrap">
              <div className="svc-book__card">
                <p className="eyebrow svc-book__eyebrow">{str(book, "eyebrow")}</p>
                <h2 className="svc-book__h">
                  {str(book, "title")}
                  <br />
                  {str(book, "byLabel", "By")} {str(book, "titleEm") ? <span style={{ color: "var(--amber)" }}>{str(book, "titleEm")}</span> : null}
                </h2>
                <p className="svc-book__body">
                  {str(book, "body")}{" "}
                  {str(book, "contactLabel") ? (
                    <CmsLink href={str(book, "contactHref", "/contact")}>{str(book, "contactLabel")}</CmsLink>
                  ) : null}
                </p>
                <StoreBadges
                  appStoreLabel={str(book, "appStoreLabel")}
                  appStoreHref={str(book, "appStoreHref")}
                  playLabel={str(book, "playLabel")}
                  playHref={str(book, "playHref")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <DownloadBand tag={str(downloads, "tag")} title={str(downloads, "title")} titleEm={str(downloads, "titleEm")} body={str(downloads, "body")} items={items} id="downloads" />
      <CtaVideo cta={page.cta} />
    </main>
  );
}

export function ProgramsView({ page }: { page: CmsPage }) {
  const coverage = page.coverage || {};
  const items = list(coverage, "items");
  return (
    <main id="main" className="font-body">
      <SpotHero hero={page.hero || {}} />
      <section className="section svc-sub-band svc-sub-band--center" id="programs">
        <div className="container">
          <span className="warranty-card__tag reveal reveal--up">{str(coverage, "tag")}</span>
          <h2 className="warranty-card__h reveal reveal--up" data-delay="1">
            {str(coverage, "title")}
            <br />
            {str(coverage, "titleEm")}
          </h2>
          <p className="warranty-card__body reveal reveal--up" data-delay="2" style={{ maxWidth: 680 }}>{str(coverage, "body")}</p>
          <div className="white-hover-cards perk-cards reveal reveal--up" data-delay="3">
            {items.map((item, index) => (
              <div className="white-hover-card" data-tilt key={str(item, "title")}>
                <span className="white-hover-card__icon">
                  <PerkIcon icon={str(item, "icon") || PERK_ICON_FALLBACK[index] || "shield"} />
                </span>
                <h3 className="white-hover-card__h">{str(item, "title")}</h3>
                <p className="white-hover-card__p">{str(item, "text")}</p>
              </div>
            ))}
          </div>
          <CmsLink href={str(coverage, "ctaHref", "/contact")} className="btn btn--filled btn--arrow btn--magnetic reveal reveal--up" data-delay="4" style={{ marginTop: "clamp(28px,4vh,44px)", display: "inline-flex" }}>
            {str(coverage, "ctaLabel")} <span className="arrow">→</span>
          </CmsLink>
        </div>
      </section>
      <CtaVideo cta={page.cta} />
    </main>
  );
}

/** Order matches the original static programs page (shield → calendar → headset). */
const PERK_ICON_FALLBACK = ["shield", "calendar", "headset"] as const;

function PerkIcon({ icon }: { icon: string }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (icon === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  }
  if (icon === "headset" || icon === "support" || icon === "headphones") {
    return (
      <svg {...common}>
        <path d="M3 11h3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6a9 9 0 0 1 18 0v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h3" />
        <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function WarrantyView({ page }: { page: CmsPage }) {
  const coverage = page.coverage || {};
  return (
    <main id="main" className="font-body">
      <SpotHero hero={page.hero || {}} />
      <DownloadBand
        id="coverage"
        tag={str(coverage, "tag")}
        title={str(coverage, "title")}
        titleEm={str(coverage, "titleEm")}
        body={str(coverage, "body")}
        items={list(coverage, "items")}
        extraClass="svc-sub-band--dots"
      />
      <CtaVideo cta={page.cta} />
    </main>
  );
}

function DownloadBand({
  id,
  tag,
  title,
  titleEm,
  body,
  items,
  extraClass = "",
}: {
  id: string;
  tag: string;
  title: string;
  titleEm: string;
  body: string;
  items: Record<string, unknown>[];
  extraClass?: string;
}) {
  return (
    <section className={`section svc-sub-band svc-sub-band--center ${extraClass}`.trim()} id={id}>
      <div className="container">
        <span className="warranty-card__tag reveal reveal--up">{tag}</span>
        <h2 className="warranty-card__h reveal reveal--up" data-delay="1">
          {title}
          <br />
          {titleEm}
        </h2>
        <p className="warranty-card__body reveal reveal--up" data-delay="2">{body}</p>
        <div className="white-hover-cards dl-cards reveal reveal--up" data-delay="3">
          {items.map((item) => {
            const href = cmsFile(item);
            const title = str(item, "title");
            return (
              <DownloadFile
                href={href}
                filename={downloadName(title, href)}
                className="white-hover-card"
                aria-label={`${str(item, "ctaLabel", "Download")} ${title}`}
                key={title}
              >
                <span className="white-hover-card__icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M9 13h6" />
                    <path d="M9 17h6" />
                    <path d="M9 9h1" />
                  </svg>
                </span>
                <h3 className="white-hover-card__h">{title}</h3>
                <p className="white-hover-card__p">{str(item, "meta")}</p>
                <span className="white-hover-card__link">{str(item, "ctaLabel")} <span className="arrow">→</span></span>
              </DownloadFile>
            );
          })}
        </div>
      </div>
    </section>
  );
}
