import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FEEDBACK_WIDGET } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: "iCAUR — Built for Every Road",
    template: "%s",
  },
  description: "iCAUR — Egypt's next-generation electric vehicle. Built for every road.",
  icons: {
    icon: [{ url: "/assets/images/Favicon.svg", type: "image/svg+xml" }],
  },
};

const IMPORT_MAP = {
  imports: {
    three: "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/",
    meshopt_decoder:
      "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/meshopt_decoder.module.js",
    ogl: "https://cdn.jsdelivr.net/npm/ogl/dist/ogl.mjs",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if(sessionStorage.getItem('pt-nav'))document.documentElement.classList.add('pt-entering');`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&family=Noto+Kufi+Arabic:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/styles.css" />
        <script
          type="importmap"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(IMPORT_MAP) }}
        />
        <script
          src={FEEDBACK_WIDGET.src}
          data-ingest-key={FEEDBACK_WIDGET.ingestKey}
          data-endpoint={FEEDBACK_WIDGET.endpoint}
          data-position="bottom-right"
          data-button-text="Feedback"
          data-accent="#4f46e5"
          async
        />
      </head>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var p=location.pathname.replace(/\\/+$/,'')||'/';var c=[];if(p==='/models/v27'){c.push('v27-page')}else{c.push('is-loading');if(p==='/'||p==='/reserve'||p==='/services'||p.indexOf('/services/')===0||p==='/innovation')c.push('dark-hero-page')}document.body.className=c.join(' ')})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
