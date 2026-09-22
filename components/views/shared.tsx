import type { ReactNode, CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { cmsHref, type CmsCta } from "@/lib/cms";
import { mediaUrl } from "@/lib/media";
import { CmsVideo } from "./CmsMedia";

type CmsLinkProps = {
  href?: string;
  className?: string;
  children: ReactNode;
  id?: string;
  "data-cursor-label"?: string;
  "aria-label"?: string;
  download?: boolean;
  style?: CSSProperties;
  "data-delay"?: number | string;
};

export function CmsLink({ href = "/", className, children, ...rest }: CmsLinkProps) {
  if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href || "#"} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={cmsHref(href) as never} className={className} {...rest}>
      {children}
    </Link>
  );
}

export function CtaVideo({ cta, reveal = "blur" }: { cta?: CmsCta | null; reveal?: "blur" | "up" }) {
  if (!cta) return null;
  return (
    <section className="cta-video" id="cta">
      <CmsVideo
        className="cta-video__bg"
        src={cta.videoSrc || "/assets/images/CTA-bg.webm"}
        poster={cta.posterSrc || "/assets/images/CTA.webp"}
        mode="lazy"
        aria-hidden="true"
      />
      <div className="cta-video__overlay" aria-hidden="true" />
      <div className={`cta-video__glass reveal reveal--${reveal}`}>
        <h2 className="cta-video__h">
          {cta.title} {cta.titleEm ? <em>{cta.titleEm}</em> : null}
        </h2>
        <p className="cta-video__body">{cta.body}</p>
        <div className="cta-video__actions">
          <CmsLink href={cta.primaryHref || "/reserve"} className="btn btn--filled btn--lg btn--arrow btn--magnetic">
            {cta.primaryLabel} <span className="brand-name">iCAUR</span> <span className="arrow">→</span>
          </CmsLink>
          <CmsLink href={cta.secondaryHref || "/contact"} className="btn btn--outline btn--arrow btn--magnetic">
            {cta.secondaryLabel} <span className="arrow">→</span>
          </CmsLink>
        </div>
      </div>
    </section>
  );
}

export function StoreBadges({
  appStoreLabel,
  appStoreHref,
  playLabel,
  playHref,
}: {
  appStoreLabel?: string;
  appStoreHref?: string;
  playLabel?: string;
  playHref?: string;
}) {
  if (!appStoreLabel && !playLabel) return null;

  function splitLabel(label: string, name: string) {
    const index = label.toLowerCase().lastIndexOf(name.toLowerCase());
    if (index > 0) return { sub: label.slice(0, index).trim(), name: label.slice(index) };
    return { sub: "", name: label };
  }

  const app = appStoreLabel ? splitLabel(appStoreLabel, "App Store") : null;
  const play = playLabel ? splitLabel(playLabel, "Google Play") : null;

  return (
    <div className="svc-book__badges">
      {app ? (
        <a href={appStoreHref || "#"} className="svc-book__badge btn--magnetic" aria-label={appStoreLabel} target={appStoreHref ? "_blank" : undefined} rel={appStoreHref ? "noopener noreferrer" : undefined}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          <div className="svc-book__badge-text">
            {app.sub ? <span className="svc-book__badge-sub">{app.sub}</span> : null}
            <span className="svc-book__badge-name">{app.name}</span>
          </div>
        </a>
      ) : null}
      {play ? (
        <a href={playHref || "#"} className="svc-book__badge btn--magnetic" aria-label={playLabel} target={playHref ? "_blank" : undefined} rel={playHref ? "noopener noreferrer" : undefined}>
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M1.08 0.42C0.72 0.64 0.5 1.04 0.5 1.52V20.48C0.5 20.96 0.72 21.36 1.08 21.58L1.16 21.66L11.62 11.2V11.04L1.16 0.34L1.08 0.42Z" fill="white" />
            <path d="M15.08 14.68L11.62 11.2V11.04L15.08 7.56L15.18 7.62L19.26 9.94C20.42 10.6 20.42 11.68 19.26 12.34L15.18 14.62L15.08 14.68Z" fill="white" opacity="0.9" />
            <path d="M15.18 14.62L11.62 11.12L1.08 21.58C1.46 21.98 2.08 22.02 2.78 21.62L15.18 14.62Z" fill="white" opacity="0.7" />
            <path d="M15.18 7.62L2.78 0.62C2.08 0.22 1.46 0.26 1.08 0.66L11.62 11.12L15.18 7.62Z" fill="white" opacity="0.7" />
          </svg>
          <div className="svc-book__badge-text">
            {play.sub ? <span className="svc-book__badge-sub">{play.sub}</span> : null}
            <span className="svc-book__badge-name">{play.name}</span>
          </div>
        </a>
      ) : null}
    </div>
  );
}

export function withBrand(text: string) {
  return text.split(/(iCAUR)/g).map((chunk, index) =>
    chunk === "iCAUR" ? (
      <span className="brand-name" key={index}>
        iCAUR
      </span>
    ) : (
      chunk
    )
  );
}

export function str(obj: Record<string, unknown> | undefined | null, key: string, fallback = "") {
  const value = obj?.[key];
  if (typeof value === "string") return value;
  const fromMedia = mediaUrl(value);
  if (fromMedia) return fromMedia;
  return value == null ? fallback : String(value);
}

export function cmsFile(obj: Record<string, unknown> | undefined | null, keys: string[] = ["file", "href"]) {
  for (const key of keys) {
    const value = obj?.[key];
    let url = "";
    if (typeof value === "string") url = value;
    else if (value && typeof value === "object" && "url" in value) {
      url = String((value as { url?: string }).url || "");
    }
    if (url && url !== "#") return url;
  }
  return "";
}

export function downloadName(title: string, url = "") {
  const fromUrl = decodeURIComponent(url.split("/").pop()?.split("?")[0] || "");
  if (fromUrl && /\.[a-z0-9]+$/i.test(fromUrl)) return fromUrl;
  const base = title.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "download";
  return `${base}.pdf`;
}

export function num(obj: Record<string, unknown> | undefined | null, key: string, fallback = 0) {
  const value = obj?.[key];
  return typeof value === "number" ? value : Number(value) || fallback;
}

export function list(obj: Record<string, unknown> | undefined | null, key: string): Record<string, unknown>[] {
  const value = obj?.[key];
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

export function texts(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "value" in item) return String((item as { value?: string }).value || "");
      return "";
    })
    .filter(Boolean);
}

export function formatDate(value?: string | null, locale = "en") {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function categoryLabel(category?: string) {
  if (!category) return "News";
  return category.charAt(0).toUpperCase() + category.slice(1);
}
