import { NEWS_ARTICLES } from "@/lib/newsArticles";
import { readPageHtml } from "@/lib/readPageHtml";
import type { SiteScript } from "@/lib/site";

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
};

export type CmsScript = {
  src?: string;
  type?: "default" | "module";
};

export type CmsSection = {
  key?: string;
  html?: string;
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
  slug?: string;
  title?: string;
  seo?: CmsSeo;
  bodyClass?: string;
  extraStyles?: string[];
  scripts?: CmsScript[];
  sections?: CmsSection[];
  html?: string;
};

export type CmsArticle = CmsPage & {
  description?: string;
  category?: string;
  publishedOn?: string;
  readTime?: string;
  coverImage?: string;
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
  features?: Record<string, boolean>;
  experience?: Record<string, unknown>;
  sortOrder?: number;
};

export type CmsRuntime = {
  submitUrl?: string;
  locations?: CmsLocation[];
  models?: CmsVehicleModel[];
};

const CMS_URL = (process.env.NEXT_PUBLIC_CMS_URL || "").replace(/\/$/, "");

async function cmsGet<T>(path: string): Promise<T | null> {
  if (!CMS_URL) return null;
  try {
    const response = await fetch(`${CMS_URL}${path}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { data?: T };
    return json.data ?? null;
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

export function toSiteScripts(scripts?: CmsScript[] | null): SiteScript[] {
  if (!scripts?.length) return [];
  return scripts
    .filter((script): script is CmsScript & { src: string } => Boolean(script.src))
    .map((script) => (script.type === "module" ? { src: script.src, type: "module" as const } : { src: script.src }));
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
  if (page?.seo?.title) {
    return { title: page.seo.title, description: page.seo.description };
  }
  return fallback;
}

export async function cmsArticleMeta(slug: string, locale: string, fallback: { title?: string; description?: string }) {
  const article = await getArticle(slug, locale);
  if (article?.seo?.title) {
    return { title: article.seo.title, description: article.seo.description };
  }
  return fallback;
}

export async function resolvePageHtml(slug: string, locale: string, fallbackId: string) {
  const page = await getPage(slug, locale);
  if (page?.html) return { page, html: page.html };
  return { page, html: await readPageHtml(fallbackId) };
}

export async function resolveArticleHtml(slug: string, locale: string) {
  const article = await getArticle(slug, locale);
  if (article?.html) return { article, html: article.html };
  const local = NEWS_ARTICLES.find((item) => item.slug === slug);
  if (!local) return { article, html: null };
  return { article, html: await readPageHtml(local.contentId) };
}

export function cmsRuntime(locations?: CmsLocation[] | null, models?: CmsVehicleModel[] | null): CmsRuntime {
  return {
    submitUrl: CMS_URL ? `${CMS_URL}/api/reserve-submissions` : undefined,
    locations: locations ?? undefined,
    models: models ?? undefined,
  };
}
