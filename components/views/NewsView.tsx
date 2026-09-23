"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import type { CmsArticle, CmsPage } from "@/lib/cms";
import { CmsImg } from "./CmsMedia";
import { categoryLabel, CmsLink, formatDate, str } from "./shared";

const PAGE_SIZE = 6;
const FILTERS = ["all", "blog", "news", "event"] as const;

type FilterKey = (typeof FILTERS)[number];

type Props = {
  page: CmsPage;
  articles: CmsArticle[];
  locale: string;
};

export function NewsView({ page, articles, locale }: Props) {
  const hero = page.hero || {};
  const filters = page.filters || {};
  const [featured, ...gridArticles] = articles;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () => gridArticles.filter((article) => filter === "all" || article.category === filter),
    [filter, gridArticles]
  );
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useLayoutEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [visible.length, filter]);

  const showFeatured = Boolean(featured) && (filter === "all" || featured.category === filter);

  return (
    <main id="main" className="bg-white font-body antialiased">
      <section className="faq-page-hero news-hero relative overflow-hidden bg-white pb-[clamp(72px,9vh,110px)] pt-[clamp(120px,14vh,180px)] text-center" id="hero">
        <div className="container relative z-10 mx-auto max-w-[720px] px-pad-x">
          <p className="eyebrow reveal reveal--up justify-center font-display text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted" data-delay="0">{str(hero, "eyebrow")}</p>
          <h1 className="reveal reveal--up font-display text-[clamp(2.2rem,5vw,3.8rem)] font-bold tracking-[-0.035em] text-black" data-delay="1">{str(hero, "title")}</h1>
          <p className="reveal reveal--up mx-auto mt-sp-4 max-w-[36rem] text-[15px] leading-relaxed text-text-mid" data-delay="2">{str(hero, "intro")}</p>
        </div>
      </section>

      <section className="section news-filters p-0" id="filters">
        <div className="container mx-auto max-w-site px-pad-x">
          <nav className="news-filters__inner flex flex-wrap items-center justify-center gap-2" aria-label="Article categories">
            {FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                className={`filter-btn${filter === key ? " is-active" : ""}`}
                onClick={() => {
                  setFilter(key);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                {filters[key] || (key === "all" ? "All" : categoryLabel(key))}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {showFeatured && featured ? (
        <section className="section news-featured-section" id="featured" key={`${filter}-${featured.slug}`}>
          <div className="container mx-auto max-w-site px-pad-x">
            <div className="news-featured reveal reveal--up" data-delay="1">
              <CmsLink className="news-featured__img" href={`/news/${featured.slug}`} data-cursor-label="Read">
                <CmsImg src={featured.coverImage} alt={featured.title || ""} loading="eager" width={800} height={500} variant="card" />
              </CmsLink>
              <div className="news-featured__text">
                <div className="news-featured__meta">
                  <span className="news-featured__tag">{categoryLabel(featured.category)}</span>
                  <time dateTime={featured.publishedOn}>{formatDate(featured.publishedOn, locale)}</time>
                </div>
                <h2 className="mb-sp-8 font-display text-black">{featured.title}</h2>
                <p className="mb-sp-12 text-base leading-[1.75] text-text-mid">{featured.description}</p>
                <CmsLink href={`/news/${featured.slug}`} className="btn btn--dark btn--arrow btn--magnetic">
                  {page.featuredCta || "Read Article"} <span className="arrow">→</span>
                </CmsLink>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section news-grid-full pt-sp-24" id="articles">
        <div className="container mx-auto max-w-site px-pad-x">
          <div className="media-grid">
            {visible.map((article, index) => (
              <article
                className="media-card media-card--tile media-card--enter animate-news-tile-enter"
                data-category={article.category}
                key={`${filter}-${article.slug || article.title}`}
                style={{ animationDelay: `${index * 80}ms` }}
                onAnimationEnd={(event) => {
                  if (event.currentTarget === event.target) {
                    event.currentTarget.classList.remove("media-card--enter");
                    event.currentTarget.style.opacity = "1";
                    event.currentTarget.style.transform = "";
                    window.dispatchEvent(new Event("resize"));
                  }
                }}
              >
                <CmsLink
                  href={`/news/${article.slug}`}
                  className="media-card__img"
                  data-cursor-label="Read"
                  aria-label={article.title || "Read article"}
                >
                  <CmsImg src={article.coverImage} alt="" loading="lazy" width={400} height={250} variant="thumb" />
                </CmsLink>
                <div className="media-card__meta">
                  <span className={`media-card__type${article.category && article.category !== "news" ? ` media-card__type--${article.category}` : ""}`}>
                    {categoryLabel(article.category)}
                  </span>
                  <time dateTime={article.publishedOn}>{formatDate(article.publishedOn, locale)}</time>
                </div>
                <h4 className="media-card__title">{article.title}</h4>
              </article>
            ))}
          </div>
          {hasMore ? (
            <div className="mt-sp-32 text-center">
              <button
                type="button"
                className="btn btn--ghost btn--lg"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                {page.loadMore || "Load More Articles"}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
