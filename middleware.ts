import { NextResponse } from "next/server";

// Maintenance mode: every request returns the "under development" page.
// Revert by pointing the Cloudflare Pages production branch back to `main`,
// or by restoring the next-intl middleware from `staging`.
const MAINTENANCE_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>iCAUR — Site Under Development</title>
<meta name="description" content="The iCAUR website is currently under development. We will be back soon." />
<style>
  :root {
    --bg: #0b0d10;
    --bg-2: #14181d;
    --fg: #f2f4f7;
    --muted: #9aa4b2;
    --accent: #2f6bff;
    --line: rgba(255,255,255,.12);
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: radial-gradient(120% 90% at 50% 0%, var(--bg-2) 0%, var(--bg) 60%);
    color: var(--fg);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    -webkit-font-smoothing: antialiased;
  }
  .wrap {
    width: 100%;
    max-width: 720px;
    text-align: center;
  }
  .brand {
    font-size: clamp(28px, 7vw, 44px);
    font-weight: 800;
    letter-spacing: .18em;
    margin: 0 0 28px;
  }
  .brand span { color: var(--accent); }
  .card {
    border: 1px solid var(--line);
    border-radius: 18px;
    background: rgba(255,255,255,.03);
    padding: clamp(28px, 6vw, 48px) clamp(20px, 5vw, 40px);
    backdrop-filter: blur(6px);
  }
  .badge {
    display: inline-block;
    font-size: 12px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 999px;
    padding: 6px 14px;
    margin-bottom: 20px;
  }
  h1 {
    font-size: clamp(24px, 5.2vw, 36px);
    line-height: 1.2;
    margin: 0 0 14px;
    font-weight: 700;
  }
  p {
    margin: 0 auto;
    max-width: 46ch;
    color: var(--muted);
    font-size: clamp(15px, 2.4vw, 17px);
    line-height: 1.7;
  }
  .ar {
    margin-top: 18px;
    direction: rtl;
    font-size: clamp(14px, 2.2vw, 16px);
  }
  .bar {
    position: relative;
    height: 4px;
    width: min(320px, 80%);
    margin: 32px auto 0;
    border-radius: 999px;
    background: rgba(255,255,255,.08);
    overflow: hidden;
  }
  .bar::after {
    content: "";
    position: absolute;
    inset: 0 auto 0 -40%;
    width: 40%;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    animation: slide 1.9s ease-in-out infinite;
  }
  @keyframes slide { to { left: 100%; } }
  @media (prefers-reduced-motion: reduce) { .bar::after { animation: none; left: 30%; } }
</style>
</head>
<body>
  <main class="wrap">
    <p class="brand">i<span>CAUR</span></p>
    <div class="card">
      <span class="badge">Under Development</span>
      <h1>We are building something new.</h1>
      <p>The iCAUR website is currently under development. The new experience will be live soon — thank you for your patience.</p>
      <p class="ar">الموقع قيد التطوير حالياً. سنعود قريباً بتجربة جديدة.</p>
      <div class="bar" role="presentation"></div>
    </div>
  </main>
</body>
</html>
`;

export function middleware() {
  return new NextResponse(MAINTENANCE_PAGE, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

export const config = {
  matcher: "/:path*",
};
