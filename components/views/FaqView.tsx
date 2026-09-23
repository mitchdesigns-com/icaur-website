"use client";

import { useState } from "react";
import type { CmsFaqItem, CmsPage } from "@/lib/cms";
import { cn } from "@/lib/cn";
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
  const [activeCat, setActiveCat] = useState<string>("all");

  return (
    <main id="main" className="bg-white font-body antialiased">
      <section
        className={cn(
          "faq-page-hero",
          "relative overflow-hidden border-b border-black/10 bg-white pb-[clamp(72px,9vh,110px)] pt-[clamp(120px,14vh,180px)] text-center"
        )}
      >
        <div className="faq-hero-shots" aria-hidden="true">
          {shots.map((src, index) => (
            <div
              className={cn(`faq-hero-shot ${shotClass[index % shotClass.length]}`, "reveal reveal--up")}
              data-delay={index + 2}
              key={src}
            >
              <CmsImg src={src} alt="" loading="lazy" variant="thumb" />
            </div>
          ))}
        </div>
        <div className="faq-asks" aria-hidden="true">
          {pills.map((pill, index) => (
            <div className={cn(`faq-ask faq-ask--${index + 1}`, "reveal reveal--up")} data-delay={index + 3} key={pill}>
              <span className={cn("faq-ask__pill", index % 2 === 0 ? "faq-ask__pill--amber" : "faq-ask__pill--ink")}>
                <span className="faq-ask__t">{pill}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="container relative z-10 mx-auto max-w-[720px] px-pad-x">
          <nav className="breadcrumb reveal reveal--up" data-delay="0" aria-label="Breadcrumb">
            <CmsLink href="/">{str(hero, "homeLabel", "Home")}</CmsLink>
            <span>›</span>
            <span aria-current="page">{str(hero, "pageLabel", "FAQs")}</span>
          </nav>
          <p className="eyebrow reveal reveal--up font-display text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted" data-delay="1">
            {str(hero, "eyebrow")}
          </p>
          <h1 className="reveal reveal--up font-display text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-[1.05] tracking-[-0.035em] text-black" data-delay="2">
            {str(hero, "title")}
            <br />
            <em className="not-italic text-amber">{str(hero, "titleEm")}</em>
          </h1>
          <p className="reveal reveal--up mx-auto mt-sp-4 max-w-[36rem] text-[15px] leading-relaxed text-text-mid" data-delay="3">
            {str(hero, "intro")}
          </p>
        </div>
        <div className="faq-cat-filters relative z-10 mt-sp-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className={cn("faq-cat-btn", activeCat === "all" && "is-active")}
            data-cat="all"
            onClick={() => setActiveCat("all")}
          >
            {str(hero, "allLabel", "All FAQs")}
          </button>
          {groups.map((group) => (
            <button
              type="button"
              className={cn("faq-cat-btn", activeCat === group.id && "is-active")}
              data-cat={group.id}
              key={group.id}
              onClick={() => setActiveCat(group.id)}
            >
              {group.label}
            </button>
          ))}
        </div>
      </section>

      <div className="faq-page-body bg-white py-[clamp(48px,6vh,80px)]">
        <div className="container mx-auto max-w-[800px] px-pad-x">
          {groups.map((group) => {
            const items = faqs.filter((item) => item.category === group.id);
            if (!items.length) return null;
            const hidden = activeCat !== "all" && activeCat !== group.id;
            return (
              <div
                className="faq-group"
                data-group={group.id}
                key={group.id}
                hidden={hidden}
                style={hidden ? { display: "none" } : undefined}
              >
                {items.map((item) => (
                  <div className="faq-item reveal reveal--up" role="listitem" key={item.question}>
                    <button type="button" className="faq-item__q" aria-expanded="false">
                      {item.question}
                      <span className="faq-item__plus" aria-hidden="true">
                        +
                      </span>
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
