/** Normalize model tokens so o3t / ot3 / 03t match. */
export function normalizeModelToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

const O3T_TOKENS = new Set(["o3t", "ot3", "03t", "t03"]);

export function modelsMatch(a: string, b: string): boolean {
  const left = normalizeModelToken(a);
  const right = normalizeModelToken(b);
  if (!left || !right) return false;
  if (left === right) return true;
  return O3T_TOKENS.has(left) && O3T_TOKENS.has(right);
}

/** Append ?model=slug to reserve links when missing. */
export function withReserveModel(href: string | undefined, modelSlug: string, fallback = "/reserve"): string {
  const base = (href || fallback).trim() || fallback;
  const slug = modelSlug.trim();
  if (!slug) return base;
  const pathOnly = base.split(/[?#]/)[0] || "";
  const isReserve = /(?:^|\/)reserve\/?$/.test(pathOnly);
  if (!isReserve) return base;
  if (/[?&]model=/.test(base)) return base;
  return `${base}${base.includes("?") ? "&" : "?"}model=${encodeURIComponent(slug)}`;
}
