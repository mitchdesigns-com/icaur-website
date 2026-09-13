import Link from "next/link";

export function Header() {
  return (
    <>
      <nav className="nav" id="nav" role="navigation" aria-label="Main">
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label="iCAUR home">
            <img
              src="/assets/images/icaur-logo.svg"
              alt="iCAUR"
              width={113}
              height={22}
              aria-hidden="true"
            />
          </Link>

          <ul className="nav__links" role="list">
            <li>
              <Link href="/about" className="nav__link">
                About
              </Link>
            </li>
            <li className="nav__item--has-drop">
              <Link
                href="/models/v27"
                className="nav__link nav__drop-trigger"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Models
                <svg
                  className="nav__drop-chevron"
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <div
                className="nav__dropdown"
                id="navModelsDropdown"
                role="region"
                aria-label="Models"
              >
                <article className="mfc">
                  <Link
                    href="/models/v27"
                    className="mfc__inner"
                    data-cursor-label="Explore"
                  >
                    <span className="mfc__glow" aria-hidden="true" />
                    <img
                      src="/assets/images/v27-model-in-homepge-01.webp"
                      alt=""
                      className="mfc__img mfc__img--default"
                      loading="lazy"
                    />
                    <img
                      src="/assets/images/v27-model-in-homepge-02.webp"
                      alt="iCAUR V27"
                      className="mfc__img mfc__img--hover"
                      loading="lazy"
                    />
                    <div className="mfc__bottom">
                      <img
                        src="/assets/images/V27-logo.svg"
                        alt="iCAUR V27"
                        className="mfc__logo"
                      />
                      <h3 className="mfc__name">
                        Bold. <span className="mfc__hl">Capable.</span>
                      </h3>
                      <div className="mfc__specs">
                        <span>450 km</span>
                        <span>380 hp</span>
                        <span>4.8s 0–100</span>
                      </div>
                      <div className="mfc__price">
                        <span className="mfc__price-label">Starts from</span>
                        <span className="mfc__price-value">1,490,000 EGP</span>
                      </div>
                    </div>
                  </Link>
                </article>
                <article className="mfc">
                  <Link
                    href="/models/v27"
                    className="mfc__inner"
                    data-cursor-label="Explore"
                  >
                    <span className="mfc__glow" aria-hidden="true" />
                    <img
                      src="/assets/images/ot3-model-in-homepage-01.webp"
                      alt=""
                      className="mfc__img mfc__img--default"
                      loading="lazy"
                    />
                    <img
                      src="/assets/images/ot3-model-in-homepage-02.webp"
                      alt="iCAUR O3T"
                      className="mfc__img mfc__img--hover"
                      loading="lazy"
                    />
                    <div className="mfc__bottom">
                      <img
                        src="/assets/images/T03-logo.svg"
                        alt="iCAUR O3T"
                        className="mfc__logo"
                      />
                      <h3 className="mfc__name">
                        Smart. <span className="mfc__hl">Sleek.</span>
                      </h3>
                      <div className="mfc__specs">
                        <span>520 km</span>
                        <span>420 hp</span>
                        <span>4.2s 0–100</span>
                      </div>
                      <div className="mfc__price">
                        <span className="mfc__price-label">Starts from</span>
                        <span className="mfc__price-value">480,000 EGP</span>
                      </div>
                    </div>
                  </Link>
                </article>
              </div>
            </li>
            <li className="nav__item--has-drop">
              <Link
                href="/services"
                className="nav__link nav__drop-trigger"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Services
                <svg
                  className="nav__drop-chevron"
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <div
                className="nav__dropdown nav__dropdown--services"
                id="navServicesDropdown"
                role="region"
                aria-label="Services"
              >
                <div className="nav__svc-links">
                  <Link href="/services/maintenance" className="nav__svc-link">
                    Maintenance Schedules
                  </Link>
                  <Link href="/services/programs" className="nav__svc-link">
                    Programs
                  </Link>
                  <Link href="/services/warranty" className="nav__svc-link">
                    Warranty
                  </Link>
                </div>
                <Link
                  href="/services"
                  className="nav__svc-media"
                  data-cursor-label="Explore"
                  aria-label="All services"
                >
                  <img
                    src="/assets/images/Maintainance.webp"
                    alt="iCAUR service & maintenance"
                    loading="lazy"
                  />
                </Link>
              </div>
            </li>
            <li>
              <Link href="/innovation" className="nav__link">
                Innovation
              </Link>
            </li>
            <li>
              <Link href="/news" className="nav__link">
                Media Center
              </Link>
            </li>
            <li>
              <Link href="/faq" className="nav__link">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/contact" className="nav__link">
                Contact Us
              </Link>
            </li>
          </ul>

          <div className="nav__actions">
            <button className="nav__lang" id="langToggle" lang="ar" aria-label="التبديل إلى العربية">
              العربية
            </button>
            <button className="nav__compare" id="compareToggle" aria-label="Compare models">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M11 2l3 3-3 3M14 5H5M5 14l-3-3 3-3M2 11h9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="nav__compare-label">Compare</span>
              <span className="nav__compare-count" id="compareCount" data-count="0">
                0
              </span>
            </button>
            <Link href="/reserve" className="btn btn--reserve btn--sm nav-btn-reserve">
              Reserve <span className="brand-name">iCAUR</span>
            </Link>
          </div>

          <button className="nav__hamburger" id="navHamburger" aria-expanded="false" aria-label="Toggle menu">
            <span />
            <span />
          </button>
        </div>
      </nav>

      <CompareDrawer />
      <CompareModal />
      <MobileMenu />
    </>
  );
}

function CompareDrawer() {
  return (
    <div className="cmp-drawer" id="cmpDrawer" aria-hidden="true">
      <div className="cmp-drawer__backdrop" id="cmpBackdrop" />
      <div className="cmp-drawer__sheet cmp-drawer__sheet--1" aria-hidden="true" />
      <div className="cmp-drawer__sheet cmp-drawer__sheet--2" aria-hidden="true" />
      <div className="cmp-drawer__panel">
        <header className="cmp-drawer__header">
          <h3>Compare iCAUR Models</h3>
          <button className="cmp-drawer__close" id="cmpClose" aria-label="Close">
            ✕
          </button>
        </header>
        <div className="cmp-drawer__body" id="cmpBody">
          <div className="cmp-empty">
            <button className="cmp-add-btn" id="cmpAddBtn">
              <span className="cmp-add-btn__icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M11 4v14M4 11h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>Add Model</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareModal() {
  return (
    <div className="cmp-modal" id="cmpModal" aria-hidden="true">
      <div className="cmp-modal__backdrop" id="cmpModalBackdrop" />
      <div className="cmp-modal__panel">
        <header className="cmp-modal__header">
          <div className="cmp-modal__header-top">
            <h4>Select Models &amp; Trims</h4>
            <button className="cmp-modal__close" id="cmpModalClose" aria-label="Close">
              ✕
            </button>
          </div>
          <p>
            Choose up to 5 trims to compare.{" "}
            <span className="cmp-modal__count">
              Selected: <em id="cmpModalSelCount">0</em> / 5
            </span>
          </p>
        </header>
        <div className="cmp-modal__grid">
          <div className="cmp-model-col">
            <div className="cmp-mfc">
              <img
                src="/assets/images/v27-model-in-homepge-01.webp"
                alt="iCAUR V27"
                className="cmp-mfc__img cmp-mfc__img--default"
              />
              <img
                src="/assets/images/v27-model-in-homepge-02.webp"
                alt="iCAUR V27"
                className="cmp-mfc__img cmp-mfc__img--hover"
              />
              <img
                src="/assets/images/V27-logo.svg"
                alt=""
                className="cmp-mfc__logo"
                aria-hidden="true"
              />
              <div className="cmp-mfc__bottom">
                <span className="cmp-mfc__name">
                  Bold. <em>Capable.</em>
                </span>
                <div className="cmp-mfc__specs">
                  <span>450 km</span>
                  <span>380 hp</span>
                  <span>4.8s</span>
                </div>
              </div>
            </div>
            <div className="cmp-trims">
              <label className="cmp-trim">
                <input
                  type="checkbox"
                  data-model="v27"
                  data-trim="Standard Range"
                  data-label="V27 Standard Range"
                />
                <span className="cmp-trim__box" />
                <span className="cmp-trim__name">Standard Range</span>
                <span className="cmp-trim__price">From 450,000 EGP</span>
              </label>
              <label className="cmp-trim">
                <input
                  type="checkbox"
                  data-model="v27"
                  data-trim="Long Range"
                  data-label="V27 Long Range"
                />
                <span className="cmp-trim__box" />
                <span className="cmp-trim__name">Long Range</span>
                <span className="cmp-trim__price">From 520,000 EGP</span>
              </label>
              <label className="cmp-trim">
                <input
                  type="checkbox"
                  data-model="v27"
                  data-trim="Performance"
                  data-label="V27 Performance"
                />
                <span className="cmp-trim__box" />
                <span className="cmp-trim__name">Performance</span>
                <span className="cmp-trim__price">From 610,000 EGP</span>
              </label>
            </div>
          </div>

          <div className="cmp-model-col">
            <div className="cmp-mfc">
              <img
                src="/assets/images/ot3-model-in-homepage-01.webp"
                alt="iCAUR O3T"
                className="cmp-mfc__img cmp-mfc__img--default"
              />
              <img
                src="/assets/images/ot3-model-in-homepage-02.webp"
                alt="iCAUR O3T"
                className="cmp-mfc__img cmp-mfc__img--hover"
              />
              <img
                src="/assets/images/T03-logo.svg"
                alt=""
                className="cmp-mfc__logo"
                aria-hidden="true"
              />
              <div className="cmp-mfc__bottom">
                <span className="cmp-mfc__name">
                  Smart. <em>Sleek.</em>
                </span>
                <div className="cmp-mfc__specs">
                  <span>520 km</span>
                  <span>420 hp</span>
                  <span>4.2s</span>
                </div>
              </div>
            </div>
            <div className="cmp-trims">
              <label className="cmp-trim">
                <input type="checkbox" data-model="o3t" data-trim="Core" data-label="O3T Core" />
                <span className="cmp-trim__box" />
                <span className="cmp-trim__name">Core</span>
                <span className="cmp-trim__price">From 480,000 EGP</span>
              </label>
              <label className="cmp-trim">
                <input type="checkbox" data-model="o3t" data-trim="Plus" data-label="O3T Plus" />
                <span className="cmp-trim__box" />
                <span className="cmp-trim__name">Plus</span>
                <span className="cmp-trim__price">From 560,000 EGP</span>
              </label>
              <label className="cmp-trim">
                <input type="checkbox" data-model="o3t" data-trim="Ultra" data-label="O3T Ultra" />
                <span className="cmp-trim__box" />
                <span className="cmp-trim__name">Ultra</span>
                <span className="cmp-trim__price">From 640,000 EGP</span>
              </label>
            </div>
          </div>
        </div>
        <footer className="cmp-modal__footer">
          <button className="btn btn--dark btn--arrow btn--magnetic" id="cmpConfirm">
            Done <span className="arrow">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
}

function MobileMenu() {
  return (
    <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
      <button className="mobile-menu__close" id="mobileClose" aria-label="Close">
        ✕
      </button>
      <nav className="mobile-menu__nav" aria-label="Mobile">
        <ul role="list">
          <li>
            <Link href="/about">About</Link>
          </li>
          <li className="mobile-menu__has-sub">
            <span className="mobile-menu__label" role="heading" aria-level={2}>
              Models
            </span>
            <ul className="mobile-menu__sub" role="list">
              <li>
                <Link href="/models/v27">V27</Link>
              </li>
              <li>
                <Link href="/models/v27">O3T</Link>
              </li>
            </ul>
          </li>
          <li className="mobile-menu__has-sub">
            <span className="mobile-menu__label" role="heading" aria-level={2}>
              <Link href="/services">Services</Link>
            </span>
            <ul className="mobile-menu__sub" role="list">
              <li>
                <Link href="/services/maintenance">Maintenance Schedules</Link>
              </li>
              <li>
                <Link href="/services/programs">Programs</Link>
              </li>
              <li>
                <Link href="/services/warranty">Warranty</Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/innovation">Innovation</Link>
          </li>
          <li>
            <Link href="/news">Media Center</Link>
          </li>
          <li>
            <Link href="/faq">FAQs</Link>
          </li>
          <li>
            <Link href="/contact">Contact Us</Link>
          </li>
        </ul>
      </nav>
      <div className="mobile-menu__actions">
        <div className="mobile-menu__tools">
          <button
            className="mobile-menu__tool"
            id="mobileLangToggle"
            lang="ar"
            aria-label="التبديل إلى العربية"
          >
            العربية
          </button>
          <button className="mobile-menu__tool" id="mobileCompareToggle" aria-label="Compare models">
            Compare{" "}
            <span className="nav__compare-count" data-count="0">
              0
            </span>
          </button>
        </div>
        <Link href="/reserve" className="btn btn--filled btn--lg">
          Reserve Your <span className="brand-name">iCAUR</span>
        </Link>
      </div>
    </div>
  );
}
