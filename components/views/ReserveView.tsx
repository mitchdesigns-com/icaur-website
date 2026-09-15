import type { CmsPage, CmsVehicleModel, CmsLocation } from "@/lib/cms";
import { CmsLink, str } from "./shared";

type Props = {
  page: CmsPage;
  models: CmsVehicleModel[];
  locations: CmsLocation[];
};

export function ReserveView({ page, models, locations }: Props) {
  const hero = page.hero || {};
  const form = page.form || {};
  return (
    <main id="main">
      <section className="rv-section" id="reserve">
        <div className="rv-bg" aria-hidden="true" id="rvBg" />
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
              <div className="rv-block">
                <p className="rv-block-label">{str(form, "chooseModel")}</p>
                <div className="rv-models" role="radiogroup" aria-label={str(form, "chooseModel")}>
                  {models.map((model, index) => (
                    <label className="rv-model" key={model.slug}>
                      <input type="radio" name="rv-model" value={model.slug} defaultChecked={index === 0} aria-label={model.name} />
                      <div className="rv-model-img-wrap">
                        <img src={model.image} alt={model.name || ""} loading="eager" />
                        <div className="rv-model-overlay" aria-hidden="true" />
                        <img src={model.logo} alt={model.name || ""} className="rv-model-logo" />
                        <span className="rv-model-dot" aria-hidden="true">
                          <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="currentColor" /></svg>
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rv-divider" />
              <form id="rvForm" className="rv-form" noValidate>
                <div className="rv-row">
                  <div className="rv-field" id="rvf-first">
                    <label className="rv-label" htmlFor="rv-first">{str(form, "firstName")}</label>
                    <input className="rv-input" id="rv-first" type="text" required autoComplete="given-name" />
                  </div>
                  <div className="rv-field" id="rvf-last">
                    <label className="rv-label" htmlFor="rv-last">{str(form, "lastName")}</label>
                    <input className="rv-input" id="rv-last" type="text" required autoComplete="family-name" />
                  </div>
                </div>
                <div className="rv-field" id="rvf-email">
                  <label className="rv-label" htmlFor="rv-email">{str(form, "emailAddress")}</label>
                  <input className="rv-input" id="rv-email" type="email" required autoComplete="email" />
                </div>
                <div className="rv-field" id="rvf-phone">
                  <label className="rv-label" htmlFor="rv-phone">{str(form, "phoneNumber")}</label>
                  <input className="rv-input" id="rv-phone" type="tel" autoComplete="tel" />
                </div>
                <div className="rv-select-wrap" id="rvf-showroom">
                  <span className="rv-select-label">{str(form, "chooseShowroom")}</span>
                  <select className="rv-select" id="rv-showroom" defaultValue="">
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
                  <CmsLink href={str(form, "termsHref", "/terms")}>{str(form, "termsLabel")}</CmsLink>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
