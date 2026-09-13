import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/SiteChrome";
import { getArticles, resolveArticleHtml } from "@/lib/cms";
import { NEWS_ARTICLES } from "@/lib/newsArticles";
import { applyRequestLocale, pageMeta } from "@/lib/pageMeta";
import { CORE_SCRIPTS } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const articles = await getArticles("en");
  if (articles?.length) return articles.map((article) => ({ slug: article.slug })).filter((item) => item.slug);
  return NEWS_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const { article } = await resolveArticleHtml(slug, locale);
  if (article?.seo?.title) {
    return { title: article.seo.title, description: article.seo.description };
  }
  const local = NEWS_ARTICLES.find((item) => item.slug === slug);
  if (!local) return {};
  return pageMeta(locale, `newsArticles.${slug}`);
}

export default async function NewsArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  applyRequestLocale(locale);
  const { article, html } = await resolveArticleHtml(slug, locale);
  if (!html) notFound();
  return (
    <SiteChrome
      locale={locale}
      page={article}
      html={html}
      fallbackBodyClass="is-loading"
      fallbackScripts={CORE_SCRIPTS}
    />
  );
}
