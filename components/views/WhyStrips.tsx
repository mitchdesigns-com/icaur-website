import { str } from "./shared";

type Props = {
  items: Record<string, unknown>[];
};

export function WhyStrips({ items }: Props) {
  return (
    <section className="why" id="why-icaur">
      {items.map((item, index) => {
        const variant = str(item, "variant", index % 2 === 0 ? "amber" : "dark");
        const side = index % 2 === 0 ? "l" : "r";
        return (
          <article className={`why-strip why-strip--${variant}`} data-side={side} key={str(item, "word") + str(item, "wordEm")}>
            <div className="why-strip__inner">
              {str(item, "eyebrow") ? (
                <p className="eyebrow why-strip__eyebrow">{str(item, "eyebrow")}</p>
              ) : null}
              <WhyGraphic index={index} />
              <h3 className="why-strip__word">
                {str(item, "word")} {str(item, "wordEm") ? <em>{str(item, "wordEm")}</em> : null}
              </h3>
              <p className="why-strip__tag">{str(item, "tag")}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function WhyGraphic({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg className="why-viz" viewBox="0 0 300 170" aria-hidden="true">
        <g className="viz-car">
          <path data-draw="0.15 0.20" pathLength="1" d="M76 34H156M86 44V34M146 44V34" />
          <path data-draw="0.16 0.34" pathLength="1" d="M52 112V54Q52 44 62 44H160Q166 44 170 48L196 66Q199 69 204 69H238Q250 71 250 82V110Q250 118 242 118H228V106Q228 100 222 100H190Q184 100 184 106V118H114V106Q114 100 108 100H76Q70 100 70 106V118H60Q52 118 52 112Z" />
          <path data-draw="0.30 0.38" pathLength="1" d="M60 64H162M116 44V64M166 46L192 64" />
          <path data-draw="0.34 0.40" pathLength="1" d="M198 60l9 -6M92 72h12M136 72h12M238 78l10 2M60 86H180" />
          <circle data-draw="0.34 0.44" pathLength="1" cx="92" cy="120" r="20" />
          <circle data-draw="0.36 0.46" pathLength="1" cx="206" cy="120" r="20" />
          <circle data-draw="0.41 0.45" pathLength="1" cx="92" cy="120" r="7" />
          <circle data-draw="0.42 0.46" pathLength="1" cx="206" cy="120" r="7" />
        </g>
        <path className="viz-pop" data-draw="0.46 0.50" pathLength="1" d="M42 54H28" />
        <path className="viz-pop" data-draw="0.47 0.50" pathLength="1" d="M40 74H26" />
        <path className="viz-pop" data-draw="0.48 0.50" pathLength="1" d="M42 94H28" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg className="why-viz" viewBox="0 0 240 150" aria-hidden="true">
        <path data-draw="0.16 0.30" pathLength="1" d="M10 116Q40 98 70 112T130 110T190 112T232 108" />
        <path data-draw="0.20 0.34" pathLength="1" d="M6 132Q40 116 74 128T138 126T198 128T236 124" />
        <path data-draw="0.30 0.38" pathLength="1" d="M60 122q8 -4 14 0M120 120q8 -4 14 0M178 121q8 -4 14 0" />
        <g className="viz-sun">
          <circle data-draw="0.36 0.46" pathLength="1" cx="186" cy="40" r="17" />
          <path data-draw="0.44 0.50" pathLength="1" d="M186 15v-8M203 23l6-6M210 40h8M203 57l6 6M169 23l-6-6M162 40h-8M169 57l-6 6M186 65v6" />
        </g>
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg className="why-viz" viewBox="0 0 260 160" aria-hidden="true">
        <g className="viz-wheel">
          <circle data-draw="0.16 0.30" pathLength="1" cx="64" cy="90" r="42" />
          <circle data-draw="0.22 0.34" pathLength="1" cx="64" cy="90" r="33" />
          <rect data-draw="0.30 0.38" pathLength="1" x="50" y="80" width="28" height="22" rx="7" />
          <rect data-draw="0.34 0.40" pathLength="1" x="33" y="83" width="13" height="15" rx="5" />
          <rect data-draw="0.35 0.41" pathLength="1" x="82" y="83" width="13" height="15" rx="5" />
          <path data-draw="0.38 0.44" pathLength="1" d="M59 130l2 -18M69 130l-2 -18" />
        </g>
        <rect data-draw="0.28 0.42" pathLength="1" x="142" y="36" width="102" height="64" rx="10" />
        <rect data-draw="0.36 0.46" pathLength="1" x="149" y="43" width="88" height="50" rx="6" />
        <path data-draw="0.42 0.47" pathLength="1" d="M142 44l-7 5v52l7 5" />
        <path className="viz-pop" data-draw="0.46 0.50" pathLength="1" d="M248 26l8 -8" />
        <path className="viz-pop" data-draw="0.47 0.50" pathLength="1" d="M254 42l12 -3" />
        <path className="viz-pop" data-draw="0.48 0.50" pathLength="1" d="M240 16l4 -12" />
      </svg>
    );
  }
  return (
    <svg className="why-viz viz-spin" viewBox="0 0 1064 1064" aria-hidden="true">
      <path data-draw="0.20 0.32" pathLength="1" d="M531.996 0V1064" />
      <path data-draw="0.28 0.40" pathLength="1" d="M908.18 155.815L155.818 908.177" />
      <path data-draw="0.36 0.46" pathLength="1" d="M1064 531.995L0 531.995" />
      <path data-draw="0.42 0.50" pathLength="1" d="M908.184 908.177L155.822 155.815" />
    </svg>
  );
}
