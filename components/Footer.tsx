import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { CmsGlobal } from "@/lib/cms";

type Props = {
  global?: CmsGlobal | null;
};

export async function Footer({ global }: Props) {
  const t = await getTranslations("footer");
  const footer = global?.footer;
  const modelLinks = footer?.modelLinks?.length
    ? footer.modelLinks
    : [
        { label: "V27", href: "/models/v27" },
        { label: "O3T", href: "/models/o3t" },
      ];
  const navLinks = footer?.navLinks?.length
    ? footer.navLinks
    : [
        { label: t("about"), href: "/about" },
        { label: t("services"), href: "/services" },
        { label: t("innovation"), href: "/innovation" },
        { label: t("news"), href: "/news" },
        { label: t("faq"), href: "/faq" },
        { label: t("contact"), href: "/contact" },
      ];
  const socials = footer?.socials?.length
    ? footer.socials
    : [
        { name: "facebook", href: "#", ariaLabel: t("facebook") },
        { name: "instagram", href: "#", ariaLabel: t("instagram") },
        { name: "twitter", href: "#", ariaLabel: t("twitter") },
        { name: "linkedin", href: "#", ariaLabel: t("linkedin") },
        { name: "youtube", href: "#", ariaLabel: t("youtube") },
      ];

  return (
    <>
      <section id="gameBg" className="game-bg" aria-label="iCAUR offroad game" />

      <footer className="footer" id="footer">
        <div className="footer__logo-wrap">
          <Link href="/" aria-label={footer?.homeAria || t("homeAria")} className="footer__wordmark reveal reveal--logo" data-delay="0">
            <img src={footer?.logo || "/assets/images/icaur-logo.svg"} alt="iCAUR" aria-hidden="true" />
          </Link>
        </div>

        <div className="footer__inner">
          <div className="footer__divider reveal reveal--clip-h" data-delay="1" />

          <div className="footer__body">
            <div className="footer__body-left reveal reveal--up" data-delay="2">
              <p className="footer__models-lbl">{footer?.models || t("models")}</p>
              <div className="footer__models-big">
                {modelLinks.map((item) => (
                  <Link key={item.href} href={(item.href || "/") as never}>
                    {item.label}
                  </Link>
                ))}
              </div>
              <nav className="footer__nav-row" aria-label="Footer navigation">
                {navLinks.map((item) => (
                  <Link key={item.href} href={(item.href || "/") as never}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link href="/reserve" className="btn btn--reserve btn--sm btn--arrow btn--magnetic">
                {footer?.reserve || t("reserve")} <span className="brand-name">iCAUR</span> <span className="arrow">→</span>
              </Link>
            </div>

            <div className="footer__body-right reveal reveal--up" data-delay="3">
              <h6 className="footer__nl-heading">{footer?.newsletter || t("newsletter")}</h6>
              <form className="nl-form--footer" action="#" method="post" noValidate>
                <input
                  type="email"
                  name="email"
                  placeholder={footer?.emailPlaceholder || t("emailPlaceholder")}
                  required
                  aria-label={footer?.emailAria || t("emailAria")}
                />
                <button type="submit">{footer?.subscribe || t("subscribe")}</button>
              </form>
              <p className="footer__nl-legal">
                {footer?.legalPrefix || t("legalPrefix")}{" "}
                <Link href={(footer?.privacyHref || "/privacy") as never}>{footer?.privacy || t("privacy")}</Link>{" "}
                {footer?.legalSuffix || t("legalSuffix")}
              </p>

              <div className="footer__contact">
                <a href={`tel:${(footer?.hotline || "17833").replace(/\s/g, "")}`} className="footer__contact-item">
                  <PhoneIcon />
                  <span>{footer?.hotline || "17833"}</span>
                </a>
                <a href={`mailto:${footer?.email || "hello@icaur.com"}`} className="footer__contact-item">
                  <MailIcon />
                  <span>{footer?.email || "hello@icaur.com"}</span>
                </a>
              </div>

              <div className="footer__partner">
                <img
                  src={footer?.partnerLogo || "/assets/images/GBauto.webp"}
                  alt={footer?.partnerAlt || "Ghabour Auto"}
                  className="footer__ghabour-logo"
                />
              </div>

              <div className="footer__social" aria-label={footer?.social || t("social")}>
                {socials.map((item) => (
                  <a key={item.name} href={item.href || "#"} aria-label={item.ariaLabel || item.name} className="social-link">
                    <SocialIcon name={item.name} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="footer__outro">
        <div className="footer__inner">
          <div className="footer__bottom">
            <p className="footer__legal">
              {footer?.copyright || t("copyright")} &nbsp;·&nbsp;{" "}
              <Link href={(footer?.privacyHref || "/privacy") as never}>{footer?.privacy || t("privacy")}</Link> &nbsp;·&nbsp;{" "}
              <Link href={(footer?.termsHref || "/terms") as never}>{footer?.terms || t("terms")}</Link>
            </p>
            <p className="footer__credit">{footer?.credit || t("credit")}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function SocialIcon({ name }: { name?: string }) {
  if (name === "instagram") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "twitter") {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (name === "linkedin") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  if (name === "youtube") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}
