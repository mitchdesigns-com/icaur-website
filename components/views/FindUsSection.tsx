"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { CmsLocation } from "@/lib/cms";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  useMap,
} from "@/components/ui/map";

type Props = {
  eyebrow: string;
  title: string;
  titleEm: string;
  locations: CmsLocation[];
};

type Loc = {
  id: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  hours: string;
  badges: string[];
  lat: number;
  lng: number;
  mapsUrl: string;
};

type CardPos = { left: number; top: number; visible: boolean };

const CARD_W = 320;
const CARD_GAP = 16;

function cardPosUnderPoint(
  pointX: number,
  pointY: number,
  mapW: number,
  mapH: number,
  cardW: number,
): CardPos {
  // Stay locked to the pin — never clamp into the viewport (that detaches from the point).
  const left = pointX - cardW / 2;
  const top = pointY + CARD_GAP;
  const visible =
    pointX > -40 &&
    pointX < mapW + 40 &&
    pointY > -40 &&
    pointY < mapH + 40;

  return { left, top, visible };
}

function badgeLabels(isAr: boolean): Record<string, string> {
  return isAr
    ? { showroom: "صالة العرض", service: "مركز الخدمة" }
    : { showroom: "Showroom", service: "Service Center" };
}

function mapsLabel(isAr: boolean) {
  return isAr ? "افتح في الخرائط" : "Open in Maps";
}

function normalizeLocations(locations: CmsLocation[]): Loc[] {
  const fromCms = locations
    .filter((loc) => typeof loc.lat === "number" && typeof loc.lng === "number")
    .map((loc) => ({
      id: loc.slug || `${loc.lat},${loc.lng}`,
      name: loc.name || "",
      area: loc.area || "",
      address: loc.address || "",
      phone: loc.phone || "",
      hours: loc.hours || "",
      badges: loc.badges || [],
      lat: loc.lat as number,
      lng: loc.lng as number,
      mapsUrl: loc.mapsUrl || `https://maps.google.com/?q=${loc.lat},${loc.lng}`,
    }));

  if (fromCms.length) return fromCms;

  return [
    {
      id: "qattamya",
      name: "Qattamya Heights",
      area: "New Cairo",
      address: "Plot 12, Qattamya Heights, New Cairo, Cairo, Egypt",
      phone: "+20 2 2759 1100",
      hours: "Sat–Thu  9 am – 6 pm",
      badges: ["showroom", "service"],
      lat: 30.0012,
      lng: 31.5037,
      mapsUrl: "https://maps.google.com/?q=30.0012,31.5037",
    },
    {
      id: "zayed",
      name: "Sheikh Zayed",
      area: "6th of October City",
      address: "26 July Corridor, Sheikh Zayed, 6th of October, Egypt",
      phone: "+20 2 3854 2200",
      hours: "Sat–Thu  9 am – 6 pm",
      badges: ["showroom"],
      lat: 30.0626,
      lng: 30.9762,
      mapsUrl: "https://maps.google.com/?q=30.0626,30.9762",
    },
    {
      id: "newcairo",
      name: "North Teseen Center",
      area: "Fifth Settlement, New Cairo",
      address: "Building 16, North Teseen Street, Fifth Settlement, New Cairo, Egypt",
      phone: "+20 2 2614 3300",
      hours: "Sat–Thu  8 am – 8 pm",
      badges: ["service"],
      lat: 30.0195,
      lng: 31.4725,
      mapsUrl: "https://maps.google.com/?q=30.0195,31.4725",
    },
    {
      id: "maadi",
      name: "Maadi Center",
      area: "Maadi, Cairo",
      address: "7 Road 9, Maadi, Cairo, Egypt",
      phone: "+20 2 2358 4400",
      hours: "Sat–Thu  9 am – 6 pm",
      badges: ["showroom", "service"],
      lat: 29.96,
      lng: 31.24,
      mapsUrl: "https://maps.google.com/?q=29.9600,31.2400",
    },
  ];
}

function FlyToActive({
  activeId,
  locations,
}: {
  activeId: string | null;
  locations: Loc[];
}) {
  const { map, isLoaded } = useMap();
  const bootRef = useRef(true);

  useEffect(() => {
    if (!map || !isLoaded) return;
    if (bootRef.current) {
      bootRef.current = false;
      requestAnimationFrame(() => map.resize());
      if (!activeId) return;
    }
    if (!activeId) {
      map.flyTo({ center: [31.22, 30.02], zoom: 10, duration: 800, essential: true });
      return;
    }
    const loc = locations.find((item) => item.id === activeId);
    if (!loc) return;
    // Leave room under the pin for the anchored card.
    map.flyTo({
      center: [loc.lng, loc.lat],
      zoom: 14,
      duration: 900,
      essential: true,
      padding: { top: 56, bottom: 240, left: 56, right: 56 },
      offset: [0, -40],
    });
  }, [activeId, isLoaded, locations, map]);

  return null;
}

function LocCard({
  loc,
  labels,
  mapsText,
  closeLabel,
  onClose,
}: {
  loc: Loc;
  labels: Record<string, string>;
  mapsText: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const { map, isLoaded } = useMap();
  const cardRef = useRef<HTMLDivElement>(null);

  const updatePos = useCallback(() => {
    if (!map || !isLoaded) return;
    const el = cardRef.current;
    if (!el) return;
    const point = map.project([loc.lng, loc.lat]);
    const container = map.getContainer();
    const cardW = el.offsetWidth || CARD_W;
    const next = cardPosUnderPoint(
      point.x,
      point.y,
      container.clientWidth,
      container.clientHeight,
      cardW,
    );
    el.style.transform = `translate3d(${next.left}px, ${next.top}px, 0)`;
    el.style.visibility = next.visible ? "visible" : "hidden";
    el.style.pointerEvents = next.visible ? "auto" : "none";
    el.setAttribute("aria-hidden", next.visible ? "false" : "true");
  }, [isLoaded, loc.lat, loc.lng, map]);

  useLayoutEffect(() => {
    updatePos();
  }, [updatePos, loc.id]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    updatePos();
    map.on("move", updatePos);
    map.on("zoom", updatePos);
    map.on("resize", updatePos);
    map.on("moveend", updatePos);
    map.on("render", updatePos);
    return () => {
      map.off("move", updatePos);
      map.off("zoom", updatePos);
      map.off("resize", updatePos);
      map.off("moveend", updatePos);
      map.off("render", updatePos);
    };
  }, [isLoaded, map, updatePos]);

  return (
    <div
      ref={cardRef}
      className="fu-map-card"
      role="dialog"
      aria-label={loc.name}
      style={{ visibility: "hidden", pointerEvents: "none" }}
    >
      <button type="button" className="fu-map-card__close" onClick={onClose} aria-label={closeLabel}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
      <div className="fu-popup__badges">
        {loc.badges.map((badge) => (
          <span key={badge} className={`fu-popup__badge fu-popup__badge--${badge}`}>
            <span className="fu-popup__badge-dot" aria-hidden="true" />
            {labels[badge] || badge}
          </span>
        ))}
      </div>
      <div className="fu-popup__name">{loc.name}</div>
      <div className="fu-popup__rows">
        <div className="fu-popup__row">
          <svg className="fu-popup__ico" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{loc.address}</span>
        </div>
        <div className="fu-popup__row fu-popup__row--phone">
          <svg className="fu-popup__ico" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.4 2 2 0 0 1 3.59 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.91z" />
          </svg>
          <span dir="ltr">{loc.phone}</span>
        </div>
        <div className="fu-popup__row">
          <svg className="fu-popup__ico" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{loc.hours}</span>
        </div>
      </div>
      <a className="fu-popup__maps" href={loc.mapsUrl} target="_blank" rel="noopener noreferrer">
        {mapsText}
      </a>
    </div>
  );
}

export function FindUsSection({ eyebrow, title, titleEm, locations }: Props) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const labels = useMemo(() => badgeLabels(isAr), [isAr]);
  const mapsText = mapsLabel(isAr);
  const locs = useMemo(() => normalizeLocations(locations), [locations]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setVisible(true);
        obs.disconnect();
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const activeLoc = locs.find((loc) => loc.id === activeId) || null;

  const handleSelect = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  const handleMarkerClick = useCallback((id: string, e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveId(id);
  }, []);

  return (
    <section id="find-us" className="find-us" ref={sectionRef} data-mapcn="1">
      <div className="find-us__grid">
        <div className="find-us__left">
          <div className={`find-us__header${visible ? " is-visible" : ""}`} id="findUsHeader">
            <p className="eyebrow eyebrow--warm">{eyebrow}</p>
            <h2 className="find-us__h">
              {title}
              <br />
              <em>{titleEm}</em>
            </h2>
          </div>
          <div className={`find-us__list${visible ? " is-visible" : ""}`} id="findUsList">
            {locs.map((loc) => (
              <button
                type="button"
                key={loc.id}
                className={`find-us__row${activeId === loc.id ? " is-active" : ""}`}
                data-id={loc.id}
                onClick={() => handleSelect(loc.id)}
              >
                <div className="find-us__badges">
                  {loc.badges.map((badge) => (
                    <span key={badge} className={`find-us__badge find-us__badge--${badge}`}>
                      {labels[badge] || badge}
                    </span>
                  ))}
                </div>
                <div className="find-us__name">{loc.name}</div>
                <div className="find-us__area">{loc.area}</div>
              </button>
            ))}
          </div>
        </div>

        <div className={`find-us-map-wrap${visible ? " is-visible" : ""}`} id="findUsMapWrap">
          <div id="findUsMap" className="fu-mapcn">
            <Map theme="light" center={[31.22, 30.02]} zoom={10} scrollZoom={false} className="fu-mapcn__canvas">
              <MapControls position={isAr ? "top-right" : "top-left"} showZoom />
              <FlyToActive activeId={activeId} locations={locs} />
              {locs.map((loc) => (
                <MapMarker
                  key={loc.id}
                  longitude={loc.lng}
                  latitude={loc.lat}
                  onClick={(e) => handleMarkerClick(loc.id, e)}
                >
                  <MarkerContent>
                    <span className={`fu-map-dot${activeId === loc.id ? " is-active" : ""}`} aria-hidden="true" />
                  </MarkerContent>
                </MapMarker>
              ))}
              {activeLoc ? (
                <LocCard
                  loc={activeLoc}
                  labels={labels}
                  mapsText={mapsText}
                  closeLabel={isAr ? "إغلاق" : "Close"}
                  onClose={() => setActiveId(null)}
                />
              ) : null}
            </Map>
          </div>
        </div>
      </div>
    </section>
  );
}
