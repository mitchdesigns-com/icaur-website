import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link } from "@/i18n/navigation";
import type { CmsGlobal, CmsNavModel, CmsVehicleModel } from "@/lib/cms";

type Props = {
  global?: CmsGlobal | null;
  models?: CmsVehicleModel[] | null;
};

export async function Header({ global, models }: Props) {
  const t = await getTranslations("nav");
  const nav = global?.nav;
  const label = (key: keyof NonNullable<CmsGlobal["nav"]>, fallback?: string) =>
    (typeof nav?.[key] === "string" ? (nav[key] as string) : undefined) || fallback || t(key as never);
  const cards = nav?.modelCards?.length ? nav.modelCards : defaultModelCards(t);
  const serviceLinks = nav?.serviceLinks?.length
    ? nav.serviceLinks
    : [
        { label: t("maintenance"), href: "/services/maintenance" },
        { label: t("programs"), href: "/services/programs" },
        { label: t("warranty"), href: "/services/warranty" },
      ];

  return (
    <>
      <nav className="nav" id="nav" role="navigation" aria-label="Main">
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label={label("homeAria")}>
            <img
              src={nav?.logo || "/assets/images/icaur-logo.svg"}
              alt="iCAUR"
              width={113}
              height={22}
              aria-hidden="true"
            />
          </Link>

          <ul className="nav__links" role="list">
            <li>
              <Link href="/about" className="nav__link">
                {label("about")}
              </Link>
            </li>
            <li className="nav__item--has-drop">
              <Link
                href="/models/v27"
                className="nav__link nav__drop-trigger"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {label("models")}
                <Chevron />
              </Link>
              <div className="nav__dropdown" id="navModelsDropdown" role="region" aria-label={label("modelsAria")}>
                {cards.map((card) => (
                  <ModelCard key={card.slug || card.href || card.name} card={card} explore={label("explore")} startsFrom={label("startsFrom")} />
                ))}
              </div>
            </li>
            <li className="nav__item--has-drop">
              <Link
                href="/services"
                className="nav__link nav__drop-trigger"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {label("services")}
                <Chevron />
              </Link>
              <div
                className="nav__dropdown nav__dropdown--services"
                id="navServicesDropdown"
                role="region"
                aria-label={label("servicesAria")}
              >
                <div className="nav__svc-links">
                  {serviceLinks.map((item) => (
                    <Link key={item.href} href={(item.href || "/services") as never} className="nav__svc-link">
                      {item.label}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/services"
                  className="nav__svc-media"
                  data-cursor-label={label("explore")}
                  aria-label={label("allServices")}
                >
                  <img
                    src={nav?.servicesImage || "/assets/images/Maintainance.webp"}
                    alt={nav?.servicesImageAlt || "iCAUR service & maintenance"}
                    loading="lazy"
                  />
                </Link>
              </div>
            </li>
            <li>
              <Link href="/innovation" className="nav__link">
                {label("innovation")}
              </Link>
            </li>
            <li>
              <Link href="/news" className="nav__link">
                {label("news")}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="nav__link">
                {label("faq")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="nav__link">
                {label("contact")}
              </Link>
            </li>
          </ul>

          <div className="nav__actions">
            <LanguageSwitcher
              id="langToggle"
              className="nav__lang"
              switchToAr={global?.lang?.switchToAr}
              switchToEn={global?.lang?.switchToEn}
              arLabel={global?.lang?.arLabel}
              enLabel={global?.lang?.enLabel}
            />
            <button className="nav__compare" id="compareToggle" aria-label={label("compareAria")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M11 2l3 3-3 3M14 5H5M5 14l-3-3 3-3M2 11h9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="nav__compare-label">{label("compare")}</span>
              <span className="nav__compare-count" id="compareCount" data-count="0">
                0
              </span>
            </button>
            <Link href="/reserve" className="btn btn--reserve btn--sm nav-btn-reserve">
              {label("reserve")} <span className="brand-name">iCAUR</span>
            </Link>
          </div>

          <button className="nav__hamburger" id="navHamburger" aria-expanded="false" aria-label={label("menu")}>
            <span />
            <span />
          </button>
        </div>
      </nav>

      <CompareDrawer compare={global?.compare} />
      <CompareModal compare={global?.compare} models={models} cards={cards} startsFrom={label("startsFrom")} />
      <MobileMenu global={global} cards={cards} serviceLinks={serviceLinks} />
    </>
  );
}

function Chevron() {
  return (
    <svg className="nav__drop-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ModelCard({
  card,
  explore,
  startsFrom,
}: {
  card: CmsNavModel;
  explore: string;
  startsFrom: string;
}) {
  return (
    <article className="mfc">
      <Link href={(card.href || "/models/v27") as never} className="mfc__inner" data-cursor-label={explore}>
        <span className="mfc__glow" aria-hidden="true" />
        <img src={card.image} alt="" className="mfc__img mfc__img--default" loading="lazy" />
        <img src={card.hoverImage} alt={card.alt || ""} className="mfc__img mfc__img--hover" loading="lazy" />
        <div className="mfc__bottom">
          <img src={card.logo} alt={card.alt || ""} className="mfc__logo" />
          <h3 className="mfc__name">
            {card.name} <span className="mfc__hl">{card.highlight}</span>
          </h3>
          <div className="mfc__specs">
            {(card.specs || []).map((spec) => (
              <span key={`${spec.label}-${spec.value}`}>{spec.value}</span>
            ))}
          </div>
          <div className="mfc__price">
            <span className="mfc__price-label">{startsFrom}</span>
            <span className="mfc__price-value">{card.price}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function defaultModelCards(t: (key: string) => string): CmsNavModel[] {
  return [
    {
      slug: "v27",
      href: "/models/v27",
      name: t("v27Name"),
      highlight: t("v27Highlight"),
      price: t("v27Price"),
      logo: "/assets/images/V27-logo.svg",
      image: "/assets/images/v27-model-in-homepge-01.webp",
      hoverImage: "/assets/images/v27-model-in-homepge-02.webp",
      alt: "iCAUR V27",
      specs: [
        { value: "450 km" },
        { value: "380 hp" },
        { value: "4.8s 0–100" },
      ],
    },
    {
      slug: "o3t",
      href: "/models/v27",
      name: t("o3tName"),
      highlight: t("o3tHighlight"),
      price: t("o3tPrice"),
      logo: "/assets/images/T03-logo.svg",
      image: "/assets/images/ot3-model-in-homepage-01.webp",
      hoverImage: "/assets/images/ot3-model-in-homepage-02.webp",
      alt: "iCAUR O3T",
      specs: [
        { value: "520 km" },
        { value: "420 hp" },
        { value: "4.2s 0–100" },
      ],
    },
  ];
}

async function CompareDrawer({ compare }: { compare?: CmsGlobal["compare"] }) {
  const t = await getTranslations("compare");
  return (
    <div className="cmp-drawer" id="cmpDrawer" aria-hidden="true">
      <div className="cmp-drawer__backdrop" id="cmpBackdrop" />
      <div className="cmp-drawer__sheet cmp-drawer__sheet--1" aria-hidden="true" />
      <div className="cmp-drawer__sheet cmp-drawer__sheet--2" aria-hidden="true" />
      <div className="cmp-drawer__panel">
        <header className="cmp-drawer__header">
          <h3>{compare?.title || t("title")}</h3>
          <button className="cmp-drawer__close" id="cmpClose" aria-label={compare?.close || t("close")}>
            ✕
          </button>
        </header>
        <div className="cmp-drawer__body" id="cmpBody">
          <div className="cmp-empty">
            <button className="cmp-add-btn" id="cmpAddBtn">
              <span className="cmp-add-btn__icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 4v14M4 11h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span>{compare?.addModel || t("addModel")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function CompareModal({
  compare,
  models,
  cards,
  startsFrom,
}: {
  compare?: CmsGlobal["compare"];
  models?: CmsVehicleModel[] | null;
  cards: CmsNavModel[];
  startsFrom: string;
}) {
  const t = await getTranslations("compare");
  const fromPrice = compare?.fromPrice || String(t.raw("fromPrice"));
  const columns =
    models?.length
      ? models.map((model) => ({
          slug: model.slug || "",
          name: model.tagline || model.name,
          highlight: model.highlight,
          image: model.image,
          hoverImage: model.hoverImage,
          logo: model.logo,
          alt: model.name,
          specs: model.specs,
          trims: model.trims || [],
        }))
      : cards.map((card) => ({
          slug: card.slug || "",
          name: card.name,
          highlight: card.highlight,
          image: card.image,
          hoverImage: card.hoverImage,
          logo: card.logo,
          alt: card.alt,
          specs: card.specs,
          trims: [],
        }));

  return (
    <div className="cmp-modal" id="cmpModal" aria-hidden="true">
      <div className="cmp-modal__backdrop" id="cmpModalBackdrop" />
      <div className="cmp-modal__panel">
        <header className="cmp-modal__header">
          <div className="cmp-modal__header-top">
            <h4>{compare?.selectTitle || t("selectTitle")}</h4>
            <button className="cmp-modal__close" id="cmpModalClose" aria-label={compare?.close || t("close")}>
              ✕
            </button>
          </div>
          <p>
            {compare?.selectHint || t("selectHint")}{" "}
            <span className="cmp-modal__count">
              {compare?.selected || t("selected")} <em id="cmpModalSelCount">0</em> / 5
            </span>
          </p>
        </header>
        <div className="cmp-modal__grid">
          {columns.map((column) => (
            <div className="cmp-model-col" key={column.slug || column.name}>
              <div className="cmp-mfc">
                <img src={column.image} alt={column.alt || ""} className="cmp-mfc__img cmp-mfc__img--default" />
                <img src={column.hoverImage} alt={column.alt || ""} className="cmp-mfc__img cmp-mfc__img--hover" />
                <img src={column.logo} alt="" className="cmp-mfc__logo" aria-hidden="true" />
                <div className="cmp-mfc__bottom">
                  <span className="cmp-mfc__name">
                    {column.name} <em>{column.highlight}</em>
                  </span>
                  <div className="cmp-mfc__specs">
                    {(column.specs || []).map((spec) => (
                      <span key={`${spec.label}-${spec.value}`}>{spec.value?.replace(" 0–100", "")}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="cmp-trims">
                {(column.trims.length
                  ? column.trims
                  : fallbackTrims(column.slug, t)
                ).map((trim) => (
                  <label className="cmp-trim" key={trim.name}>
                    <input
                      type="checkbox"
                      data-model={column.slug}
                      data-trim={trim.name}
                      data-label={trim.compareLabel || `${column.alt || column.slug} ${trim.name}`}
                    />
                    <span className="cmp-trim__box" />
                    <span className="cmp-trim__name">{trim.name}</span>
                    <span className="cmp-trim__price">
                      {fromPrice.includes("{price}")
                        ? fromPrice.replace("{price}", trim.fromPrice || "")
                        : `${startsFrom} ${trim.fromPrice || ""}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <footer className="cmp-modal__footer">
          <button className="btn btn--dark btn--arrow btn--magnetic" id="cmpConfirm">
            {compare?.done || t("done")} <span className="arrow">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
}

function fallbackTrims(slug: string, t: (key: string, values?: { price: string }) => string) {
  if (slug === "o3t") {
    return [
      { name: t("core"), fromPrice: "480,000 EGP", compareLabel: "O3T Core" },
      { name: t("plus"), fromPrice: "560,000 EGP", compareLabel: "O3T Plus" },
      { name: t("ultra"), fromPrice: "640,000 EGP", compareLabel: "O3T Ultra" },
    ];
  }
  return [
    { name: t("standardRange"), fromPrice: "450,000 EGP", compareLabel: "V27 Standard Range" },
    { name: t("longRange"), fromPrice: "520,000 EGP", compareLabel: "V27 Long Range" },
    { name: t("performance"), fromPrice: "610,000 EGP", compareLabel: "V27 Performance" },
  ];
}

async function MobileMenu({
  global,
  cards,
  serviceLinks,
}: {
  global?: CmsGlobal | null;
  cards: CmsNavModel[];
  serviceLinks: { label?: string; href?: string }[];
}) {
  const t = await getTranslations("nav");
  const compare = await getTranslations("compare");
  const nav = global?.nav;

  return (
    <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
      <button className="mobile-menu__close" id="mobileClose" aria-label={global?.compare?.close || compare("close")}>
        ✕
      </button>
      <nav className="mobile-menu__nav" aria-label="Mobile">
        <ul role="list">
          <li>
            <Link href="/about">{nav?.about || t("about")}</Link>
          </li>
          <li className="mobile-menu__has-sub">
            <span className="mobile-menu__label" role="heading" aria-level={2}>
              {nav?.models || t("models")}
            </span>
            <ul className="mobile-menu__sub" role="list">
              {cards.map((card) => (
                <li key={card.slug || card.href}>
                  <Link href={(card.href || "/models/v27") as never}>{card.alt || card.slug}</Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="mobile-menu__has-sub">
            <span className="mobile-menu__label" role="heading" aria-level={2}>
              <Link href="/services">{nav?.services || t("services")}</Link>
            </span>
            <ul className="mobile-menu__sub" role="list">
              {serviceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={(item.href || "/services") as never}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <Link href="/innovation">{nav?.innovation || t("innovation")}</Link>
          </li>
          <li>
            <Link href="/news">{nav?.news || t("news")}</Link>
          </li>
          <li>
            <Link href="/faq">{nav?.faq || t("faq")}</Link>
          </li>
          <li>
            <Link href="/contact">{nav?.contact || t("contact")}</Link>
          </li>
        </ul>
      </nav>
      <div className="mobile-menu__actions">
        <div className="mobile-menu__tools">
          <LanguageSwitcher
            id="mobileLangToggle"
            className="mobile-menu__tool"
            switchToAr={global?.lang?.switchToAr}
            switchToEn={global?.lang?.switchToEn}
            arLabel={global?.lang?.arLabel}
            enLabel={global?.lang?.enLabel}
          />
          <button className="mobile-menu__tool" id="mobileCompareToggle" aria-label={nav?.compareAria || t("compareAria")}>
            {nav?.compare || t("compare")}{" "}
            <span className="nav__compare-count" data-count="0">
              0
            </span>
          </button>
        </div>
        <Link href="/reserve" className="btn btn--filled btn--lg">
          {nav?.reserveMobile || t("reserveMobile")} <span className="brand-name">iCAUR</span>
        </Link>
      </div>
    </div>
  );
}
