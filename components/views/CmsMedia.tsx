"use client";

import { useEffect, useRef, type ImgHTMLAttributes, type VideoHTMLAttributes } from "react";
import { imageSources, mediaUrl, type CmsMediaValue } from "@/lib/media";
import { publicAsset } from "@/lib/publicAssets";

type ImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes"> & {
  src?: CmsMediaValue | unknown;
  variant?: "full" | "card" | "thumb" | "logo";
};

export function CmsImg({ src, variant = "card", alt = "", loading = "lazy", onError, ...rest }: ImgProps) {
  const sources = imageSources(src, variant);
  const original = mediaUrl(src);
  if (!sources.src) return null;
  return (
    <img
      alt={alt}
      loading={loading}
      decoding="async"
      {...rest}
      src={sources.src}
      srcSet={sources.srcSet}
      sizes={sources.sizes}
      data-full={original && original !== sources.src ? original : undefined}
      onError={(event) => {
        const img = event.currentTarget;
        const fallback = img.dataset.full;
        if (fallback && img.src !== fallback) {
          img.removeAttribute("srcset");
          img.removeAttribute("sizes");
          img.src = fallback;
        }
        onError?.(event);
      }}
    />
  );
}

type VideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "poster"> & {
  src?: CmsMediaValue | unknown;
  poster?: CmsMediaValue | unknown;
  mode?: "hero" | "scrub" | "lazy";
};

export function CmsVideo({
  src,
  poster,
  mode = "lazy",
  autoPlay,
  muted = true,
  loop = true,
  playsInline = true,
  ...rest
}: VideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const url = publicAsset(mediaUrl(src));
  const posterUrl = publicAsset(mediaUrl(poster));
  const eager = mode === "hero" || mode === "scrub";

  useEffect(() => {
    const video = ref.current;
    if (!video || !url) return;

    const play = () => {
      video.muted = true;
      video.play().catch(() => {});
    };

    if (eager) {
      if (mode === "hero") play();
      return;
    }

    const show = () => {
      if (!video.getAttribute("src")) {
        video.src = url;
        video.load();
      }
      play();
    };

    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        show();
        observer.disconnect();
      },
      { rootMargin: "280px" }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [eager, mode, url]);

  return (
    <video
      ref={ref}
      src={eager ? url : undefined}
      data-src={eager ? undefined : url}
      poster={posterUrl || undefined}
      autoPlay={mode === "hero" || autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={mode === "lazy" ? "none" : "metadata"}
      {...rest}
    />
  );
}
