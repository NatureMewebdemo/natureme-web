import type { NextConfig } from "next";

/** natureme.ai is the public launching-soon site: its home page is the landing page, and the app's pages stay off it. */
const LANDING_HOST = [{ type: "host" as const, value: "(www\\.)?natureme\\.ai" }];

const nextConfig: NextConfig = {
  async rewrites() {
    return { beforeFiles: [{ source: "/", has: LANDING_HOST, destination: "/coming-soon" }], afterFiles: [], fallback: [] };
  },
  async redirects() {
    return ["/coming-soon", "/welcome", "/explore/:path*", "/map/:path*", "/companion/:path*", "/studio/:path*"].map((source) => ({
      source,
      has: LANDING_HOST,
      destination: "/",
      permanent: false,
    }));
  },
};

export default nextConfig;
