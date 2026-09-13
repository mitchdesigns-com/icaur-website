import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();

const PAGES = [
  { id: "home", src: "index.html" },
  { id: "about", src: "about/index.html" },
  { id: "contact", src: "contact/index.html" },
  { id: "faq", src: "faq/index.html" },
  { id: "innovation", src: "innovation/index.html" },
  { id: "news", src: "news/index.html" },
  { id: "reserve", src: "reserve/index.html" },
  { id: "services", src: "services/index.html" },
  { id: "services-maintenance", src: "services/maintenance/index.html" },
  { id: "services-programs", src: "services/programs/index.html" },
  { id: "services-warranty", src: "services/warranty/index.html" },
  { id: "models-v27", src: "models/v27/index.html" },
  { id: "news-ai-cabin", src: "news/ai-cabin/index.html" },
  { id: "news-battery-tech", src: "news/battery-tech/index.html" },
  { id: "news-egypt-ev-future", src: "news/egypt-ev-future/index.html" },
  { id: "news-electric-wiring", src: "news/electric-wiring/index.html" },
  { id: "news-v23-design", src: "news/v23-design/index.html" },
  { id: "news-v27-breaks-range-records", src: "news/v27-breaks-range-records/index.html" },
  { id: "news-wanderer-campaign", src: "news/wanderer-campaign/index.html" },
];

function extractBetween(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1 || end <= start) return null;
  return html.slice(start + startMarker.length, end);
}

function rewriteAssetPaths(html) {
  return html
    .replaceAll("../assets/images/", "/assets/images/")
    .replace(/(src|poster|href)="assets\/images\//g, '$1="/assets/images/');
}

function extractInlineScripts(block) {
  const scripts = [];
  const html = block.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, body) => {
    const a = attrs || "";
    if (/\bsrc\s*=/.test(a)) return full;
    if (!body.trim()) return "";
    scripts.push(body.trim());
    return "";
  });
  return { html, scripts };
}

mkdirSync(join(ROOT, "content/pages"), { recursive: true });
mkdirSync(join(ROOT, "public/js/page"), { recursive: true });

for (const page of PAGES) {
  const raw = readFileSync(join(ROOT, page.src), "utf8");
  let block = extractBetween(raw, '<div id="site-header"></div>', '<div id="site-footer"></div>');
  if (!block) {
    console.error("Could not extract", page.src);
    continue;
  }

  const { html: withoutScripts, scripts } = extractInlineScripts(block);
  let html = rewriteAssetPaths(withoutScripts).trim();

  writeFileSync(join(ROOT, "content/pages", `${page.id}.html`), html + "\n");

  if (scripts.length) {
    const js = scripts.map((s) => s.replace(/^\/\/.*$/m, "").trim()).join("\n\n") + "\n";
    writeFileSync(join(ROOT, "public/js/page", `${page.id}.js`), js);
    console.log(page.id, "html + inline js");
  } else {
    console.log(page.id, "html");
  }
}

console.log("extracted", PAGES.length, "pages");
