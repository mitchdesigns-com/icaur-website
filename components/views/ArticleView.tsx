import type { CmsArticle } from "@/lib/cms";
import { categoryLabel, CmsLink, formatDate } from "./shared";

type Props = {
  article: CmsArticle;
  locale: string;
};

export function ArticleView({ article, locale }: Props) {
  const related = article.related || [];
  return (
    <main id="main">
      <section className="post-hero">
        <div className="post-hero__inner">
          <nav className="breadcrumb reveal reveal--up" data-delay="0" aria-label="Breadcrumb">
            <CmsLink href="/">Home</CmsLink>
            <span>›</span>
            <CmsLink href="/news">Media Center</CmsLink>
            <span>›</span>
            <span aria-current="page">Article</span>
          </nav>
          <h1 className="post-hero__h reveal reveal--up" data-delay="1">{article.title}</h1>
          <div className="post-meta reveal reveal--up" data-delay="2">
            <span className="post-meta__tag">{categoryLabel(article.category)}</span>
            <span className="post-meta__dot">·</span>
            <span>{article.readTime}</span>
            <span className="post-meta__dot">·</span>
            <time dateTime={article.publishedOn}>{formatDate(article.publishedOn, locale)}</time>
          </div>
        </div>
      </section>

      {article.coverImage ? (
        <div className="post-cover reveal reveal--up">
          <img src={article.coverImage} alt={article.title || ""} loading="eager" />
        </div>
      ) : null}

      <article className="post-body reveal reveal--up">
        {(article.blocks || []).map((block, index) => (
          <div key={`${block.heading || block.image || block.quote || "p"}-${index}`}>
            {block.heading ? <h2>{block.heading}</h2> : null}
            {block.body ? <p>{block.body}</p> : null}
            {block.quote ? <div className="post-pullquote">{block.quote}</div> : null}
            {block.image ? (
              <div className="post-img">
                <img src={block.image} alt={block.imageAlt || ""} loading="lazy" />
              </div>
            ) : null}
          </div>
        ))}
      </article>

      {related.length ? (
        <section className="post-read-also">
          <div className="post-read-also__inner">
            <h3>Read Also</h3>
            <div className="post-read-also__grid">
              {related.map((item) => (
                <article className="news-card reveal reveal--up" key={item.slug}>
                  <div className="news-card__header">
                    <div className="news-card__meta-row">
                      <span className={`news-card__type news-card__type--${item.category || "news"}`}>{categoryLabel(item.category)}</span>
                      <div className="news-card__date-loc">
                        <time dateTime={item.publishedOn}>{formatDate(item.publishedOn, locale)}</time>
                      </div>
                    </div>
                    <h4>{item.title}</h4>
                  </div>
                  <CmsLink href={`/news/${item.slug}`} className="news-card__img" data-cursor-label="Read">
                    <img src={item.coverImage} alt={item.title || ""} loading="lazy" width={400} height={250} />
                  </CmsLink>
                  <div className="news-card__body">
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
