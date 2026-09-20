import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { ModelView } from "@/components/views/V27View";
import { getVehicleModel, seoMetadata } from "@/lib/cms";
import { applyRequestLocale, pageMeta } from "@/lib/pageMeta";
import { MODEL_CHROME } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const model = await getVehicleModel(slug, locale);
  const fallback =
    slug === "v27" || slug === "o3t"
      ? await pageMeta(locale, slug)
      : { title: model?.seo?.title || `iCAUR ${model?.name || slug}`, description: model?.seo?.description || model?.tagline || "" };
  return seoMetadata(model?.seo, fallback);
}

export default async function ModelPage({ params }: Props) {
  const { locale, slug } = await params;
  applyRequestLocale(locale);
  const model = await getVehicleModel(slug, locale);
  if (!model) notFound();
  const chrome = MODEL_CHROME;
  return (
    <SiteChrome locale={locale} bodyClass={chrome.bodyClass} scripts={chrome.scripts} styles={chrome.styles} page={model}>
      <ModelView page={model} mark={model.name || slug.toUpperCase()} />
    </SiteChrome>
  );
}
