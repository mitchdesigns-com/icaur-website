import type { Metadata } from "next";

export type CmsLink = {
  label?: string;
  href?: string;
};

export type CmsSocialLink = {
  name?: string;
  href?: string;
  ariaLabel?: string;
};

export type CmsSpec = {
  label?: string;
  value?: string;
};

export type CmsTrim = {
  name?: string;
  fromPrice?: string;
  range?: string;
  hp?: string;
  accel?: string;
  compareLabel?: string;
};

export type CmsNavModel = {
  slug?: string;
  href?: string;
  name?: string;
  highlight?: string;
  price?: string;
  logo?: string;
  image?: string;
  hoverImage?: string;
  alt?: string;
  specs?: CmsSpec[];
};

export type CmsSeo = {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
};

export type CmsCta = {
  title?: string;
  titleEm?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  videoSrc?: string;
  posterSrc?: string;
};

export type CmsFeatureFlag = {
  label?: string;
  included?: boolean;
};

export type CmsArticleBlock = {
  heading?: string;
  body?: string;
  quote?: string;
  image?: string;
  imageAlt?: string;
};

export type CmsFaqItem = {
  question?: string;
  answer?: string;
  category?: "sales" | "warranty" | "services" | "spare-parts" | "home" | string;
  sortOrder?: number;
  showOnHome?: boolean;
};

export type CmsGlobal = {
  seo?: CmsSeo;
  favicon?: string;
  nav?: {
    homeAria?: string;
    about?: string;
    models?: string;
    modelsAria?: string;
    services?: string;
    servicesAria?: string;
    allServices?: string;
    innovation?: string;
    news?: string;
    faq?: string;
    contact?: string;
    reserve?: string;
    reserveMobile?: string;
    compare?: string;
    compareAria?: string;
    explore?: string;
    menu?: string;
    startsFrom?: string;
    logo?: string;
    servicesImage?: string;
    servicesImageAlt?: string;
    modelCards?: CmsNavModel[];
    serviceLinks?: CmsLink[];
    links?: CmsLink[];
  };
  footer?: {
    homeAria?: string;
    models?: string;
    reserve?: string;
    newsletter?: string;
    emailPlaceholder?: string;
    emailAria?: string;
    subscribe?: string;
    legalPrefix?: string;
    privacy?: string;
    privacyHref?: string;
    legalSuffix?: string;
    terms?: string;
    termsHref?: string;
    social?: string;
    copyright?: string;
    credit?: string;
    hotline?: string;
    email?: string;
    logo?: string;
    partnerLogo?: string;
    partnerAlt?: string;
    modelLinks?: CmsLink[];
    navLinks?: CmsLink[];
    socials?: CmsSocialLink[];
  };
  quickNav?: {
    label?: string;
    whatsapp?: string;
    whatsappHref?: string;
    maintenance?: string;
    maintenanceHref?: string;
    testDrive?: string;
    testDriveHref?: string;
    open?: string;
  };
  compare?: {
    title?: string;
    close?: string;
    addModel?: string;
    selectTitle?: string;
    selectHint?: string;
    selected?: string;
    done?: string;
    fromPrice?: string;
  };
  lang?: {
    switchToAr?: string;
    switchToEn?: string;
    arLabel?: string;
    enLabel?: string;
  };
};

export type CmsPage = {
  seo?: CmsSeo;
  hero?: Record<string, unknown>;
  models?: Record<string, unknown>;
  overview?: Record<string, unknown>;
  services?: Record<string, unknown>;
  why?: { items?: Record<string, unknown>[] };
  media?: Record<string, unknown>;
  faq?: Record<string, unknown>;
  cta?: CmsCta;
  story?: Record<string, unknown>;
  figures?: { items?: Record<string, unknown>[] };
  vision?: Record<string, unknown>;
  mission?: Record<string, unknown>;
  values?: Record<string, unknown>;
  intro?: Record<string, unknown>;
  form?: Record<string, unknown>;
  app?: Record<string, unknown>;
  findUs?: Record<string, unknown>;
  technology?: Record<string, unknown>;
  pillars?: Record<string, unknown>[];
  filters?: Record<string, string>;
  featuredCta?: string;
  loadMore?: string;
  hub?: { cards?: Record<string, unknown>[] };
  book?: Record<string, unknown>;
  downloads?: Record<string, unknown>;
  coverage?: Record<string, unknown>;
};

export type CmsArticle = {
  slug?: string;
  title?: string;
  seo?: CmsSeo;
  description?: string;
  category?: string;
  publishedOn?: string;
  readTime?: string;
  coverImage?: string;
  blocks?: CmsArticleBlock[];
  related?: CmsArticle[];
};

export type CmsLocation = {
  slug?: string;
  name?: string;
  area?: string;
  address?: string;
  phone?: string;
  hours?: string;
  badges?: string[];
  lat?: number;
  lng?: number;
  mapsUrl?: string;
  sortOrder?: number;
};

export type CmsVehicleModel = {
  slug?: string;
  name?: string;
  tagline?: string;
  highlight?: string;
  href?: string;
  logo?: string;
  image?: string;
  hoverImage?: string;
  startingPrice?: string;
  specs?: CmsSpec[];
  trims?: CmsTrim[];
  features?: CmsFeatureFlag[] | Record<string, boolean>;
  sortOrder?: number;
};

export type CmsRuntime = {
  submitUrl?: string;
  locations?: CmsLocation[];
  models?: CmsVehicleModel[];
};

const CMS_URL = (process.env.NEXT_PUBLIC_CMS_URL || "").replace(/\/$/, "");

export function cmsAsset(src?: string | null): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("//") || src.startsWith("data:")) return src;
  if (src.startsWith("/uploads") && CMS_URL) return `${CMS_URL}${src}`;
  return src;
}

function withCmsAssets<T>(value: T): T {
  if (typeof value === "string") return cmsAsset(value) as T;
  if (Array.isArray(value)) return value.map((item) => withCmsAssets(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withCmsAssets(item)])) as T;
  }
  return value;
}

export function seoMetadata(
  seo?: CmsSeo | null,
  fallback: { title?: string; description?: string } = {}
): Metadata {
  const title = seo?.title || fallback.title;
  const description = seo?.description || fallback.description;
  const keywords = (seo?.keywords || "")
    .split(/[,،]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const image = cmsAsset(seo?.ogImage);
  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    openGraph: {
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

async function cmsGet<T>(path: string): Promise<T | null> {
  if (!CMS_URL) return null;
  try {
    const response = await fetch(`${CMS_URL}${path}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { data?: T };
    return withCmsAssets((json.data ?? null) as T);
  } catch {
    return null;
  }
}

export function cmsHref(href: string): string | { pathname: string; query: Record<string, string> } {
  if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }
  const [pathname, search] = href.split("?");
  const query = Object.fromEntries(new URLSearchParams(search || ""));
  return Object.keys(query).length ? { pathname, query } : pathname;
}

export function featureMap(features?: CmsFeatureFlag[] | Record<string, boolean> | null): Record<string, boolean> {
  if (!features) return {};
  if (Array.isArray(features)) {
    return Object.fromEntries(features.map((item) => [item.label || "", Boolean(item.included)]));
  }
  return features;
}

export async function getGlobal(locale: string): Promise<CmsGlobal | null> {
  return cmsGet<CmsGlobal>(`/api/global?locale=${locale}`);
}

const PAGE_API: Record<string, string> = {
  home: "/api/home",
  about: "/api/about",
  contact: "/api/contact",
  faq: "/api/faq-page",
  innovation: "/api/innovation",
  news: "/api/news-page",
  reserve: "/api/reserve-page",
  services: "/api/services-page",
  "services-maintenance": "/api/maintenance-page",
  "services-programs": "/api/programs-page",
  "services-warranty": "/api/warranty-page",
  "models-v27": "/api/v27-page",
};

export async function getPage(slug: string, locale: string): Promise<CmsPage | null> {
  const path = PAGE_API[slug];
  if (!path) return null;
  return cmsGet<CmsPage>(`${path}?locale=${locale}`);
}

export async function getArticle(slug: string, locale: string): Promise<CmsArticle | null> {
  return cmsGet<CmsArticle>(`/api/articles?slug=${encodeURIComponent(slug)}&locale=${locale}`);
}

export async function getArticles(locale: string): Promise<CmsArticle[] | null> {
  return cmsGet<CmsArticle[]>(`/api/articles?locale=${locale}`);
}

export async function getFaqs(locale: string): Promise<CmsFaqItem[] | null> {
  return cmsGet<CmsFaqItem[]>(`/api/faq-items?locale=${locale}`);
}

export async function getLocations(locale: string): Promise<CmsLocation[] | null> {
  return cmsGet<CmsLocation[]>(`/api/locations?locale=${locale}`);
}

export async function getVehicleModels(locale: string): Promise<CmsVehicleModel[] | null> {
  return cmsGet<CmsVehicleModel[]>(`/api/vehicle-models?locale=${locale}`);
}

export async function loadChrome(locale: string) {
  const [global, locations, models] = await Promise.all([
    getGlobal(locale),
    getLocations(locale),
    getVehicleModels(locale),
  ]);
  return { global, locations, models };
}

export async function cmsPageMeta(slug: string, locale: string, fallback: { title?: string; description?: string }) {
  const page = await getPage(slug, locale);
  return seoMetadata(page?.seo, fallback);
}

export async function cmsArticleMeta(slug: string, locale: string, fallback: { title?: string; description?: string }) {
  const article = await getArticle(slug, locale);
  return seoMetadata(article?.seo, fallback);
}

export function cmsRuntime(locations?: CmsLocation[] | null, models?: CmsVehicleModel[] | null): CmsRuntime {
  return {
    submitUrl: CMS_URL ? `${CMS_URL}/api/reserve-submissions` : undefined,
    locations: locations ?? undefined,
    models: (models || []).map((model) => ({
      ...model,
      features: featureMap(model.features),
    })),
  };
}
