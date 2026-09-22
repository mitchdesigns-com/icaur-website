import type { CmsLocation, CmsPage, CmsVehicleModel } from "@/lib/cms";
import { CmsImg } from "./CmsMedia";
import { CtaVideo, StoreBadges, str } from "./shared";

type Props = {
  page: CmsPage;
  locations: CmsLocation[];
  models: CmsVehicleModel[];
};

export function ContactView({ page, locations, models }: Props) {
  const intro = page.intro || {};
  const form = page.form || {};
  const app = page.app || {};
  const findUs = page.findUs || {};
  const showrooms = locations.filter((item) => (item.badges || []).includes("showroom"));
  const services = locations.filter((item) => (item.badges || []).includes("service"));

  return (
    <main id="main">
      <section className="rs-section" id="contact">
        <div className="rs-bg" aria-hidden="true" />
        <div className="rs-card reveal reveal--up">
          <div className="rs-left">
            <p className="eyebrow rs-eyebrow">{str(intro, "eyebrow")}</p>
            <h2 className="rs-headline">{str(intro, "title")} <em>{str(intro, "titleEm")}</em></h2>
            <p className="rs-tagline">{str(intro, "tagline")}</p>
            <div className="rs-contact-links">
              <a href={`tel:${str(intro, "phone")}`} className="rs-contact-link">
                <span className="rs-contact-text">{str(intro, "phone")}</span>
              </a>
              <a href={`mailto:${str(intro, "email")}`} className="rs-contact-link">
                <span className="rs-contact-text">{str(intro, "email")}</span>
              </a>
            </div>
            <figure className="rs-left-media">
              <CmsImg src={intro.image} alt={str(intro, "imageAlt")} loading="lazy" variant="card" />
            </figure>
          </div>
          <div className="rs-right">
            <div className="rs-chips" role="tablist" aria-label={str(form, "requestTypeLabel")}>
              <button type="button" className="rs-chip is-active" role="tab" id="rschip-inquiry" data-panel="inquiry" aria-selected="true" aria-controls="rspanel-inquiry">{str(form, "inquiryChip")}</button>
              <button type="button" className="rs-chip" role="tab" id="rschip-testdrive" data-panel="testdrive" aria-selected="false" aria-controls="rspanel-testdrive">{str(form, "testDriveChip")}</button>
              <button type="button" className="rs-chip" role="tab" id="rschip-maintenance" data-panel="maintenance" aria-selected="false" aria-controls="rspanel-maintenance">{str(form, "maintenanceChip")}</button>
            </div>
            <form id="rsForm" aria-label="Contact form" noValidate>
              <div className="rs-group">
                <p className="rs-group-label">{str(form, "salutation")}</p>
                <div className="rs-radios" role="radiogroup" aria-label={str(form, "salutation")}>
                  <label className="rs-radio"><input type="radio" name="rs-salutation" value="mr" /><span className="rs-radio-dot" aria-hidden="true" />{str(form, "mr")}</label>
                  <label className="rs-radio"><input type="radio" name="rs-salutation" value="mrs" /><span className="rs-radio-dot" aria-hidden="true" />{str(form, "mrs")}</label>
                </div>
              </div>
              <div className="rs-field-row">
                <div className="rs-field" id="rsf-first">
                  <label className="rs-label" htmlFor="rs-first">{str(form, "firstName")}</label>
                  <input className="rs-input" id="rs-first" type="text" required autoComplete="given-name" />
                </div>
                <div className="rs-field" id="rsf-last">
                  <label className="rs-label" htmlFor="rs-last">{str(form, "lastName")}</label>
                  <input className="rs-input" id="rs-last" type="text" required autoComplete="family-name" />
                </div>
              </div>
              <div className="rs-ctx-row">
                <div className="rs-field" id="rsf-phone">
                  <label className="rs-label" htmlFor="rs-phone">{str(form, "phoneNumber")}</label>
                  <input className="rs-input" id="rs-phone" type="tel" autoComplete="tel" />
                </div>
                <div className="rs-select-wrap rs-slot" data-panel="inquiry">
                  <span className="rs-select-label">{str(form, "city")}</span>
                  <select className="rs-select" id="rs-city" aria-label={str(form, "city")} defaultValue="">
                    <option value="" disabled />
                    {locations.map((location) => (
                      <option value={location.slug} key={location.slug}>{location.area || location.name}</option>
                    ))}
                  </select>
                </div>
                <div className="rs-select-wrap rs-slot" data-panel="testdrive" hidden>
                  <span className="rs-select-label">{str(form, "showroom")}</span>
                  <select className="rs-select" id="rs-showroom" aria-label={str(form, "showroom")} defaultValue="">
                    <option value="" disabled />
                    {showrooms.map((location) => (
                      <option value={location.slug} key={location.slug}>{location.name}</option>
                    ))}
                  </select>
                </div>
                <div className="rs-select-wrap rs-slot" data-panel="maintenance" hidden>
                  <span className="rs-select-label">{str(form, "serviceCenter")}</span>
                  <select className="rs-select" id="rs-centre" aria-label={str(form, "serviceCenter")} defaultValue="">
                    <option value="" disabled />
                    {services.map((location) => (
                      <option value={location.slug} key={location.slug}>{location.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="rs-field" id="rsf-email">
                <label className="rs-label" htmlFor="rs-email">{str(form, "emailAddress")}</label>
                <input className="rs-input" id="rs-email" type="email" required autoComplete="email" />
              </div>
              <div className="rs-panel" id="rspanel-inquiry" data-panel="inquiry" role="tabpanel" aria-labelledby="rschip-inquiry">
                <div className="rs-ctx-row">
                  <div className="rs-select-wrap">
                    <span className="rs-select-label">{str(form, "requestCategory")}</span>
                    <select className="rs-select" id="rs-category" aria-label={str(form, "requestCategory")} defaultValue="">
                      <option value="" disabled />
                      <option value="inquiry">Inquiry</option>
                      <option value="complaint">Complaint</option>
                    </select>
                  </div>
                  <div className="rs-select-wrap is-disabled" id="rs-subwrap">
                    <span className="rs-select-label" id="rs-sublabel">{str(form, "subCategory")}</span>
                    <select className="rs-select" id="rs-subcategory" disabled aria-label={str(form, "subCategory")} defaultValue="">
                      <option value="" disabled />
                    </select>
                  </div>
                </div>
              </div>
              <div className="rs-panel" id="rspanel-testdrive" data-panel="testdrive" role="tabpanel" aria-labelledby="rschip-testdrive" hidden>
                <div className="rs-ctx-row">
                  <div className="rs-select-wrap">
                    <span className="rs-select-label">{str(form, "model")}</span>
                    <select className="rs-select" id="rs-td-model" aria-label={str(form, "model")} defaultValue="">
                      <option value="" disabled />
                      {models.map((model) => (
                        <option value={model.slug} key={model.slug}>{model.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rs-field rs-field--date">
                    <label className="rs-label" htmlFor="rs-td-date">{str(form, "preferredDate")}</label>
                    <input className="rs-input" id="rs-td-date" type="date" />
                    <span className="rs-date-text" aria-hidden="true" />
                  </div>
                </div>
                <div className="rs-ctx-row">
                  <div className="rs-select-wrap">
                    <span className="rs-select-label">{str(form, "preferredTime")}</span>
                    <select className="rs-select" id="rs-td-time" aria-label={str(form, "preferredTime")} defaultValue="">
                      <option value="" disabled />
                      <option value="10-12">10:00 — 12:00</option>
                      <option value="12-14">12:00 — 14:00</option>
                      <option value="14-16">14:00 — 16:00</option>
                      <option value="16-18">16:00 — 18:00</option>
                    </select>
                  </div>
                  <div className="rs-select-wrap">
                    <span className="rs-select-label">{str(form, "drivingLicense")}</span>
                    <select className="rs-select" id="rs-td-license" aria-label={str(form, "drivingLicense")} defaultValue="">
                      <option value="" disabled />
                      <option value="yes">{str(form, "licenseYes")}</option>
                      <option value="no">{str(form, "licenseNo")}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="rs-panel" id="rspanel-maintenance" data-panel="maintenance" role="tabpanel" aria-labelledby="rschip-maintenance" hidden>
                <div className="rs-ctx-row">
                  <div className="rs-select-wrap">
                    <span className="rs-select-label">{str(form, "model")}</span>
                    <select className="rs-select" id="rs-mt-model" aria-label={str(form, "model")} defaultValue="">
                      <option value="" disabled />
                      {models.map((model) => (
                        <option value={model.slug} key={`mt-${model.slug}`}>{model.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rs-select-wrap">
                    <span className="rs-select-label">{str(form, "serviceType")}</span>
                    <select className="rs-select" id="rs-mt-type" aria-label={str(form, "serviceType")} defaultValue="">
                      <option value="" disabled />
                      <option value="periodic">Periodic Maintenance</option>
                      <option value="repair">Repair</option>
                      <option value="bodywork">Body & Paint</option>
                      <option value="warranty">Warranty Claim</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="rs-ctx-row">
                  <div className="rs-field" id="rsf-mileage">
                    <label className="rs-label" htmlFor="rs-mt-mileage">{str(form, "mileage")}</label>
                    <input className="rs-input" id="rs-mt-mileage" type="number" min={0} step={1} inputMode="numeric" />
                  </div>
                  <div className="rs-field rs-field--date">
                    <label className="rs-label" htmlFor="rs-mt-date">{str(form, "preferredDate")}</label>
                    <input className="rs-input" id="rs-mt-date" type="date" />
                    <span className="rs-date-text" aria-hidden="true" />
                  </div>
                </div>
              </div>
              <div className="rs-textarea-wrap">
                <span className="rs-textarea-label">{str(form, "message")}</span>
                <textarea className="rs-textarea" id="rs-message" />
              </div>
              <div className="rs-group">
                <p className="rs-group-label">{str(form, "channelLabel")}</p>
                <div className="rs-checks">
                  <label className="rs-check"><input type="checkbox" name="rs-channel" value="phone-call" defaultChecked /><span className="rs-check-box" aria-hidden="true" />Phone Call</label>
                  <label className="rs-check"><input type="checkbox" name="rs-channel" value="email" defaultChecked /><span className="rs-check-box" aria-hidden="true" />Email</label>
                  <label className="rs-check"><input type="checkbox" name="rs-channel" value="sms" defaultChecked /><span className="rs-check-box" aria-hidden="true" />SMS</label>
                </div>
              </div>
              <div className="rs-cta">
                <button type="submit" className="rs-submit" id="rsSubmitBtn">{str(form, "submit")}</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="svc-book" id="book-app">
        <div className="svc-book__bg" aria-hidden="true" />
        <div className="svc-book__inner">
          <div id="svcBookCard">
            {str(app, "image") ? <CmsImg className="svc-book__pop" src={app.image} alt="" aria-hidden="true" variant="thumb" /> : null}
            <div className="svc-book__panel-wrap">
              <div className="svc-book__card">
                <h2 className="svc-book__h">{str(app, "title")}<br /><span style={{ color: "var(--amber)" }}>{str(app, "titleEm")}</span></h2>
                <p className="svc-book__body">{str(app, "body")}</p>
                <StoreBadges
                  appStoreLabel={str(app, "appStoreLabel")}
                  appStoreHref={str(app, "appStoreHref")}
                  playLabel={str(app, "playLabel")}
                  playHref={str(app, "playHref")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="find-us" className="find-us">
        <div className="find-us__grid">
          <div className="find-us__left">
            <div className="find-us__header" id="findUsHeader">
              <p className="eyebrow eyebrow--warm">{str(findUs, "eyebrow")}</p>
              <h2 className="find-us__h">{str(findUs, "title")}<br /><em>{str(findUs, "titleEm")}</em></h2>
            </div>
            <div className="find-us__list" id="findUsList" />
          </div>
          <div className="find-us-map-wrap" id="findUsMapWrap">
            <div id="findUsMap" />
          </div>
        </div>
      </section>

      <CtaVideo cta={page.cta} />
    </main>
  );
}
