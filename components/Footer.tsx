import Link from "next/link";

export function Footer() {
  return (
    <>
      <section id="gameBg" className="game-bg" aria-label="iCAUR offroad game" />

      <footer className="footer" id="footer">
        <div className="footer__logo-wrap">
          <Link href="/" aria-label="iCAUR home" className="footer__wordmark reveal reveal--logo" data-delay="0">
            <img src="/assets/images/icaur-logo.svg" alt="iCAUR" aria-hidden="true" />
          </Link>
        </div>

        <div className="footer__inner">
          <div className="footer__divider reveal reveal--clip-h" data-delay="1" />

          <div className="footer__body">
            <div className="footer__body-left reveal reveal--up" data-delay="2">
              <p className="footer__models-lbl">Models</p>
              <div className="footer__models-big">
                <Link href="/models/v27">V27</Link>
                <Link href="/models/o3t">O3T</Link>
              </div>
              <nav className="footer__nav-row" aria-label="Footer navigation">
                <Link href="/about">About</Link>
                <Link href="/services">Services</Link>
                <Link href="/innovation">Innovation</Link>
                <Link href="/news">Media Center</Link>
                <Link href="/faq">FAQs</Link>
                <Link href="/contact">Contact us</Link>
              </nav>
              <Link href="/reserve" className="btn btn--reserve btn--sm btn--arrow btn--magnetic">
                Reserve Your <span className="brand-name">iCAUR</span> <span className="arrow">→</span>
              </Link>
            </div>

            <div className="footer__body-right reveal reveal--up" data-delay="3">
              <h6 className="footer__nl-heading">Join Our Newsletter</h6>
              <form className="nl-form--footer" action="#" method="post" noValidate>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  required
                  aria-label="Email address"
                />
                <button type="submit">Subscribe</button>
              </form>
              <p className="footer__nl-legal">
                By subscribing you agree to our <Link href="/privacy">Privacy Policy</Link> and
                consent to receive updates from iCAUR.
              </p>

              <div className="footer__contact">
                <a href="tel:17833" className="footer__contact-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <span>17833</span>
                </a>
                <a href="mailto:hello@icaur.com" className="footer__contact-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>hello@icaur.com</span>
                </a>
              </div>

              <div className="footer__partner">
                <img
                  src="/assets/images/GBauto.webp"
                  alt="Ghabour Auto"
                  className="footer__ghabour-logo"
                />
              </div>

              <div className="footer__social" aria-label="Social media">
                <a href="#" aria-label="Facebook" className="social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="social-link">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a href="#" aria-label="X / Twitter" className="social-link">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn" className="social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a href="#" aria-label="YouTube" className="social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="footer__outro">
        <div className="footer__inner">
          <div className="footer__bottom">
            <p className="footer__legal">
              © 2026 iCAUR. All rights reserved. &nbsp;·&nbsp;{" "}
              <Link href="/privacy">Privacy Policy</Link> &nbsp;·&nbsp;{" "}
              <Link href="/terms">Terms of Service</Link>
            </p>
            <p className="footer__credit">WEBSITE DESIGN &amp; DEVELOPMENT BY MITCHDESIGNS</p>
          </div>
        </div>
      </div>
    </>
  );
}
