import type { CmsPage, CmsVehicleModel, CmsLocation } from "@/lib/cms";
import { cmsAsset } from "@/lib/cms";
import { ReserveFormClient } from "@/components/motion/ReserveFormClient";
import { CmsImg } from "./CmsMedia";
import { CmsLink, str } from "./shared";

type Props = {
  page: CmsPage;
  models: CmsVehicleModel[];
  locations: CmsLocation[];
};

const RESERVE_BG_FALLBACK = "/assets/images/ICUAR V27 brochure 03 20.webp";

export function ReserveView({ page, models, locations }: Props) {
  const hero = page.hero || {};
  const form = page.form || {};
  const bgSrc = cmsAsset(str(hero, "image", RESERVE_BG_FALLBACK) || RESERVE_BG_FALLBACK);
  return (
    <main id="main" className="font-body antialiased">
      <ReserveFormClient />
      <section className="rv-section relative" id="reserve">
        <div
          className="rv-bg"
          aria-hidden="true"
          id="rvBg"
          style={bgSrc ? { backgroundImage: `url("${bgSrc}")` } : undefined}
        />
        <div className="rv-overlay" aria-hidden="true" />
        <div className="rv-layout">
          <div className="rv-left reveal reveal--up">
            <h1 className="rv-h1">
              {str(hero, "title")}
              <br />
              <em>{str(hero, "titleEm")}</em>
            </h1>
            <p className="rv-sub">{str(hero, "subtitle")}</p>
          </div>
          <div className="rv-right reveal reveal--up" data-delay="1">
            <div className="rv-card">
              <p className="eyebrow rv-eyebrow rv-card-eyebrow">{str(form, "eyebrow")}</p>
              <form id="rvForm" className="rv-form" noValidate>
                <div className="rv-block">
                  <p className="rv-block-label">{str(form, "chooseModel")}</p>
                  <div className="rv-models" role="radiogroup" aria-label={str(form, "chooseModel")}>
                    {models.map((model, index) => (
                      <label className="rv-model" key={model.slug}>
                        <input type="radio" name="rv-model" value={model.slug} defaultChecked={index === 0} aria-label={model.name} />
                        <div className="rv-model-img-wrap">
                          <CmsImg src={model.image} alt={model.name || ""} loading="eager" variant="card" />
                          <div className="rv-model-overlay" aria-hidden="true" />
                          <CmsImg src={model.logo} alt={model.name || ""} className="rv-model-logo" variant="logo" />
                          <span className="rv-model-dot" aria-hidden="true">
                            <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="currentColor" /></svg>
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rv-divider" />
                <div className="rv-row">
                  <div className="rv-field" id="rvf-first">
                    <label className="rv-label" htmlFor="rv-first">{str(form, "firstName")}</label>
                    <input className="rv-input" id="rv-first" name="rv-first" type="text" required autoComplete="given-name" />
                  </div>
                  <div className="rv-field" id="rvf-last">
                    <label className="rv-label" htmlFor="rv-last">{str(form, "lastName")}</label>
                    <input className="rv-input" id="rv-last" name="rv-last" type="text" required autoComplete="family-name" />
                  </div>
                </div>
                <div className="rv-field" id="rvf-email">
                  <label className="rv-label" htmlFor="rv-email">{str(form, "emailAddress")}</label>
                  <input className="rv-input" id="rv-email" name="rv-email" type="email" required autoComplete="email" />
                </div>
                <div className="rv-field" id="rvf-phone">
                  <label className="rv-label" htmlFor="rv-phone">{str(form, "phoneNumber")}</label>
                  <input className="rv-input" id="rv-phone" name="rv-phone" type="tel" autoComplete="tel" />
                </div>
                <div className="rv-select-wrap" id="rvf-showroom">
                  <span className="rv-select-label">{str(form, "chooseShowroom")}</span>
                  <select className="rv-select" id="rv-showroom" name="rv-showroom" defaultValue="">
                    <option value="" disabled />
                    {locations.map((location) => (
                      <option value={location.slug} key={location.slug}>{location.name}</option>
                    ))}
                  </select>
                  <span className="rv-select-arrow" aria-hidden="true">
                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </div>
                <button type="submit" className="rv-submit">{str(form, "submit")}</button>
                <p className="rv-terms">
                  {str(form, "termsPrefix")}{" "}
                  <CmsLink href={str(form, "termsHref", "/terms-and-conditions")}>{str(form, "termsLabel")}</CmsLink>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
