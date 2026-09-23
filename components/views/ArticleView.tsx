import type { CmsArticle } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { CmsImg } from "./CmsMedia";
import { categoryLabel, CmsLink, formatDate } from "./shared";

type Props = {
  article: CmsArticle;
  locale: string;
};

export function ArticleView({ article, locale }: Props) {
  const related = article.related || [];
  return (
    <main id="main" className="bg-white font-body antialiased">
      <section className={cn("post-hero", "bg-white pt-[clamp(80px,10vh,140px)] pb-0")}>
        <div className={cn("post-hero__inner", "mx-auto max-w-[780px] px-10 max-md:px-5")}>
          <nav className="breadcrumb reveal reveal--up" data-delay="0" aria-label="Breadcrumb">
            <CmsLink href="/">Home</CmsLink>
            <span>›</span>
            <CmsLink href="/news">Media Center</CmsLink>
            <span>›</span>
            <span aria-current="page">Article</span>
          </nav>
          <h1 className={cn("post-hero__h", "reveal reveal--up font-display text-[clamp(2rem,4.5vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.035em] text-black")} data-delay="1">
            {article.title}
          </h1>
          <div className={cn("post-meta", "reveal reveal--up mt-5 mb-11 flex flex-wrap items-center gap-[14px] text-[13px] text-text-muted")} data-delay="2">
            <span className="post-meta__tag">{categoryLabel(article.category)}</span>
            <span className="post-meta__dot">·</span>
            <span>{article.readTime}</span>
            <span className="post-meta__dot">·</span>
            <time dateTime={article.publishedOn}>{formatDate(article.publishedOn, locale)}</time>
          </div>
        </div>
      </section>

      {article.coverImage ? (
        <div className={cn("post-cover", "reveal reveal--up mx-[clamp(20px,4vw,60px)] mb-[clamp(48px,6vh,80px)] aspect-[16/7] overflow-hidden rounded-[20px]")}>
          <CmsImg src={article.coverImage} alt={article.title || ""} loading="eager" variant="full" />
        </div>
      ) : null}

      <article className={cn("post-body", "reveal reveal--up mx-auto max-w-[900px] bg-white px-[clamp(20px,8vw,120px)] pb-[clamp(64px,8vh,120px)]")}>
        {(article.blocks || []).map((block, index) => (
          <div key={`${block.heading || block.image || block.quote || "p"}-${index}`}>
            {block.heading ? (
              <h2 className="mb-[0.65em] mt-[2.5em] font-display text-[clamp(1.3rem,2.2vw,1.75rem)] font-bold tracking-[-0.025em] text-black">
                {block.heading}
              </h2>
            ) : null}
            {block.body ? <p className="mb-[1.4em] text-[clamp(15px,1.15vw,17px)] leading-[1.82] text-text-mid">{block.body}</p> : null}
            {block.quote ? <div className="post-pullquote">{block.quote}</div> : null}
            {block.image ? (
              <div className="post-img my-[2.5em] overflow-hidden rounded-md bg-cream-deep">
                <CmsImg src={block.image} alt={block.imageAlt || ""} loading="lazy" variant="full" />
              </div>
            ) : null}
          </div>
        ))}
      </article>

      {related.length ? (
        <section className="post-read-also bg-white py-[clamp(48px,6vh,80px)]">
          <div className="post-read-also__inner mx-auto max-w-[1160px] px-10">
            <h3 className="font-display text-black">Read Also</h3>
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
                    <CmsImg src={item.coverImage} alt={item.title || ""} loading="lazy" width={400} height={250} variant="thumb" />
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
