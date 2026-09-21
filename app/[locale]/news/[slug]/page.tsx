import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/SiteChrome";
import { ArticleView } from "@/components/views/ArticleView";
import { getArticle, getArticles, pickReadAlso, seoMetadata } from "@/lib/cms";
import { NEWS_ARTICLES } from "@/lib/newsArticles";
import { applyRequestLocale, pageMeta } from "@/lib/pageMeta";
import { PAGE_CHROME } from "@/lib/site";

export const runtime = "edge";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(slug, locale);
  const local = NEWS_ARTICLES.find((item) => item.slug === slug);
  const fallback = local ? await pageMeta(locale, `newsArticles.${slug}`) : {};
  return seoMetadata(article?.seo, fallback);
}

export default async function NewsArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  applyRequestLocale(locale);
  const [article, articles] = await Promise.all([getArticle(slug, locale), getArticles(locale)]);
  if (!article) notFound();
  const chrome = PAGE_CHROME.article;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts}>
      <ArticleView article={{ ...article, related: pickReadAlso(articles, slug) }} locale={locale} />
    </SiteChrome>
  );
}
