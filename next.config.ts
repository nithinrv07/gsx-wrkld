import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Tailwind is compiled by PostCSS (postcss.config.mjs), so it works with
  // both Turbopack (`next dev`) and Webpack (`next build --webpack`).
};

export default nextConfig;
