import { Fragment } from "react";
import type { CmsArticle, CmsFaqItem, CmsPage, CmsVehicleModel } from "@/lib/cms";
import { categoryLabel, CmsLink, CtaVideo, formatDate, list, num, str, texts, withBrand } from "./shared";
import { WhyStrips } from "./WhyStrips";

type Props = {
  page: CmsPage;
  models: CmsVehicleModel[];
  articles: CmsArticle[];
  faqs: CmsFaqItem[];
  locale: string;
  startsFrom?: string;
};

type HomeStory = {
  slug: string;
  title: string;
  category: string;
  publishedOn: string;
  coverImage: string;
};

const HOME_MEDIA: HomeStory[] = [
  {
    slug: "v23-design",
    title: "iCAUR V27 Studio Design Revealed",
    category: "news",
    publishedOn: "2026-05-28",
    coverImage: "/assets/images/iCAUR INTL_V27 REV_cam025.webp",
  },
  {
    slug: "electric-wiring",
    title: "Electric Wiring Matrix Optimized for Egypt",
    category: "blog",
    publishedOn: "2026-05-20",
    coverImage: "/assets/images/v27/car-side.webp",
  },
];

export function HomeView({ page, models, articles, faqs, locale, startsFrom = "Starts from" }: Props) {
  const hero = page.hero || {};
  const modelsCopy = page.models || {};
  const overview = page.overview || {};
  const services = page.services || {};
  const media = page.media || {};
  const faq = page.faq || {};
  const paragraphs = texts(overview.paragraphs);
  const stats = list(overview, "stats");
  const serviceItems = list(services, "items");
  const deck = texts(services.deck);
  const featured = homeMediaStories(articles);
  const homeFaqs = faqs
    .filter((item) => item.showOnHome)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .slice(0, 5);
  const modelCards = [...models].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <main id="main">
      <div className="hero-scroll-driver" id="heroScrollDriver">
        <section className="hero" id="hero">
          <div className="hero__bg" aria-hidden="true">
            <video className="hero__bg-img" src={str(hero, "videoSrc")} autoPlay loop muted playsInline preload="metadata" />
          </div>
          <div className="hero__overlay" id="heroOverlay" aria-hidden="true" />
          <div className="hero__mask-reveal" id="heroMaskReveal" aria-hidden="true">
            <span className="hero__mask-line">{str(hero, "maskLine1")}</span>
            <span className="hero__mask-line">{str(hero, "maskLine2")}</span>
          </div>
          <div className="hero__grain" aria-hidden="true" />
          <div className="hero__inner">
            <div className="hero__eyebrow reveal reveal--up" data-delay="0">
              <p className="eyebrow eyebrow--badge">{str(hero, "eyebrow")}</p>
            </div>
            <h1 className="hero__headline" aria-label={`${str(hero, "titleA")} ${str(hero, "titleB")} ${str(hero, "titleC")} ${str(hero, "titleAccent")}`}>
              <span className="hero__line" aria-hidden="true">
                <span className="hero__word">{str(hero, "titleA")}</span>
                <span className="hero__word">{str(hero, "titleB")}</span>
              </span>
              <span className="hero__line" aria-hidden="true">
                <span className="hero__word">{str(hero, "titleC")}</span>
                <span className="hero__word hero__word--accent">{str(hero, "titleAccent")}</span>
              </span>
            </h1>
            <div className="hero__footer">
              <p className="hero__sub reveal reveal--up" data-delay="5">
                <HeroSubtitle text={str(hero, "subtitle")} />
              </p>
              <div className="hero__ctas reveal reveal--up" data-delay="6">
                <CmsLink href={str(hero, "ctaHref", "/reserve")} className="btn btn--filled btn--lg btn--magnetic">
                  {str(hero, "ctaLabel")} →
                </CmsLink>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="section models" id="models">
        <div className="container">
          <header className="section-head models__head reveal reveal--up" data-stagger="parent">
            <p className="eyebrow">{withBrand(str(modelsCopy, "eyebrow"))}</p>
            <h2 className="section-title">
              {str(modelsCopy, "title")}
              <br />
              <em>{str(modelsCopy, "titleEm")}</em> {str(modelsCopy, "titleAfter")}
            </h2>
          </header>
          <div className="models-grid models-grid--feature">
            {modelCards.map((model, index) => (
              <article className="mfc reveal reveal--up" data-delay={index} key={model.slug || model.name}>
                <CmsLink href={model.href || "/models/v27"} className="mfc__inner" data-cursor-label="Explore">
                  <span className="mfc__glow" aria-hidden="true" />
                  <img src={model.image} alt="" className="mfc__img mfc__img--default" loading="lazy" />
                  <img src={model.logo} alt={model.name || ""} className="mfc__logo" />
                  <img src={model.hoverImage} alt={model.name || ""} className="mfc__img mfc__img--hover" loading="lazy" />
                  <div className="mfc__bottom">
                    <h3 className="mfc__name">
                      {model.tagline} <span className="mfc__hl">{model.highlight}</span>
                    </h3>
                    <div className="mfc__specs">
                      {(model.specs || []).map((spec) => (
                        <span key={`${spec.label}-${spec.value}`}>{spec.value}</span>
                      ))}
                    </div>
                    <div className="mfc__price">
                      <span className="mfc__price-label">{startsFrom}</span>
                      <span className="mfc__price-value">{model.startingPrice}</span>
                    </div>
                  </div>
                </CmsLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="overview-scroll-driver" id="overviewScrollDriver">
        <section className="overview" id="overview">
          <div className="overview__bg" aria-hidden="true">
            <div className="overview__bg-inner" id="overviewBgInner">
              <video className="overview__video" src={str(overview, "videoSrc")} muted playsInline preload="auto" />
              <div className="overview__overlay" aria-hidden="true" />
              <span className="overview__grain" aria-hidden="true" />
            </div>
          </div>
          <div className="overview__heading">
            <h2 className="overview__title">{str(overview, "title")}</h2>
          </div>
          <div className="overview__copy">
            {paragraphs.map((paragraph, index) => (
              <div className="ov-step" data-step={index} key={paragraph}>
                <div className="ov-mask">
                  <p className="overview__body">{paragraph}</p>
                </div>
                {index === paragraphs.length - 1 ? (
                  <CmsLink href={str(overview, "ctaHref", "/about")} className="link-arrow link-arrow--light ov-cta">
                    {str(overview, "ctaLabel")} <span className="arrow">→</span>
                  </CmsLink>
                ) : null}
              </div>
            ))}
          </div>
          <div className="overview__stats" id="overviewStats">
            {stats.map((stat) => (
              <div className="ov-stat" key={str(stat, "label")}>
                <span className="ov-stat__num">
                  {str(stat, "prefix") ? <span className="ov-stat__prefix">{str(stat, "prefix")}</span> : null}
                  <span className="ov-stat__value" data-count={num(stat, "value")}>0</span>
                  {str(stat, "suffix") ? <span className="ov-stat__suffix">{str(stat, "suffix")}</span> : null}
                </span>
                <span className="ov-stat__label">{str(stat, "label")}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="svc-driver" id="svcDriver">
        <section className="svc" id="services">
          <div className="svc__track" id="svcTrack">
            <div className="svc__panel svc__panel--intro">
              <div className="svc__intro-inner">
                <div className="svc__headgroup" id="svcHeadGroup">
                  <p className="eyebrow svc__eyebrow">{withBrand(str(services, "eyebrow"))}</p>
                  <h2 className="svc__headline" id="svcHeadline">
                    {str(services, "headline")}
                    <br />
                    {str(services, "headlineMid")} <em>{str(services, "headlineEm")}</em>
                  </h2>
                </div>
                <p className="svc__sub">{str(services, "sub")}</p>
                <span className="svc__slot" id="svcSlot" aria-hidden="true" />
              </div>
              <svg className="svc__trace" id="svcTrace" viewBox="0 0 100 100" aria-hidden="true">
                <path id="svcTracePath" d="M10 70 C 30 20, 70 20, 90 60" />
              </svg>
              <div className="svc__deck" id="svcDeck" aria-hidden="true">
                <div className="svc__deck-inner">
                  {texts(services.deck).map((src) => (
                    <img key={src} src={src} alt="" loading="lazy" />
                  ))}
                </div>
              </div>
            </div>
            {serviceItems.map((item, index) => (
              <Fragment key={str(item, "href") || index}>
                <article className={`svc__panel svc__panel--feature${index === 1 ? " svc__panel--flip" : ""}`}>
                  <figure className="svc__media svc__media--lg">
                    <img src={str(item, "image")} alt={str(item, "imageAlt")} loading="lazy" data-par="0.10" />
                  </figure>
                  <div className="svc__body">
                    <span className="svc__num">{str(item, "num")}</span>
                    <h3 className="svc__title">
                      {str(item, "title")} {str(item, "titleEm") ? <em>{str(item, "titleEm")}</em> : null}
                    </h3>
                    <p className="svc__text">{str(item, "text")}</p>
                    <CmsLink href={str(item, "href")} className="btn btn--dark btn--sm btn--arrow btn--magnetic">
                      {str(item, "ctaLabel")} <span className="arrow">→</span>
                    </CmsLink>
                  </div>
                </article>
                {index === 0 ? (
                  <ServiceCluster
                    first={deck[7] || "/assets/images/v27/interior-01.webp"}
                    second="/assets/images/v27-18.webp"
                    firstClass="svc__media--sm-a"
                    secondClass="svc__media--sm-b"
                    firstPar="0.18"
                    secondPar="-0.12"
                  />
                ) : null}
                {index === 1 ? (
                  <ServiceCluster
                    first={deck[5] || "/assets/images/v27-18.webp"}
                    second={deck[4] || "/assets/images/v27/interior-display.webp"}
                    firstClass="svc__media--sm-c"
                    secondClass="svc__media--sm-d"
                    firstPar="0.16"
                    secondPar="-0.10"
                  />
                ) : null}
              </Fragment>
            ))}
          </div>
        </section>
      </div>

      <WhyStrips items={list(page.why, "items")} />

      <div className="media-driver" id="mediaDriver">
        <section className="media" id="news">
          <div className="media__stage" id="mediaStage">
            <div className="media__grid">
              <div className="media__col">
                <header className="media__head" id="mediaHead">
                  <p className="eyebrow media__eyebrow">{str(media, "eyebrow")}</p>
                  <h2 className="media__title">{str(media, "title")}</h2>
                </header>
                <div className="media__brief" id="mediaBrief">
                  <p>{str(media, "brief")}</p>
                  <CmsLink href={str(media, "ctaHref", "/news")} className="btn btn--outline btn--sm btn--arrow">
                    {str(media, "ctaLabel")} <span className="arrow">→</span>
                  </CmsLink>
                </div>
              </div>
              {featured[0] ? (
                <article className="media-card media-card--lead" id="mediaLead">
                  <CmsLink href={`/news/${featured[0].slug}`} className="media-card__img" id="mediaLeadImg" data-cursor-label="Read">
                    <img src={featured[0].coverImage} alt={featured[0].title} loading="lazy" />
                  </CmsLink>
                  <div className="media-card__meta">
                    <span className={`media-card__type${featured[0].category === "blog" ? " media-card__type--blog" : ""}`}>
                      {categoryLabel(featured[0].category)}
                    </span>
                    <time dateTime={featured[0].publishedOn}>{formatDate(featured[0].publishedOn, locale)}</time>
                  </div>
                  <h4 className="media-card__title">{featured[0].title}</h4>
                </article>
              ) : null}
              {featured[1] ? (
                <article className="media-card media-card--big" id="mediaBig">
                  <CmsLink href={`/news/${featured[1].slug}`} className="media-card__img" data-cursor-label="Read">
                    <img src={featured[1].coverImage} alt={featured[1].title} loading="lazy" />
                  </CmsLink>
                  <div className="media-card__meta">
                    <span className={`media-card__type${featured[1].category === "blog" ? " media-card__type--blog" : ""}`}>
                      {categoryLabel(featured[1].category)}
                    </span>
                    <time dateTime={featured[1].publishedOn}>{formatDate(featured[1].publishedOn, locale)}</time>
                  </div>
                  <h4 className="media-card__title">{featured[1].title}</h4>
                </article>
              ) : null}
            </div>
            <div className="media__veil" id="mediaVeil" aria-hidden="true">
              <span className="media__scrim" id="mediaScrim" />
            </div>
          </div>
        </section>
      </div>

      <section className="section faq" id="faq">
        <div className="container">
          <div className="faq__layout">
            <aside className="faq__left reveal reveal--up" data-stagger="parent">
              <p className="eyebrow">{str(faq, "eyebrow")}</p>
              <h2 className="section-title">{str(faq, "title")}</h2>
              <p className="faq__hint">{str(faq, "hint")}</p>
              <CmsLink href={str(faq, "ctaHref", "/faq")} className="btn btn--dark btn--arrow btn--magnetic">
                {str(faq, "ctaLabel")} <span className="arrow">→</span>
              </CmsLink>
            </aside>
            <div className="faq__list">
              {homeFaqs.map((item, index) => (
                <div className="faq-item reveal reveal--up" data-delay={index + 1} key={item.question}>
                  <button className="faq-item__q" aria-expanded="false">
                    <span>{item.question}</span>
                    <span className="faq-item__plus" aria-hidden="true">+</span>
                  </button>
                  <div className="faq-item__a">
                    <div>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaVideo cta={page.cta} />
    </main>
  );
}

function homeMediaStories(articles: CmsArticle[]): HomeStory[] {
  const bySlug = new Map(articles.map((item) => [item.slug, item]));
  const studioCover = articles.find((item) => (item.coverImage || "").includes("cam025"))?.coverImage;
  return HOME_MEDIA.map((story, index) => {
    const cms = bySlug.get(story.slug);
    return {
      ...story,
      slug: cms?.slug || story.slug,
      category: cms?.category || story.category,
      publishedOn: cms?.publishedOn || story.publishedOn,
      coverImage: (index === 0 && studioCover) || cms?.coverImage || story.coverImage,
    };
  });
}

function HeroSubtitle({ text }: { text: string }) {
  const marker = "real life,";
  const at = text.toLowerCase().indexOf(marker);
  if (at === -1) return <>{text}</>;
  const splitAt = at + marker.length;
  return (
    <>
      {text.slice(0, splitAt)}
      <br />
      {text.slice(splitAt).trimStart()}
    </>
  );
}

function ServiceCluster({
  first,
  second,
  firstClass,
  secondClass,
  firstPar,
  secondPar,
}: {
  first: string;
  second: string;
  firstClass: string;
  secondClass: string;
  firstPar: string;
  secondPar: string;
}) {
  return (
    <div className="svc__panel svc__panel--cluster" aria-hidden="true">
      <figure className={`svc__media svc__media--sm ${firstClass}`}>
        <img src={first} alt="" loading="lazy" data-par={firstPar} />
      </figure>
      <figure className={`svc__media svc__media--sm ${secondClass}`}>
        <img src={second} alt="" loading="lazy" data-par={secondPar} />
      </figure>
    </div>
  );
}
