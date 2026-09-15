import type { CmsArticle, CmsPage } from "@/lib/cms";
import { categoryLabel, CmsLink, formatDate, str } from "./shared";

export function NewsView({ page, articles, locale }: { page: CmsPage; articles: CmsArticle[]; locale: string }) {
  const hero = page.hero || {};
  const filters = page.filters || {};
  const [featured, ...rest] = articles;

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
            <button className="filter-btn is-active" data-filter="all">{filters.all || "All"}</button>
            <button className="filter-btn" data-filter="blog">{filters.blog || "Blog"}</button>
            <button className="filter-btn" data-filter="news">{filters.news || "News"}</button>
            <button className="filter-btn" data-filter="event">{filters.event || "Event"}</button>
          </nav>
        </div>
      </section>

      {featured ? (
        <section className="section news-featured-section" id="featured">
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
            {rest.map((article) => (
              <article className="media-card media-card--tile" data-category={article.category} key={article.slug}>
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
          <div style={{ textAlign: "center", marginTop: "var(--sp-32)" }} className="reveal reveal--up">
            <button className="btn btn--ghost btn--lg btn--magnetic">{page.loadMore || "Load More Articles"}</button>
          </div>
        </div>
      </section>
    </main>
  );
}
