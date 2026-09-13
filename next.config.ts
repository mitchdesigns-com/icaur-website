import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  trailingSlash: false,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/i,
      type: "asset/source",
    });
    return config;
  },
};

export default withNextIntl(nextConfig);
