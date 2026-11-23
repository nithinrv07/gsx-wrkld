import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Tailwind is compiled by PostCSS (postcss.config.mjs), so it works with
  // both Turbopack (`next dev`) and Webpack (`next build --webpack`).

  // The app has two destinations: Dashboard and Projects (spec 12.2).
  // Pods, sprints, boards and analytics live inside each project, so the old
  // standalone pages send people there. Temporary (307) so they aren't cached.
  async redirects() {
    return [
      {
        source: "/analytics",
        has: [{ type: "query", key: "project", value: "(?<project>[a-z0-9-]+)" }],
        destination: "/projects/:project",
        permanent: false,
      },
      { source: "/analytics", destination: "/projects", permanent: false },
      { source: "/pods", destination: "/projects", permanent: false },
      { source: "/sprints", destination: "/projects", permanent: false },
      { source: "/tasks", destination: "/projects", permanent: false },
      { source: "/settings", destination: "/dashboard", permanent: false },
    ];
  },
};

export default nextConfig;
