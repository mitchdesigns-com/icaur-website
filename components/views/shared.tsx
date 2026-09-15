import type { ReactNode, CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { cmsHref, type CmsCta } from "@/lib/cms";

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

export function CtaVideo({ cta }: { cta?: CmsCta | null }) {
  if (!cta) return null;
  return (
    <section className="cta-video" id="cta">
      <video
        className="cta-video__bg"
        src={cta.videoSrc || "/assets/images/CTA-bg.webm"}
        poster={cta.posterSrc || "/assets/images/CTA.webp"}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="cta-video__overlay" aria-hidden="true" />
      <div className="cta-video__glass reveal reveal--blur">
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

export function BrandName({ children }: { children?: ReactNode }) {
  return <span className="brand-name">{children || "iCAUR"}</span>;
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
  return typeof value === "string" ? value : value == null ? fallback : String(value);
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
