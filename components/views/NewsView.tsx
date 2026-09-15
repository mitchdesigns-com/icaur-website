"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import type { CmsArticle, CmsPage } from "@/lib/cms";
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
    <main id="main">
      <section className="faq-page-hero news-hero" id="hero">
        <div className="container" style={{ maxWidth: 720 }}>
          <p className="eyebrow reveal reveal--up" data-delay="0" style={{ justifyContent: "center" }}>{str(hero, "eyebrow")}</p>
          <h1 className="reveal reveal--up" data-delay="1">{str(hero, "title")}</h1>
          <p className="reveal reveal--up" data-delay="2">{str(hero, "intro")}</p>
        </div>
      </section>

      <section className="section news-filters" id="filters" style={{ padding: 0 }}>
        <div className="container">
          <nav className="news-filters__inner" aria-label="Article categories">
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
          <div className="container">
            <div className="news-featured reveal reveal--up" data-delay="1">
              <CmsLink className="news-featured__img" href={`/news/${featured.slug}`} data-cursor-label="Read">
                <img src={featured.coverImage} alt={featured.title || ""} loading="eager" width={800} height={500} />
              </CmsLink>
              <div className="news-featured__text">
                <div className="news-featured__meta">
                  <span className="news-featured__tag">{categoryLabel(featured.category)}</span>
                  <time dateTime={featured.publishedOn}>{formatDate(featured.publishedOn, locale)}</time>
                </div>
                <h2 style={{ marginBottom: "var(--sp-8)" }}>{featured.title}</h2>
                <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--text-mid)", marginBottom: "var(--sp-12)" }}>{featured.description}</p>
                <CmsLink href={`/news/${featured.slug}`} className="btn btn--dark btn--arrow btn--magnetic">
                  {page.featuredCta || "Read Article"} <span className="arrow">→</span>
                </CmsLink>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section news-grid-full" id="articles" style={{ paddingTop: "var(--sp-24)" }}>
        <div className="container">
          <div className="media-grid">
            {visible.map((article, index) => (
              <article
                className="media-card media-card--tile media-card--enter"
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
                <CmsLink href={`/news/${article.slug}`} className="media-card__img" data-cursor-label="Read">
                  <img src={article.coverImage} alt={article.title || ""} loading="lazy" width={400} height={250} />
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
            <div style={{ textAlign: "center", marginTop: "var(--sp-32)" }}>
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
