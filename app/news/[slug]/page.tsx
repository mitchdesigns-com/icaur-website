import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/SiteChrome";
import { NEWS_ARTICLES } from "@/lib/newsArticles";
import { readPageHtml } from "@/lib/readPageHtml";
import { CORE_SCRIPTS } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

function findArticle(slug: string) {
  return NEWS_ARTICLES.find((article) => article.slug === slug);
}

export function generateStaticParams() {
  return NEWS_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  const html = await readPageHtml(article.contentId);
  return <SiteChrome bodyClass="is-loading" html={html} scripts={CORE_SCRIPTS} />;
}
