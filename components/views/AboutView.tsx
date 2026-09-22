import { Fragment } from "react";
import type { CmsPage } from "@/lib/cms";
import { mediaList } from "@/lib/media";
import { CmsImg, CmsVideo } from "./CmsMedia";
import { CmsLink, CtaVideo, list, num, str } from "./shared";

const ABOUT_STORY_CLUSTER = [
  "https://pub-835dbefa2ea84f599cef0519f76de888.r2.dev/cms/interior_display_4c3657864e.webp",
  "https://pub-835dbefa2ea84f599cef0519f76de888.r2.dev/cms/ICUAR_V27_brochure_03_18_bc9df0f1f9.webp",
];

function MvStatement({ parts }: { parts: Record<string, unknown>[] }) {
  return (
    <p className="mv__statement" data-mv-split>
      {parts.map((part, index) => {
        const image = str(part, "image");
        if (image) {
          return (
            <span className="mv-chip" aria-hidden="true" key={index}>
              <CmsImg src={image} alt="" loading="lazy" variant="thumb" />
            </span>
          );
        }
        const text = str(part, "text");
        return part.em ? <em key={index}>{text}</em> : text;
      })}
    </p>
  );
}

export function AboutView({ page }: { page: CmsPage }) {
  const hero = page.hero || {};
  const story = page.story || {};
  const panels = list(story, "panels");
  const cmsCluster = mediaList(story.cluster);
  const cluster = cmsCluster.length >= 2 ? cmsCluster : ABOUT_STORY_CLUSTER;
  const figures = list(page.figures, "items");
  const vision = page.vision || {};
  const mission = page.mission || {};
  const values = page.values || {};
  const valueItems = list(values, "items");

  return (
    <main id="main">
      <section className="spot-hero spot-hero--video" id="hero">
        <CmsVideo className="spot-hero__video" id="aboutHeroVideo" src={hero.videoSrc} poster={hero.posterSrc} mode="hero" aria-hidden="true" />
        <div className="spot-hero__reveal" aria-hidden="true" />
        <div className="spot-hero__shade" aria-hidden="true" />
        <div className="spot-hero__head">
          <p className="eyebrow eyebrow--warm spot-anim spot-anim--fade" style={{ animationDelay: ".1s" }}>{str(hero, "eyebrow")}</p>
          <h1 className="spot-hero__h">
            <span className="spot-l1 spot-anim spot-anim--reveal" style={{ animationDelay: ".25s" }}>{str(hero, "title")}</span>
            <span className="spot-l2 spot-anim spot-anim--reveal" style={{ animationDelay: ".42s" }}><em>{str(hero, "titleEm")}</em></span>
          </h1>
          <p className="spot-hero__sub spot-anim spot-anim--fade" style={{ animationDelay: ".6s" }}>{str(hero, "subtitle")}</p>
        </div>
      </section>

      <div className="svc-driver" id="aboutDriver">
        <section className="svc" id="aboutScene">
          <div className="svc__track" id="aboutTrack">
            <div className="svc__panel svc__panel--intro">
              <div className="svc__intro-inner">
                <div className="svc__headgroup" id="aboutHeadGroup">
                  <p className="eyebrow svc__eyebrow">{str(story, "eyebrow")}</p>
                  <h2 className="svc__headline" id="aboutHeadline">
                    {str(story, "headline")}
                    <br />
                    {str(story, "headlineMid")} <em>{str(story, "headlineEm")}</em>
                  </h2>
                </div>
                <p className="svc__sub">{str(story, "sub")}</p>
              </div>
            </div>
            {panels.map((panel, index) => {
              const titleEm = str(panel, "titleEm");
              return (
                <Fragment key={str(panel, "title") + titleEm}>
                  <article className={`svc__panel svc__panel--feature${index === 1 ? " svc__panel--flip" : ""}`}>
                    <figure className="svc__media svc__media--lg">
                      <CmsImg src={panel.image} alt={str(panel, "imageAlt")} loading="lazy" data-par="0.10" variant="card" />
                    </figure>
                    <div className="svc__body">
                      <span className="svc__num">{str(panel, "num")}</span>
                      <h3 className="svc__title">
                        {str(panel, "title")}{" "}
                        {titleEm ? <em>{titleEm}</em> : null}
                        {str(panel, "titleAfter") || (titleEm === "Drama" ? "." : "")}
                      </h3>
                      <p className="svc__text">{str(panel, "text")}</p>
                      {str(panel, "ctaLabel") ? (
                        <CmsLink href={str(panel, "ctaHref")} className="btn btn--dark btn--sm btn--arrow btn--magnetic">
                          {str(panel, "ctaLabel")} <span className="brand-name">iCAUR</span> <span className="arrow">→</span>
                        </CmsLink>
                      ) : null}
                    </div>
                  </article>
                  {index === 0 ? (
                    <div className="svc__panel svc__panel--cluster" aria-hidden="true">
                      <figure className="svc__media svc__media--sm svc__media--sm-a">
                        <CmsImg src={cluster[0]} alt="" loading="lazy" data-par="0.18" variant="thumb" />
                      </figure>
                      <figure className="svc__media svc__media--sm svc__media--sm-b">
                        <CmsImg src={cluster[1]} alt="" loading="lazy" data-par="-0.12" variant="thumb" />
                      </figure>
                    </div>
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </section>
      </div>

      <section className="section about-figures" id="figures" data-dotfield>
        <div className="container">
          <div className="figures-grid">
            {figures.map((figure, index) => (
              <div className="figure reveal reveal--up" data-delay={index} key={str(figure, "label")}>
                <span className="figure__num" data-count-to={num(figure, "value")} data-suffix={str(figure, "suffix") || undefined}>0</span>
                <span className="figure__label">{str(figure, "label")}</span>
                <span className="figure__sub">{str(figure, "sub")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mv-driver" id="mvDriver">
        <section className="mv" id="missionSection" aria-label="Our vision and mission">
          <div className="mv__bg" id="mvBg" aria-hidden="true" />
          <div className="mv__stage">
            <canvas id="mvCanvas" aria-hidden="true" />
            <div className="mv__panel mv__panel--vision" id="mvVision">
              <div className="mv__inner">
                <h2 className="mv__title">{str(vision, "title")} <em>{str(vision, "titleEm")}</em></h2>
                <MvStatement parts={list(vision, "parts")} />
              </div>
            </div>
            <div className="mv__panel mv__panel--mission" id="mvMission">
              <div className="mv__inner">
                <h2 className="mv__title">{str(mission, "title")} <em>{str(mission, "titleEm")}</em></h2>
                <MvStatement parts={list(mission, "parts")} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="section usp-list usp-list--dark" id="values">
        <div className="container usp-list__wrap">
          <p className="eyebrow eyebrow--warm reveal reveal--up">{str(values, "eyebrow")}</p>
          <h2 className="section-title section-title--light reveal reveal--up" data-delay="1">{str(values, "title")}</h2>
          <div className="usp-list__stack" id="uspStack">
            {valueItems.map((item) => (
              <div className="usp-row" tabIndex={0} data-img={str(item, "image")} key={str(item, "title")}>
                <span className="usp-row__title">{str(item, "title")}</span>
              </div>
            ))}
          </div>
          <div className="usp-preview" id="uspPreview" aria-hidden="true">
            <CmsImg src={valueItems[0]?.image} alt="" loading="lazy" variant="card" />
          </div>
        </div>
      </section>

      <CtaVideo cta={page.cta} reveal="up" />
    </main>
  );
}
