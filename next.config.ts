import type { NextConfig } from "next";

/**
 * `STATIC_EXPORT=1 pnpm build` writes a fully static site to `out/` for hosts
 * without a Node server (Cloudflare Workers static assets, Pages, S3).
 * The demo data is generated at build time, so every page can be prerendered.
 */
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(staticExport
    ? { output: "export", trailingSlash: true }
    : { cacheComponents: true, partialPrefetching: true }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
