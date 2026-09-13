export function GrainFilter() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      aria-hidden="true"
    >
      <filter
        id="grain-filter"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        colorInterpolationFilters="linearRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="4"
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
        <feBlend in="SourceGraphic" in2="grey" mode="multiply" result="blend" />
        <feComposite in="blend" in2="SourceGraphic" operator="in" />
      </filter>
    </svg>
  );
}
