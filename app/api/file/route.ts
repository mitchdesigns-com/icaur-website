import { NextRequest } from "next/server";

export const runtime = "edge";

const ALLOWED_HOSTS = new Set([
  "pub-835dbefa2ea84f599cef0519f76de888.r2.dev",
  "icaur-cms.cloudhosta.com",
]);

function safeFilename(value: string) {
  return value.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 180) || "download.pdf";
}

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("src") || "";
  const name = req.nextUrl.searchParams.get("name") || "";

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return new Response("Bad request", { status: 400 });
  }
  if (!ALLOWED_HOSTS.has(url.hostname)) {
    return new Response("Forbidden", { status: 403 });
  }

  const upstream = await fetch(url.toString(), { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: upstream.status || 404 });
  }

  const filename = safeFilename(name || url.pathname.split("/").pop() || "download.pdf");
  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("Content-Type") || "application/octet-stream");
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  const length = upstream.headers.get("Content-Length");
  if (length) headers.set("Content-Length", length);
  headers.set("Cache-Control", "private, max-age=60");

  return new Response(upstream.body, { status: 200, headers });
}
