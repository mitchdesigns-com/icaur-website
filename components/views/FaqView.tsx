import type { CmsFaqItem, CmsPage } from "@/lib/cms";
import { mediaList } from "@/lib/media";
import { CmsImg } from "./CmsMedia";
import { CmsLink, CtaVideo, str, texts } from "./shared";

const GROUPS = [
  { id: "sales", labelKey: "salesLabel", en: "Sales", ar: "المبيعات" },
  { id: "warranty", labelKey: "warrantyLabel", en: "Warranty", ar: "الضمان" },
  { id: "services", labelKey: "servicesLabel", en: "Services", ar: "الخدمات" },
  { id: "spare-parts", labelKey: "sparePartsLabel", en: "Spare Parts", ar: "قطع الغيار" },
] as const;

type Props = {
  page: CmsPage;
  faqs: CmsFaqItem[];
  locale?: string;
};

export function FaqView({ page, faqs, locale = "en" }: Props) {
  const hero = page.hero || {};
  const pills = texts(hero.pills);
  const shots = mediaList(hero.shots);
  const shotClass = ["faq-hero-shot--tall", "faq-hero-shot--sq", "faq-hero-shot--wide", "faq-hero-shot--tall"];
  const isAr = locale === "ar";
  const groups = GROUPS.map((group) => ({
    ...group,
    label: str(hero, group.labelKey, isAr ? group.ar : group.en),
  }));

  return (
    <main id="main">
      <section className="faq-page-hero">
        <div className="faq-hero-shots" aria-hidden="true">
          {shots.map((src, index) => (
            <div className={`faq-hero-shot ${shotClass[index % shotClass.length]} reveal reveal--up`} data-delay={index + 2} key={src}>
              <CmsImg src={src} alt="" loading="lazy" variant="thumb" />
            </div>
          ))}
        </div>
        <div className="faq-asks" aria-hidden="true">
          {pills.map((pill, index) => (
            <div className={`faq-ask faq-ask--${index + 1} reveal reveal--up`} data-delay={index + 3} key={pill}>
              <span className={`faq-ask__pill ${index % 2 === 0 ? "faq-ask__pill--amber" : "faq-ask__pill--ink"}`}>
                <span className="faq-ask__t">{pill}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="container" style={{ maxWidth: 720 }}>
          <nav className="breadcrumb reveal reveal--up" data-delay="0" aria-label="Breadcrumb">
            <CmsLink href="/">{str(hero, "homeLabel", "Home")}</CmsLink>
            <span>›</span>
            <span aria-current="page">{str(hero, "pageLabel", "FAQs")}</span>
          </nav>
          <p className="eyebrow reveal reveal--up" data-delay="1">{str(hero, "eyebrow")}</p>
          <h1 className="reveal reveal--up" data-delay="2">
            {str(hero, "title")}
            <br />
            <em style={{ fontStyle: "normal", color: "var(--amber)" }}>{str(hero, "titleEm")}</em>
          </h1>
          <p className="reveal reveal--up" data-delay="3">{str(hero, "intro")}</p>
        </div>
        <div className="faq-cat-filters">
          <button className="faq-cat-btn is-active" data-cat="all">{str(hero, "allLabel", "All FAQs")}</button>
          {groups.map((group) => (
            <button className="faq-cat-btn" data-cat={group.id} key={group.id}>{group.label}</button>
          ))}
        </div>
      </section>

      <div className="faq-page-body">
        <div className="container" style={{ maxWidth: 800 }}>
          {groups.map((group) => {
            const items = faqs.filter((item) => item.category === group.id);
            if (!items.length) return null;
            return (
              <div className="faq-group" data-group={group.id} key={group.id}>
                {items.map((item) => (
                  <div className="faq-item reveal reveal--up" role="listitem" key={item.question}>
                    <button type="button" className="faq-item__q" aria-expanded="false">
                      {item.question}
                      <span className="faq-item__plus" aria-hidden="true">+</span>
                    </button>
                    <div className="faq-item__a" aria-hidden="true">
                      <div>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <CtaVideo cta={page.cta} />
    </main>
  );
}
