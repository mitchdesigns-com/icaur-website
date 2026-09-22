export type CmsMediaValue =
  | string
  | {
      url?: string;
      width?: number;
      height?: number;
      mime?: string;
      formats?: Record<string, string | { url?: string; width?: number }>;
    }
  | null
  | undefined;

const IMAGE_EXT = /\.(webp|jpe?g|png|gif|avif)$/i;
const FORMAT_WIDTHS: Record<string, number> = {
  thumbnail: 156,
  small: 500,
  medium: 750,
  large: 1000,
};

export function mediaUrl(value: CmsMediaValue | unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "url" in value) {
    return String((value as { url?: string }).url || "");
  }
  return "";
}

export function mediaList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(mediaUrl).filter(Boolean);
}

function formatMap(value: CmsMediaValue | unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const formats = (value as { formats?: Record<string, string | { url?: string }> }).formats;
  if (!formats) return {};
  return Object.fromEntries(
    Object.entries(formats)
      .map(([key, item]) => {
        const url = typeof item === "string" ? item : item?.url || "";
        return [key, url];
      })
      .filter((entry) => entry[1])
  );
}

function derivedFormats(src: string): Record<string, string> {
  if (!src || !/^https?:\/\//i.test(src) || src.startsWith("data:") || !IMAGE_EXT.test(src.split("?")[0] || "")) return {};
  try {
    const parsed = new URL(src);
    const segments = parsed.pathname.split("/");
    const file = segments.pop() || "";
    if (!file || /^(thumbnail|small|medium|large)_/.test(file)) return {};
    parsed.pathname = `${segments.join("/")}/small_${file}`;
    return { small: parsed.toString() };
  } catch {
    return {};
  }
}

export function imageSources(
  value: CmsMediaValue | unknown,
  variant: "full" | "card" | "thumb" | "logo" = "card"
): { src: string; srcSet?: string; sizes?: string } {
  const original = mediaUrl(value);
  if (!original) return { src: "" };
  if (variant === "logo" || original.endsWith(".svg") || original.startsWith("data:")) {
    return { src: original };
  }

  const formats = { ...derivedFormats(original), ...formatMap(value) };
  const candidates = Object.entries(FORMAT_WIDTHS)
    .map(([key, width]) => (formats[key] ? `${formats[key]} ${width}w` : ""))
    .filter(Boolean);
  candidates.push(`${original} 2000w`);

  const src =
    variant === "full"
      ? original
      : formats.small || formats.medium || formats.large || original;

  const sizes =
    variant === "full"
      ? "100vw"
      : variant === "thumb"
        ? "(max-width: 700px) 50vw, 320px"
        : "(max-width: 860px) 90vw, 640px";

  return { src, srcSet: candidates.join(", "), sizes };
}
